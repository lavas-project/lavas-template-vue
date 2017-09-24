import RouteManager from './route-manager';
import WebpackConfig from './webpack';

import webpack from 'webpack';
import chokidar from 'chokidar';
import template from 'lodash.template';
import {copy, emptyDir, readFile, outputFile, pathExists} from 'fs-extra';
import {join} from 'path';

import historyMiddleware from 'connect-history-api-fallback';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {CONFIG_FILE} from './constants';
import {webpackCompile, enableHotReload} from './utils/webpack';
import {distLavasPath, assetsPath} from './utils/path';
import * as JsonUtil from './utils/json';

function templatesPath(path) {
    return join(__dirname, 'templates', path);
}

export default class Builder {
    constructor(core) {
        this.cwd = core.cwd;
        this.config = core.config;
        this.lavasDir = join(this.config.globals.rootDir, './.lavas');
        this.renderer = core.renderer;
        this.internalMiddlewares = core.internalMiddlewares;
        this.webpackConfig = new WebpackConfig(core.config, core.env);
        this.routeManager = new RouteManager(this);
        this.ssrExists = this.config.entry.some(e => e.ssr);
        this.mpaExists = this.config.entry.some(e => !e.ssr);
    }

    /**
     * create an entry file for a skeleton component
     *
     * @param {string} entryName entryName
     * @param {string} skeletonPath used as import
     * @return {string} entryPath
     */
    async createEntryForSkeleton(entryName, skeletonPath) {
        const skeletonEntryTemplate = templatesPath('entry-skeleton.tpl');
        // .lavas/${entryName}/skeleton.js
        let entryPath = join(this.lavasDir, `${entryName}/skeleton.js`);

        await outputFile(
            entryPath,
            template(await readFile(skeletonEntryTemplate, 'utf8'))({
                skeleton: {
                    path: skeletonPath
                }
            })
        );

        return entryPath;
    }

    /**
     * create a webpack config and compile with it
     *
     * @param {boolean} isDev is in development mode?
     * @return {Object} compiler webpack compiler
     */
    async buildMultiEntries(isDev) {
        let rootDir = this.config.globals.rootDir;

        // create mpa config based on client config
        let mpaConfig = this.webpackConfig.client(this.config);
        let skeletonEntries = {};

        // set context and clear entries
        mpaConfig.entry = {};
        mpaConfig.name = 'mpaClient';
        mpaConfig.context = rootDir;

        /**
         * for each module needs prerendering, we will:
         * 1. add a html-webpack-plugin to output a relative HTML file
         * 2. create an entry if a skeleton component is provided
         */
        await Promise.all(this.config.entry.map(async entryConfig => {
            let {name: entryName, ssr: needSSR} = entryConfig;

            if (!needSSR) {
                // allow user to provide a custom HTML template
                let htmlTemplatePath = join(rootDir, `entries/${entryName}/client.template.html`);
                if (!await pathExists(htmlTemplatePath)) {
                    htmlTemplatePath = templatesPath('index.template.html');
                }
                let htmlFilename = `${entryName}.html`;

                mpaConfig.entry[entryName] = [`./entries/${entryName}/entry-client.js`];

                // add html webpack plugin
                mpaConfig.plugins.unshift(new HtmlWebpackPlugin({
                    filename: htmlFilename,
                    template: htmlTemplatePath,
                    inject: true,
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true
                    },
                    favicon: assetsPath('img/icons/favicon.ico'),
                    chunksSortMode: 'dependency',
                    chunks: ['manifest', 'vue', 'vendor', entryName],
                    config: this.config // use config in template
                }));

                let skeletonPath = join(rootDir, `entries/${entryName}/skeleton.vue`);
                let skeletonImportPath = `@/entries/${entryName}/skeleton.vue`;
                if (await pathExists(skeletonPath)) {
                    let entryPath = await this.createEntryForSkeleton(entryName, skeletonImportPath);
                    skeletonEntries[entryName] = [entryPath];
                }
            }
        }));

        if (Object.keys(skeletonEntries).length) {
            let skeletonConfig = this.webpackConfig.server(this.config);
            // remove vue-ssr-client plugin
            skeletonConfig.plugins.pop();
            skeletonConfig.entry = skeletonEntries;

            // add skeleton plugin
            mpaConfig.plugins.push(new SkeletonWebpackPlugin({
                webpackConfig: skeletonConfig
            }));
        }

