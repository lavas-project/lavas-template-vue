'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _ConfigReader = require('./ConfigReader');

var _ConfigReader2 = _interopRequireDefault(_ConfigReader);

var _ConfigValidator = require('./ConfigValidator');

var _ConfigValidator2 = _interopRequireDefault(_ConfigValidator);

var _privateFile = require('./middlewares/privateFile');

var _privateFile2 = _interopRequireDefault(_privateFile);

var _ssr = require('./middlewares/ssr');

var _ssr2 = _interopRequireDefault(_ssr);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _connect = require('connect');

var _connect2 = _interopRequireDefault(_connect);

var _composeMiddleware = require('compose-middleware');

var _koaCompose = require('koa-compose');

var _koaCompose2 = _interopRequireDefault(_koaCompose);

var _koaConnect = require('koa-connect');

var _koaConnect2 = _interopRequireDefault(_koaConnect);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _fsExtra = require('fs-extra');

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LavasCore = function () {
    function LavasCore() {
        var cwd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();
        (0, _classCallCheck3.default)(this, LavasCore);

        this.cwd = cwd;
    }

    (0, _createClass3.default)(LavasCore, [{
        key: '_init',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(isInBuild) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.isProd = this.env === 'production';
                                this.configReader = new _ConfigReader2.default(this.cwd, this.env);

                                if (!isInBuild) {
                                    _context.next = 10;
                                    break;
                                }

                                _context.next = 5;
                                return this.configReader.read();

                            case 5:
                                this.config = _context.sent;

                                _ConfigValidator2.default.validate(this.config);
                                this.webpackConfig = new _WebpackConfig2.default(this.config, this.env);
                                _context.next = 13;
                                break;

                            case 10:
                                _context.next = 12;
                                return this.configReader.readConfigFile(this.cwd);

                            case 12:
                                this.config = _context.sent;

                            case 13:
                                if (!isInBuild || !this.isProd) {
                                    this.app = (0, _connect2.default)();
                                }

                                this.renderer = new _Renderer2.default(this);
                                this.routeManager = new _RouteManager2.default(this);

                            case 16:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function _init(_x2) {
                return _ref.apply(this, arguments);
            }

            return _init;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var _this = this;

                var env = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'development';
                var spinner, clientConfig, serverConfig;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                this.env = env || process.env.NODE_ENV;

                                _context2.next = 3;
                                return this._init(true);

                            case 3:
                                spinner = (0, _ora2.default)();

                                spinner.start();

                                _context2.next = 7;
                                return (0, _fsExtra.emptyDir)(this.config.webpack.base.output.path);

                            case 7:
                                _context2.next = 9;
                                return this.routeManager.buildRoutes();

                            case 9:
                                if (this.config.extensions) {
                                    this.config.extensions.forEach(function (_ref3) {
                                        var name = _ref3.name,
                                            init = _ref3.init;

                                        console.log('[Lavas] ' + name + ' extension is running...');
                                        _this.webpackConfig.addHooks(init);
                                    });
                                }

                                clientConfig = this.webpackConfig.client(this.config);
                                serverConfig = this.webpackConfig.server(this.config);
                                _context2.next = 14;
                                return this.renderer.build(clientConfig, serverConfig);

                            case 14:
                                if (!this.isProd) {
                                    _context2.next = 23;
                                    break;
                                }

                                _context2.next = 17;
                                return this.configReader.writeConfigFile(this.config);

                            case 17:
                                _context2.next = 19;
                                return this.routeManager.buildMultiEntries();

                            case 19:
                                _context2.next = 21;
                                return this.routeManager.writeRoutesFile();

                            case 21:
                                _context2.next = 23;
                                return this.copyServerModuleToDist();

                            case 23:

                                spinner.succeed();

                            case 24:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function build() {
                return _ref2.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'runAfterBuild',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                this.env = 'production';
                                _context3.next = 3;
                                return this._init();

                            case 3:
                                _context3.next = 5;
                                return this.routeManager.createWithRoutesFile();

                            case 5:
                                _context3.next = 7;
                                return this.renderer.createWithBundle();

                            case 7:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function runAfterBuild() {
                return _ref4.apply(this, arguments);
            }

            return runAfterBuild;
        }()
    }, {
        key: 'koaMiddleware',
        value: function koaMiddleware() {
            if (this.isProd) {
                this.app.use((0, _serveStatic2.default)(this.config.webpack.base.output.path));
            }

            var transformedMiddlewares = this.app.stack.map(function (m) {
                return (0, _koaConnect2.default)(m.handle);
            });

            return (0, _koaCompose2.default)([function () {
                var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(ctx, next) {
                    return _regenerator2.default.wrap(function _callee4$(_context4) {
                        while (1) {
                            switch (_context4.prev = _context4.next) {
                                case 0:
                                    ctx.status = 200;
                                    _context4.next = 3;
                                    return next();

                                case 3:
                                case 'end':
                                    return _context4.stop();
                            }
                        }
                    }, _callee4, this);
                }));

                return function (_x4, _x5) {
                    return _ref5.apply(this, arguments);
                };
            }(), (0, _koaConnect2.default)((0, _privateFile2.default)(this))].concat((0, _toConsumableArray3.default)(transformedMiddlewares), [(0, _koaConnect2.default)((0, _ssr2.default)(this))]));
        }
    }, {
        key: 'expressMiddleware',
        value: function expressMiddleware() {
            if (this.isProd) {
                this.app.use((0, _serveStatic2.default)(this.config.webpack.base.output.path));
            }

            var middlewares = this.app.stack.map(function (m) {
                return m.handle;
            });

            return (0, _composeMiddleware.compose)([(0, _privateFile2.default)(this)].concat((0, _toConsumableArray3.default)(middlewares), [(0, _ssr2.default)(this)]));
        }
    }, {
        key: 'copyServerModuleToDist',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
                var libDir, distLibDir, serverDir, distServerDir, nodeModulesDir, distNodeModulesDir, jsonDir, distJsonDir;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                libDir = (0, _path.join)(this.cwd, './lib');
                                distLibDir = (0, _path.join)(this.cwd, './dist/lib');
                                serverDir = (0, _path.join)(this.cwd, './server.dev.js');
                                distServerDir = (0, _path.join)(this.cwd, './dist/server.js');
                                nodeModulesDir = (0, _path.join)(this.cwd, 'node_modules');
                                distNodeModulesDir = (0, _path.join)(this.cwd, './dist/node_modules');
                                jsonDir = (0, _path.join)(this.cwd, 'package.json');
                                distJsonDir = (0, _path.join)(this.cwd, './dist/package.json');
                                _context5.next = 10;
                                return _promise2.default.all([(0, _fsExtra.copy)(libDir, distLibDir), (0, _fsExtra.copy)(serverDir, distServerDir), (0, _fsExtra.copy)(nodeModulesDir, distNodeModulesDir), (0, _fsExtra.copy)(jsonDir, distJsonDir)]);

                            case 10:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function copyServerModuleToDist() {
                return _ref6.apply(this, arguments);
            }

            return copyServerModuleToDist;
        }()
    }]);
    return LavasCore;
}();

exports.default = LavasCore;
module.exports = exports['default'];