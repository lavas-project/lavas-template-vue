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

import {distLavasPath, resolveAliasPath} from './utils/path';
import {webpackCompile} from './utils/webpack';
import {CLIENT_MANIFEST, SERVER_BUNDLE, TEMPLATE_HTML} from './constants';

export default class Renderer {
    constructor(core) {
        this.env = core.env;
        this.config = core.config;
        this.rootDir = this.config && this.config.globals.rootDir;
        this.cwd = core.cwd;
        this.internalMiddlewares = core.internalMiddlewares;
        this.renderer = null;
        this.serverBundle = null;
        this.clientManifest = null;
        this.resolve = null;
        this.readyPromise = new Promise(r => this.resolve = r);
    }

    /**
     * resolve template path with webpack alias
     *
     * @param {string} alias webpack alias
     * @return {string} resolved path
     */
    getTemplatePath(alias) {
        let templatePath;
        try {
            // try to use template defined in config
            templatePath = resolveAliasPath(alias, this.config.module.default.ssrHtmlTemplate);
        }
        catch (e) {
            // use default template instead
            templatePath = join(this.rootDir, 'core', TEMPLATE_HTML);
        }
        return templatePath;
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
        await webpackCompile([clientConfig, serverConfig]);

        // copy index.template.html to dist/lavas
        let templatePath = this.getTemplatePath(clientConfig.resolve.alias);
        let distTemplatePath = distLavasPath(this.config.webpack.base.output.path, TEMPLATE_HTML);
        await copy(templatePath, distTemplatePath);

        console.log('[Lavas] SSR build completed.');
    }

    async build(clientConfig, serverConfig) {
        let templatePath = this.getTemplatePath(clientConfig.resolve.alias);
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
                .readFileSync(distLavasPath(clientConfig.output.path, CLIENT_MANIFEST), 'utf-8');

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
    async createRenderer({templatePath}) {
        if (this.serverBundle && this.clientManifest && templatePath) {

            let first = !this.renderer;
            let template = await readFile(templatePath, 'utf-8');
            this.renderer = createBundleRenderer(this.serverBundle, {
                template,
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
