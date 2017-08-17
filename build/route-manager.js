/**
 * @file route manager
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 * @desc generate route.js, multi entries in .lavas directory
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const template = require('lodash.template');
const utils = require('./utils');
const config = require('./config');
const isProd = process.env.NODE_ENV === 'production';

const routesTemplate = path.join(__dirname, './templates/routes.js');
// const entryTemplate = path.join(__dirname, '../core/entry-client.js');

const webpack = require('webpack');
const merge = require('webpack-merge');
const clientConfig = require('./webpack.client.conf');

const HtmlWebpackPlugin = require('html-webpack-plugin');

class RouteManager {

    constructor(props = {}) {
        Object.assign(this, {
            targetDir: path.join(__dirname, '../.lavas'),
            prerenderDirname: 'prerender'
        }, props);

        this.routes = [];
    }

    /**
     * should current request path be prerendered ?
     *
     * @param {string} path route path
     * @return {boolean}
     */
    shouldPrerender(path) {
        if (!isProd) {
            return false;
        }
        let matchedRoute = this.routes.find(route => route.pathRegExp.test(path));
        return matchedRoute && matchedRoute.prerender;
    }

    /**
     * find html according to current route path
     *
     * @param {string} path route path
     * @return {Promise}
     */
    async prerender(path) {
        let matchedRoute = this.routes.find(route => route.pathRegExp.test(path));
        if (matchedRoute && matchedRoute.htmlPath) {
            return await fs.readFile(matchedRoute.htmlPath, 'utf8');
        }
    }

    async prerenderMultiEntries() {

        // let prerenderDir = path.join(this.targetDir, this.prerenderDirname);
        // await fs.emptyDirSync(prerenderDir);

        let mpaConfig = merge(clientConfig);

        // set context and empty entries
        mpaConfig.entry = {};
        mpaConfig.context = config.globals.rootDir;

        // remove vue-ssr-client plugin
        mpaConfig.plugins.pop();

        this.routes.map(route => {
            let {pagename, template, prerender} = route;

            if (prerender) {
                let htmlTemplatePath = template
                    || path.join(__dirname, './templates/index.template.html');
                let htmlFilename = `${pagename}.html`;

                route.htmlPath = path.join(htmlTemplatePath, htmlFilename);

                mpaConfig.entry[pagename] = './core/entry-client.js';

                // add skeleton & html webpack plugin
                mpaConfig.plugins.push(new HtmlWebpackPlugin({
                    filename: htmlFilename,
                    template: htmlTemplatePath,
                    inject: true,
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true
                    },
                    favicon: utils.assetsPath('img/icons/favicon.ico'),
                    chunksSortMode: 'dependency'
                }));
            }

            // let pageDir = path.join(prerenderDir, pagename);
            // let entryPath = path.join(pageDir, './entry.js');
            // await fs.ensureFileSync(entryPath);
        });

        if (Object.keys(mpaConfig.entry).length) {

            await new Promise((resolve, reject) => {

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
     * output routes.js into .lavas according to /pages
     *
     */
    async autoCompileRoutes() {
        const routesConfig = config.router.routes;

        console.log('[Lavas] auto compile routes...');
        this.routes = await utils.generateRouter(path.resolve(__dirname, '../pages'));

        this.routes.forEach(route => {
            // find route in config
            let routeConfig = routesConfig.find(r => r.name === route.name);

            // mixin with config
            if (routeConfig) {
                let {name, pagename, template,
                    path: routePath, prerender, meta = {},
                    lazyLoading, chunkname} = routeConfig;

                Object.assign(route, {
                    pagename,
                    template,
                    path: routePath || route.path,
                    prerender,
                    meta,
                    chunkname,
                    lazyLoading: lazyLoading || !!chunkname
                });
            }

            // generate hash for each route, "_" will be added in front
            route.hash = crypto.createHash('md5').update(route.name).digest('hex');

            // turn route path into regexp
            // eg. /detail/:id => /^\/detail\/[^\/]+\/?$/
            route.pathRegExp = new RegExp(`^${route.path.replace(/\/:[^\/]*/g, '/[^\/]+')}\/?$`);
        });
        let routesTpl = await fs.readFile(routesTemplate, 'utf8');

        // write contents into .lavas/routes.js
        await fs.writeFile(
            path.join(this.targetDir, './routes.js'),
            template(routesTpl)({routes: this.routes}),
            'utf8'
        );

        console.log('[Lavas] all routes are already generated.');
    }
}

module.exports = new RouteManager();