        if (Object.keys(mpaConfig.entry).length) {
            // enable hotreload in every entry in dev mode
            if (isDev) {
                enableHotReload(mpaConfig);
            }
            // await webpackCompile(mpaConfig);
            return webpack(mpaConfig);
        }
    }

    /**
     * write config.json which will be used in prod mode
     *
     * @param {Object} config
     */
    async writeConfigFile(config) {
        let configFilePath = distLavasPath(config.webpack.base.output.path, CONFIG_FILE);
        await outputFile(configFilePath, JsonUtil.stringify(config));
    }

    /**
     * copy server relatived files into dist when build
     */
    async copyServerModuleToDist() {
        let distPath = this.config.webpack.base.output.path;

        let libDir = join(this.cwd, 'lib');
        let distLibDir = join(distPath, 'lib');

        let serverDir = join(this.cwd, 'server.dev.js');
        let distServerDir = join(distPath, 'server.js');

        let nodeModulesDir = join(this.cwd, 'node_modules');
        let distNodeModulesDir = join(distPath, 'node_modules');

        let jsonDir = join(this.cwd, 'package.json');
        let distJsonDir = join(distPath, 'package.json');

        await Promise.all([
            copy(libDir, distLibDir),
            copy(serverDir, distServerDir),
            copy(nodeModulesDir, distNodeModulesDir),
            copy(jsonDir, distJsonDir)
        ]);
    }

    /**
     * inject routes into service-worker.js.tmpl for later use
     */
    async injectEntriesToSW() {
        // add entryConfig to service-worker.tmpl.js
        let rawTemplate = await readFile(templatesPath('service-worker.js.tmpl'));
        let swTemplateContent = template(rawTemplate, {
            evaluate: /{{([\s\S]+?)}}/g,
            interpolate: /{{=([\s\S]+?)}}/g,
            escape: /{{-([\s\S]+?)}}/g
        })({
            entryConfig: JsonUtil.stringify(this.config.entry)
        });
        let swTemplateFilePath = templatesPath('service-worker-real.js.tmpl');
        await outputFile(swTemplateFilePath, swTemplateContent);
    }

    /**
     * add skeleton routes in development mode
     *
     * @param {object} clientConfig webpack client config
     */
    addSkeletonRoutes(clientConfig) {
        let {globals: {rootDir}, entry} = this.config;
        let entriesWithSkeleton = this.config.entry.filter(async e => {
            let {name, ssr} = e;
            let skeletonPath = join(rootDir, `entries/${name}/skeleton.vue`);
            return !ssr && await pathExists(skeletonPath);
        });
        clientConfig.module.rules.push(SkeletonWebpackPlugin.loader({
            resource: join(rootDir, '.lavas/main/routes'),
            options: {
                entry: entriesWithSkeleton.map(e => e.name),
                // template of importing skeleton component
                importTemplate: 'import [nameCap] from \'@/entries/[name]/skeleton.vue\';',
                // template of route path
                routePathTemplate: '/skeleton-[name]',
                // position to insert route object in router.js file
                insertAfter: 'let routes = ['
            }
        }));
    }

    /**
     * build in development mode
     */
    async buildDev() {
        // webpack client & server config
        let clientConfig = this.webpackConfig.client(this.config);
        let serverConfig = this.webpackConfig.server(this.config);

        await this.routeManager.buildRoutes();

        if (this.ssrExists) {
            console.log('[Lavas] SSR build starting...');
            // add skeleton routes
            // this.addSkeletonRoutes(clientConfig);
            // build bundle renderer
            await this.renderer.build(clientConfig, serverConfig);
            console.log('[Lavas] SSR build completed.');
        }

        if (this.mpaExists) {
            console.log('[Lavas] MPA build starting...');
            let compiler = await this.buildMultiEntries(true);
            let devMiddleware = webpackDevMiddleware(compiler, {
                publicPath: clientConfig.output.publicPath,
                noInfo: true
            });
            let hotMiddleware = webpackHotMiddleware(compiler, {
                heartbeat: 5000
            });

            // hotreload for html
            compiler.plugin('compilation', (compilation) => {
                compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
                    hotMiddleware.publish({
                        action: 'reload'
                    });
                    cb();
                });
            });

            // add html history api support
            this.internalMiddlewares.push(historyMiddleware({
                htmlAcceptHeaders: ['text/html'],
                rewrites: [{
                    from: new RegExp('/rewrite/detail'),
                    to: '/detail.html'
                },{
                    from: new RegExp('/'),
                    to: '/main.html'
                }]
            }));
            this.internalMiddlewares.push(devMiddleware);
            this.internalMiddlewares.push(hotMiddleware);
            console.log('[Lavas] MPA build completed.');
        }

        // use chokidar to rebuild routes
        // let pagesDir = join(this.config.globals.rootDir, 'pages');
        // chokidar.watch(pagesDir)
        //     .on('change', async () => {
        //         await this.routeManager.buildRoutes();
        //     });
    }

    /**
     * build in production mode
     */
    async buildProd() {
        // clear dist/ first
        await emptyDir(this.config.webpack.base.output.path);
        // inject routes into service-worker.js.tmpl for later use
        await this.injectEntriesToSW();
        await this.routeManager.buildRoutes();

        // SSR build process
        if (this.ssrExists) {
            console.log('[Lavas] SSR build starting...');
            // webpack client & server config
            let clientConfig = this.webpackConfig.client(this.config);
            let serverConfig = this.webpackConfig.server(this.config);
            // build bundle renderer
            await this.renderer.build(clientConfig, serverConfig);
            await Promise.all([
                /**
                 * when running online server, renderer needs to use template and
                 * replace some variables such as meta, config in it. so we need
                 * to store some props in config.json.
                 * TODO: not all the props in config is needed. for now, only manifest
                 * & assetsDir are required. some props such as globalDir are useless.
                 */
                this.writeConfigFile(this.config),
                // copy some files to /dist
                this.copyServerModuleToDist()
            ]);
            console.log('[Lavas] SSR build completed.');
        }

        // MPA build process
        if (this.mpaExists) {
            console.log('[Lavas] MPA build starting...');
            await this.buildMultiEntries();
            console.log('[Lavas] MPA build completed.');
        }
    }
}
