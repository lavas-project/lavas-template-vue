/**
 * @file webpack base config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import {posix, join} from 'path';

import nodeExternals from 'webpack-node-externals';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin';
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin';

import {vueLoaders, styleLoaders} from './utils/loader';

export default class WebpackConfig {
    constructor(config = {}, env) {
        this.config = config;
        this.env = env;
        this.hooks = [];
    }

    assetsPath(newPath) {
        return posix.join(this.config.webpack.shortcuts.assetsDir, newPath);
    }

    executeHooks(params) {
        this.hooks.forEach(hook => {
            hook.call(null, params, this.env);
        });
    }

    base(config) {
        let isProd = this.env === 'production';
        let {globals, webpack: webpackConfig, babel} = config;
        let {base, shortcuts, mergeStrategy = {}, build} = webpackConfig;
        let {cssSourceMap, cssMinimize, cssExtract, jsSourceMap} = shortcuts;

        let baseConfig = merge.strategy(mergeStrategy)({
            resolve: {
                extensions: ['.js', '.vue', '.json'],
                alias: {
                    '@': globals.rootDir,
                    '$': join(globals.rootDir, '.lavas')
                }
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
                        }]
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
                            name: this.assetsPath('img/[name].[hash:7].[ext]')
                        }
                    },
                    {
                        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: this.assetsPath('fonts/[name].[hash:7].[ext]')
                        }
                    }
                ]
            },
            plugins: isProd
                ? [
                    new webpack.optimize.UglifyJsPlugin({
                        compress: {
                            warnings: false
                        },
                        sourceMap: jsSourceMap
                    }),
                    new ExtractTextPlugin({
                        filename: this.assetsPath('css/[name].[contenthash].css')
                    }),
                    new OptimizeCSSPlugin({
                        cssProcessorOptions: {
                            safe: true
                        }
                    })
                ]
                : [new FriendlyErrorsPlugin()]
        }, base);

        if (typeof build === 'function') {
            build.call(this, baseConfig, {type: 'base'});
        }

        return baseConfig;
    }

    client(config) {
        let webpackConfig = config.webpack;
        let {client, shortcuts, mergeStrategy = {}, build} = webpackConfig;
        let {ssr, cssSourceMap, cssMinimize, cssExtract, jsSourceMap, assetsDir, copyDir} = shortcuts;

        let baseConfig = this.base(config);
        let clientConfig = merge.strategy(mergeStrategy)(baseConfig, {
            output: {
                filename: this.assetsPath(baseConfig.output.filename),
                chunkFilename: this.assetsPath('js/[name].[chunkhash:8].js')
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
                    minChunks(module, count) {
                        let context = module.context;
                        let targets = ['vue', 'vue-router', 'vuex', 'vue-meta'];
                        return context
                            && context.indexOf('node_modules') >= 0
                            && targets.find(t => new RegExp('/' + t + '/', 'i').test(context));
                    }
                }),

                // extract webpack runtime and module manifest to its own file in order to
                // prevent vendor hash from being updated whenever app bundle is updated
                new webpack.optimize.CommonsChunkPlugin({
                    name: 'manifest',
                    chunks: ['vue']
                }),

                // copy custom static assets
                new CopyWebpackPlugin([{
                    from: copyDir,
                    to: assetsDir,
                    ignore: ['.*']
                }])
            ]
        }, client);

        if (ssr) {
            clientConfig.plugins.push(new VueSSRClientPlugin());
        }

        if (typeof build === 'function') {
            build.call(this, clientConfig, {type: 'client'});
        }

        this.executeHooks({
            client: clientConfig
        });

        return clientConfig;
    }

    server(config) {
        let webpackConfig = config.webpack;
        let {server, mergeStrategy = {}, build} = webpackConfig;

        let baseConfig = this.base(config);
        let serverConfig = merge.strategy(mergeStrategy)(baseConfig, {
            target: 'node',
            output: {
                filename: 'server-bundle.js',
                libraryTarget: 'commonjs2'
            },
            resolve: {},
            // https://webpack.js.org/configuration/externals/#externals
            // https://github.com/liady/webpack-node-externals
            externals: nodeExternals({
                // do not externalize CSS files in case we need to import it from a dep
                whitelist: [/\.(css|vue)$/]
            }),
            plugins: [
                new webpack.DefinePlugin({
                    'process.env.VUE_ENV': '"server"',
                    'process.env.NODE_ENV': `"${this.env}"`
                }),
                new VueSSRServerPlugin()
            ]
        }, server);

        if (typeof build === 'function') {
            build.call(this, serverConfig, {type: 'server'});
        }

        this.executeHooks({
            server: serverConfig
        });

        return serverConfig;
    }
}
