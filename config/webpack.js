/**
 * @file webpack config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');

module.exports = {

    output: {

        /**
         * output dir
         *
         * @type {string}
         */
        path: path.resolve(__dirname, '../dist'),

        /**
         * public path
         *
         * @type {string}
         */
        publicPath: '',

        /**
         * assets directory name
         *
         * @type {string}
         */
        assetsDir: 'static',

        /**
         * filename format
         *
         * @type {string}
         */
        filename: 'js/[name].[chunkhash:8].js'
    },

    /**
     * alias for webpack
     *
     * @type {Object.<string, string>}
     */
    alias: {},

    /**
     * extend webpack config
     *
     * @type {Function|null}
     */
    extend: null,

    /**
     * webpack loaders
     *
     * @type {Array.<Object>}
     */
    loaders: [],

    /**
     * webpack plugins
     *
     * @type {Array.<*>}
     */
    plugins: [],

    /**
     * node externals whitelist, only work in webpack.server.conf.js，default /\.(css|vue)$/
     *     https://webpack.js.org/configuration/externals/#externals
     *     https://github.com/liady/webpack-node-externals
     *
     * @type {Array.<RegExp|string>}
     */
    nodeExternalsWhilelist: [],

    /**
     * if need analyzer, https://github.com/th0r/webpack-bundle-analyzer
     * default false, if this variable is an Object, then analyzer will be opened
     *
     * @type {boolean|Object}
     */
    bundleAnalyzerReport: false,

    /**
     * if extract css files
     *
     * @type {boolean}
     */
    cssExtract: true,

    /**
     * if generate css source map or not
     *
     * @type {boolean}
     */
    cssSourceMap: true,

    /**
     * if generate js source map or not
     *
     * @type {boolean}
     */
    jsSourceMap: true

};
