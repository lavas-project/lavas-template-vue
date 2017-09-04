'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _crypto = require('crypto');

var _lodash = require('lodash.template');

var _lodash2 = _interopRequireDefault(_lodash);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _htmlWebpackPlugin = require('html-webpack-plugin');

var _htmlWebpackPlugin2 = _interopRequireDefault(_htmlWebpackPlugin);

var _vueSkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin');

var _vueSkeletonWebpackPlugin2 = _interopRequireDefault(_vueSkeletonWebpackPlugin);

var _router = require('./utils/router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routesTemplate = (0, _path.join)(__dirname, './templates/routes.tpl');
var skeletonEntryTemplate = (0, _path.join)(__dirname, './templates/entry-skeleton.tpl');

var RouteManager = function () {
    function RouteManager(config, env, webpackConfig) {
        (0, _classCallCheck3.default)(this, RouteManager);

        this.config = config;
        this.env = env;
        this.webpackConfig = webpackConfig;

        (0, _assign2.default)(this, {
            targetDir: (0, _path.join)(config.globals.rootDir, './.lavas'),
            skeletonsDirname: 'skeletons'
        });

        this.routes = [];

        this.cache = (0, _lruCache2.default)({
            max: 1000,
            maxAge: 1000 * 60 * 15
        });
    }

    (0, _createClass3.default)(RouteManager, [{
        key: 'shouldPrerender',
        value: function shouldPrerender(path) {
            if (!this.env === 'production') {
                return false;
            }
            var matchedRoute = this.routes.find(function (route) {
                return route.pathRegExp.test(path);
            });

            return matchedRoute && matchedRoute.prerender;
        }
    }, {
        key: 'prerender',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(path) {
                var matchedRoute, entry;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                matchedRoute = this.routes.find(function (route) {
                                    return route.pathRegExp.test(path);
                                });

                                if (!(matchedRoute && matchedRoute.htmlPath)) {
                                    _context.next = 9;
                                    break;
                                }

                                entry = this.cache.get(path);

                                if (entry) {
                                    _context.next = 8;
                                    break;
                                }

                                _context.next = 6;
                                return (0, _fsExtra.readFile)(matchedRoute.htmlPath, 'utf8');

                            case 6:
                                entry = _context.sent;

                                this.cache.set(path, entry);

                            case 8:
                                return _context.abrupt('return', entry);

                            case 9:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function prerender(_x) {
                return _ref.apply(this, arguments);
            }

            return prerender;
        }()
    }, {
        key: 'createEntryForSkeleton',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(pagename, skeletonPath) {
                var skeletonsDir, entryPath;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                skeletonsDir = (0, _path.join)(this.targetDir, this.skeletonsDirname);
                                _context2.next = 3;
                                return (0, _fsExtra.emptyDir)(skeletonsDir);

                            case 3:
                                entryPath = (0, _path.join)(skeletonsDir, './' + pagename + '-entry-skeleton.js');
                                _context2.t0 = _fsExtra.writeFile;
                                _context2.t1 = entryPath;
                                _context2.t2 = _lodash2.default;
                                _context2.next = 9;
                                return (0, _fsExtra.readFile)(skeletonEntryTemplate, 'utf8');

                            case 9:
                                _context2.t3 = _context2.sent;
                                _context2.t4 = (0, _context2.t2)(_context2.t3);
                                _context2.t5 = {
                                    skeleton: {
                                        path: skeletonPath
                                    }
                                };
                                _context2.t6 = (0, _context2.t4)(_context2.t5);
                                _context2.next = 15;
                                return (0, _context2.t0)(_context2.t1, _context2.t6, 'utf8');

                            case 15:
                                return _context2.abrupt('return', entryPath);

                            case 16:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function createEntryForSkeleton(_x2, _x3) {
                return _ref2.apply(this, arguments);
            }

            return createEntryForSkeleton;
        }()
    }, {
        key: 'compileMultiEntries',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                var _this = this;

                var _config$webpack, shortcuts, base, assetsDir, ssr, mpaConfig, skeletonEntries, skeletonConfig;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _config$webpack = this.config.webpack, shortcuts = _config$webpack.shortcuts, base = _config$webpack.base;
                                assetsDir = shortcuts.assetsDir, ssr = shortcuts.ssr;
                                mpaConfig = (0, _webpackMerge2.default)(this.webpackConfig.client(this.config));
                                skeletonEntries = {};

                                mpaConfig.entry = {};
                                mpaConfig.context = this.config.globals.rootDir;

                                if (ssr) {
                                    mpaConfig.plugins.pop();
                                }

                                _context4.next = 9;
                                return _promise2.default.all(this.routes.map(function () {
                                    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(route) {
                                        var pagename, template, prerender, skeleton, htmlTemplatePath, htmlFilename, entryPath;
                                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                                            while (1) {
                                                switch (_context3.prev = _context3.next) {
                                                    case 0:
                                                        pagename = route.pagename, template = route.template, prerender = route.prerender, skeleton = route.skeleton;

                                                        if (!prerender) {
                                                            _context3.next = 12;
                                                            break;
                                                        }

                                                        htmlTemplatePath = template || (0, _path.join)(__dirname, './templates/index.template.html');
                                                        htmlFilename = pagename + '.html';

                                                        route.htmlPath = (0, _path.join)(base.output.path, htmlFilename);

                                                        mpaConfig.entry[pagename] = ['./core/entry-client.js'];

                                                        mpaConfig.plugins.push(new _htmlWebpackPlugin2.default({
                                                            filename: htmlFilename,
                                                            template: htmlTemplatePath,
                                                            inject: true,
                                                            minify: {
                                                                removeComments: true,
                                                                collapseWhitespace: true,
                                                                removeAttributeQuotes: true
                                                            },
                                                            favicon: (0, _path.join)(assetsDir, 'img/icons/favicon.ico'),
                                                            chunksSortMode: 'dependency'
                                                        }));

                                                        if (!skeleton) {
                                                            _context3.next = 12;
                                                            break;
                                                        }

                                                        _context3.next = 10;
                                                        return _this.createEntryForSkeleton(pagename, skeleton);

                                                    case 10:
                                                        entryPath = _context3.sent;

                                                        skeletonEntries[pagename] = [entryPath];

                                                    case 12:
                                                    case 'end':
                                                        return _context3.stop();
                                                }
                                            }
                                        }, _callee3, _this);
                                    }));

                                    return function (_x4) {
                                        return _ref4.apply(this, arguments);
                                    };
                                }()));

                            case 9:

                                if ((0, _keys2.default)(skeletonEntries).length) {
                                    skeletonConfig = (0, _webpackMerge2.default)(this.webpackConfig.server(this.config));

                                    if (ssr) {
                                        skeletonConfig.plugins.pop();
                                    }
                                    skeletonConfig.entry = skeletonEntries;

                                    mpaConfig.plugins.push(new _vueSkeletonWebpackPlugin2.default({
                                        webpackConfig: skeletonConfig
                                    }));
                                }

                                if (!(0, _keys2.default)(mpaConfig.entry).length) {
                                    _context4.next = 13;
                                    break;
                                }

                                _context4.next = 13;
                                return new _promise2.default(function (resolve, reject) {
                                    (0, _webpack2.default)(mpaConfig, function (err, stats) {
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

                                        console.log('[Lavas] prerender completed.');
                                        resolve();
                                    });
                                });

                            case 13:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function compileMultiEntries() {
                return _ref3.apply(this, arguments);
            }

            return compileMultiEntries;
        }()
    }, {
        key: 'autoCompileRoutes',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
                var routesConfig, routesFilePath, then;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                routesConfig = this.config.router && this.config.router.routes || [];


                                console.log('[Lavas] auto compile routes...');
                                _context5.next = 4;
                                return (0, _router.generateRoutes)((0, _path.join)(this.targetDir, '../pages'));

                            case 4:
                                this.routes = _context5.sent;


                                this.routes.forEach(function (route) {
                                    var routeConfig = routesConfig.find(function (r) {
                                        return r.name === route.name;
                                    });

                                    if (routeConfig) {
                                        var routePath = routeConfig.path,
                                            lazyLoading = routeConfig.lazyLoading,
                                            chunkname = routeConfig.chunkname;


                                        (0, _assign2.default)(route, routeConfig, {
                                            path: routePath || route.path,
                                            lazyLoading: lazyLoading || !!chunkname
                                        });
                                    }

                                    route.hash = (0, _crypto.createHash)('md5').update(route.name).digest('hex');

                                    route.pathRegExp = new RegExp('^' + route.path.replace(/\/:[^\/]*/g, '/[^\/]+') + '/?$');
                                });

                                routesFilePath = (0, _path.join)(this.targetDir, './routes.js');
                                _context5.next = 9;
                                return (0, _fsExtra.ensureFile)(routesFilePath);

                            case 9:
                                _context5.t0 = _fsExtra.writeFile;
                                _context5.t1 = routesFilePath;
                                _context5.t2 = _lodash2.default;
                                _context5.next = 14;
                                return (0, _fsExtra.readFile)(routesTemplate, 'utf8');

                            case 14:
                                _context5.t3 = _context5.sent;
                                _context5.t4 = (0, _context5.t2)(_context5.t3);
                                _context5.t5 = { routes: this.routes };
                                _context5.t6 = (0, _context5.t4)(_context5.t5);
                                _context5.next = 20;
                                return (0, _context5.t0)(_context5.t1, _context5.t6, 'utf8');

                            case 20:
                                then = Date.now() / 1000 - 10;
                                _context5.next = 23;
                                return (0, _fsExtra.utimes)(routesFilePath, then, then);

                            case 23:

                                console.log('[Lavas] all routes are already generated.');

                            case 24:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function autoCompileRoutes() {
                return _ref5.apply(this, arguments);
            }

            return autoCompileRoutes;
        }()
    }]);
    return RouteManager;
}();

exports.default = RouteManager;
module.exports = exports['default'];