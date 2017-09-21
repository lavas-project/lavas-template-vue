import RouteManager from './route-manager';
import WebpackConfig from './webpack';

import chokidar from 'chokidar';
import template from 'lodash.template';
import {copy, emptyDir, readFile, outputFile, pathExists} from 'fs-extra';
import {join} from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {CONFIG_FILE, TEMPLATE_HTML} from './constants';
import {webpackCompile} from './utils/webpack';
import {distLavasPath} from './utils/path';
import * as JsonUtil from './utils/json';
import templateUtil from './utils/template';

export default class Builder {
    constructor(core) {
        this.cwd = core.cwd;
        this.config = core.config;
        this.isProd = core.isProd;
        this.lavasDir = join(this.config.globals.rootDir, './.lavas');
        this.renderer = core.renderer;
        this.webpackConfig = new WebpackConfig(core.config, core.env);
        this.routeManager = new RouteManager(this);
    }

    /**
     * create an entry file for a skeleton component
     *
     * @param {string} entryName entryName
     * @param {string} skeletonPath used as import
     * @return {string} entryPath
     */
    async createEntryForSkeleton(entryName, skeletonPath) {
        const skeletonEntryTemplate = join(__dirname, './templates/entry-skeleton.tpl');
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
     */
    async buildMultiEntries() {
        let rootDir = this.config.globals.rootDir;

        // create mpa config based on client config
        let mpaConfig = this.webpackConfig.client(this.config);
        let skeletonEntries = {};

        // set context and clear entries
        mpaConfig.entry = {};
        mpaConfig.context = rootDir;

        /**
         * for each module needs prerendering, we will:
         * 1. add a html-webpack-plugin to output a relative HTML file
         * 2. create an entry if a skeleton component is provided
         */
        await Promise.all(this.config.entry.map(async entryConfig => {
            let {name: entryName, ssr: needSSR} = entryConfig;

            if (!needSSR) {
                let htmlFilename = `${entryName}.html`;
                // allow user to provide a custom HTML template
                let customTemplatePath = join(rootDir, `entries/${entryName}/${TEMPLATE_HTML}`);
                if (!await pathExists(customTemplatePath)) {
                    throw new Error(`${TEMPLATE_HTML} required for entry: ${name}`);
                }
                let clientTemplateContent = templateUtil.client(await readFile(customTemplatePath, 'utf8'));
                let realTemplatePath = join(rootDir, `.lavas/${entryName}/${TEMPLATE_HTML}`);
                await outputFile(realTemplatePath, clientTemplateContent);

                mpaConfig.entry[entryName] = [`./entries/${entryName}/entry-client.js`];

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
                    chunksSortMode: 'dependency',
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
            await webpackCompile(mpaConfig);
            console.log('[Lavas] MPA build completed.');
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
        let rawTemplate = await readFile(join(__dirname, 'templates/service-worker.js.tmpl'));
        let swTemplateContent = template(rawTemplate, {
            evaluate: /{{([\s\S]+?)}}/g,
            interpolate: /{{=([\s\S]+?)}}/g,
            escape: /{{-([\s\S]+?)}}/g
        })({
            entryConfig: JsonUtil.stringify(this.config.entry)
        });
        let swTemplateFilePath = join(__dirname, 'templates/service-worker-real.js.tmpl');
        await outputFile(swTemplateFilePath, swTemplateContent);
    }

    async build() {
        if (this.isProd) {
            // clear dist/
            await emptyDir(this.config.webpack.base.output.path);
        }

        // build routes' info and source code
        await this.routeManager.buildRoutes();

        // inject entry info into service-worker.js.tmpl for later use
        await this.injectEntriesToSW();

        // webpack client & server config
        let clientConfig = this.webpackConfig.client(this.config);
        let serverConfig = this.webpackConfig.server(this.config);

        // build bundle renderer
        await this.renderer.build(clientConfig, serverConfig);

        if (this.isProd) {
            console.log(`[Lavas] write and copy files...`);
            await Promise.all([
                /**
                 * when running online server, renderer needs to use template and
                 * replace some variables such as meta, config in it. so we need
                 * to store some props in config.json.
                 * TODO: not all the props in config is needed. for now, only manifest
                 * & assetsDir are required. some props such as globalDir are useless.
                 */
                this.writeConfigFile(this.config),
                // compile multi entries only in production mode
                this.buildMultiEntries(),
                // copy to /dist
                this.copyServerModuleToDist()
            ]);
        }
        // else {
            // TODO: use chokidar to rebuild routes in dev mode
            // let pagesDir = join(this.config.globals.rootDir, 'pages');
            // chokidar.watch(pagesDir)
            //     .on('change', async () => {
            //         await this.routeManager.buildRoutes();
            //     });
        // }
    }
}
