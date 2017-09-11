/**
 * @file ssr renderer
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {join} from 'path';
import {readFile, copy} from 'fs-extra';
import webpack from 'webpack';
import MFS from 'memory-fs';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {createBundleRenderer} from 'vue-server-renderer';

import {distLavasPath} from './utils/path';
import {CLIENT_MANIFEST, SERVER_BUNDLE, TEMPLATE_HTML} from './constants';

export default class Renderer {
    constructor(core) {
        this.env = core.env;
        this.config = core.config;
        this.rootDir = this.config && this.config.globals.rootDir;
        this.cwd = core.cwd;
        this.app = core.app;
        this.renderer = null;
        this.serverBundle = null;
        this.clientManifest = null;
        this.resolve = null;
        this.readyPromise = new Promise(r => this.resolve = r);
        this.privateFiles = [CLIENT_MANIFEST, SERVER_BUNDLE, TEMPLATE_HTML];
    }

    async createWithBundle() {
        this.serverBundle = await import(distLavasPath(this.cwd, SERVER_BUNDLE));
        this.clientManifest = await import(distLavasPath(this.cwd, CLIENT_MANIFEST));
        await this.createRenderer({
            templatePath: distLavasPath(this.cwd, TEMPLATE_HTML)
        });
    }

    async buildInProduction(clientConfig, serverConfig) {
        // set context in both configs
        clientConfig.context = this.rootDir;
        serverConfig.context = this.rootDir;

        // start to build client & server configs
        await new Promise((resolve, reject) => {

            webpack([clientConfig, serverConfig], (err, stats) => {
                if (err) {
                    console.error(err.stack || err);
                    if (err.details) {
                        console.error(err.details);
                    }
                    reject(err);
                    return;
                }

                const info = stats.toJson();

                if (stats.hasErrors()) {
                    console.error(info.errors);
                    reject(info.errors);
                    return;
                }

                if (stats.hasWarnings()) {
                    console.warn(info.warnings);
                }

                console.log('[Lavas] SSR build completed.');
                resolve();
            });
        });

        // copy index.template.html to dist/lavas
        let templatePath = join(this.rootDir, 'core', TEMPLATE_HTML);
        let distTemplatePath = distLavasPath(this.config.webpack.base.output.path, TEMPLATE_HTML);
        await copy(templatePath, distTemplatePath);
    }

    async build(clientConfig, serverConfig) {
        let templatePath = join(this.rootDir, 'core', TEMPLATE_HTML);
        this.clientConfig = clientConfig;
        this.serverConfig = serverConfig;
        if (this.env === 'production') {
            await this.buildInProduction(clientConfig, serverConfig);
        }
        else {
            // get client manifest
            this.getClientManifest(async (err, manifest) => {
                this.clientManifest = manifest;
                await this.createRenderer({templatePath});
            });

            // get server bundle
            this.getServerBundle(async (err, serverBundle) => {
                this.serverBundle = serverBundle;
                await this.createRenderer({templatePath});
            });
        }
    }

    /**
     * get client manifest, and add middlewares to Koa instance
     *
     * @param {Function} callback callback
     */
    getClientManifest(callback) {
        let clientConfig = this.clientConfig;

        clientConfig.context = this.rootDir;
        clientConfig.entry.app = ['webpack-hot-middleware/client', ...clientConfig.entry.app];
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

        this.app.use(devMiddleware);

        // hot middleware
        let hotMiddleware = webpackHotMiddleware(clientCompiler, {
            heartbeat: 5000
        });

        this.app.use(hotMiddleware);

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
                .readFileSync(distLavasPath(clientConfig.output.path, CLIENT_MANIFEST), 'utf-8');

            this.clientManifest = JSON.parse(rawContent);

            callback(null, this.clientManifest);
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

            // read bundle generated by vue-ssr-webpack-plugin
            this.serverBundle = JSON.parse(rawContent);

            callback(null, this.serverBundle);
        });
    }

    /**
     * create renderer
     *
     * @param {Object} options options
     * @param {string} options.templatePath html template
     */
    async createRenderer({templatePath}) {
        if (this.serverBundle && this.clientManifest && templatePath) {
            let first = !this.renderer;
            let template = await readFile(templatePath, 'utf-8');
            this.renderer = createBundleRenderer(this.serverBundle, {
                template,
                // basedir: this.config.webpack.base.output.path,
                clientManifest: this.clientManifest,
                runInNewContext: false
            });

            if (first) {
                this.resolve(this.renderer);
            }
        }
    }

    /**
     * get vue server renderer
     *
     * @return {Promise.<*>}
     */
    getRenderer() {
        if (this.renderer) {
            return Promise.resolve(this.renderer);
        }

        return this.readyPromise;
    }
}
