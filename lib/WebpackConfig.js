'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _path = require('path');

var _webpackNodeExternals = require('webpack-node-externals');

var _webpackNodeExternals2 = _interopRequireDefault(_webpackNodeExternals);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _friendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

var _friendlyErrorsWebpackPlugin2 = _interopRequireDefault(_friendlyErrorsWebpackPlugin);

var _optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

var _optimizeCssAssetsWebpackPlugin2 = _interopRequireDefault(_optimizeCssAssetsWebpackPlugin);

var _copyWebpackPlugin = require('copy-webpack-plugin');

var _copyWebpackPlugin2 = _interopRequireDefault(_copyWebpackPlugin);

var _clientPlugin = require('vue-server-renderer/client-plugin');

var _clientPlugin2 = _interopRequireDefault(_clientPlugin);

var _serverPlugin = require('vue-server-renderer/server-plugin');

var _serverPlugin2 = _interopRequireDefault(_serverPlugin);

var _loader = require('./utils/loader');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebpackConfig = function () {
    function WebpackConfig() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var env = arguments[1];
        (0, _classCallCheck3.default)(this, WebpackConfig);

        this.config = config;
        this.env = env;
    }

    (0, _createClass3.default)(WebpackConfig, [{
        key: 'assetsPath',
        value: function assetsPath(newPath) {
            return _path.posix.join(this.config.webpack.shortcuts.assetsDir, newPath);
        }
    }, {
        key: 'base',
        value: function base(config) {
            var isProd = this.env === 'production';
            var globals = config.globals,
                webpackConfig = config.webpack,
                babel = config.babel;
            var base = webpackConfig.base,
                shortcuts = webpackConfig.shortcuts,
                _webpackConfig$mergeS = webpackConfig.mergeStrategy,
                mergeStrategy = _webpackConfig$mergeS === undefined ? {} : _webpackConfig$mergeS,
                build = webpackConfig.build;
            var cssSourceMap = shortcuts.cssSourceMap,
                cssMinimize = shortcuts.cssMinimize,
                cssExtract = shortcuts.cssExtract,
                jsSourceMap = shortcuts.jsSourceMap;


            var baseConfig = _webpackMerge2.default.strategy(mergeStrategy)({
                resolve: {
                    extensions: ['.js', '.vue', '.json'],
                    alias: {
                        '@': globals.rootDir,
                        '$': (0, _path.join)(globals.rootDir, '.lavas')
                    }
                },
                module: {
                    rules: [{
                        test: /\.vue$/,
                        use: [{
                            loader: 'vue-loader',
                            options: (0, _loader.vueLoaders)({
                                cssSourceMap: cssSourceMap,
                                cssMinimize: cssMinimize,
                                cssExtract: cssExtract
                            })
                        }]
                    }, {
                        test: /\.js$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: babel.presets,
                                plugins: babel.plugins
                            }
                        },
                        exclude: /node_modules/
                    }, {
                        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: this.assetsPath('img/[name].[hash:7].[ext]')
                        }
                    }, {
                        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: this.assetsPath('fonts/[name].[hash:7].[ext]')
                        }
                    }]
                },
                plugins: isProd ? [new _webpack2.default.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    },
                    sourceMap: jsSourceMap
                }), new _extractTextWebpackPlugin2.default({
                    filename: this.assetsPath('css/[name].[contenthash].css')
                }), new _optimizeCssAssetsWebpackPlugin2.default({
                    cssProcessorOptions: {
                        safe: true
                    }
                })] : [new _friendlyErrorsWebpackPlugin2.default()]
            }, base);

            if (typeof build === 'function') {
                build.call(this, baseConfig, { type: 'base' });
            }

            return baseConfig;
        }
    }, {
        key: 'client',
        value: function client(config) {
            var webpackConfig = config.webpack;
            var client = webpackConfig.client,
                shortcuts = webpackConfig.shortcuts,
                _webpackConfig$mergeS2 = webpackConfig.mergeStrategy,
                mergeStrategy = _webpackConfig$mergeS2 === undefined ? {} : _webpackConfig$mergeS2,
                build = webpackConfig.build;
            var ssr = shortcuts.ssr,
                cssSourceMap = shortcuts.cssSourceMap,
                cssMinimize = shortcuts.cssMinimize,
                cssExtract = shortcuts.cssExtract,
                jsSourceMap = shortcuts.jsSourceMap,
                assetsDir = shortcuts.assetsDir,
                copyDir = shortcuts.copyDir;


            var baseConfig = this.base(config);
            var clientConfig = _webpackMerge2.default.strategy(mergeStrategy)(baseConfig, {
                output: {
                    filename: this.assetsPath(baseConfig.output.filename),
                    chunkFilename: this.assetsPath('js/[name].[chunkhash:8].js')
                },
                module: {
                    rules: (0, _loader.styleLoaders)({
                        cssSourceMap: cssSourceMap,
                        cssMinimize: cssMinimize,
                        cssExtract: cssExtract
                    })
                },
                devtool: jsSourceMap ? '#source-map' : false,
                plugins: [new _webpack2.default.DefinePlugin({
                    'process.env.VUE_ENV': '"client"',
                    'process.env.NODE_ENV': '"' + this.env + '"'
                }), new _webpack2.default.optimize.CommonsChunkPlugin({
                    name: 'vendor',
                    minChunks: function minChunks(module, count) {
                        return module.resource && /\.js$/.test(module.resource) && module.resource.indexOf('node_modules') >= 0;
                    }
                }), new _webpack2.default.optimize.CommonsChunkPlugin({
                    name: 'vue',
                    minChunks: function minChunks(module, count) {
                        var context = module.context;
                        var targets = ['vue', 'vue-router', 'vuex', 'vue-meta'];
                        return context && context.indexOf('node_modules') >= 0 && targets.find(function (t) {
                            return new RegExp('/' + t + '/', 'i').test(context);
                        });
                    }
                }), new _webpack2.default.optimize.CommonsChunkPlugin({
                    name: 'manifest',
                    chunks: ['vue']
                }), new _copyWebpackPlugin2.default([{
                    from: copyDir,
                    to: assetsDir,
                    ignore: ['.*']
                }])]
            }, client);

            if (ssr) {
                clientConfig.plugins.push(new _clientPlugin2.default());
            }

            if (typeof build === 'function') {
                build.call(this, clientConfig, { type: 'client' });
            }

            return clientConfig;
        }
    }, {
        key: 'server',
        value: function server(config) {
            var webpackConfig = config.webpack;
            var server = webpackConfig.server,
                _webpackConfig$mergeS3 = webpackConfig.mergeStrategy,
                mergeStrategy = _webpackConfig$mergeS3 === undefined ? {} : _webpackConfig$mergeS3,
                build = webpackConfig.build;


            var baseConfig = this.base(config);
            var serverConfig = _webpackMerge2.default.strategy(mergeStrategy)(baseConfig, {
                target: 'node',
                output: {
                    filename: 'server-bundle.js',
                    libraryTarget: 'commonjs2'
                },
                resolve: {},

                externals: (0, _webpackNodeExternals2.default)({
                    whitelist: [/\.(css|vue)$/]
                }),
                plugins: [new _webpack2.default.DefinePlugin({
                    'process.env.VUE_ENV': '"server"',
                    'process.env.NODE_ENV': '"' + this.env + '"'
                }), new _serverPlugin2.default()]
            }, server);

            if (typeof build === 'function') {
                build.call(this, serverConfig, { type: 'server' });
            }

            return serverConfig;
        }
    }]);
    return WebpackConfig;
}();

exports.default = WebpackConfig;
module.exports = exports['default'];