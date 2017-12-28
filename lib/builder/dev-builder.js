'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _memoryFs = require('memory-fs');

var _memoryFs2 = _interopRequireDefault(_memoryFs);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _connectHistoryApiFallback = require('connect-history-api-fallback');

var _connectHistoryApiFallback2 = _interopRequireDefault(_connectHistoryApiFallback);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _vueSkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin');

var _vueSkeletonWebpackPlugin2 = _interopRequireDefault(_vueSkeletonWebpackPlugin);

var _constants = require('../constants');

var _webpack3 = require('../utils/webpack');

var _router = require('../utils/router');

var _baseBuilder = require('./base-builder');

var _baseBuilder2 = _interopRequireDefault(_baseBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DevBuilder = function (_BaseBuilder) {
    (0, _inherits3.default)(DevBuilder, _BaseBuilder);

    function DevBuilder(core) {
        (0, _classCallCheck3.default)(this, DevBuilder);

        var _this = (0, _possibleConstructorReturn3.default)(this, (DevBuilder.__proto__ || (0, _getPrototypeOf2.default)(DevBuilder)).call(this, core));

        _this.watchers = [];

        _this.devMiddleware = null;

        _this.serverWatching = null;

        _this.writeFile = _webpack3.writeFileInDev;

        _this.sharedCache = {};
        return _this;
    }

    (0, _createClass3.default)(DevBuilder, [{
        key: 'addWatcher',
        value: function addWatcher(paths, events, callback) {
            if (!Array.isArray(events)) {
                events = [events];
            }
            var watcher = _chokidar2.default.watch(paths, { ignoreInitial: true });
            events.forEach(function (event) {
                watcher.on(event, callback);
            });
            this.watchers.push(watcher);
        }
    }, {
        key: 'reloadClient',
        value: function reloadClient() {
            if (this.oldHotMiddleware) {
                this.oldHotMiddleware.publish({
                    action: 'reload'
                });
            }
        }
    }, {
        key: 'startRebuild',
        value: function startRebuild() {
            console.log('[Lavas] config changed, start rebuilding...');
            this.core.emit('start-rebuild');
        }
    }, {
        key: 'addSkeletonRoutes',
        value: function addSkeletonRoutes(clientConfig) {
            clientConfig.module.rules.push(_vueSkeletonWebpackPlugin2.default.loader({
                resource: [(0, _path.join)(this.config.globals.rootDir, '.lavas/router')],
                options: {
                    entry: [_constants.DEFAULT_ENTRY_NAME],
                    importTemplate: 'import [nameCap] from \'@/core/Skeleton.vue\';',
                    routePathTemplate: '/skeleton-[name]',
                    insertAfter: 'let routes = ['
                }
            }));
        }
    }, {
        key: 'addWatchers',
        value: function addWatchers() {
            var _this2 = this;

            var _config = this.config,
                globals = _config.globals,
                build = _config.build;

            var pagesDir = (0, _path.join)(globals.rootDir, 'pages');
            this.addWatcher(pagesDir, ['add', 'unlink'], (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return _this2.routeManager.buildRoutes();

                            case 2:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, _this2);
            })));

            if (build.watch) {
                this.addWatcher(build.watch, 'change', this.startRebuild.bind(this));
            }

            var configDir = (0, _path.join)(globals.rootDir, _constants.LAVAS_CONFIG_FILE);
            this.addWatcher(configDir, 'change', this.startRebuild.bind(this));
        }
    }, {
        key: 'build',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                var _this3 = this;

                var mpaConfig, clientConfig, serverConfig, hotMiddleware, clientCompiler, serverCompiler, clientMFS, noop, serverMFS;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                this.isDev = true;
                                mpaConfig = void 0;
                                clientConfig = void 0;
                                serverConfig = void 0;
                                hotMiddleware = void 0;
                                clientCompiler = void 0;
                                serverCompiler = void 0;
                                clientMFS = void 0;

                                noop = function noop() {};

                                _context4.next = 11;
                                return this.routeManager.buildRoutes();

                            case 11:
                                _context4.next = 13;
                                return this.writeRuntimeConfig();

                            case 13:
                                if (!this.ssr) {
                                    _context4.next = 26;
                                    break;
                                }

                                console.log('[Lavas] SSR build starting...');
                                clientConfig = this.webpackConfig.client();
                                serverConfig = this.webpackConfig.server();
                                serverMFS = new _memoryFs2.default();

                                this.renderer.addWatcher = this.addWatcher.bind(this);
                                this.renderer.reloadClient = this.reloadClient.bind(this);
                                _context4.next = 22;
                                return this.renderer.build(clientConfig, serverConfig);

                            case 22:
                                this.renderer.serverMFS = serverMFS;

                                serverCompiler = (0, _webpack2.default)(serverConfig);
                                serverCompiler.outputFileSystem = serverMFS;

                                this.serverWatching = serverCompiler.watch({}, function () {
                                    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(err, stats) {
                                        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, error;

                                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        if (!err) {
                                                            _context2.next = 2;
                                                            break;
                                                        }

                                                        throw err;

                                                    case 2:
                                                        stats = stats.toJson();

                                                        if (!stats.errors.length) {
                                                            _context2.next = 24;
                                                            break;
                                                        }

                                                        _iteratorNormalCompletion = true;
                                                        _didIteratorError = false;
                                                        _iteratorError = undefined;
                                                        _context2.prev = 7;

                                                        for (_iterator = (0, _getIterator3.default)(stats.errors); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                                            error = _step.value;

                                                            console.error(error);
                                                        }
                                                        _context2.next = 15;
                                                        break;

                                                    case 11:
                                                        _context2.prev = 11;
                                                        _context2.t0 = _context2['catch'](7);
                                                        _didIteratorError = true;
                                                        _iteratorError = _context2.t0;

                                                    case 15:
                                                        _context2.prev = 15;
                                                        _context2.prev = 16;

                                                        if (!_iteratorNormalCompletion && _iterator.return) {
                                                            _iterator.return();
                                                        }

                                                    case 18:
                                                        _context2.prev = 18;

                                                        if (!_didIteratorError) {
                                                            _context2.next = 21;
                                                            break;
                                                        }

                                                        throw _iteratorError;

                                                    case 21:
                                                        return _context2.finish(18);

                                                    case 22:
                                                        return _context2.finish(15);

                                                    case 23:
                                                        return _context2.abrupt('return');

                                                    case 24:
                                                        _context2.next = 26;
                                                        return _this3.renderer.refreshFiles();

                                                    case 26:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this3, [[7, 11, 15, 23], [16,, 18, 22]]);
                                    }));

                                    return function (_x, _x2) {
                                        return _ref3.apply(this, arguments);
                                    };
                                }());

                            case 26:
                                if (this.ssr) {
                                    _context4.next = 34;
                                    break;
                                }

                                console.log('[Lavas] SPA build starting...');
                                _context4.next = 30;
                                return this.createMPAConfig(true);

                            case 30:
                                mpaConfig = _context4.sent;
                                _context4.next = 33;
                                return (0, _webpack3.enableHotReload)(this.lavasPath(), mpaConfig, true);

                            case 33:
                                this.addSkeletonRoutes(mpaConfig);

                            case 34:
                                clientCompiler = (0, _webpack2.default)([clientConfig, mpaConfig].filter(function (config) {
                                    return config;
                                }));
                                clientCompiler.cache = this.sharedCache;

                                this.devMiddleware = (0, _webpackDevMiddleware2.default)(clientCompiler, {
                                    publicPath: this.config.build.publicPath,
                                    noInfo: true
                                });

                                clientMFS = this.devMiddleware.fileSystem;
                                clientCompiler.outputFileSystem = clientMFS;
                                if (this.ssr) {
                                    this.renderer.clientMFS = clientMFS;
                                }

                                hotMiddleware = (0, _webpackHotMiddleware2.default)(clientCompiler, {
                                    heartbeat: 5000,
                                    log: noop
                                });

                                clientCompiler.plugin('compilation', function (compilation) {
                                    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
                                        hotMiddleware.publish({
                                            action: 'reload'
                                        });
                                        cb();
                                    });
                                });

                                if (!this.ssr) {
                                    this.core.middlewareComposer.add((0, _connectHistoryApiFallback2.default)({
                                        htmlAcceptHeaders: ['text/html'],
                                        disableDotRule: false,
                                        index: '/' + _constants.DEFAULT_ENTRY_NAME + '.html'
                                    }));
                                }

                                this.core.middlewareComposer.add(this.devMiddleware);
                                this.core.middlewareComposer.add(hotMiddleware);

                                _context4.next = 47;
                                return new _promise2.default(function (resolve) {
                                    _this3.devMiddleware.waitUntilValid((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                                            while (1) {
                                                switch (_context3.prev = _context3.next) {
                                                    case 0:
                                                        if (!_this3.ssr) {
                                                            console.log('[Lavas] MPA build completed.');
                                                        }

                                                        if (!_this3.ssr) {
                                                            _context3.next = 5;
                                                            break;
                                                        }

                                                        _context3.next = 4;
                                                        return _this3.renderer.refreshFiles();

                                                    case 4:
                                                        console.log('[Lavas] SSR build completed.');

                                                    case 5:
                                                        if (_this3.oldHotMiddleware) {
                                                            _this3.oldHotMiddleware.publish({
                                                                action: 'reload'
                                                            });
                                                        }

                                                        _this3.oldHotMiddleware = hotMiddleware;
                                                        resolve();

                                                    case 8:
                                                    case 'end':
                                                        return _context3.stop();
                                                }
                                            }
                                        }, _callee3, _this3);
                                    })));
                                });

                            case 47:

                                this.addWatchers();

                            case 48:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function build() {
                return _ref2.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'close',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
                var _this4 = this;

                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                if (this.watchers && this.watchers.length) {
                                    this.watchers.forEach(function (watcher) {
                                        watcher.close();
                                    });
                                    this.watchers = [];
                                }

                                if (!this.devMiddleware) {
                                    _context5.next = 4;
                                    break;
                                }

                                _context5.next = 4;
                                return new _promise2.default(function (resolve) {
                                    _this4.devMiddleware.close(function () {
                                        return resolve();
                                    });
                                });

                            case 4:
                                if (!this.serverWatching) {
                                    _context5.next = 8;
                                    break;
                                }

                                _context5.next = 7;
                                return new _promise2.default(function (resolve) {
                                    _this4.serverWatching.close(function () {
                                        return resolve();
                                    });
                                });

                            case 7:
                                this.serverWatching = null;

                            case 8:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function close() {
                return _ref5.apply(this, arguments);
            }

            return close;
        }()
    }]);
    return DevBuilder;
}(_baseBuilder2.default);

exports.default = DevBuilder;
module.exports = exports['default'];