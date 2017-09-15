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
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin';

import {distLavasPath, resolveAliasPath} from './utils/path';
import {webpackCompile} from './utils/webpack';
import constants from './constants';

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
        return join(this.rootDir, `entries/${entryName}/`, constants.TEMPLATE_HTML);
    }

    async createWithBundle() {
        this.serverBundle = await import(distLavasPath(this.cwd, constants.SERVER_BUNDLE));
        // TODO entryName
        this.clientManifest = await import(distLavasPath(this.cwd, constants.CLIENT_MANIFEST));
        await this.createRenderer({
            templatePath: distLavasPath(this.cwd, constants.TEMPLATE_HTML)
        });
    }

    async buildInProduction(clientConfig, serverConfig, entryName) {
        // set context in both configs
        clientConfig.context = this.rootDir;
        serverConfig.context = this.rootDir;

        // start to build client & server configs
        await webpackCompile([clientConfig, serverConfig]);

        // copy index.template.html to dist/lavas
        let templatePath = this.getTemplatePath(entryName);
        let distTemplatePath = distLavasPath(this.config.webpack.base.output.path, entryName, constants.TEMPLATE_HTML);
        await fs.copy(templatePath, distTemplatePath);
    }

    async build(clientConfig, serverConfig) {
        // generate manifest, serverBundle, templatePath for each entry
        this.config.entries.forEach(entry => {
            let entryName = entry.name;
            // TODO use clientConfig.resolve.alias
            let templatePath = this.getTemplatePath(entryName);
            this.clientConfig = clientConfig;
            this.serverConfig = serverConfig;
            // add client entry and plugins to clientConfig
            this.extendClientConfig(entryName);

            if (this.env === 'production') {
                await this.buildInProduction(clientConfig, serverConfig, entryName);
            }
            else {
                // get client manifest
                this.getClientManifest(entryName, async (err, manifest) => {
                    this.clientManifest[entryName] = manifest;
                    await this.createRenderer(templatePath, entryName);
                });

                // get server bundle
                this.getServerBundle(async (err, serverBundle) => {
                    this.serverBundle = serverBundle;
                    await this.createRenderer(templatePath, entryName);
                });
            }
        });

        if (this.env === 'production') {
            console.log('[Lavas] SSR build completed.');
        }
    },

    extendClientConfig(entryName) {
        this.clientConfig.entry[entryName] = [`./entries/${entryName}/entry-client.js`];
        this.clientConfig.plugins.push(
            new VueSSRClientPlugin({
                filename: join(constants.LAVAS_DIRNAME_IN_DIST, entryName, constants.CLIENT_MANIFEST)
            })
        );
    },

    /**
     * get client manifest, and add middlewares to Koa instance
     *
     * @param {Function} callback callback
     */
    getClientManifest(entryName, callback) {
        let clientConfig = this.clientConfig;

        clientConfig.context = this.rootDir;
        clientConfig.entry[entryName] = ['webpack-hot-middleware/client', ...clientConfig.entry[entryName]];
        clientConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
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

            let rawContent = devMiddleware.fileSystem
                .readFileSync(distLavasPath(clientConfig.output.path, entryName, constants.CLIENT_MANIFEST), 'utf-8');

            callback(null, JSON.parse(rawContent));
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
                distLavasPath(serverConfig.output.path, constants.SERVER_BUNDLE), 'utf8');

            callback(null, JSON.parse(rawContent));
        });
    }

    /**
     * create renderer
     *
     * @param {Object} options options
     * @param {string} options.templatePath html template
     */
    async createRenderer(templatePath, entryName) {
        if (this.serverBundle && this.clientManifest[entryName] && templatePath) {

            let first = !this.renderer[entryName];
            let template = await fs.readFile(templatePath, 'utf-8');
            this.renderer[entryName] = createBundleRenderer(this.serverBundle, {
                template,
                clientManifest: this.clientManifest[entryName],
                runInNewContext: false
            });

            if (first) {
                this.resolve(this.renderer[entryName]);
            }
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
