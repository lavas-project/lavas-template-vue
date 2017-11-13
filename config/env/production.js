/**
 * @file development config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    build: {
        cssExtract: true,
        filenames: {
            entry: 'js/[name].[chunkhash:8].js',
            vendor: 'js/vendor.[chunkhash:8].js',
            vue: 'js/vue.[chunkhash:8].js',
            chunk: 'js/[name].[chunkhash:8].js',
            css: 'css/[name].[contenthash:8].css',
            img: 'img/[name].[hash:8].[ext]',
            fonts: 'fonts/[name].[hash:8].[ext]'
        },
        ssrCopy: [
            {
                src: 'lib'
            },
            {
                src: 'server.prod.js'
            },
            // {
            //     src: 'node_modules'
            // },
            {
                src: 'package.json'
            }
        ]
    }

};
