

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _crypto = require('crypto');

var _serializeJavascript = require('serialize-javascript');

var _serializeJavascript2 = _interopRequireDefault(_serializeJavascript);

var _lodash = require('lodash.template');

var _lodash2 = _interopRequireDefault(_lodash);

var _router = require('./utils/router');

var _webpack = require('./utils/webpack');

var _path2 = require('./utils/path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routerTemplate = (0, _path.join)(__dirname, './templates/router.tmpl');

var RouteManager = function () {
    function RouteManager() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var env = arguments[1];
        (0, _classCallCheck3.default)(this, RouteManager);

        this.config = config;
        this.isDev = env === 'development';

        if (this.config.globals && this.config.globals.rootDir) {
            this.lavasDir = (0, _path.join)(this.config.globals.rootDir, './.lavas');
        }

        this.routes = [];

        this.flatRoutes = new _set2.default();

        this.errorRoute;
    }

    (0, _createClass3.default)(RouteManager, [{
        key: 'rewriteRoutePath',
        value: function rewriteRoutePath(rewriteRules, path) {
            for (var i = 0; i < rewriteRules.length; i++) {
                var rule = rewriteRules[i];
                var from = rule.from,
                    to = rule.to;

                if (from instanceof RegExp && from.test(path)) {
                    return path.replace(from, to);
                } else if (Array.isArray(from) && from.includes(path) || typeof from === 'string' && from === path) {
                        return to;
                    }
            }
            return path;
        }
    }, {
        key: 'mergeWithConfig',
        value: function mergeWithConfig(routes) {
            var routesConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            var _this = this;

            var rewriteRules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var parentPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

            var timestamp = this.isDev ? new Date().getTime() : '';
            var errorIndex = void 0;

            routes.forEach(function (route, index) {
                _this.flatRoutes.add(route);

                route.rewritePath = _this.rewriteRoutePath(rewriteRules, route.path);
                route.fullPath = parentPath ? parentPath + '/' + route.path : route.path;

                if (route.fullPath === _this.config.errorHandler.errorPath) {
                    _this.errorRoute = route;

                    _this.errorRoute.alias = '*';
                    errorIndex = index;
                }

                var routeConfig = routesConfig.find(function (_ref) {
                    var pattern = _ref.pattern;

                    return pattern instanceof RegExp ? pattern.test(route.fullPath) : pattern === route.fullPath;
                });

                if (routeConfig) {
                    var routePath = routeConfig.path,
                        lazyLoading = routeConfig.lazyLoading,
                        chunkname = routeConfig.chunkname;


                    (0, _assign2.default)(route, routeConfig, {
                        rewritePath: routePath || route.rewritePath,
                        lazyLoading: lazyLoading || !!chunkname
                    });
                }

                route.hash = timestamp + (0, _crypto.createHash)('md5').update(route.component).digest('hex');

                route.pathRegExp = route.rewritePath === '*' ? /^.*$/ : (0, _router.routes2Reg)(route.rewritePath);

                if (route.children && route.children.length) {
                    _this.mergeWithConfig(route.children, routesConfig, rewriteRules, route.fullPath);
                }
            });

            if (errorIndex !== undefined) {
                routes.splice(errorIndex, 1);
            }
        }
    }, {
        key: 'generateRoutesContent',
        value: function generateRoutesContent(routes) {
            var generate = function generate(routes) {
                return routes.map(function (cur) {
                    var route = {
                        path: cur.rewritePath,
                        component: '_' + cur.hash,
                        meta: cur.meta || {}
                    };

                    if (cur.name) {
                        route.name = cur.name;
                    }

                    if (cur.alias) {
                        route.alias = cur.alias;
                    }

                    if (cur.children) {
                        route.children = generate(cur.children);
                    }

                    return route;
                });
            };

            return (0, _stringify2.default)(generate(routes), undefined, 4).replace(/"component": "(_.+)"/mg, '"component": $1');
        }
    }, {
        key: 'writeRoutesSourceFile',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var writeFile, _config$router, _config$router$mode, mode, _config$router$base, base, _config$router$pageTr, pageTransition, scrollBehavior, transitionType, routesFilePath, routesContent, routesFileContent;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.routes.push(this.errorRoute);

                                writeFile = this.isDev ? _webpack.writeFileInDev : _fsExtra.outputFile;
                                _config$router = this.config.router, _config$router$mode = _config$router.mode, mode = _config$router$mode === undefined ? 'history' : _config$router$mode, _config$router$base = _config$router.base, base = _config$router$base === undefined ? '/' : _config$router$base, _config$router$pageTr = _config$router.pageTransition, pageTransition = _config$router$pageTr === undefined ? { enable: false } : _config$router$pageTr, scrollBehavior = _config$router.scrollBehavior;
                                transitionType = pageTransition.type;

                                if (transitionType === 'slide') {
                                    pageTransition = (0, _assign2.default)({
                                        enable: true,
                                        slideLeftClass: 'slide-left',
                                        slideRightClass: 'slide-right',
                                        alwaysBackPages: ['index'],
                                        alwaysForwardPages: []
                                    }, pageTransition);
                                } else if (transitionType) {
                                    pageTransition = (0, _assign2.default)({
                                        enable: true,
                                        transitionClass: transitionType
                                    }, pageTransition);
                                } else {
                                    console.log('[Lavas] page transition type is required.');
                                    pageTransition = { enable: false };
                                }

                                if (scrollBehavior) {
                                    scrollBehavior = (0, _serializeJavascript2.default)(scrollBehavior).replace('scrollBehavior(', 'function(');
                                }

                                routesFilePath = (0, _path.join)(this.lavasDir, 'router.js');
                                routesContent = this.generateRoutesContent(this.routes);
                                _context.t0 = _lodash2.default;
                                _context.next = 11;
                                return (0, _fsExtra.readFile)(routerTemplate, 'utf8');

                            case 11:
                                _context.t1 = _context.sent;
                                _context.t2 = (0, _context.t0)(_context.t1);
                                _context.t3 = {
                                    router: {
                                        mode: mode,
                                        base: base,
                                        routes: this.flatRoutes,
                                        scrollBehavior: scrollBehavior,
                                        pageTransition: pageTransition
                                    },
                                    routesContent: routesContent
                                };
                                routesFileContent = (0, _context.t2)(_context.t3);
                                _context.next = 17;
                                return writeFile(routesFilePath, routesFileContent);

                            case 17:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function writeRoutesSourceFile() {
                return _ref2.apply(this, arguments);
            }

            return writeRoutesSourceFile;
        }()
    }, {
        key: 'writeRoutesJsonFile',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var generateRoutesJson, routerConfig, routesJson;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                generateRoutesJson = function generateRoutesJson(route) {
                                    var tmpRoute = {
                                        path: route.rewritePath,
                                        name: route.name,
                                        meta: route.meta || {}
                                    };

                                    if (route.alias) {
                                        tmpRoute.alias = route.alias;
                                    }

                                    if (route.children) {
                                        tmpRoute.children = [];
                                        route.children.forEach(function (child) {
                                            return tmpRoute.children.push(generateRoutesJson(child));
                                        });
                                    }

                                    return tmpRoute;
                                };

                                routerConfig = this.config.router;
                                routesJson = {
                                    ssr: routerConfig.ssr,
                                    mode: routerConfig.mode,
                                    base: routerConfig.base,
                                    routes: []
                                };


                                this.routes.forEach(function (route) {
                                    return routesJson.routes.push(generateRoutesJson(route));
                                });

                                _context2.next = 6;
                                return (0, _fsExtra.outputFile)((0, _path2.distLavasPath)(this.config.build.path, 'routes.json'), (0, _stringify2.default)(routesJson, null, 4));

                            case 6:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function writeRoutesJsonFile() {
                return _ref3.apply(this, arguments);
            }

            return writeRoutesJsonFile;
        }()
    }, {
        key: 'buildRoutes',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                var _config$router2, _config$router2$route, routesConfig, _config$router2$rewri, rewriteRules, pathRule;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _config$router2 = this.config.router, _config$router2$route = _config$router2.routes, routesConfig = _config$router2$route === undefined ? [] : _config$router2$route, _config$router2$rewri = _config$router2.rewrite, rewriteRules = _config$router2$rewri === undefined ? [] : _config$router2$rewri, pathRule = _config$router2.pathRule;

                                this.flatRoutes = new _set2.default();

                                console.log('[Lavas] auto compile routes...');

                                _context3.next = 5;
                                return (0, _router.generateRoutes)((0, _path.join)(this.lavasDir, '../pages'), { routerOption: { pathRule: pathRule } });

                            case 5:
                                this.routes = _context3.sent;

                                this.mergeWithConfig(this.routes, routesConfig, rewriteRules);

                                _context3.next = 9;
                                return this.writeRoutesSourceFile();

                            case 9:
                                if (this.isDev) {
                                    _context3.next = 12;
                                    break;
                                }

                                _context3.next = 12;
                                return this.writeRoutesJsonFile();

                            case 12:

                                console.log('[Lavas] all routes are already generated.');

                            case 13:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function buildRoutes() {
                return _ref4.apply(this, arguments);
            }

            return buildRoutes;
        }()
    }]);
    return RouteManager;
}();

exports.default = RouteManager;
module.exports = exports['default'];