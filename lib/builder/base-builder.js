'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash.template');

var _lodash2 = _interopRequireDefault(_lodash);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _htmlWebpackPlugin = require('html-webpack-plugin');

var _htmlWebpackPlugin2 = _interopRequireDefault(_htmlWebpackPlugin);

var _vueSkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin');

var _vueSkeletonWebpackPlugin2 = _interopRequireDefault(_vueSkeletonWebpackPlugin);

var _constants = require('../constants');

var _path2 = require('../utils/path');

var _json = require('../utils/json');

var JsonUtil = _interopRequireWildcard(_json);

var _template = require('../utils/template');

var _template2 = _interopRequireDefault(_template);

var _routeManager = require('../route-manager');

var _routeManager2 = _interopRequireDefault(_routeManager);

var _webpack = require('../webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _configReader = require('../config-reader');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseBuilder = function () {
    function BaseBuilder(core) {
        (0, _classCallCheck3.default)(this, BaseBuilder);

        this.core = core;
        this.env = core.env;
        this.cwd = core.cwd;
        this.renderer = core.renderer;
        this.webpackConfig = new _webpack2.default(core.config, this.env);
        this.routeManager = new _routeManager2.default(core.config, this.env);

        this.writeFile = null;

        this.init(core.config);
    }

    (0, _createClass3.default)(BaseBuilder, [{
        key: 'init',
        value: function init(config) {
            this.config = config;
            this.webpackConfig.config = config;
            this.routeManager.config = config;
            this.ssr = config.ssr;
        }
    }, {
        key: 'build',
        value: function build() {
            throw new Error('[Lavas] Builder.build() must be overrided.');
        }
    }, {
        key: 'close',
        value: function close() {}
    }, {
        key: 'templatesPath',
        value: function templatesPath() {
            var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';

            return (0, _path.join)(__dirname, '../templates', path);
        }
    }, {
        key: 'lavasPath',
        value: function lavasPath() {
            var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';

            return (0, _path.join)(this.config.globals.rootDir, './.lavas', path);
        }
    }, {
        key: 'writeFileToLavasDir',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(path, content) {
                var resolvedPath;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                resolvedPath = this.lavasPath(path);
                                _context.next = 3;
                                return this.writeFile(resolvedPath, content);

                            case 3:
                                return _context.abrupt('return', resolvedPath);

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function writeFileToLavasDir(_x3, _x4) {
                return _ref.apply(this, arguments);
            }

            return writeFileToLavasDir;
        }()
    }, {
        key: 'writeRuntimeConfig',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var filteredConfig;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                filteredConfig = JsonUtil.deepPick(this.config, _configReader.RUMTIME_ITEMS);
                                _context2.next = 3;
                                return this.writeFileToLavasDir('config.json', JsonUtil.stringify(filteredConfig, null, 4));

                            case 3:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function writeRuntimeConfig() {
                return _ref2.apply(this, arguments);
            }

            return writeRuntimeConfig;
        }()
    }, {
        key: 'writeSkeletonEntry',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(skeletonPath) {
                var skeletonEntryTemplate;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                skeletonEntryTemplate = this.templatesPath('entry-skeleton.tmpl');
                                _context3.t0 = this;
                                _context3.t1 = _lodash2.default;
                                _context3.next = 5;
                                return (0, _fsExtra.readFile)(skeletonEntryTemplate, 'utf8');

                            case 5:
                                _context3.t2 = _context3.sent;
                                _context3.t3 = (0, _context3.t1)(_context3.t2);
                                _context3.t4 = {
                                    skeleton: {
                                        path: skeletonPath
                                    }
                                };
                                _context3.t5 = (0, _context3.t3)(_context3.t4);
                                _context3.next = 11;
                                return _context3.t0.writeFileToLavasDir.call(_context3.t0, 'skeleton.js', _context3.t5);

                            case 11:
                                return _context3.abrupt('return', _context3.sent);

                            case 12:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function writeSkeletonEntry(_x5) {
                return _ref3.apply(this, arguments);
            }

            return writeSkeletonEntry;
        }()
    }, {
        key: 'addHtmlPlugin',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(mpaConfig, entryName, baseUrl, watcherEnabled) {
                var _this = this;

                var rootDir, htmlFilename, customTemplatePath, entryTemplatePath, resolvedTemplatePath;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                rootDir = this.config.globals.rootDir;
                                htmlFilename = entryName + '.html';
                                customTemplatePath = (0, _path.join)(rootDir, 'core/' + _constants.TEMPLATE_HTML);
                                _context5.next = 5;
                                return (0, _fsExtra.pathExists)(customTemplatePath);

                            case 5:
                                if (_context5.sent) {
                                    _context5.next = 7;
                                    break;
                                }

                                throw new Error(_constants.TEMPLATE_HTML + ' required for entry: ' + entryName);

                            case 7:
                                entryTemplatePath = (0, _path.join)(entryName, _constants.TEMPLATE_HTML);
                                _context5.t0 = this;
                                _context5.t1 = entryTemplatePath;
                                _context5.t2 = _template2.default;
                                _context5.next = 13;
                                return (0, _fsExtra.readFile)(customTemplatePath, 'utf8');

                            case 13:
                                _context5.t3 = _context5.sent;
                                _context5.t4 = baseUrl;
                                _context5.t5 = _context5.t2.client.call(_context5.t2, _context5.t3, _context5.t4);
                                _context5.next = 18;
                                return _context5.t0.writeFileToLavasDir.call(_context5.t0, _context5.t1, _context5.t5);

                            case 18:
                                resolvedTemplatePath = _context5.sent;

                                mpaConfig.plugins.unshift(new _htmlWebpackPlugin2.default({
                                    filename: htmlFilename,
                                    template: resolvedTemplatePath,
                                    inject: true,
                                    minify: {
                                        removeComments: true,
                                        collapseWhitespace: true,
                                        removeAttributeQuotes: true
                                    },
                                    favicon: (0, _path2.assetsPath)('img/icons/favicon.ico'),
                                    chunksSortMode: 'dependency',
                                    cache: false,
                                    chunks: ['manifest', 'vue', 'vendor', entryName],
                                    config: this.config }));

                                if (watcherEnabled) {
                                    this.addWatcher(customTemplatePath, 'change', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                                        return _regenerator2.default.wrap(function _callee4$(_context4) {
                                            while (1) {
                                                switch (_context4.prev = _context4.next) {
                                                    case 0:
                                                        _context4.t0 = _this;
                                                        _context4.t1 = entryTemplatePath;
                                                        _context4.t2 = _template2.default;
                                                        _context4.next = 5;
                                                        return (0, _fsExtra.readFile)(customTemplatePath, 'utf8');

                                                    case 5:
                                                        _context4.t3 = _context4.sent;
                                                        _context4.t4 = baseUrl;
                                                        _context4.t5 = _context4.t2.client.call(_context4.t2, _context4.t3, _context4.t4);
                                                        _context4.next = 10;
                                                        return _context4.t0.writeFileToLavasDir.call(_context4.t0, _context4.t1, _context4.t5);

                                                    case 10:
                                                    case 'end':
                                                        return _context4.stop();
                                                }
                                            }
                                        }, _callee4, _this);
                                    })));
                                }

                            case 21:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function addHtmlPlugin(_x6, _x7, _x8, _x9) {
                return _ref4.apply(this, arguments);
            }

            return addHtmlPlugin;
        }()
    }, {
        key: 'createMPAConfig',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(watcherEnabled) {
                var _config, globals, ssrEnabled, router, entryName, rootDir, mpaConfig, skeletonEntries, skeletonPath, skeletonImportPath, entryPath, skeletonConfig;

                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _config = this.config, globals = _config.globals, ssrEnabled = _config.ssr, router = _config.router;
                                entryName = _constants.DEFAULT_ENTRY_NAME;
                                rootDir = globals.rootDir;
                                mpaConfig = this.webpackConfig.client();
                                skeletonEntries = {};

                                mpaConfig.entry = {};
                                mpaConfig.name = 'mpaclient';
                                mpaConfig.context = rootDir;

                                if (ssrEnabled) {
                                    _context6.next = 21;
                                    break;
                                }

                                mpaConfig.entry[entryName] = ['./core/entry-client.js'];

                                _context6.next = 12;
                                return this.addHtmlPlugin(mpaConfig, entryName, router.baseUrl, watcherEnabled);

                            case 12:
                                skeletonPath = (0, _path.join)(rootDir, 'core/Skeleton.vue');
                                skeletonImportPath = '@/core/Skeleton.vue';
                                _context6.next = 16;
                                return (0, _fsExtra.pathExists)(skeletonPath);

                            case 16:
                                if (!_context6.sent) {
                                    _context6.next = 21;
                                    break;
                                }

                                _context6.next = 19;
                                return this.writeSkeletonEntry(skeletonImportPath);

                            case 19:
                                entryPath = _context6.sent;

                                skeletonEntries[entryName] = [entryPath];

                            case 21:

                                if ((0, _keys2.default)(skeletonEntries).length) {
                                    skeletonConfig = this.webpackConfig.server({ cssExtract: true });

                                    skeletonConfig.plugins.pop();
                                    skeletonConfig.entry = skeletonEntries;

                                    mpaConfig.plugins.push(new _vueSkeletonWebpackPlugin2.default({
                                        webpackConfig: skeletonConfig
                                    }));
                                }

                                return _context6.abrupt('return', mpaConfig);

                            case 23:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function createMPAConfig(_x10) {
                return _ref6.apply(this, arguments);
            }

            return createMPAConfig;
        }()
    }]);
    return BaseBuilder;
}();

exports.default = BaseBuilder;
module.exports = exports['default'];