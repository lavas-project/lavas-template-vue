/**
 * @file route manager
 * @author panyuqi
 * @desc generate route.js, multi entries in .lavas directory
 */

import {
    utimes,
    readFile,
    writeFile,
    emptyDir,
    ensureFile
} from 'fs-extra';
import {join} from 'path';
import {createHash} from 'crypto';
import template from 'lodash.template';
import webpack from 'webpack';
import merge from 'webpack-merge';
import lruCache from 'lru-cache';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {generateRoutes} from './utils/router';

const routesTemplate = join(__dirname, './templates/routes.tpl');
const skeletonEntryTemplate = join(__dirname, './templates/entry-skeleton.tpl');
const ROUTES_FILE = 'routes.json';

export default class RouteManager {

    constructor(config, env, webpackConfig) {
        this.config = config;
        this.env = env;
        this.webpackConfig = webpackConfig;

        Object.assign(this, {
            targetDir: join(config.globals.rootDir, './.lavas'),
            skeletonsDirname: 'skeletons'
        });

        this.routes = [];

        this.flatRoutes = new Set();

        this.prerenderCache = lruCache({
            max: 1000,
            maxAge: 1000 * 60 * 15
        });

        this.privateFiles = [];
    }

    /**
     * find matched route
     *
     * @param {string} path route path
     * @param {Array} routes routes
     * @return {Object} matchedRoute
     */
    findMatchedRoute(path, routes = this.routes) {
        let matchedRoute = routes.find(route => route.pathRegExp.test(path));
        if (matchedRoute && matchedRoute.children) {
            let matched = route.pathRegExp.match(path);
            if (matched && matched[0]) {
                matchedRoute = findMatchedRoute(
                    path.substring(matched[0].length), matchedRoute.children);
            }
        }
        return matchedRoute;
    }

    /**
     * find html according to current route
     *
     * @param {Object} route route
     * @return {Promise}
     */
    async prerender(route) {
        if (route && route.htmlPath) {
            let entry = this.prerenderCache.get(route.name);
            if (!entry) {
                entry = await readFile(route.htmlPath, 'utf8');
                this.prerenderCache.set(route.name, entry);
            }
            return entry;
        }
    }

    /**
     * create an entry file for a skeleton component
     *
     * @param {string} pagename pagename
     * @param {string} skeletonPath used as import
     * @return {string} entryPath
     */
    async createEntryForSkeleton(pagename, skeletonPath) {

        // .lavas/skeletons
        let skeletonsDir = join(this.targetDir, this.skeletonsDirname);
        await emptyDir(skeletonsDir);

        // eg. .lavas/skeletons/detail-entry-skeleton.js
        let entryPath = join(skeletonsDir, `./${pagename}-entry-skeleton.js`);

        await writeFile(
            entryPath,
            template(await readFile(skeletonEntryTemplate, 'utf8'))({
                skeleton: {
                    path: skeletonPath
                }
            }),
            'utf8'
        );

        return entryPath;
    }

    /**
     * create a webpack config and compile with it
     *
     */
    async buildMultiEntries() {
        let {shortcuts, base} = this.config.webpack;
        let {assetsDir, ssr} = shortcuts;

        // create mpa config based on client config
        let mpaConfig = merge(this.webpackConfig.client(this.config));
        let skeletonEntries = {};

        // set context and clear entries
        mpaConfig.entry = {};
        mpaConfig.context = this.config.globals.rootDir;

        // remove vue-ssr-client plugin
        if (ssr) {
            // TODO: what if vue-ssr-client-plugin is not the last one in plugins array?
            mpaConfig.plugins.pop();
        }

        /**
         * for each route needs prerendering, we will:
         * 1. add a html-webpack-plugin to output a relative HTML file
         * 2. create an entry if a skeleton component is provided
         */
        await Promise.all(this.routes.map(async route => {
            let {pagename, template, prerender, skeleton} = route;

            if (prerender) {

                // allow user to provide a custom HTML template
                let htmlTemplatePath = template
                    || join(__dirname, './templates/index.template.html');
                let htmlFilename = `${pagename}.html`;

                // save the path of HTML file which will be used in prerender searching process
                route.htmlPath = join(base.output.path, htmlFilename);

                mpaConfig.entry[pagename] = ['./core/entry-client.js'];

                // add html webpack plugin
                mpaConfig.plugins.push(new HtmlWebpackPlugin({
                    filename: htmlFilename,
                    template: htmlTemplatePath,
                    inject: true,
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true
                    },
                    favicon: join(assetsDir, 'img/icons/favicon.ico'),
                    chunksSortMode: 'dependency',
                    config: this.config
                }));

                if (skeleton) {
                    let entryPath = await this.createEntryForSkeleton(pagename, skeleton);
                    skeletonEntries[pagename] = [entryPath];
                }
            }
        }));

