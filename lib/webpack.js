'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _serverPlugin = require('vue-server-renderer/server-plugin');

var _serverPlugin2 = _interopRequireDefault(_serverPlugin);

var _webpackBundleAnalyzer = require('webpack-bundle-analyzer');

var _swRegisterWebpackPlugin = require('sw-register-webpack-plugin');

var _swRegisterWebpackPlugin2 = _interopRequireDefault(_swRegisterWebpackPlugin);

var _workboxWebpackPlugin = require('./plugins/workbox-webpack-plugin');

var _workboxWebpackPlugin2 = _interopRequireDefault(_workboxWebpackPlugin);

var _loader = require('./utils/loader');

var _path2 = require('./utils/path');

var _workbox = require('./utils/workbox');

var _constants = require('./constants');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _gracefulFs = require('graceful-fs');

var _gracefulFs2 = _interopRequireDefault(_gracefulFs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_gracefulFs2.default.gracefulify(_fs2.default);

var WebpackConfig = function () {
    function WebpackConfig() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var env = arguments[1];
        (0, _classCallCheck3.default)(this, WebpackConfig);

        this.config = config;
        this.env = env;
        this.isProd = this.env === 'production';
        this.isDev = this.env === 'development';
    }

    (0, _createClass3.default)(WebpackConfig, [{
        key: 'base',
        value: function base() {
            var buildConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var _config = this.config,
                globals = _config.globals,
                build = _config.build;

            var _Object$assign = (0, _assign2.default)({}, build, buildConfig),
                path = _Object$assign.path,
                publicPath = _Object$assign.publicPath,
                filenames = _Object$assign.filenames,
                babel = _Object$assign.babel,
                cssSourceMap = _Object$assign.cssSourceMap,
                cssMinimize = _Object$assign.cssMinimize,
                cssExtract = _Object$assign.cssExtract,
                jsSourceMap = _Object$assign.jsSourceMap,
                _Object$assign$alias$ = _Object$assign.alias.base,
                baseAlias = _Object$assign$alias$ === undefined ? {} : _Object$assign$alias$,
                _Object$assign$define = _Object$assign.defines.base,
                baseDefines = _Object$assign$define === undefined ? {} : _Object$assign$define,
                extend = _Object$assign.extend,
                _Object$assign$plugin = _Object$assign.plugins.base,
                basePlugins = _Object$assign$plugin === undefined ? [] : _Object$assign$plugin;

            var baseConfig = {
                output: {
                    path: path,
                    publicPath: publicPath
                },
                resolve: {
                    extensions: ['.js', '.vue', '.json'],
                    alias: (0, _assign2.default)({
                        '@': globals.rootDir,
                        '$': (0, _path.join)(globals.rootDir, '.lavas')
                    }, baseAlias)
                },
                module: {
                    noParse: /es6-promise\.js$/,
                    rules: [{
                        test: /\.vue$/,
                        use: [{
                            loader: 'vue-loader',
                            options: (0, _loader.vueLoaders)({
                                cssSourceMap: cssSourceMap,
                                cssMinimize: cssMinimize,
                                cssExtract: cssExtract
                            })
                        }],
                        include: [(0, _path.join)(globals.rootDir, 'components'), (0, _path.join)(globals.rootDir, 'core'), (0, _path.join)(globals.rootDir, 'pages'), (0, _path.join)(globals.rootDir, 'entries')]
                    }, {
                        test: /\.js$/,
                        use: {
                            loader: 'babel-loader',
                            options: babel
                        },
                        exclude: /node_modules/
                    }, {
                        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: (0, _path2.assetsPath)(filenames.img)
                        }
                    }, {
                        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: (0, _path2.assetsPath)(filenames.fonts)
                        }
                    }]
                }
            };

            var pluginsInProd = [new _webpack2.default.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                sourceMap: jsSourceMap
            }), new _optimizeCssAssetsWebpackPlugin2.default({
                cssProcessorOptions: {
                    safe: true
                }
            })];

            var pluginsInDev = [new _friendlyErrorsWebpackPlugin2.default()];

            baseConfig.plugins = [].concat((0, _toConsumableArray3.default)(this.isProd ? pluginsInProd : pluginsInDev), [new _webpack2.default.DefinePlugin(baseDefines), new _swRegisterWebpackPlugin2.default({
                filePath: (0, _path.resolve)(__dirname, 'templates/sw-register.js'),
                prefix: publicPath
            })], (0, _toConsumableArray3.default)(basePlugins));

            if (cssExtract) {
                baseConfig.plugins.unshift(new _extractTextWebpackPlugin2.default({
                    filename: (0, _path2.assetsPath)(filenames.css)
                }));
            }

            if (typeof extend === 'function') {
                extend.call(this, baseConfig, {
                    type: 'base',
                    env: this.env
                });
            }

            return baseConfig;
        }
    }, {
        key: 'client',
        value: function client() {
            var buildConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var _config2 = this.config,
                buildVersion = _config2.buildVersion,
                ssr = _config2.ssr,
                globals = _config2.globals,
                build = _config2.build,
                manifest = _config2.manifest,
                workboxConfig = _config2.serviceWorker;

            var _Object$assign3 = (0, _assign2.default)({}, build, buildConfig),
                publicPath = _Object$assign3.publicPath,
                filenames = _Object$assign3.filenames,
                cssSourceMap = _Object$assign3.cssSourceMap,
                cssMinimize = _Object$assign3.cssMinimize,
                cssExtract = _Object$assign3.cssExtract,
                jsSourceMap = _Object$assign3.jsSourceMap,
                bundleAnalyzerReport = _Object$assign3.bundleAnalyzerReport,
                extend = _Object$assign3.extend,
                _Object$assign3$defin = _Object$assign3.defines.client,
                clientDefines = _Object$assign3$defin === undefined ? {} : _Object$assign3$defin,
                _Object$assign3$alias = _Object$assign3.alias.client,
                clientAlias = _Object$assign3$alias === undefined ? {} : _Object$assign3$alias,
                _Object$assign3$plugi = _Object$assign3.plugins.client,
                clientPlugins = _Object$assign3$plugi === undefined ? [] : _Object$assign3$plugi;

            var outputFilename = filenames.entry;
            var clientConfig = (0, _webpackMerge2.default)(this.base(buildConfig), {
                output: {
                    filename: (0, _path2.assetsPath)(outputFilename),
                    chunkFilename: (0, _path2.assetsPath)(filenames.chunk)
                },
                resolve: {
                    alias: clientAlias
                },
                module: {
                    rules: (0, _loader.styleLoaders)({
                        cssSourceMap: cssSourceMap,
                        cssMinimize: cssMinimize,
                        cssExtract: cssExtract
                    })
                },
                devtool: jsSourceMap ? this.isDev ? 'cheap-module-eval-source-map' : 'nosources-source-map' : false,
                plugins: [new _webpack2.default.DefinePlugin((0, _assign2.default)({
                    'process.env.VUE_ENV': '"client"',
                    'process.env.NODE_ENV': '"' + this.env + '"'
                }, clientDefines)), new _webpack2.default.optimize.CommonsChunkPlugin({
                    name: 'vendor',
                    filename: (0, _path2.assetsPath)(filenames.vendor),
                    minChunks: function minChunks(module, count) {
                        return module.resource && /\.js$/.test(module.resource) && module.resource.indexOf('node_modules') >= 0;
                    }
                }), new _webpack2.default.optimize.CommonsChunkPlugin({
                    name: 'vue',
                    filename: (0, _path2.assetsPath)(filenames.vue),
                    minChunks: function minChunks(module, count) {
                        var context = module.context;
                        var matchContext = context ? context.split(_path.sep).join('::') : '';
                        var targets = ['vue', 'vue-router', 'vuex', 'vue-meta'];

                        var npmRegExp = new RegExp(targets.join('|'), 'i');

                        var cnpmRegExp = new RegExp(targets.map(function (t) {
                            return '_' + t + '@\\d\\.\\d\\.\\d@' + t;
                        }).join('|'), 'i');

                        return context && matchContext.indexOf('node_modules') !== -1 && (npmRegExp.test(matchContext) || cnpmRegExp.test(matchContext));
                    }
                }), new _webpack2.default.optimize.CommonsChunkPlugin({
                    name: 'manifest',
                    chunks: ['vue']
                })].concat((0, _toConsumableArray3.default)(clientPlugins))
            });

            if (workboxConfig) {
                workboxConfig.importWorkboxFrom = 'disabled';
                if (ssr) {
                    workboxConfig.templatedUrls = {
                        '/appshell': '' + buildVersion
                    };
                }
                clientConfig.plugins.push(new _workboxWebpackPlugin2.default.InjectManifest(workboxConfig));
            }

            var copyList = [{
                from: (0, _path.join)(globals.rootDir, _constants.ASSETS_DIRNAME_IN_DIST),
                to: _constants.ASSETS_DIRNAME_IN_DIST
            }];
            clientConfig.plugins.push(new _copyWebpackPlugin2.default(copyList));

            if (bundleAnalyzerReport) {
                clientConfig.plugins.push(new _webpackBundleAnalyzer.BundleAnalyzerPlugin((0, _assign2.default)({}, bundleAnalyzerReport)));
            }

            if (typeof extend === 'function') {
                extend.call(this, clientConfig, {
                    type: 'client',
                    env: this.env
                });
            }

            return clientConfig;
        }
    }, {
        key: 'server',
        value: function server() {
            var buildConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var _config$build = this.config.build,
                extend = _config$build.extend,
                _config$build$nodeExt = _config$build.nodeExternalsWhitelist,
                nodeExternalsWhitelist = _config$build$nodeExt === undefined ? [] : _config$build$nodeExt,
                _config$build$defines = _config$build.defines.server,
                serverDefines = _config$build$defines === undefined ? {} : _config$build$defines,
                _config$build$alias$s = _config$build.alias.server,
                serverAlias = _config$build$alias$s === undefined ? {} : _config$build$alias$s,
                _config$build$plugins = _config$build.plugins.server,
                serverPlugins = _config$build$plugins === undefined ? [] : _config$build$plugins;


            var serverConfig = (0, _webpackMerge2.default)(this.base(buildConfig), {
                target: 'node',
                output: {
                    filename: 'server-bundle.js',
                    libraryTarget: 'commonjs2'
                },
                resolve: {
                    alias: serverAlias
                },
                module: {
                    rules: (0, _loader.styleLoaders)({
                        cssSourceMap: false,
                        cssMinimize: false,
                        cssExtract: false
                    })
                },

                externals: (0, _webpackNodeExternals2.default)({
                    whitelist: [].concat((0, _toConsumableArray3.default)(nodeExternalsWhitelist), [/\.(css|vue)$/])
                }),
                plugins: [new _webpack2.default.DefinePlugin((0, _assign2.default)({
                    'process.env.VUE_ENV': '"server"',
                    'process.env.NODE_ENV': '"' + this.env + '"'
                }, serverDefines)), new _serverPlugin2.default({
                    filename: (0, _path.join)(_constants.LAVAS_DIRNAME_IN_DIST, _constants.SERVER_BUNDLE)
                })].concat((0, _toConsumableArray3.default)(serverPlugins))
            });

            if (typeof extend === 'function') {
                extend.call(this, serverConfig, {
                    type: 'server',
                    env: this.env
                });
            }

            return serverConfig;
        }
    }]);
    return WebpackConfig;
}();

exports.default = WebpackConfig;
module.exports = exports['default'];