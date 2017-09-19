

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _crypto = require('crypto');

var _lodash = require('lodash.template');

var _lodash2 = _interopRequireDefault(_lodash);

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _htmlWebpackPlugin = require('html-webpack-plugin');

var _htmlWebpackPlugin2 = _interopRequireDefault(_htmlWebpackPlugin);

var _vueSkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin');

var _vueSkeletonWebpackPlugin2 = _interopRequireDefault(_vueSkeletonWebpackPlugin);

var _router = require('./utils/router');

var _path2 = require('./utils/path');

var _webpack = require('./utils/webpack');

var _json = require('./utils/json');

var JsonUtil = _interopRequireWildcard(_json);

var _constants = require('./constants');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routesTemplate = (0, _path.join)(__dirname, './templates/routes.tpl');
var skeletonEntryTemplate = (0, _path.join)(__dirname, './templates/entry-skeleton.tpl');

var RouteManager = function () {
    function RouteManager(core) {
        (0, _classCallCheck3.default)(this, RouteManager);

        this.config = core.config;
        this.env = core.env;
        this.cwd = core.cwd;
        this.webpackConfig = core.webpackConfig;

        if (this.config) {
            this.targetDir = (0, _path.join)(this.config.globals.rootDir, './.lavas');
        }

        this.routes = [];

        this.flatRoutes = new _set2.default();

        this.prerenderCache = (0, _lruCache2.default)({
            max: 1000,
            maxAge: 1000 * 60 * 15
        });
    }

    (0, _createClass3.default)(RouteManager, [{
        key: 'findMatchedRoute',
        value: function findMatchedRoute(path) {
            var routes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.routes;

            var matchedRoute = routes.find(function (route) {
                return route.pathRegExp.test(path);
            });
            if (matchedRoute && matchedRoute.children) {
                var matched = path.match(matchedRoute.pathRegExp);
                if (matched && matched[0]) {
                    return this.findMatchedRoute(path.substring(matched[0].length), matchedRoute.children);
                }
            }
            return matchedRoute;
        }
    }, {
        key: 'getStaticHtml',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(entryName) {
                var entry;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                entry = this.prerenderCache.get(entryName);

                                if (entry) {
                                    _context.next = 6;
                                    break;
                                }

                                _context.next = 4;
                                return (0, _fsExtra.readFile)((0, _path.join)(this.cwd, entryName + '.html'), 'utf8');

                            case 4:
                                entry = _context.sent;

                                this.prerenderCache.set(entryName, entry);

                            case 6:
                                return _context.abrupt('return', entry);

                            case 7:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function getStaticHtml(_x2) {
                return _ref.apply(this, arguments);
            }

            return getStaticHtml;
        }()
    }, {
        key: 'createEntryForSkeleton',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(entryName, skeletonPath) {
                var entryPath;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                entryPath = (0, _path.join)(this.targetDir, entryName + '/skeleton.js');
                                _context2.t0 = _fsExtra.outputFile;
                                _context2.t1 = entryPath;
                                _context2.t2 = _lodash2.default;
                                _context2.next = 6;
                                return (0, _fsExtra.readFile)(skeletonEntryTemplate, 'utf8');

                            case 6:
                                _context2.t3 = _context2.sent;
                                _context2.t4 = (0, _context2.t2)(_context2.t3);
                                _context2.t5 = {
                                    skeleton: {
                                        path: skeletonPath
                                    }
                                };
                                _context2.t6 = (0, _context2.t4)(_context2.t5);
                                _context2.next = 12;
                                return (0, _context2.t0)(_context2.t1, _context2.t6, 'utf8');

                            case 12:
                                return _context2.abrupt('return', entryPath);

                            case 13:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function createEntryForSkeleton(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return createEntryForSkeleton;
        }()
    }, {
        key: 'buildMultiEntries',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                var _this = this;

                var rootDir, mpaConfig, skeletonEntries, skeletonConfig;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                rootDir = this.config.globals.rootDir;
                                mpaConfig = (0, _webpackMerge2.default)(this.webpackConfig.client(this.config));
                                skeletonEntries = {};

                                mpaConfig.entry = {};
                                mpaConfig.context = rootDir;

                                _context4.next = 7;
                                return _promise2.default.all(this.config.entry.map(function () {
                                    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(entryConfig) {
                                        var entryName, needSSR, htmlTemplatePath, htmlFilename, skeletonPath, entryPath;
                                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                                            while (1) {
                                                switch (_context3.prev = _context3.next) {
                                                    case 0:
                                                        entryName = entryConfig.name, needSSR = entryConfig.ssr;

                                                        if (needSSR) {
                                                            _context3.next = 18;
                                                            break;
                                                        }

                                                        htmlTemplatePath = (0, _path.join)(rootDir, 'entries/' + entryName + '/client.template.html');
                                                        _context3.next = 5;
                                                        return (0, _fsExtra.pathExists)(htmlTemplatePath);

                                                    case 5:
                                                        if (_context3.sent) {
                                                            _context3.next = 7;
                                                            break;
                                                        }

                                                        htmlTemplatePath = (0, _path.join)(__dirname, './templates/index.template.html');

                                                    case 7:
                                                        htmlFilename = entryName + '.html';


                                                        mpaConfig.entry[entryName] = [(0, _path.join)(rootDir, 'entries/' + entryName + '/entry-client.js')];

                                                        mpaConfig.plugins.unshift(new _htmlWebpackPlugin2.default({
                                                            filename: htmlFilename,
                                                            template: htmlTemplatePath,
                                                            inject: true,
                                                            minify: {
                                                                removeComments: true,
                                                                collapseWhitespace: true,
                                                                removeAttributeQuotes: true
                                                            },
                                                            chunksSortMode: 'dependency',
                                                            config: _this.config }));

                                                        skeletonPath = (0, _path.join)(rootDir, 'entries/' + entryName + '/skeleton.vue');
                                                        _context3.next = 13;
                                                        return (0, _fsExtra.pathExists)(skeletonPath);

                                                    case 13:
                                                        if (!_context3.sent) {
                                                            _context3.next = 18;
                                                            break;
                                                        }

                                                        _context3.next = 16;
                                                        return _this.createEntryForSkeleton(entryName, skeletonPath);

                                                    case 16:
                                                        entryPath = _context3.sent;

                                                        skeletonEntries[entryName] = [entryPath];

                                                    case 18:
                                                    case 'end':
                                                        return _context3.stop();
                                                }
                                            }
                                        }, _callee3, _this);
                                    }));

                                    return function (_x5) {
                                        return _ref4.apply(this, arguments);
                                    };
                                }()));

                            case 7:

                                if ((0, _keys2.default)(skeletonEntries).length) {
                                    skeletonConfig = (0, _webpackMerge2.default)(this.webpackConfig.server(this.config));

                                    skeletonConfig.plugins.pop();
                                    skeletonConfig.entry = skeletonEntries;

                                    mpaConfig.plugins.push(new _vueSkeletonWebpackPlugin2.default({
                                        webpackConfig: skeletonConfig
                                    }));
                                }

                                if (!(0, _keys2.default)(mpaConfig.entry).length) {
                                    _context4.next = 12;
                                    break;
                                }

                                _context4.next = 11;
                                return (0, _webpack.webpackCompile)(mpaConfig);

                            case 11:
                                console.log('[Lavas] MPA build completed.');

                            case 12:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function buildMultiEntries() {
                return _ref3.apply(this, arguments);
            }

            return buildMultiEntries;
        }()
    }, {
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

            var _this2 = this;

            var rewriteRules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var parentPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

            var timestamp = new Date().getTime();

            routes.forEach(function (route) {
                _this2.flatRoutes.add(route);

                var routeConfig = routesConfig.find(function (_ref5) {
                    var pattern = _ref5.pattern;

                    return pattern instanceof RegExp ? pattern.test(route.path) : pattern === route.name;
                });

                route.path = _this2.rewriteRoutePath(rewriteRules, route.path);
                route.fullPath = parentPath ? parentPath + '/' + route.path : route.path;

                var entry = _this2.config.entry.find(function (entryConfig) {
                    return (0, _router.matchUrl)(entryConfig.routes, route.fullPath);
                });
                if (entry) {
                    route.entryName = entry.name;
                }

                if (routeConfig) {
                    var routePath = routeConfig.path,
                        lazyLoading = routeConfig.lazyLoading,
                        chunkname = routeConfig.chunkname;


                    (0, _assign2.default)(route, routeConfig, {
                        path: routePath || route.path,
                        lazyLoading: lazyLoading || !!chunkname
                    });
                }

                if (route.name) {
                    route.hash = timestamp + (0, _crypto.createHash)('md5').update(route.name).digest('hex');
                }

                route.pathRegExp = new RegExp('^' + route.path.replace(/\/:[^\/]*/g, '/[^\/]+') + '/?');

                if (route.children && route.children.length) {
                    _this2.mergeWithConfig(route.children, routeConfig && routeConfig.children, rewriteRules, route.fullPath);
                }
            });
        }
    }, {
        key: 'generateRoutesContent',
        value: function generateRoutesContent(routes) {
            var _this3 = this;

            return routes.reduce(function (prev, cur) {
                var childrenContent = '';
                if (cur.children) {
                    childrenContent = 'children: [\n                    ' + _this3.generateRoutesContent(cur.children) + '\n                ]';
                }
                return prev + ('{\n                path: \'' + cur.path + '\',\n                name: \'' + cur.name + '\',\n                component: _' + cur.hash + ',\n                meta: ' + (0, _stringify2.default)(cur.meta || {}) + ',\n                ' + childrenContent + '\n            },');
            }, '');
        }
    }, {
        key: 'writeRoutesFile',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
                var routesFilePath, jsonContent;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                routesFilePath = (0, _path2.distLavasPath)(this.config.webpack.base.output.path, _constants.ROUTES_FILE);
                                jsonContent = JsonUtil.stringify(this.routes);
                                _context5.next = 4;
                                return (0, _fsExtra.outputFile)(routesFilePath, jsonContent, 'utf8');

                            case 4:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function writeRoutesFile() {
                return _ref6.apply(this, arguments);
            }

            return writeRoutesFile;
        }()
    }, {
        key: 'writeRoutesSourceFile',
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
                var _this4 = this;

                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return _promise2.default.all(this.config.entry.map(function () {
                                    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(entryConfig) {
                                        var entryName, entryRoutes, entryFlatRoutes, routesFilePath, routesContent, routesFileContent;
                                        return _regenerator2.default.wrap(function _callee6$(_context6) {
                                            while (1) {
                                                switch (_context6.prev = _context6.next) {
                                                    case 0:
                                                        entryName = entryConfig.name;
                                                        entryRoutes = _this4.routes.filter(function (route) {
                                                            return route.entryName === entryName;
                                                        });
                                                        entryFlatRoutes = new _set2.default();

                                                        _this4.flatRoutes.forEach(function (flatRoute) {
                                                            if (flatRoute.entryName === entryName) {
                                                                entryFlatRoutes.add(flatRoute);
                                                            }
                                                        });

                                                        routesFilePath = (0, _path.join)(_this4.targetDir, entryName + '/routes.js');
                                                        routesContent = _this4.generateRoutesContent(entryRoutes);
                                                        _context6.t0 = _lodash2.default;
                                                        _context6.next = 9;
                                                        return (0, _fsExtra.readFile)(routesTemplate, 'utf8');

                                                    case 9:
                                                        _context6.t1 = _context6.sent;
                                                        _context6.t2 = (0, _context6.t0)(_context6.t1);
                                                        _context6.t3 = {
                                                            routes: entryFlatRoutes,
                                                            routesContent: routesContent
                                                        };
                                                        routesFileContent = (0, _context6.t2)(_context6.t3);
                                                        _context6.next = 15;
                                                        return (0, _webpack.writeFileInDev)(routesFilePath, routesFileContent);

                                                    case 15:
                                                    case 'end':
                                                        return _context6.stop();
                                                }
                                            }
                                        }, _callee6, _this4);
                                    }));

                                    return function (_x9) {
                                        return _ref8.apply(this, arguments);
                                    };
                                }()));

                            case 2:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function writeRoutesSourceFile() {
                return _ref7.apply(this, arguments);
            }

            return writeRoutesSourceFile;
        }()
    }, {
        key: 'buildRoutes',
        value: function () {
            var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
                var _config$router, _config$router$routes, routesConfig, _config$router$rewrit, rewriteRules;

                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _config$router = this.config.router, _config$router$routes = _config$router.routes, routesConfig = _config$router$routes === undefined ? [] : _config$router$routes, _config$router$rewrit = _config$router.rewrite, rewriteRules = _config$router$rewrit === undefined ? [] : _config$router$rewrit;


                                console.log('[Lavas] auto compile routes...');

                                _context8.next = 4;
                                return (0, _router.generateRoutes)((0, _path.join)(this.targetDir, '../pages'));

                            case 4:
                                this.routes = _context8.sent;

                                this.mergeWithConfig(this.routes, routesConfig, rewriteRules);

                                _context8.next = 8;
                                return this.writeRoutesSourceFile();

                            case 8:

                                console.log('[Lavas] all routes are already generated.');

                            case 9:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function buildRoutes() {
                return _ref9.apply(this, arguments);
            }

            return buildRoutes;
        }()
    }, {
        key: 'createWithRoutesFile',
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
                var routesFilePath;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                routesFilePath = (0, _path2.distLavasPath)(this.cwd, _constants.ROUTES_FILE);
                                _context9.t0 = JsonUtil;
                                _context9.next = 4;
                                return (0, _fsExtra.readFile)(routesFilePath, 'utf8');

                            case 4:
                                _context9.t1 = _context9.sent;
                                this.routes = _context9.t0.parse.call(_context9.t0, _context9.t1);

                            case 6:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function createWithRoutesFile() {
                return _ref10.apply(this, arguments);
            }

            return createWithRoutesFile;
        }()
    }]);
    return RouteManager;
}();

exports.default = RouteManager;
module.exports = exports['default'];