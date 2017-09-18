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
        this.resolve = null;
        this.readyPromise = new Promise(r => this.resolve = r);
    }

    /**
     * resolve template path with webpack alias
     *
     * @param {string} alias webpack alias
     * @param {string} entryName entry name
     * @return {string} resolved path
     */
    getTemplatePath(entryName) {
        // TODO alias
        return join(this.rootDir, `entries/${entryName}/`, TEMPLATE_HTML);
    }

    async createWithBundle() {
        this.serverBundle = await import(distLavasPath(this.cwd, SERVER_BUNDLE));
        // TODO entryName
        this.clientManifest = await import(distLavasPath(this.cwd, CLIENT_MANIFEST));
        await this.createRenderer({
            templatePath: distLavasPath(this.cwd, TEMPLATE_HTML)
        });
    }

    async buildInProduction(clientConfig, serverConfig, entryName) {
        // set context in both configs
        clientConfig.context = this.rootDir;
        serverConfig.context = this.rootDir;

        // start to build client & server configs
        await webpackCompile([clientConfig, serverConfig]);

        // copy index.template.html to dist/lavas
        let templatePath = this.getTemplatePath(clientConfig.resolve.alias);
        let distTemplatePath = distLavasPath(this.config.webpack.base.output.path, TEMPLATE_HTML);
        await fs.copy(templatePath, distTemplatePath);
    }

    async build(clientConfig, serverConfig) {
        this.clientConfig = clientConfig;
        this.serverConfig = serverConfig;

        // generate client.entry.xxx
        this.generateEntryInfo();

        if (this.env === 'production') {
            // TODO
            await this.buildInProduction(clientConfig, serverConfig);
        }
        else {
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

    generateEntryInfo() {
        this.clientConfig.entry = {};
        this.config.entry.forEach(entryConfig => {
            let entryName = entryConfig.name;

            this.clientConfig.entry[entryName] = [`./entries/${entryName}/entry-client.js`];
        });
    }

    /**
     * get client manifest, and add middlewares to Koa instance
     *
     * @param {Function} callback callback
     */
    getClientManifest(callback) {
        let clientConfig = this.clientConfig;
        let entryNames = Object.keys(clientConfig.entry);

        clientConfig.context = this.rootDir;

        entryNames.forEach(entryName => {
            clientConfig.entry[entryName] = ['webpack-hot-middleware/client', ...clientConfig.entry[entryName]];
        });
        clientConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new VueSSRClientPlugin({
                filename: join(LAVAS_DIRNAME_IN_DIST, `[entryName]/${CLIENT_MANIFEST}`)
            })
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
        serverConfig.context = this.rootDir;

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
     *
     * @param {Object} options options
     * @param {string} options.templatePath html template
     */
    async createRenderer() {
        if (this.serverBundle && this.clientManifest) {
            let entryNames = Object.keys(this.clientConfig.entry);
            await Promise.all(entryNames.map(async entryName => {
                let first = !this.renderer[entryName];
                let template = await fs.readFile(this.getTemplatePath(entryName), 'utf-8');
                this.renderer[entryName] = createBundleRenderer(this.serverBundle, {
                    template,
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
            console.log(entryName, this.renderer[entryName])
            return Promise.resolve(this.renderer[entryName]);
        }

        return this.readyPromise;
    }
}
