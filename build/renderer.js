/**
 * @file ssr renderer
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {join} from 'path';
import fs from 'fs-extra';
import webpack from 'webpack';
import MFS from 'memory-fs';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {createBundleRenderer} from 'vue-server-renderer';
import VueSSRClientPlugin from './plugins/ssr-client-plugin';

import {distLavasPath, resolveAliasPath} from './utils/path';
import {webpackCompile} from './utils/webpack';
import {LAVAS_DIRNAME_IN_DIST, TEMPLATE_HTML, SERVER_BUNDLE, CLIENT_MANIFEST} from './constants';

export default class Renderer {
    constructor(core) {
        this.env = core.env;
        this.config = core.config;
        this.rootDir = this.config && this.config.globals.rootDir;
        this.cwd = core.cwd;
        this.internalMiddlewares = core.internalMiddlewares;
        this.renderer = {};
        this.serverBundle = null;
        this.clientManifest = {};
        this.templates = {};
        this.resolve = null;
        this.readyPromise = new Promise(r => this.resolve = r);
        this.entries = this.config.entry.map(e => e.name);
    }

    /**
     * resolve template path with webpack alias
     *
     * @param {string} alias webpack alias
     * @param {string} entryName entry name
     * @return {string} resolved path
     */
    getTemplatePath(entryName) {
        return join(this.rootDir, `entries/${entryName}/`, TEMPLATE_HTML);
    }

    /**
     * add custom ssr client plugin in config
     */
    addSSRClientPlugin() {
        this.clientConfig.plugins.push(
            new VueSSRClientPlugin({
                filename: join(LAVAS_DIRNAME_IN_DIST, `[entryName]/${CLIENT_MANIFEST}`)
            })
        );
    }

    async createWithBundle() {
        this.serverBundle = await import(distLavasPath(this.cwd, SERVER_BUNDLE));

        await Promise.all(this.entries.map(async entryName => {
            let templatePath = distLavasPath(this.cwd, `${entryName}/${TEMPLATE_HTML}`);
            let manifestPath = distLavasPath(this.cwd, `${entryName}/${CLIENT_MANIFEST}`);
            this.templates[entryName] = await fs.readFile(templatePath, 'utf-8');
            this.clientManifest[entryName] = await import(manifestPath);
        }));
    }

    async buildInProduction() {
        this.addSSRClientPlugin();

        // start to build client & server configs
        await webpackCompile([this.clientConfig, this.serverConfig]);

        // copy index.template.html to dist/lavas
        await Promise.all(this.entries.map(async entryName => {
            let templatePath = this.getTemplatePath(entryName);
            let distTemplatePath = distLavasPath(this.config.webpack.base.output.path, `${entryName}/${TEMPLATE_HTML}`);
            await fs.copy(templatePath, distTemplatePath);
        }));

    }

    async build(clientConfig, serverConfig) {
        this.clientConfig = clientConfig;
        this.serverConfig = serverConfig;

        // set entries in both client & server webpack config
        this.setWebpackEntries();

        if (this.env === 'production') {
            await this.buildInProduction();
        }
        else {

            await Promise.all(this.entries.map(async entryName => {
                this.templates[entryName] = await fs.readFile(this.getTemplatePath(entryName), 'utf-8');
            }));

            // get client manifest
            this.getClientManifest(async (err, manifest) => {
                this.clientManifest = manifest;
                await this.createRenderer();
            });

            // get server bundle
            this.getServerBundle(async (err, serverBundle) => {
                this.serverBundle = serverBundle;
                await this.createRenderer();
            });
        }
    }

    /**
     * set entries in both client & server webpack config
     */
    setWebpackEntries() {
        // set context in both configs first
        this.clientConfig.context = this.rootDir;
        this.serverConfig.context = this.rootDir;

        // each entry should have an independent client entry
        this.clientConfig.entry = {};
        this.entries.forEach(entryName => {
            this.clientConfig.entry[entryName] = [`./entries/${entryName}/entry-client.js`];
        });

        // only one entry in server side
        this.serverConfig.entry = './core/entry-server.js';
    }

    /**
     * get client manifest, and add middlewares to Koa instance
     *
     * @param {Function} callback callback
     */
    getClientManifest(callback) {
        let clientConfig = this.clientConfig;
        let entryNames = Object.keys(clientConfig.entry);

        entryNames.forEach(entryName => {
            clientConfig.entry[entryName] = ['webpack-hot-middleware/client', ...clientConfig.entry[entryName]];
        });

        // add custom ssr client plugin
        this.addSSRClientPlugin();
        // add other plugins in dev mode
        clientConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        );

        // init client compiler
        let clientCompiler = webpack(clientConfig);

        // dev middleware
        let devMiddleware = webpackDevMiddleware(clientCompiler, {
            publicPath: this.config.webpack.base.output.publicPath,
            noInfo: true
        });

        this.internalMiddlewares.push(devMiddleware);

        // hot middleware
        let hotMiddleware = webpackHotMiddleware(clientCompiler, {
            heartbeat: 5000
        });

        this.internalMiddlewares.push(hotMiddleware);

        clientCompiler.plugin('done', stats => {
            stats = stats.toJson();
            stats.errors.forEach(err => console.error(err));
            stats.warnings.forEach(err => console.warn(err));

            if (stats.errors.length) {
                // print all errors
                for (let error of stats.errors) {
                    console.error(error);
                }

                return;
            }

            callback(null, entryNames.reduce((prev, entryName) => {
                prev[entryName] = JSON.parse(
                    devMiddleware.fileSystem.readFileSync(
                        distLavasPath(clientConfig.output.path, `${entryName}/${CLIENT_MANIFEST}`),
                        'utf-8'
                    )
                );
                return prev;
            }, {}));
        });

    }

    /**
     * get server bundle
     *
     * @param {Function} callback callback
     */
    getServerBundle(callback) {
        let serverConfig = this.serverConfig;

        // watch and update server renderer
        const serverCompiler = webpack(serverConfig);
        const mfs = new MFS();
        serverCompiler.outputFileSystem = mfs;
        serverCompiler.watch({}, (err, stats) => {

            if (err) {
                throw err;
            }
            stats = stats.toJson();
            if (stats.errors.length) {
                // print all errors
                for (let error of stats.errors) {
                    console.error(error);
                }

                return;
            }

            let rawContent = mfs.readFileSync(
                distLavasPath(serverConfig.output.path, SERVER_BUNDLE), 'utf8');

            callback(null, JSON.parse(rawContent));
        });
    }

    /**
     * create renderer
     */
    async createRenderer() {
        if (this.serverBundle && this.clientManifest) {
            await Promise.all(this.entries.map(async entryName => {
                let first = !this.renderer[entryName];
                this.renderer[entryName] = createBundleRenderer(this.serverBundle, {
                    template: this.templates[entryName],
                    clientManifest: this.clientManifest[entryName],
                    runInNewContext: false
                });

                if (first) {
                    this.resolve(this.renderer[entryName]);
                }
            }));
        }
    }

    /**
     * get vue server renderer
     *
     * @return {Promise.<*>}
     */
    getRenderer(entryName) {
        if (this.renderer[entryName]) {
            return Promise.resolve(this.renderer[entryName]);
        }

        return this.readyPromise;
    }
}
