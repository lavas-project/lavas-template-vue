import RouteManager from './route-manager';
import WebpackConfig from './webpack';

import webpack from 'webpack';
import MFS from 'memory-fs';
import chokidar from 'chokidar';
import template from 'lodash.template';
import {copy, emptyDir, readFile, outputFile, pathExists} from 'fs-extra';
import {join} from 'path';

import historyMiddleware from 'connect-history-api-fallback';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {CONFIG_FILE, TEMPLATE_HTML} from './constants';
import {webpackCompile, enableHotReload, writeFileInDev} from './utils/webpack';
import {distLavasPath, assetsPath} from './utils/path';
import {routes2Reg} from './utils/router';
import * as JsonUtil from './utils/json';
import templateUtil from './utils/template';

function templatesPath(path) {
    return join(__dirname, 'templates', path);
}

export default class Builder {
    constructor(core) {
        this.core = core;
        this.cwd = core.cwd;
        this.config = core.config;
        this.lavasDir = join(this.config.globals.rootDir, './.lavas');
        this.renderer = core.renderer;
        this.internalMiddlewares = core.internalMiddlewares;
        this.webpackConfig = new WebpackConfig(core.config, core.env);
        this.routeManager = new RouteManager(core.config, core.env);
        this.ssrExists = this.config.entry.some(e => e.ssr);
        this.mpaExists = this.config.entry.some(e => !e.ssr);
        this.watchers = [];
        this.devMiddleware = null;
        this.devFs = new MFS();
    }

