'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _url = require('url');

var _path2 = require('./utils/path');

var _constants = require('./constants');

var _composeMiddleware = require('compose-middleware');

var _express = require('express');

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _ssr = require('./middlewares/ssr');

var _ssr2 = _interopRequireDefault(_ssr);

var _koaError = require('./middlewares/koa-error');

var _koaError2 = _interopRequireDefault(_koaError);

var _expressError = require('./middlewares/express-error');

var _expressError2 = _interopRequireDefault(_expressError);

var _static = require('./middlewares/static');

var _static2 = _interopRequireDefault(_static);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MiddlewareComposer = function () {
    function MiddlewareComposer(core) {
        (0, _classCallCheck3.default)(this, MiddlewareComposer);

        this.core = core;
        this.cwd = core.cwd;
        this.config = core.config;
        this.isProd = core.isProd;
        this.internalMiddlewares = [];
    }

    (0, _createClass3.default)(MiddlewareComposer, [{
        key: 'add',
        value: function add(middleware) {
            if (typeof middleware !== 'function') {
                throw new Error('Middleware must be a function.');
            }
            this.internalMiddlewares.push(middleware);
        }
    }, {
        key: 'clean',
        value: function clean() {
            this.internalMiddlewares = [];
        }
    }, {
        key: 'setup',
        value: function setup() {
            if (this.config.build && this.config.build.compress) {
                this.add((0, _compression2.default)());
            }

            var faviconPath = _path.posix.join(this.cwd, _constants.ASSETS_DIRNAME_IN_DIST, 'img/icons/favicon.ico');
            this.add((0, _serveFavicon2.default)(faviconPath));
        }
    }, {
        key: 'koa',
        value: function koa() {
            var _this = this;

            var composeKoa = require('koa-compose');
            var c2k = require('koa-connect');
            var mount = require('koa-mount');
            var koaStatic = require('koa-static');
            var send = require('koa-send');

            var _config = this.config,
                ssr = _config.ssr,
                base = _config.router.base,
                publicPath = _config.build.publicPath,
                serviceWorker = _config.serviceWorker,
                errorHandler = _config.errorHandler;

            base = (0, _path2.removeTrailingSlash)(base || '/');

            var middlewares = [(0, _koaError2.default)(errorHandler.errorPath), function () {
                var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
                    return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    ctx.status = 200;
                                    _context.next = 3;
                                    return next();

                                case 3:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, _this);
                }));

                return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                };
            }()].concat((0, _toConsumableArray3.default)(this.internalMiddlewares.map(c2k)));

            middlewares.push(function () {
                var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    if (!(base === ctx.path)) {
                                        _context2.next = 4;
                                        break;
                                    }

                                    ctx.redirect(ctx.path + '/' + ctx.search);
                                    _context2.next = 6;
                                    break;

                                case 4:
                                    _context2.next = 6;
                                    return next();

                                case 6:
                                case 'end':
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, _this);
                }));

                return function (_x3, _x4) {
                    return _ref2.apply(this, arguments);
                };
            }());

            if (ssr) {
                if (this.isProd && !(0, _path2.isFromCDN)(publicPath)) {
                    middlewares.push(mount(_path.posix.join(publicPath, _constants.ASSETS_DIRNAME_IN_DIST), koaStatic((0, _path.join)(this.cwd, _constants.ASSETS_DIRNAME_IN_DIST))));

                    if (serviceWorker && serviceWorker.swDest) {
                        var swFiles = [(0, _path.basename)(serviceWorker.swDest), 'sw-register.js'].map(function (f) {
                            return _path.posix.join(publicPath, f);
                        });
                        middlewares.push(function () {
                            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx, next) {
                                var done;
                                return _regenerator2.default.wrap(function _callee3$(_context3) {
                                    while (1) {
                                        switch (_context3.prev = _context3.next) {
                                            case 0:
                                                done = false;

                                                if (!swFiles.includes(ctx.path)) {
                                                    _context3.next = 6;
                                                    break;
                                                }

                                                ctx.set('Cache-Control', 'private, no-cache, no-store');
                                                _context3.next = 5;
                                                return send(ctx, ctx.path.substring(publicPath.length), {
                                                    root: _this.cwd
                                                });

                                            case 5:
                                                done = _context3.sent;

                                            case 6:
                                                if (done) {
                                                    _context3.next = 9;
                                                    break;
                                                }

                                                _context3.next = 9;
                                                return next();

                                            case 9:
                                            case 'end':
                                                return _context3.stop();
                                        }
                                    }
                                }, _callee3, _this);
                            }));

                            return function (_x5, _x6) {
                                return _ref3.apply(this, arguments);
                            };
                        }());
                    }
                }
                middlewares.push(c2k((0, _ssr2.default)(this.core)));
            }

            return composeKoa(middlewares);
        }
    }, {
        key: 'express',
        value: function express() {
            var expressRouter = _express.Router;
            var _config2 = this.config,
                ssr = _config2.ssr,
                base = _config2.router.base,
                publicPath = _config2.build.publicPath,
                serviceWorker = _config2.serviceWorker,
                errorHandler = _config2.errorHandler;

            base = (0, _path2.removeTrailingSlash)(base || '/');

            var middlewares = (0, _from2.default)(this.internalMiddlewares);

            var rootRouter = expressRouter();
            rootRouter.get(base, function (req, res, next) {
                var url = (0, _url.parse)(req.url);
                if (!url.pathname.endsWith('/')) {
                    res.redirect(301, url.pathname + '/' + (url.search || ''));
                } else {
                    next();
                }
            });
            middlewares.unshift(rootRouter);

            if (ssr) {
                if (this.isProd && !(0, _path2.isFromCDN)(publicPath)) {
                    var staticRouter = expressRouter();
                    staticRouter.get(_path.posix.join(publicPath, _constants.ASSETS_DIRNAME_IN_DIST, '*'), (0, _static2.default)(publicPath));
                    middlewares.push(staticRouter);

                    middlewares.push((0, _serveStatic2.default)(this.cwd, {
                        cacheControl: false,
                        etag: false
                    }));

                    if (serviceWorker && serviceWorker.swDest) {
                        var swFiles = [(0, _path.basename)(serviceWorker.swDest), 'sw-register.js'].map(function (f) {
                            return _path.posix.join(publicPath, f);
                        });
                        var swRouter = expressRouter();
                        swRouter.get(swFiles, (0, _static2.default)(publicPath));
                        middlewares.push(swRouter);

                        middlewares.push((0, _serveStatic2.default)(this.cwd, {
                            etag: false
                        }));
                    }
                }

                middlewares.push((0, _ssr2.default)(this.core));
            }

            middlewares.push((0, _expressError2.default)(errorHandler.errorPath));

            return (0, _composeMiddleware.compose)(middlewares);
        }
    }]);
    return MiddlewareComposer;
}();

exports.default = MiddlewareComposer;
module.exports = exports['default'];