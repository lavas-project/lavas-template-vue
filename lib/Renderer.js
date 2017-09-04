'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _fsExtra = require('fs-extra');

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _memoryFs = require('memory-fs');

var _memoryFs2 = _interopRequireDefault(_memoryFs);

var _koaWebpack = require('koa-webpack');

var _koaWebpack2 = _interopRequireDefault(_koaWebpack);

var _vueServerRenderer = require('vue-server-renderer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Renderer = function () {
    function Renderer(core) {
        var _this = this;

        (0, _classCallCheck3.default)(this, Renderer);

        this.env = core.env;
        this.config = core.config;
        this.rootDir = this.config.globals.rootDir;
        this.app = core.app;
        this.renderer = null;
        this.serverBundle = null;
        this.clientManifest = null;
        this.resolve = null;
        this.readyPromise = new _promise2.default(function (r) {
            return _this.resolve = r;
        });
    }

    (0, _createClass3.default)(Renderer, [{
        key: 'init',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(clientConfig, serverConfig) {
                var _this2 = this;

                var outputPath;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                this.clientConfig = clientConfig;
                                this.serverConfig = serverConfig;

                                if (!(this.env === 'production')) {
                                    _context3.next = 20;
                                    break;
                                }

                                outputPath = this.config.webpack.base.output.path;
                                _context3.next = 6;
                                return (0, _fsExtra.emptyDir)(outputPath);

                            case 6:
                                clientConfig.context = this.rootDir;
                                serverConfig.context = this.rootDir;

                                _context3.next = 10;
                                return new _promise2.default(function (resolve, reject) {

                                    (0, _webpack2.default)([clientConfig, serverConfig], function (err, stats) {
                                        if (err) {
                                            console.error(err.stack || err);
                                            if (err.details) {
                                                console.error(err.details);
                                            }
                                            reject(err);
                                            return;
                                        }

                                        var info = stats.toJson();

                                        if (stats.hasErrors()) {
                                            console.error(info.errors);
                                            reject(info.errors);
                                            return;
                                        }

                                        if (stats.hasWarnings()) {
                                            console.warn(info.warnings);
                                        }

                                        console.log('[Lavas] production build completed.');
                                        resolve();
                                    });
                                });

                            case 10:
                                _context3.next = 12;
                                return _promise2.default.resolve().then(function () {
                                    return require('' + (0, _path.join)(outputPath, './vue-ssr-server-bundle.json'));
                                });

                            case 12:
                                this.serverBundle = _context3.sent;
                                _context3.next = 15;
                                return _promise2.default.resolve().then(function () {
                                    return require('' + (0, _path.join)(outputPath, './vue-ssr-client-manifest.json'));
                                });

                            case 15:
                                this.clientManifest = _context3.sent;
                                _context3.next = 18;
                                return this.createRenderer();

                            case 18:
                                _context3.next = 22;
                                break;

                            case 20:
                                this.getClientManifest(function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(err, manifest) {
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        _this2.clientManifest = manifest;
                                                        _context.next = 3;
                                                        return _this2.createRenderer();

                                                    case 3:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this2);
                                    }));

                                    return function (_x3, _x4) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }());

                                this.getServerBundle(function () {
                                    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(err, serverBundle) {
                                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        _this2.serverBundle = serverBundle;
                                                        _context2.next = 3;
                                                        return _this2.createRenderer();

                                                    case 3:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this2);
                                    }));

                                    return function (_x5, _x6) {
                                        return _ref3.apply(this, arguments);
                                    };
                                }());

                            case 22:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function init(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return init;
        }()
    }, {
        key: 'getClientManifest',
        value: function getClientManifest(callback) {
            var _this3 = this;

            var clientConfig = this.clientConfig;

            clientConfig.context = this.rootDir;
            clientConfig.entry.app = ['webpack-hot-middleware/client'].concat((0, _toConsumableArray3.default)(clientConfig.entry.app));
            clientConfig.plugins.push(new _webpack2.default.HotModuleReplacementPlugin(), new _webpack2.default.NoEmitOnErrorsPlugin());

            var clientCompiler = (0, _webpack2.default)(clientConfig);

            var koaWebpackMiddleware = (0, _koaWebpack2.default)({
                compiler: clientCompiler,
                dev: {
                    publicPath: this.config.webpack.base.output.publicPath,
                    noInfo: true
                },
                hot: {
                    heartbeat: 5000
                }
            });
            this.app.use(koaWebpackMiddleware);

            clientCompiler.plugin('done', function (stats) {
                stats = stats.toJson();
                stats.errors.forEach(function (err) {
                    return console.error(err);
                });
                stats.warnings.forEach(function (err) {
                    return console.warn(err);
                });

                if (stats.errors.length) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = (0, _getIterator3.default)(stats.errors), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var error = _step.value;

                            console.error(error);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    return;
                }

                var rawContent = koaWebpackMiddleware.dev.fileSystem.readFileSync((0, _path.join)(clientConfig.output.path, 'vue-ssr-client-manifest.json'), 'utf-8');

                _this3.clientManifest = JSON.parse(rawContent);

                callback(null, _this3.clientManifest);
            });
        }
    }, {
        key: 'getServerBundle',
        value: function getServerBundle(callback) {
            var _this4 = this;

            var serverConfig = this.serverConfig;
            serverConfig.context = this.rootDir;

            var serverCompiler = (0, _webpack2.default)(serverConfig);
            var mfs = new _memoryFs2.default();
            serverCompiler.outputFileSystem = mfs;
            serverCompiler.watch({}, function (err, stats) {
                if (err) {
                    throw err;
                }
                stats = stats.toJson();
                if (stats.errors.length) {
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = (0, _getIterator3.default)(stats.errors), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var error = _step2.value;

                            console.error(error);
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    return;
                }

                var rawContent = mfs.readFileSync((0, _path.join)(serverConfig.output.path, 'vue-ssr-server-bundle.json'), 'utf8');

                _this4.serverBundle = JSON.parse(rawContent);

                callback(null, _this4.serverBundle);
            });
        }
    }, {
        key: 'createRenderer',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                var first, template;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (!(this.serverBundle && this.clientManifest)) {
                                    _context4.next = 7;
                                    break;
                                }

                                first = !this.renderer;
                                _context4.next = 4;
                                return (0, _fsExtra.readFile)((0, _path.join)(this.rootDir, './core/index.template.html'), 'utf-8');

                            case 4:
                                template = _context4.sent;

                                this.renderer = (0, _vueServerRenderer.createBundleRenderer)(this.serverBundle, {
                                    template: template,
                                    basedir: this.config.webpack.base.output.path,
                                    clientManifest: this.clientManifest,
                                    runInNewContext: false
                                });

                                if (first) {
                                    this.resolve(this.renderer);
                                }

                            case 7:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function createRenderer() {
                return _ref4.apply(this, arguments);
            }

            return createRenderer;
        }()
    }, {
        key: 'getRenderer',
        value: function getRenderer() {
            if (this.renderer) {
                return _promise2.default.resolve(this.renderer);
            }

            return this.readyPromise;
        }
    }]);
    return Renderer;
}();

exports.default = Renderer;
module.exports = exports['default'];