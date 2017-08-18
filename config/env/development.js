/**
 * @file development config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    webpack: {
        cssExtract: false,
        cssSourceMap: true,
        jsSourceMap: true,
        output: {
            assetsDir: 'static',
            publicPath: '/dist/',

            /**
             * shouldn't use [chunkhash] in dev mode with webpack-dev-middleware
             *
             * https://github.com/webpack/webpack/issues/2393
             */
            filename: 'js/[name].[hash:8].js'
        }
    }

};
