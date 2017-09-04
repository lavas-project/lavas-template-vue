/**
 * @file ssr renderer
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {join} from 'path';
import {readFile, emptyDir} from 'fs-extra';
import webpack from 'webpack';
import MFS from 'memory-fs';
import koaWebpack from 'koa-webpack';
import {createBundleRenderer} from 'vue-server-renderer';

export default class Renderer {
    constructor(core) {
        this.env = core.env;
        this.config = core.config;
        this.rootDir = this.config.globals.rootDir;
        this.app = core.app;
        this.renderer = null;
        this.serverBundle = null;
        this.clientManifest = null;
        this.resolve = null;
        this.readyPromise = new Promise(r => this.resolve = r);
    }

    async createAfterBuild() {
        let outputPath = this.config.webpack.base.output.path;
        this.serverBundle = await import(join(outputPath, './vue-ssr-server-bundle.json'));
        this.clientManifest = await import(join(outputPath, './vue-ssr-client-manifest.json'));
        await this.createRenderer();
    }

    async buildProduction(clientConfig, serverConfig) {
        let outputPath = this.config.webpack.base.output.path;

        // clear dist/
        await emptyDir(outputPath);

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

                console.log('[Lavas] production build completed.');
                resolve();
            });
        });
    }

    async build(clientConfig, serverConfig) {
        this.clientConfig = clientConfig;
        this.serverConfig = serverConfig;
        if (this.env === 'production') {
            this.buildProduction(clientConfig, serverConfig);
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

        // use koa webpack middleware which already includes dev&hot middleware
        let koaWebpackMiddleware = koaWebpack({
            compiler: clientCompiler,
            dev: {
                publicPath: this.config.webpack.base.output.publicPath,
                noInfo: true
            },
            hot: {
                heartbeat: 5000
            }
        });
        this.app.use(koaWebpackMiddleware);

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

            let rawContent = koaWebpackMiddleware.dev.fileSystem
                .readFileSync(join(clientConfig.output.path, 'vue-ssr-client-manifest.json'), 'utf-8');

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
                join(serverConfig.output.path, 'vue-ssr-server-bundle.json'), 'utf8');

            // read bundle generated by vue-ssr-webpack-plugin
            this.serverBundle = JSON.parse(rawContent);

            callback(null, this.serverBundle);
        });
    }

    /**
     * create renderer
     */
    async createRenderer() {
        if (this.serverBundle && this.clientManifest) {
            let first = !this.renderer;
            let template = await readFile(join(this.rootDir, './core/index.template.html'), 'utf-8');
            this.renderer = createBundleRenderer(this.serverBundle, {
                template,
                basedir: this.config.webpack.base.output.path,
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
