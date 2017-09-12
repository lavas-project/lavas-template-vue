/**
 * @file webpack base config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import {posix, join, resolve} from 'path';
import fs from 'fs-extra';
import template from 'lodash.template';

import nodeExternals from 'webpack-node-externals';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin';
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin';
import BundleAnalyzerPlugin from 'webpack-bundle-analyzer';
import ManifestJsonWebpackPlugin from './plugins/manifest-json-webpack-plugin';
import SWPrecacheWebPlugin from 'sw-precache-webpack-plugin';
import SWRegisterWebpackPlugin from 'sw-register-webpack-plugin';

import {vueLoaders, styleLoaders} from './utils/loader';
import {LAVAS_DIRNAME_IN_DIST, CLIENT_MANIFEST, SERVER_BUNDLE} from './constants';

export default class WebpackConfig {
    constructor(config = {}, env) {
        this.config = config;
        this.env = env;
        this.hooks = {};
    }

    /**
     * generate a relative path based on config
     * eg. static/js/[name].[hash].js
     *
     * @param {string} sourcePath source path
     * @return {string} relative path
     */
    assetsPath(sourcePath) {
        return posix.join(this.config.webpack.shortcuts.assetsDir, sourcePath);
    }

    /**
     * add hooks to proper queue
     *
     * @param {Object} hooks hook object contains base, client and server function
     */
    addHooks(hooks) {

        Object.keys(hooks).forEach(hookKey => {
            let hook = hooks[hookKey];
            if (!this.hooks[hookKey]) {
                this.hooks[hookKey] = [];
            }
            if (hook && typeof hook === 'function') {
                this.hooks[hookKey].push(hook);
            }
        });
    }

    /**
     * serially execute added hooks
     *
     * @param {string} type base|server|client
     * @param {Object} config config
     */
    executeHooks(type, config) {
        if (this.hooks[type]) {
            this.hooks[type].forEach(hook => {
                hook.call(null, config);
            });
        }
    }

    /**
     * generate webpack base config based on lavas config
     *
     * @param {Object} config lavas config
     * @return {Object} webpack base config
     */
    base(config) {
        let isProd = this.env === 'production';
        let {globals, webpack: webpackConfig, babel, serviceWorker: swPrecacheConfig, routes} = config;
        let {base, shortcuts, mergeStrategy = {}, extend} = webpackConfig;
        let {cssSourceMap, cssMinimize, cssExtract, jsSourceMap} = shortcuts;

        // add 'routes' to service-worker.tmpl.js
        let swTemplateContent = template(fs.readFileSync(resolve(__dirname, 'templates/service-worker.tmpl.js')), {
            evaluate: /{{([\s\S]+?)}}/g,
            interpolate: /{{=([\s\S]+?)}}/g,
            escape: /{{-([\s\S]+?)}}/g
        })({
            routes: JSON.stringify(routes)
        });
        let swTemplateFilePath = resolve(__dirname, 'templates/service-worker-real.js.tmpl');
        fs.writeFileSync(swTemplateFilePath, swTemplateContent);
        // add templateFilePath to swPrecacheConfig
        swPrecacheConfig.templateFilePath = swTemplateFilePath;

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
                    new OptimizeCSSPlugin({
                        cssProcessorOptions: {
                            safe: true
                        }
                    }),
                    new SWPrecacheWebPlugin(swPrecacheConfig),
                    new SWRegisterWebpackPlugin({
                        filePath: resolve(__dirname, 'templates/sw-register.js')
                    })
                ]
                : [new FriendlyErrorsPlugin()]
        }, base);

        if (cssExtract) {
            baseConfig.plugins.unshift(
                new ExtractTextPlugin({
                    filename: this.assetsPath('css/[name].[contenthash].css')
                })
            );
        }

        if (typeof extend === 'function') {
            extend.call(this, baseConfig, {
                type: 'base',
                env: this.env
            });
        }

        this.executeHooks('base', baseConfig);

        return baseConfig;
    }

    /**
     * generate client base config based on lavas config
     *
     * @param {Object} config lavas config
     * @return {Object} client base config
     */
    client(config) {
        let webpackConfig = config.webpack;
        let {client, shortcuts, mergeStrategy = {}, extend} = webpackConfig;
        /* eslint-disable fecs-one-var-per-line */
        let {ssr, cssSourceMap, cssMinimize, cssExtract,
            jsSourceMap, assetsDir, copyDir, bundleAnalyzerReport} = shortcuts;
        /* eslint-enable fecs-one-var-per-line */

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
                            && targets.find(t => {
                                let npmRegExp = new RegExp(`/${t}/`, 'i');
                                // compatible with cnpm, eg./_vue@2.4.2@vue/
                                let cnpmRegExp = new RegExp(`/_${t}@\\d\\.\\d\\.\\d@${t}/`, 'i');
                                return npmRegExp.test(context) || cnpmRegExp.test(context);
                            });
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
                }]),

                new ManifestJsonWebpackPlugin({
                    config: this.config.manifest,
                    path: this.assetsPath('manifest.json')
                })
            ]
        }, client);

        if (ssr) {
            clientConfig.plugins.push(new VueSSRClientPlugin({
                filename: join(LAVAS_DIRNAME_IN_DIST, CLIENT_MANIFEST)
            }));
        }

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

        this.executeHooks('client', clientConfig);

        return clientConfig;
    }

    /**
     * generate webpack server config based on lavas config
     *
     * @param {Object} config lavas config
     * @return {Object} webpack server config
     */
    server(config) {
        let webpackConfig = config.webpack;
        let {server, mergeStrategy = {}, extend} = webpackConfig;

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
                new VueSSRServerPlugin({
                    filename: join(LAVAS_DIRNAME_IN_DIST, SERVER_BUNDLE)
                })
            ]
        }, server);

        if (typeof extend === 'function') {
            extend.call(this, serverConfig, {
                type: 'server',
                env: this.env
            });
        }

        this.executeHooks('server', serverConfig);

        return serverConfig;
    }
}
