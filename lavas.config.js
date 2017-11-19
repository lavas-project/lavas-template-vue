/**
 * @file lavas config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');

module.exports = function (env) {
    const isDev = env === 'development';
    const isProd = env === 'production';
    const BUILD_PATH = path.resolve(__dirname, 'dist');

    let config = {
        build: {
            path: BUILD_PATH,
            publicPath: '/game/',
            filenames: {
                entry: isDev ? 'js/[name].[hash:8].js'
                    : 'js/[name].[chunkhash:8].js'
            },
            cssExtract: isProd,
            extend: function (config, {type}) {
                if (type === 'base') {
                    // Import `theme-variables.styl` in every <style> block in .vue files.
                    let vueRule = config.module.rules[0];
                    vueRule.use.push({
                        loader: 'vue-style-variables-loader',
                        options: {
                            importStatements: [
                                '@import "~@/assets/stylus/theme-variables.styl";'
                            ]
                        }
                    });
                }
            },
            ssrCopy: isDev ? [] : [
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
        },
        entry: [
            {
                name: 'main',
                ssr: true,
                mode: 'history',
                base: '/game/',
                routes: /^.*$/,
                pageTransition: {
                    type: 'fade',
                    transitionClass: 'fade'
                }
            }
        ],
        router: {
            routes: [
                {
                    pattern: '/detail',
                    lazyLoading: true,
                    chunkname: 'detail'
                }
            ]
        },
        manifest: {
            start_url: '/?utm_source=homescreen',
            name: '*__name__*',
            short_name: '*__name__*',
            icons: [
                {
                    src: 'static/img/icons/android-chrome-512x512.png',
                    type: 'image/png',
                    size: '512x512'
                },
                {
                    src: 'static/img/icons/android-chrome-192x192.png',
                    type: 'image/png',
                    size: '192x192'
                },
                {
                    src: 'static/img/icons/apple-touch-icon-180x180.png',
                    type: 'image/png',
                    size: '180x180'
                },
                {
                    src: 'static/img/icons/apple-touch-icon-152x152.png',
                    type: 'image/png',
                    size: '152x152'
                }
            ],
            display: 'standalone',
            background_color: '#000000',
            theme_color: '#278fef'
        },
        serviceWorker: {
            swSrc: path.join(__dirname, 'core/service-worker.js'),
            swDest: path.join(BUILD_PATH, 'service-worker.js'),
            globDirectory: path.basename(BUILD_PATH),
            globPatterns: [
                '**/*.{html,js,css,eot,svg,ttf,woff}'
            ],
            globIgnores: [
                'sw-register.js',
                '**/*.map'
            ],
            templatedUrls: {
                '/game/appshell': [
                    '../entries/main/**/*.*',
                    '../components/OfflineToast.vue',
                    '../components/UpdateToast.vue',
                    '../assets/stylus/main.styl'
                ]
            },
            dontCacheBustUrlsMatching: /\.\w{8}\./

        }
    };

    return config;
};
