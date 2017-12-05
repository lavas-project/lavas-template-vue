/**
 * @file lavas config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const BUILD_PATH = path.resolve(__dirname, 'dist');
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    build: {
        path: BUILD_PATH,
        publicPath: '/',
        ssrCopy: isDev ? [] : [
            {
                src: 'server.prod.js'
            },
            {
                src: 'node_modules'
            },
            {
                src: 'package.json'
            }
        ]
    },
    entry: [
        {
            name: 'main',
            ssr: true,
            mode: 'history',
            base: '/',
            routes: /^.*$/,
            pageTransition: {
                type: 'fade',
                transitionClass: 'fade'
            }
        }
    ],
    serviceWorker: {
        swSrc: path.join(__dirname, 'core/service-worker.js'),
        swDest: path.join(BUILD_PATH, 'service-worker.js'),
        globDirectory: BUILD_PATH,
        globPatterns: [
            '**/*.{html,js,css,eot,svg,ttf,woff}'
        ],
        globIgnores: [
            'sw-register.js',
            '**/*.map'
        ],
        appshellUrls: ['/appshell/main'],
        dontCacheBustUrlsMatching: /\.\w{8}\./
    }
};
