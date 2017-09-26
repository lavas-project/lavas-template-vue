/**
 * @file build config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');

module.exports = {

    /**
     * 编译之后的路径，默认为 dist
     *
     * @type {string}
     */
    path: path.resolve(__dirname, '../dist'),

    /**
     * public path
     *
     * @type {string}
     */
    publicPath: '/',

    /**
     * if extract css files
     *
     * @type {boolean}
     */
    cssExtract: true,

    /**
     * if enable minification
     *
     * @type {boolean}
     */
    cssMinimize: true,

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
    jsSourceMap: true,

    /**
     * if need analyzer, https://github.com/th0r/webpack-bundle-analyzer
     * default false, if this variable is an Object, then analyzer will be opened
     *
     * @type {boolean|Object}
     */
    bundleAnalyzerReport: false,

    /**
     * alias for webpack
     *
     * @type {Object.<string, string>}
     */
    alias: {},

    /**
     * webpack plugins
     *
     * @type {Array.<*>}
     */
    plugins: [],

    /**
     * node externals 白名单
     *
     * @type {Array.<string|RegExp>}
     */
    nodeExternalsWhitelist: [],

    /**
     * 扩展 webpack 的配置
     *
     * ```javascript
     * function extend(config, {isClient}) {
     * }
     * ```
     *
     * 函数参数中的 config 是 webpack 的配置
     */
    extend: null
};
