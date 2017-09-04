'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var Koa = require('koa');
var Router = require('koa-router');
var serve = require('koa-static');
var chokidar = require('chokidar');
var rendererFactory = require('./ssr-renderer');
var config = require('./config');
var routeManager = require('./route-manager');
var isProd = process.env.NODE_ENV === 'production';

var app = new Koa();
var router = new Router();

(0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
    var port;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.prev = 0;
                    _context2.next = 3;
                    return routeManager.autoCompileRoutes();

                case 3:
                    if (!isProd) {
                        _context2.next = 6;
                        break;
                    }

                    _context2.next = 6;
                    return routeManager.compileMultiEntries();

                case 6:
                    chokidar.watch(path.join(config.globals.srcDir, 'pages')).on('change', function () {
                        return routeManager.autoCompileRoutes();
                    });

                    app.use(serve(config.webpack.output.path));

                    rendererFactory.initRenderer(app);

                    router.all('*', function () {
                        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx) {
                            var renderer;
                            return _regenerator2.default.wrap(function _callee$(_context) {
                                while (1) {
                                    switch (_context.prev = _context.next) {
                                        case 0:
                                            if (!routeManager.shouldPrerender(ctx.path)) {
                                                _context.next = 6;
                                                break;
                                            }

                                            _context.next = 3;
                                            return routeManager.prerender(ctx.path);

                                        case 3:
                                            ctx.body = _context.sent;
                                            _context.next = 12;
                                            break;

                                        case 6:
                                            _context.next = 8;
                                            return rendererFactory.getRenderer();

                                        case 8:
                                            renderer = _context.sent;
                                            _context.next = 11;
                                            return new _promise2.default(function (resolve, reject) {
                                                renderer.renderToString(ctx, function (err, html) {
                                                    if (err) {
                                                        return reject(err);
                                                    }

                                                    resolve(html);
                                                });
                                            });

                                        case 11:
                                            ctx.body = _context.sent;

                                        case 12:
                                        case 'end':
                                            return _context.stop();
                                    }
                                }
                            }, _callee, undefined);
                        }));

                        return function (_x) {
                            return _ref2.apply(this, arguments);
                        };
                    }());

                    app.use(router.routes());
                    app.use(router.allowedMethods());

                    port = process.env.PORT || 3030;

                    app.listen(port, function () {
                        console.log('server started at localhost:' + port);
                    });
                    _context2.next = 19;
                    break;

                case 16:
                    _context2.prev = 16;
                    _context2.t0 = _context2['catch'](0);

                    console.error(_context2.t0);

                case 19:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _callee2, undefined, [[0, 16]]);
}))();