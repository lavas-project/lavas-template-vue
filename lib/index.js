'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _RouteManager = require('./RouteManager');

var _RouteManager2 = _interopRequireDefault(_RouteManager);

var _Renderer = require('./Renderer');

var _Renderer2 = _interopRequireDefault(_Renderer);

var _WebpackConfig = require('./WebpackConfig');

var _WebpackConfig2 = _interopRequireDefault(_WebpackConfig);

var _ConfigValidator = require('./ConfigValidator');

var _ConfigValidator2 = _interopRequireDefault(_ConfigValidator);

var _koaStatic = require('koa-static');

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _path = require('path');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LavasCore = function () {
    function LavasCore() {
        var cwd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();
        var app = arguments[1];
        (0, _classCallCheck3.default)(this, LavasCore);

        this.cwd = cwd;
        this.app = app;
    }

    (0, _createClass3.default)(LavasCore, [{
        key: 'init',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var env = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'development';
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.env = env || process.env.NODE_ENV;

                                _context.next = 3;
                                return this.loadConfig();

                            case 3:
                                this.config = _context.sent;


                                _ConfigValidator2.default.validate(this.config);

                                this.webpackConfig = new _WebpackConfig2.default(this.config, this.env);

                                this.routeManager = new _RouteManager2.default(this.config, this.env, this.webpackConfig);

                                this.renderer = new _Renderer2.default(this);

                                this.setupMiddlewares();

                            case 9:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function init() {
                return _ref.apply(this, arguments);
            }

            return init;
        }()
    }, {
        key: 'loadConfig',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                var _this = this;

                var config, configDir, files, temp;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                config = {};
                                configDir = (0, _path.join)(this.cwd, 'config');
                                files = _glob2.default.sync('**/*.js', {
                                    cwd: configDir
                                });
                                _context3.next = 5;
                                return _promise2.default.all(files.map(function () {
                                    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(filepath) {
                                        var paths, name, cur, i;
                                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        filepath = filepath.substring(0, filepath.length - 3);

                                                        paths = filepath.split('/');
                                                        name = void 0;
                                                        cur = config;

                                                        for (i = 0; i < paths.length - 1; i++) {
                                                            name = paths[i];
                                                            if (!cur[name]) {
                                                                cur[name] = {};
                                                            }

                                                            cur = cur[name];
                                                        }

                                                        name = paths.pop();

                                                        _context2.next = 8;
                                                        return _promise2.default.resolve().then(function () {
                                                            return require('' + (0, _path.join)(configDir, filepath));
                                                        });

                                                    case 8:
                                                        cur[name] = _context2.sent;

                                                    case 9:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this);
                                    }));

                                    return function (_x3) {
                                        return _ref3.apply(this, arguments);
                                    };
                                }()));

                            case 5:
                                temp = config.env || {};

                                if (temp[this.env]) {
                                    _lodash2.default.merge(config, temp[this.env]);
                                }

                                return _context3.abrupt('return', config);

                            case 8:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function loadConfig() {
                return _ref2.apply(this, arguments);
            }

            return loadConfig;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                var clientConfig, serverConfig;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.routeManager.autoCompileRoutes();

                            case 2:
                                clientConfig = this.webpackConfig.client(this.config);
                                serverConfig = this.webpackConfig.server(this.config);
                                _context4.next = 6;
                                return this.renderer.init(clientConfig, serverConfig);

                            case 6:
                                if (!(this.env === 'production')) {
                                    _context4.next = 9;
                                    break;
                                }

                                _context4.next = 9;
                                return this.routeManager.compileMultiEntries();

                            case 9:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function build() {
                return _ref4.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'setupMiddlewares',
        value: function setupMiddlewares() {
            if (this.app) {
                this.app.use((0, _koaStatic2.default)(this.config.webpack.base.output.path));
            }
        }
    }, {
        key: 'koaMiddleware',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(ctx, next) {
                var renderer;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                if (!this.routeManager.shouldPrerender(ctx.path)) {
                                    _context5.next = 6;
                                    break;
                                }

                                _context5.next = 3;
                                return this.routeManager.prerender(ctx.path);

                            case 3:
                                ctx.body = _context5.sent;
                                _context5.next = 12;
                                break;

                            case 6:
                                _context5.next = 8;
                                return this.renderer.getRenderer();

                            case 8:
                                renderer = _context5.sent;
                                _context5.next = 11;
                                return new _promise2.default(function (resolve, reject) {
                                    renderer.renderToString(ctx, function (err, html) {
                                        if (err) {
                                            return reject(err);
                                        }

                                        resolve(html);
                                    });
                                });

                            case 11:
                                ctx.body = _context5.sent;

                            case 12:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function koaMiddleware(_x4, _x5) {
                return _ref5.apply(this, arguments);
            }

            return koaMiddleware;
        }()
    }]);
    return LavasCore;
}();

exports.default = LavasCore;
module.exports = exports['default'];