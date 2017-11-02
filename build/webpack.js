/**
 * @file webpack base config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import {join, resolve, sep} from 'path';

import nodeExternals from 'webpack-node-externals';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin';
import BundleAnalyzerPlugin from 'webpack-bundle-analyzer';
import ManifestJsonWebpackPlugin from './plugins/manifest-json-webpack-plugin';
import SWPrecacheWebPlugin from 'sw-precache-webpack-plugin';
import SWRegisterWebpackPlugin from 'sw-register-webpack-plugin';
// import WorkboxWebpackPlugin from 'workbox-webpack-plugin';

import {vueLoaders, styleLoaders} from './utils/loader';
import {assetsPath} from './utils/path';
import {LAVAS_DIRNAME_IN_DIST, SERVER_BUNDLE, ASSETS_DIRNAME_IN_DIST} from './constants';

import fs from 'fs';
import gracefulFs from 'graceful-fs';

// solve 'too many open files' problem on Windows
// see https://github.com/webpack-contrib/copy-webpack-plugin/issues/59
gracefulFs.gracefulify(fs);

export default class WebpackConfig {
    constructor(config = {}, env) {
        this.config = config;
        this.env = env;
        this.isProd = this.env === 'production';
        this.isDev = this.env === 'development';
    }

    /**
     * generate webpack base config based on lavas config
     *
     * @param {Object} buildConfig build config
     * @return {Object} webpack base config
     */
    base(buildConfig = {}) {
        let {globals, build, babel, serviceWorker: swPrecacheConfig} = this.config;
        /* eslint-disable fecs-one-var-per-line */
        let {path, publicPath, cssSourceMap, cssMinimize,
            cssExtract, jsSourceMap, alias: {base: baseAlias = {}}, extend,
            plugins: {base: basePlugins = []}} = Object.assign({}, build, buildConfig);
        /* eslint-enable fecs-one-var-per-line */
        let baseConfig = {
            output: {
                path,
                publicPath
            },
            resolve: {
                extensions: ['.js', '.vue', '.json'],
                alias: Object.assign({
                    '@': globals.rootDir,
                    '$': join(globals.rootDir, '.lavas')
                }, baseAlias)
            },
            module: {
                rules: [{
                        test: /\.vue$/,
                        use: [{
                            loader: 'vue-loader',
                            options: vueLoaders({
                                cssSourceMap,
                                cssMinimize,
                                cssExtract
                            })
                        }],
                        include: [
                            join(globals.rootDir, 'components'),
                            join(globals.rootDir, 'core'),
                            join(globals.rootDir, 'pages'),
                            join(globals.rootDir, 'entries')
                        ]
                    },
                    {
                        test: /\.js$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: babel.presets,
                                plugins: babel.plugins
                            }
                        },
                        exclude: /node_modules/
                    },
                    {
                        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: assetsPath('img/[name].[hash:7].[ext]')
                        }
                    },
                    {
                        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: assetsPath('fonts/[name].[hash:7].[ext]')
                        }
                    }
                ]
            },
            plugins: this.isProd
                ? [
                    new webpack.optimize.UglifyJsPlugin({
                        compress: {
                            warnings: false
                        },
                        sourceMap: jsSourceMap
                    }),
                    new OptimizeCSSPlugin({
                        cssProcessorOptions: {
                            safe: true
                        }
                    }),
                    // new WorkboxWebpackPlugin({
                    //     globDirectory: 'dist/static',
                    //     globPatterns: ['**/*.{html,js,css}'],
                    //     swDest: join('dist', 'service-worker.js'),
                    // }),
                    new SWPrecacheWebPlugin(Object.assign(swPrecacheConfig, {
                        templateFilePath: resolve(__dirname, 'templates/service-worker-real.js.tmpl')
                    })),
                    new SWRegisterWebpackPlugin({
                        filePath: resolve(__dirname, 'templates/sw-register.js'),
                        prefix: publicPath
                    }),
                    ...basePlugins
                ]
                : [
                    new FriendlyErrorsPlugin(),
                    ...basePlugins
                ]
        };

        if (cssExtract) {
            baseConfig.plugins.unshift(
                new ExtractTextPlugin({
                    filename: assetsPath('css/[name].[contenthash].css')
                })
            );
        }

        if (typeof extend === 'function') {
            extend.call(this, baseConfig, {
                type: 'base',
                env: this.env
            });
        }

        return baseConfig;
    }

    /**
     * generate client base config based on lavas config
     *
     * @param {Object} buildConfig build config
     * @return {Object} client base config
     */
    client(buildConfig = {}) {
        let {globals, build, manifest} = this.config;

        /* eslint-disable fecs-one-var-per-line */
        let {publicPath, cssSourceMap, cssMinimize, cssExtract,
            jsSourceMap, bundleAnalyzerReport, extend,
            alias: {client: clientAlias = {}},
            plugins: {client: clientPlugins = []}} = Object.assign({}, build, buildConfig);
        /* eslint-enable fecs-one-var-per-line */

        let outputFilename = this.isDev ? 'js/[name].[hash:8].js' : 'js/[name].[chunkhash:8].js';
        let clientConfig = merge(this.base(buildConfig), {
            output: {
                filename: assetsPath(outputFilename),
                chunkFilename: assetsPath('js/[name].[chunkhash:8].js')
            },
            resolve: {
                alias: clientAlias
            },
            module: {
                rules: styleLoaders({
                    cssSourceMap,
                    cssMinimize,
                    cssExtract
                })
            },
            devtool: jsSourceMap ? '#source-map' : false,
            plugins: [
                // http://vuejs.github.io/vue-loader/en/workflow/production.html
                new webpack.DefinePlugin({
                    'process.env.VUE_ENV': '"client"',
                    'process.env.NODE_ENV': `"${this.env}"`
                }),

                // split vendor js into its own file
                new webpack.optimize.CommonsChunkPlugin({
                    name: 'vendor',
                    filename: assetsPath('js/vendor.[chunkhash:8].js'),
                    minChunks(module, count) {
                        // any required modules inside node_modules are extracted to vendor
                        return module.resource
                            && /\.js$/.test(module.resource)
                            && module.resource.indexOf('node_modules') >= 0;
                    }
                }),

                // split vue, vue-router, vue-meta and vuex into vue chunk
                new webpack.optimize.CommonsChunkPlugin({
                    name: 'vue',
                    filename: assetsPath('js/vue.[chunkhash:8].js'),
                    minChunks(module, count) {
                        // On Windows, context will be seperated by '\',
                        // then paths like '\node_modules\vue\' cannot be matched because of '\v'.
                        // Transforming into '::node_modules::vue::' can solve this.
                        let context = module.context;
                        let matchContext = context ? context.split(sep).join('::') : '';
                        let targets = ['vue', 'vue-router', 'vuex', 'vue-meta'];
                        // /^(vue|vue-router)$/i
                        let npmRegExp = new RegExp(targets.join('|'), 'i');
                        // /^(_vue@2.4.2@vue|_vue-router@1.2.3@vue-router)$/i
                        let cnpmRegExp
                            = new RegExp(targets.map(t => `_${t}@\\d\\.\\d\\.\\d@${t}`).join('|'), 'i');

                        return context
                            && matchContext.indexOf('node_modules') !== -1
                            && (npmRegExp.test(matchContext) || cnpmRegExp.test(matchContext));
                    }
                }),

                // extract webpack runtime and module manifest to its own file in order to
                // prevent vendor hash from being updated whenever app bundle is updated
                new webpack.optimize.CommonsChunkPlugin({
                    name: 'manifest',
                    chunks: ['vue']
                }),

                new ManifestJsonWebpackPlugin({
                    config: manifest,
                    publicPath,
                    path: assetsPath('manifest.json')
                }),

                // add custom plugins in client side
                ...clientPlugins
            ]
        });

        clientConfig.plugins.push(new CopyWebpackPlugin([{
            from: join(globals.rootDir, ASSETS_DIRNAME_IN_DIST),
            to: ASSETS_DIRNAME_IN_DIST,
            ignore: ['*.md']
        }]));

        if (bundleAnalyzerReport) {
            clientConfig.plugins.push(
                new BundleAnalyzerPlugin(Object.assign({}, bundleAnalyzerReport)));
        }

        if (typeof extend === 'function') {
            extend.call(this, clientConfig, {
                type: 'client',
                env: this.env
            });
        }

        return clientConfig;
    }

    /**
     * generate webpack server config based on lavas config
     *
     * @param {Object} buildConfig build config
     * @return {Object} webpack server config
     */
    server(buildConfig = {}) {
        /* eslint-disable fecs-one-var-per-line */
        let {extend, nodeExternalsWhitelist = [],
            alias: {server: serverAlias = {}},
            plugins: {server: serverPlugins = []}} = this.config.build;
        /* eslint-enable fecs-one-var-per-line */

        let serverConfig = merge(this.base(buildConfig), {
            target: 'node',
            output: {
                filename: 'server-bundle.js',
                libraryTarget: 'commonjs2'
            },
            resolve: {
                alias: serverAlias
            },
            // https://webpack.js.org/configuration/externals/#externals
            // https://github.com/liady/webpack-node-externals
            externals: nodeExternals({
                // do not externalize CSS files in case we need to import it from a dep
                whitelist: [...nodeExternalsWhitelist, /\.(css|vue)$/]
            }),
            plugins: [
                new webpack.DefinePlugin({
                    'process.env.VUE_ENV': '"server"',
                    'process.env.NODE_ENV': `"${this.env}"`
                }),
                new VueSSRServerPlugin({
                    filename: join(LAVAS_DIRNAME_IN_DIST, SERVER_BUNDLE)
                }),
                // add custom plugins in server side
                ...serverPlugins
            ]
        });

        if (typeof extend === 'function') {
            extend.call(this, serverConfig, {
                type: 'server',
                env: this.env
            });
        }

        return serverConfig;
    }
}