    /**
     * create an entry file for a skeleton component
     *
     * @param {string} entryName entryName
     * @param {string} skeletonPath used as import
     * @return {string} entryPath
     */
    async createSkeletonEntry(entryName, skeletonPath) {
        const skeletonEntryTemplate = templatesPath('entry-skeleton.tpl');
        // .lavas/${entryName}/skeleton.js
        let entryPath = join(this.lavasDir, `${entryName}/skeleton.js`);

        let writeFile = this.isDev ? writeFileInDev : outputFile;
        await writeFile(
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
     * create html template for entry
     *
     * @param {string} sourcePath sourcePath
     * @param {string} targetPath targetPath
     */
    async createHtmlTemplate(sourcePath, targetPath) {
        let writeFile = this.isDev ? writeFileInDev : outputFile;
        let clientTemplateContent = templateUtil.client(await readFile(sourcePath, 'utf8'));
        await writeFile(targetPath, clientTemplateContent);
    }

    /**
     * use html webpack plugin
     *
     * @param {Object} mpaConfig mpaConfig
     * @param {string} entryName entryName
     */
    async addHtmlPlugin(mpaConfig, entryName) {
        // allow user to provide a custom HTML template
        let rootDir = this.config.globals.rootDir;
        let htmlFilename = `${entryName}.html`;
        let customTemplatePath = join(rootDir, `entries/${entryName}/${TEMPLATE_HTML}`);
        if (!await pathExists(customTemplatePath)) {
            throw new Error(`${TEMPLATE_HTML} required for entry: ${entryName}`);
        }
        let realTemplatePath = join(this.lavasDir, `${entryName}/${TEMPLATE_HTML}`);
        await this.createHtmlTemplate(customTemplatePath, realTemplatePath);

        // add html webpack plugin
        mpaConfig.plugins.unshift(new HtmlWebpackPlugin({
            filename: htmlFilename,
            template: realTemplatePath,
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

        // watch template in development mode
        if (this.isDev) {
            this.addWatcher(customTemplatePath, 'change', async () => {
                await this.createHtmlTemplate(customTemplatePath, realTemplatePath);
            });
        }
    }

    /**
     * create a webpack config and compile with it
     *
     * @return {Object} mpaConfig webpack config for MPA
     */
    async createMPAConfig() {
        let rootDir = this.config.globals.rootDir;

        // create mpa config based on client config
        let mpaConfig = this.webpackConfig.client();
        let skeletonEntries = {};

        // set context and clear entries
        mpaConfig.entry = {};
        mpaConfig.name = 'mpaclient';
        mpaConfig.context = rootDir;

        /**
         * for each module needs prerendering, we will:
         * 1. add a html-webpack-plugin to output a relative HTML file
         * 2. create an entry if a skeleton component is provided
         */
        await Promise.all(this.config.entry.map(async entryConfig => {
            let {name: entryName, ssr: needSSR} = entryConfig;

            if (!needSSR) {
                // set client entry first
                mpaConfig.entry[entryName] = [`./entries/${entryName}/entry-client.js`];

                // add html-webpack-plugin
                await this.addHtmlPlugin(mpaConfig, entryName);

                // if skeleton provided, we need to create an entry
                let skeletonPath = join(rootDir, `entries/${entryName}/skeleton.vue`);
                let skeletonImportPath = `@/entries/${entryName}/skeleton.vue`;
                if (await pathExists(skeletonPath)) {
                    let entryPath = await this.createSkeletonEntry(entryName, skeletonImportPath);
                    // skeletonEntries[entryName] = [entryPath];
                }
            }
        }));

        if (Object.keys(skeletonEntries).length) {
            // when ssr skeleton, we need to extract css from js
            let skeletonConfig = this.webpackConfig.server({cssExtract: true});
            // remove vue-ssr-client plugin
            skeletonConfig.plugins.pop();
            skeletonConfig.entry = skeletonEntries;

            // add skeleton plugin
            mpaConfig.plugins.push(new SkeletonWebpackPlugin({
                webpackConfig: skeletonConfig
            }));
        }

        // enable hotreload in every entry in dev mode
        if (this.isDev) {
            await enableHotReload(this.lavasDir, mpaConfig, true);
        }
        // await webpackCompile(mpaConfig);
        return mpaConfig;
    }

    /**
     * write config.json which will be used in prod mode
     *
     * @param {Object} config
     */
    async writeConfigFile(config) {
        let configFilePath = distLavasPath(config.build.path, CONFIG_FILE);
        await outputFile(configFilePath, JsonUtil.stringify(config));
    }

    /**
     * copy server relatived files into dist when build
     */
    async copyServerModuleToDist() {
        let distPath = this.config.build.path;

        // TODO: delete after moving lib to lavas-core
        let libDir = join(this.cwd, 'lib');
        let distLibDir = join(distPath, 'lib');

        let serverDir = join(this.cwd, 'server.prod.js');
        let distServerDir = join(distPath, 'server.prod.js');

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
        // only pages in MPA need skeleton
        let entriesWithSkeleton = entry.filter(async e => {
            let {name, ssr} = e;
            let skeletonPath = join(rootDir, `entries/${name}/skeleton.vue`);
            return !ssr && await pathExists(skeletonPath);
        });

        clientConfig.module.rules.push(SkeletonWebpackPlugin.loader({
            resource: entriesWithSkeleton.map(e => join(rootDir, `.lavas/${e.name}/routes`)),
            options: {
                entry: entriesWithSkeleton.map(e => e.name),
                importTemplate: 'import [nameCap] from \'@/entries/[name]/skeleton.vue\';',
                routePathTemplate: '/skeleton-[name]',
                insertAfter: 'let routes = ['
            }
        }));
    }

    /**
     * set chokidar watchers, following directories and files will be watched:
     * /pages, /config, /entries/[entry]/index.html.tmpl
     *
     * @param {string|Array.<string>} paths
     * @param {string|Array.<string>} events
     * @param {Function} callback callback
     */
    addWatcher(paths, events, callback) {
        if (!Array.isArray(events)) {
            events = [events];
        }
        let watcher = chokidar.watch(paths, {ignoreInitial: true});
        events.forEach(event => {
            watcher.on(event, callback);
        });
        this.watchers.push(watcher);
    }

    /**
     * build in development mode
     */
    async buildDev() {
        this.isDev = true;
        // webpack client & server config
        let clientConfig = this.webpackConfig.client();
        let serverConfig = this.webpackConfig.server();
        let hotMiddleware;

        await this.routeManager.buildRoutes();

        if (this.ssrExists) {
            console.log('[Lavas] SSR build starting...');
            // build bundle renderer
            await this.renderer.build(clientConfig, serverConfig);
            console.log('[Lavas] SSR build completed.');
        }

        if (this.mpaExists) {
            console.log('[Lavas] MPA build starting...');
            // create mpa config first
            let mpaConfig = await this.createMPAConfig();

            // add skeleton routes
            this.addSkeletonRoutes(mpaConfig);

            // create a compiler based on mpa config
            let compiler = webpack(mpaConfig);
            compiler.outputFileSystem = this.devFs;
            this.devMiddleware = webpackDevMiddleware(compiler, {
                publicPath: clientConfig.output.publicPath,
                noInfo: true
            });

            hotMiddleware = webpackHotMiddleware(compiler, {
                heartbeat: 5000,
                log: () => {}
            });

            /**
             * TODO: hot reload for html
             * html-webpack-plugin has a problem with webpack 3.x.
             * the relative ISSUE: https://github.com/vuejs-templates/webpack/issues/751#issuecomment-309955295
             *
             * before the problem solved, there's no page reload
             * when the html-webpack-plugin template changes
             */
            // compiler.plugin('compilation', (compilation) => {
            //     compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
            //         // trigger reload action, which will be used in hot-reload-client.js
            //         hotMiddleware.publish({
            //             action: 'reload'
            //         });
            //         cb();
            //     });
            // });

            /**
             * add html history api support:
             * in mpa, we use connect-history-api-fallback middleware
             * in ssr, ssr middleware will handle it instead
             */
            if (!this.ssrExists) {
                let mpaEntries = this.config.entry.filter(e => !e.ssr);
                let rewrites = mpaEntries
                    .map(entry => {
                        let {name, routes} = entry;
                        return {
                            from: routes2Reg(routes),
                            to: `/${name}.html`
                        };
                    });
                /**
                 * we should put this middleware in front of dev middleware since
                 * it will rewrite req.url to xxx.html based on options.rewrites
                 */
                this.internalMiddlewares.push(historyMiddleware({
                    htmlAcceptHeaders: ['text/html'],
                    disableDotRule: false, // ignore paths with dot inside
                    // verbose: true,
                    rewrites
                }));
            }

            // add dev & hot-reload middlewares
            this.internalMiddlewares.push(this.devMiddleware);
            this.internalMiddlewares.push(hotMiddleware);
            console.log('[Lavas] MPA build completed.');
        }

        // use chokidar to rebuild routes
        let pagesDir = join(this.config.globals.rootDir, 'pages');
        this.addWatcher(pagesDir, ['add', 'unlink'], async () => {
            await this.routeManager.buildRoutes();
        });

        // TODO: watch files provides by user
        if (this.config.build.watch) {
            this.addWatcher(this.config.build.watch, 'change', async () => {
                await this.routeManager.buildRoutes();
                if (this.ssrExists) {
                    this.renderer.refreshFiles();
                }
            });
        }

        // watch config directory, rebuild whole process
        let configDir = join(this.config.globals.rootDir, 'config');
        this.addWatcher(configDir, 'change', async () => {
            console.log('[Lavas] config changed, start rebuilding...');
            await this.close();
            this.config = await this.core.configReader.read();
            this.webpackConfig.config = this.config;
            this.routeManager.config = this.config;
            await this.buildDev();
            console.log('[Lavas] rebuild finish.');
        });
    }

    /**
     * build in production mode
     */
    async buildProd() {
        this.isProd = true;
        // clear dist/ first
        await emptyDir(this.config.build.path);
        // inject routes into service-worker.js.tmpl for later use
        await this.injectEntriesToSW();
        await this.routeManager.buildRoutes();

        // SSR build process
        if (this.ssrExists) {
            console.log('[Lavas] SSR build starting...');
            // webpack client & server config
            let clientConfig = this.webpackConfig.client();
            let serverConfig = this.webpackConfig.server();
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
            await webpackCompile(await this.createMPAConfig());
            console.log('[Lavas] MPA build completed.');
        }
    }

    /**
     * close watchers and some middlewares before rebuild
     *
     */
    async close() {
        // close chokidar watchers
        if (this.watchers && this.watchers.length) {
            this.watchers.forEach(watcher => {
                watcher.close();
            });
            this.watchers = [];
        }
        // close devMiddlewares
        if (this.devMiddleware) {
            await new Promise(resolve => {
                this.devMiddleware.close(() => resolve());
            });
        }
    }
}
