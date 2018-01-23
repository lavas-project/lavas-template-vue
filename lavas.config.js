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
        ssr: false,
        path: BUILD_PATH,
        publicPath: '/',
        ssrCopy: isDev ? [] : [
            {
                src: 'server.prod.js'
            },
            {
                src: 'package.json'
            }
        ],
        skeleton: {
            enable: false
        }
    },
    router: {
        mode: 'history',
        base: '/',
        pageTransition: {
            type: 'fade',
            transitionClass: 'fade'
        }
    },
    serviceWorker: {
        swSrc: path.join(__dirname, 'entries/[entryName]/service-worker.js'),
        swDest: path.join(BUILD_PATH, '[entryName]/service-worker.js'),
        // swPath: '/custom_path/', // specify custom serveice worker file's path, default is publicPath
        globDirectory: BUILD_PATH,
        globPatterns: [
            '**/*.{html,js,css,eot,svg,ttf,woff}'
        ],
        globIgnores: [
            'sw-register.js',
            '**/*.map'
        ],
        appshellUrl: '/[entryName]/appshell',
        dontCacheBustUrlsMatching: /\.\w{8}\./
    },
    // entries: [{
    //     name: 'index',
    //     serviceWorker: {
    //         swSrc: path.join(__dirname, 'entries/[entryName]/service-worker.js'),
    //         swDest: path.join(BUILD_PATH, '[entryName]/service-worker.js'),
    //         globDirectory: BUILD_PATH,
    //         globPatterns: [
    //             '**/*.{html,js,css,eot,svg,ttf,woff}'
    //         ],
    //         globIgnores: [
    //             'sw-register.js',
    //             '**/*.map'
    //         ],
    //         appshellUrl: '/[entryName]/appshell',
    //         dontCacheBustUrlsMatching: /\.\w{8}\./
    //     }
    // }, 'detail']
    entries: ['index', 'detail']
};
