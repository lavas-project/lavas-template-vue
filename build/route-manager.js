/**
 * @file route manager
 * @author panyuqi
 * @desc generate route.js, multi entries in .lavas directory
 */

'use strict';

import {
    utimes,
    readFile,
    emptyDir,
    readJson,
    outputFile,
    outputJson,
    pathExists
} from 'fs-extra';
import {join} from 'path';
import {createHash} from 'crypto';
import template from 'lodash.template';
import merge from 'webpack-merge';
import lruCache from 'lru-cache';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {generateRoutes, matchUrl} from './utils/router';
import {distLavasPath} from './utils/path';
import {webpackCompile, writeFileInDev} from './utils/webpack';
import {ROUTES_FILE, SKELETON_DIRNAME} from './constants';

const routesTemplate = join(__dirname, './templates/routes.tpl');
const skeletonEntryTemplate = join(__dirname, './templates/entry-skeleton.tpl');

export default class RouteManager {

    constructor(core) {
        this.config = core.config;
        this.env = core.env;
        this.cwd = core.cwd;
        this.webpackConfig = core.webpackConfig;

        if (this.config) {
            this.targetDir = join(this.config.globals.rootDir, './.lavas');
        }

        this.routes = [];

        this.flatRoutes = new Set();

        this.prerenderCache = lruCache({
            max: 1000,
            maxAge: 1000 * 60 * 15
        });
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
            let matched = path.match(matchedRoute.pathRegExp);
            if (matched && matched[0]) {
                return this.findMatchedRoute(
                    path.substring(matched[0].length), matchedRoute.children);
            }
        }
        return matchedRoute;
    }

    /**
     * find html according to current route
     *
     * @param {string} entryName entryName
     * @return {Promise}
     */
    async getStaticHtml(entryName) {
        let entry = this.prerenderCache.get(entryName);
        if (!entry) {
            entry = await readFile(route.htmlPath, 'utf8');
            this.prerenderCache.set(entryName, entry);
        }
        return entry;
    }

    /**
     * create an entry file for a skeleton component
     *
     * @param {string} entryName entryName
     * @param {string} skeletonPath used as import
     * @return {string} entryPath
     */
    async createEntryForSkeleton(entryName, skeletonPath) {
        // .lavas/${entryName}/skeleton.js
        let entryPath = join(this.targetDir, `${entryName}/skeleton.js`);

        await outputFile(
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
        let rootDir = this.config.globals.rootDir;

        // create mpa config based on client config
        let mpaConfig = merge(this.webpackConfig.client(this.config));
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
                // allow user to provide a custom HTML template
                let htmlTemplatePath = join(rootDir, `entries/${entryName}/client.template.html`);
                if (!await pathExists(htmlTemplatePath)) {
                    htmlTemplatePath = join(__dirname, './templates/index.template.html');
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
                    chunksSortMode: 'dependency',
                    config: this.config // use config in template
                }));

                let skeletonPath = `@/entries/${entryName}/skeleton.vue`;
                if (await pathExists(skeletonPath)) {
                    let entryPath = await this.createEntryForSkeleton(entryName, skeletonPath);
                    skeletonEntries[entryName] = [entryPath];
                }
            }
        }));

        if (Object.keys(skeletonEntries).length) {
            let skeletonConfig = merge(this.webpackConfig.server(this.config));
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
     * rewrite route path with rules
     *
     * @param {Array} rewriteRules rewrite rules
     * @param {string} path original route path
     * @return {string} path rewrited
     */
    rewriteRoutePath(rewriteRules, path) {
        for (let i = 0; i < rewriteRules.length; i++) {
            let rule = rewriteRules[i];
            let {from, to} = rule;
            /**
             * if type of 'from' is regexp, use String.replace
             */
            if (from instanceof RegExp && from.test(path)) {
                return path.replace(from, to);
            }
            /**
             * if type of 'from' is array|string, 'to' must be a
             * single rule, just replace with it
             */
            else if ((Array.isArray(from) && from.includes(path))
                || (typeof from === 'string' && from === path)) {
                return to;
            }
        }
        return path;
    }

    /**
     * merge routes with config recursively
     *
     * @param {Array} routes routes
     * @param {Array} routesConfig config
     */
    mergeWithConfig(routes, routesConfig = [], rewriteRules = [], parentPath = '') {
        /**
         * in dev mode, we need to add timestamp to every route's hash as prefix.
         * otherwise when we change the code in page.vue, route's hash remains the same,
         * webpack hot middleware will throw a "Duplicate declaration" error.
         */
        let timestamp = (new Date()).getTime();

        routes.forEach(route => {

            // add to set
            this.flatRoutes.add(route);

            // find route in config
            let routeConfig = routesConfig.find(({pattern}) => {
                return pattern instanceof RegExp ?
                    pattern.test(route.path) : pattern === route.name;
            });

            // rewrite route path with rules
            route.path = this.rewriteRoutePath(rewriteRules, route.path);
            route.fullPath = parentPath ? `${parentPath}/${route.path}` : route.path;

            // map entry to every route
            let entry = this.config.entry.find(
                entryConfig => matchUrl(entryConfig.routes, route.fullPath));
            if (entry) {
                route.entryName = entry.name;
            }

            // mixin with config, rewrites path, add lazyLoading, meta
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
                route.hash = timestamp
                    + createHash('md5').update(route.name).digest('hex');
            }

            /**
             * turn route fullpath into regexp
             * eg. /detail/:id => /^\/detail\/[^\/]+\/?$/
             */
            route.pathRegExp = new RegExp(`^${route.path.replace(/\/:[^\/]*/g, '/[^\/]+')}\/?`);

            // merge recursively
            if (route.children && route.children.length) {
                this.mergeWithConfig(route.children,
                    routeConfig && routeConfig.children, rewriteRules, route.fullPath);
            }
        });
    }

    /**
     * generate routes content which will be injected into routes.js
     * based on nested routes
     *
     * @param {Array} routes route list
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
            },`;
        }, '');
    }

    /**
     * write dist/routes.json which will be used in prod mode
     *
     */
    async writeRoutesFile() {
        // write contents into dist/lavas/routes.json
        let routesFilePath = distLavasPath(this.config.webpack.base.output.path, ROUTES_FILE);
        await outputJson(
            routesFilePath,
            this.routes,
            'utf8'
        );
    }

    /**
     * write routes.js for each entry
     *
     */
    async writeRoutesSourceFile() {
        await Promise.all(this.config.entry.map(async entryConfig => {
            let entryName = entryConfig.name;

            let entryRoutes = this.routes.filter(route => route.entryName === entryName);
            let entryFlatRoutes = new Set();
            this.flatRoutes.forEach(flatRoute => {
                if (flatRoute.entryName === entryName) {
                    entryFlatRoutes.add(flatRoute)
                }
            });

            let routesFilePath = join(this.targetDir, `${entryName}/routes.js`);
            let routesContent = this.generateRoutesContent(entryRoutes);

            let routesFileContent = template(await readFile(routesTemplate, 'utf8'))({
                routes: entryFlatRoutes,
                routesContent
            });
            await writeFileInDev(routesFilePath, routesFileContent);
        }));
    }

    /**
     * output routes.js into .lavas according to /pages
     *
     */
    async buildRoutes() {
        const {routes: routesConfig = [], rewrite: rewriteRules = []} = this.config.router;

        console.log('[Lavas] auto compile routes...');

        // generate routes according to pages dir
        this.routes = await generateRoutes(join(this.targetDir, '../pages'));

        // merge with routes' config
        this.mergeWithConfig(this.routes, routesConfig, rewriteRules);

        // write routes for each entry
        await this.writeRoutesSourceFile();

        console.log('[Lavas] all routes are already generated.');
    }

    /**
     * create routes based on routes.json
     *
     */
    async createWithRoutesFile() {
        let routesFilePath = distLavasPath(this.cwd, ROUTES_FILE);
        this.routes = await readJson(routesFilePath);
        this.mergeWithConfig(this.routes);
    }
}
