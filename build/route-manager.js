/**
 * @file route manager
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 * @desc generate route.js, multi entries in .lavas directory
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const template = require('lodash.template');
const utils = require('./utils');
const pify = require('pify');
const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

const webpack = require('webpack');
// const mpaConfig = require('./webpack.mpa.conf');
// const pageConfig = require('../pages/page');

// const MultipageWebpackPlugin = require('multipage-webpack-plugin');

class RouteManager {

    constructor(props) {
        this.routesTemplate = path.join(__dirname, './templates/routes.js');
        this.routesFile = path.join(__dirname, '../.lavas/routes.js');
    }

    shouldPrerender() {
        return false;
    }

    async prerender() {

    }

    compileMultiEntries() {
        // let compiler = webpack(mpaConfig);
    }

    async run() {
        let routes = utils.generateRouter();

        routes.forEach(route => {
            // generate hash for each route, "_" will be added in front
            route.hash = crypto.createHash('md5').update(route.name).digest('hex');
        });
        let routesTpl = await readFile(this.routesTemplate, 'utf8');

        // write contents into .lavas/routes.js
        await writeFile(this.routesFile, template(routesTpl)({routes}), 'utf8');

        this.compileMultiEntries();
    }
}

module.exports = new RouteManager();