        if (Object.keys(skeletonEntries).length) {
            let skeletonConfig = merge(this.webpackConfig.server(this.config));
            // remove vue-ssr-client plugin
            if (ssr) {
                // TODO: what if vue-ssr-server-plugin is not the last one in plugins array?
                skeletonConfig.plugins.pop();
            }
            skeletonConfig.entry = skeletonEntries;

            // add skeleton plugin
            mpaConfig.plugins.push(new SkeletonWebpackPlugin({
                webpackConfig: skeletonConfig
            }));
        }

        if (Object.keys(mpaConfig.entry).length) {

            await new Promise((resolve, reject) => {

                // start to compile multi entries
                webpack(mpaConfig, (err, stats) => {
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

                    console.log('[Lavas] prerender completed.');
                    resolve();
                });
            });
        }
    }

    /**
     * merge routes with config recursively
     *
     * @params {Array} routes
     * @params {Array} routesConfig
     */
    mergeWithConfig(routes, routesConfig = []) {

        routes.forEach(route => {

            // add to set
            this.flatRoutes.add(route);

            // find route in config
            let routeConfig = routesConfig.find(r => r.name === route.name);

            // mixin with config
            if (routeConfig) {
                let {
                    path: routePath,
                    lazyLoading,
                    chunkname
                } = routeConfig;

                Object.assign(route, routeConfig, {
                    path: routePath || route.path,
                    lazyLoading: lazyLoading || !!chunkname
                });
            }

            if (route.name) {
                /**
                 * generate hash for each route which will be used in routes.js template,
                 * an underscore "_" will be added in front of each hash, because JS variables can't
                 * start with numbers
                 */
                route.hash = createHash('md5').update(route.name).digest('hex');
            }

            /**
             * turn route fullpath into regexp
             * eg. /detail/:id => /^\/detail\/[^\/]+\/?$/
             */
            route.pathRegExp = new RegExp(`^${route.path.replace(/\/:[^\/]*/g, '/[^\/]+')}\/?`);

            if (route.children && route.children.length) {
                this.mergeWithConfig(route.children, routeConfig && routeConfig.children);
            }
        });
    }

    /**
     * generate routes content
     *
     * @params {Array} routes
     * @return {string} content
     */
    generateRoutesContent(routes) {
        return routes.reduce((prev, cur) => {
            let childrenContent = '';
            if (cur.children) {
                childrenContent = `children: [
                    ${this.generateRoutesContent(cur.children)}
                ]`;
            }
            return prev + `{
                path: '${cur.path}',
                name: '${cur.name}',
                component: _${cur.hash},
                meta: ${JSON.stringify(cur.meta || {})},
                ${childrenContent}
            },`
        }, '');
    }

    /**
     * write dist/routes.json which will be used in prod mode
     *
     */
    async writeRoutesFile() {
        // write contents into dist/routes.json
        let routesFilePath = join(this.config.webpack.base.output.path, ROUTES_FILE);
        this.privateFiles.push(ROUTES_FILE);
        await ensureFile(routesFilePath);
        await writeFile(
            routesFilePath,
            JSON.stringify(this.routes),
            'utf8'
        );
    }

    /**
     * write .lavas/routes.js
     *
     */
    async writeRoutesSourceFile() {
        let routesContent = this.generateRoutesContent(this.routes);

        // write contents into .lavas/routes.js
        let routesFilePath = join(this.targetDir, './routes.js');
        await ensureFile(routesFilePath);
        await writeFile(
            routesFilePath,
            template(await readFile(routesTemplate, 'utf8'))({
                routes: this.flatRoutes,
                routesContent
            }),
            'utf8'
        );

        /**
         * hack for watchpack, solve the rebuilding problem in dev mode
         * https://github.com/webpack/watchpack/issues/25#issuecomment-287789288
         */
        let then = Date.now() / 1000 - 10;
        await utimes(routesFilePath, then, then);
    }

    /**
     * output routes.js into .lavas according to /pages
     *
     */
    async buildRoutes() {
        const routesConfig = this.config.router && this.config.router.routes || [];

        console.log('[Lavas] auto compile routes...');

        this.routes = await generateRoutes(join(this.targetDir, '../pages'));

        this.mergeWithConfig(this.routes, routesConfig);

        await this.writeRoutesSourceFile();

        console.log('[Lavas] all routes are already generated.');
    }

    /**
     * create routes based on routes.json
     *
     */
    async createWithRoutesFile() {
        let routesFilePath = join(this.config.webpack.base.output.path, './routes.json');
        this.routes = JSON.parse(await readFile(routesFilePath, 'utf8'));
        this.mergeWithConfig(this.routes);
    }
}
