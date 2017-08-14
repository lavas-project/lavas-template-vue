/**
 * @file webpack config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const globals = require('./globals');

module.exports = {

    output: {

        /**
         * output dir
         *
         * @type {string}
         */
        path: path.join(globals.rootDir, 'dist'),

        /**
         * public path
         *
         * @type {string}
         */
        publicPath: '/dist'

    },

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
    jsSourceMap: true,

};
