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

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _vueServerRenderer = require('vue-server-renderer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CLIENT_MANIFEST = 'vue-ssr-client-manifest.json';
var SERVER_BUNDLE = 'vue-ssr-server-bundle.json';

var Renderer = function () {
    function Renderer(core) {
        var _this = this;

        (0, _classCallCheck3.default)(this, Renderer);

        this.env = core.env;
        this.config = core.config;
        this.rootDir = this.config.globals.rootDir;
        this.cwd = core.cwd;
        this.app = core.app;
        this.renderer = null;
        this.serverBundle = null;
        this.clientManifest = null;
        this.resolve = null;
        this.readyPromise = new _promise2.default(function (r) {
            return _this.resolve = r;
        });
        this.privateFiles = [CLIENT_MANIFEST, SERVER_BUNDLE];
    }

    (0, _createClass3.default)(Renderer, [{
        key: 'createWithBundle',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var _this2 = this;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return _promise2.default.resolve().then(function () {
                                    return require('' + (0, _path.join)(_this2.cwd, SERVER_BUNDLE));
                                });

                            case 2:
                                this.serverBundle = _context.sent;
                                _context.next = 5;
                                return _promise2.default.resolve().then(function () {
                                    return require('' + (0, _path.join)(_this2.cwd, CLIENT_MANIFEST));
                                });

                            case 5:
                                this.clientManifest = _context.sent;
                                _context.next = 8;
                                return this.createRenderer();

                            case 8:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function createWithBundle() {
                return _ref.apply(this, arguments);
            }

            return createWithBundle;
        }()
    }, {
        key: 'buildInProduction',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(clientConfig, serverConfig) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                clientConfig.context = this.rootDir;
                                serverConfig.context = this.rootDir;

                                _context2.next = 4;
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

                            case 4:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function buildInProduction(_x, _x2) {
                return _ref2.apply(this, arguments);
            }

            return buildInProduction;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(clientConfig, serverConfig) {
                var _this3 = this;

                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                this.clientConfig = clientConfig;
                                this.serverConfig = serverConfig;

                                if (!(this.env === 'production')) {
                                    _context5.next = 7;
                                    break;
                                }

                                _context5.next = 5;
                                return this.buildInProduction(clientConfig, serverConfig);

                            case 5:
                                _context5.next = 9;
                                break;

                            case 7:
                                this.getClientManifest(function () {
                                    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(err, manifest) {
                                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                                            while (1) {
                                                switch (_context3.prev = _context3.next) {
                                                    case 0:
                                                        _this3.clientManifest = manifest;
                                                        _context3.next = 3;
                                                        return _this3.createRenderer();

                                                    case 3:
                                                    case 'end':
                                                        return _context3.stop();
                                                }
                                            }
                                        }, _callee3, _this3);
                                    }));

                                    return function (_x5, _x6) {
                                        return _ref4.apply(this, arguments);
                                    };
                                }());

                                this.getServerBundle(function () {
                                    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(err, serverBundle) {
                                        return _regenerator2.default.wrap(function _callee4$(_context4) {
                                            while (1) {
                                                switch (_context4.prev = _context4.next) {
                                                    case 0:
                                                        _this3.serverBundle = serverBundle;
                                                        _context4.next = 3;
                                                        return _this3.createRenderer();

                                                    case 3:
                                                    case 'end':
                                                        return _context4.stop();
                                                }
                                            }
                                        }, _callee4, _this3);
                                    }));

                                    return function (_x7, _x8) {
                                        return _ref5.apply(this, arguments);
                                    };
                                }());

                            case 9:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function build(_x3, _x4) {
                return _ref3.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'getClientManifest',
        value: function getClientManifest(callback) {
            var _this4 = this;

            var clientConfig = this.clientConfig;

            clientConfig.context = this.rootDir;
            clientConfig.entry.app = ['webpack-hot-middleware/client'].concat((0, _toConsumableArray3.default)(clientConfig.entry.app));
            clientConfig.plugins.push(new _webpack2.default.HotModuleReplacementPlugin(), new _webpack2.default.NoEmitOnErrorsPlugin());

            var clientCompiler = (0, _webpack2.default)(clientConfig);

            var devMiddleware = (0, _webpackDevMiddleware2.default)(clientCompiler, {
                publicPath: this.config.webpack.base.output.publicPath,
                noInfo: true
            });

            this.app.use(devMiddleware);

            var hotMiddleware = (0, _webpackHotMiddleware2.default)(clientCompiler, {
                heartbeat: 5000
            });

            this.app.use(hotMiddleware);

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

                var rawContent = devMiddleware.fileSystem.readFileSync((0, _path.join)(clientConfig.output.path, CLIENT_MANIFEST), 'utf-8');

                _this4.clientManifest = JSON.parse(rawContent);

                callback(null, _this4.clientManifest);
            });
        }
    }, {
        key: 'getServerBundle',
        value: function getServerBundle(callback) {
            var _this5 = this;

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

                var rawContent = mfs.readFileSync((0, _path.join)(serverConfig.output.path, SERVER_BUNDLE), 'utf8');

                _this5.serverBundle = JSON.parse(rawContent);

                callback(null, _this5.serverBundle);
            });
        }
    }, {
        key: 'createRenderer',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
                var first, template;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                if (!(this.serverBundle && this.clientManifest)) {
                                    _context6.next = 7;
                                    break;
                                }

                                first = !this.renderer;
                                _context6.next = 4;
                                return (0, _fsExtra.readFile)((0, _path.join)(this.rootDir, './core/index.template.html'), 'utf-8');

                            case 4:
                                template = _context6.sent;

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
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function createRenderer() {
                return _ref6.apply(this, arguments);
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