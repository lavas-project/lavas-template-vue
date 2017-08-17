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
        // TODO
    }

    async prerenderMultiEntries() {
        const routes = config.router.routes;

        // let prerenderDir = path.join(this.targetDir, this.prerenderDirname);
        // await fs.emptyDirSync(prerenderDir);

        let mpaConfig = merge(clientConfig);

        // set context and empty entries
        mpaConfig.entry = {};
        mpaConfig.context = config.globals.rootDir;

        // remove vue-ssr-client plugin
        mpaConfig.plugins.pop();

        await Promise.all(
            routes.map(async page => {
                let {name, pagename, template,
                    path: routePath,
                    prerender, meta, lazyLoading, chunkname} = page;

                // find route
                let matchedRoute = this.routes.find(route => route.name === name);

                if (matchedRoute) {
                    // override route path if passed in
                    Object.assign(matchedRoute, {
                        path: routePath || matchedRoute.path,
                        prerender,
                        meta,
                        chunkname,
                        lazyLoading: lazyLoading || !!chunkname
                    });
                    if (prerender) {
                        let htmlTemplatePath = template
                            || path.join(__dirname, './templates/index.template.html');

                        mpaConfig.entry[pagename] = './core/entry-client.js';

                        // add skeleton & html webpack plugin
                        mpaConfig.plugins.push(new HtmlWebpackPlugin({
                            filename: `${pagename}.html`,
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
                }

                // let pageDir = path.join(prerenderDir, pagename);
                // let entryPath = path.join(pageDir, './entry.js');
                // await fs.ensureFileSync(entryPath);
            })
        );

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
        console.log('[Lavas] auto compile routes...');

        this.routes = utils.generateRouter();

        this.routes.forEach(route => {
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
