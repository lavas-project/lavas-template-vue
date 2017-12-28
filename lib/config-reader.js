'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RUMTIME_ITEMS = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _lodash = require('lodash');

var _constants = require('./constants');

var _path2 = require('./utils/path');

var _json = require('./utils/json');

var JsonUtil = _interopRequireWildcard(_json);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mergeArray(a, b) {
    if ((0, _lodash.isArray)(a)) {
        return a.concat(b);
    }
}

var DEFAULT_CONFIG = {
    buildVersion: null,
    ssr: true,
    build: {
        publicPath: '/',
        filenames: {
            entry: 'js/[name].[chunkhash:8].js',
            vendor: 'js/vendor.[chunkhash:8].js',
            vue: 'js/vue.[chunkhash:8].js',
            chunk: 'js/[name].[chunkhash:8].js',
            css: 'css/[name].[contenthash:8].css',
            img: 'img/[name].[hash:8].[ext]',
            fonts: 'fonts/[name].[hash:8].[ext]'
        },
        babel: {
            presets: ['vue-app'],
            babelrc: false
        },
        cssExtract: false,
        cssMinimize: true,
        cssSourceMap: true,
        jsSourceMap: true,
        bundleAnalyzerReport: false,
        compress: false,
        defines: {
            base: {},
            client: {},
            server: {}
        },
        alias: {
            base: {},
            client: {},
            server: {}
        },
        plugins: {
            base: [],
            client: [],
            server: []
        },
        nodeExternalsWhitelist: [],
        watch: null,
        extend: null,
        ssrCopy: []
    },
    router: {},
    errorHandler: {
        errorPath: '/error'
    },
    middleware: {
        all: [],
        server: [],
        client: []
    },
    serviceWorker: null,
    production: {
        build: {
            cssExtract: true,
            compress: true
        }
    },
    development: {
        build: {
            filenames: {
                entry: 'js/[name].[hash:8].js'
            },
            babel: {
                cacheDirectory: true
            }
        }
    }
};

var RUMTIME_ITEMS = exports.RUMTIME_ITEMS = {
    ssr: true,
    buildVersion: true,
    build: {
        publicPath: true,
        compress: true
    },
    middleware: true,
    router: true,
    errorHandler: true,
    serviceWorker: {
        swDest: true
    }
};

var ConfigReader = function () {
    function ConfigReader(cwd, env) {
        (0, _classCallCheck3.default)(this, ConfigReader);

        this.cwd = cwd;
        this.env = env;
    }

    (0, _createClass3.default)(ConfigReader, [{
        key: 'read',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var _this = this;

                var config, singleConfigPath, configDir, files, temp;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                config = {};

                                (0, _lodash.merge)(config, DEFAULT_CONFIG, {
                                    globals: {
                                        rootDir: this.cwd
                                    },
                                    buildVersion: Date.now()
                                }, mergeArray);

                                if (config[this.env]) {
                                    (0, _lodash.merge)(config, config[this.env], mergeArray);
                                }

                                singleConfigPath = (0, _path.join)(this.cwd, _constants.LAVAS_CONFIG_FILE);
                                _context2.next = 6;
                                return (0, _fsExtra.pathExists)(singleConfigPath);

                            case 6:
                                if (!_context2.sent) {
                                    _context2.next = 18;
                                    break;
                                }

                                console.log('[Lavas] read lavas.config.js.');
                                delete require.cache[require.resolve(singleConfigPath)];
                                _context2.t0 = _lodash.merge;
                                _context2.t1 = config;
                                _context2.next = 13;
                                return _promise2.default.resolve().then(function () {
                                    return require('' + singleConfigPath);
                                });

                            case 13:
                                _context2.t2 = _context2.sent;
                                _context2.t3 = mergeArray;
                                (0, _context2.t0)(_context2.t1, _context2.t2, _context2.t3);
                                _context2.next = 24;
                                break;

                            case 18:
                                configDir = (0, _path.join)(this.cwd, 'config');
                                files = _glob2.default.sync('**/*.js', {
                                    cwd: configDir
                                });
                                _context2.next = 22;
                                return _promise2.default.all(files.map(function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(filepath) {
                                        var paths, name, cur, i, configPath, exportContent;
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
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

                                                        configPath = (0, _path.join)(configDir, filepath);

                                                        delete require.cache[require.resolve(configPath)];
                                                        _context.next = 10;
                                                        return _promise2.default.resolve().then(function () {
                                                            return require('' + configPath);
                                                        });

                                                    case 10:
                                                        exportContent = _context.sent;

                                                        cur[name] = (typeof exportContent === 'undefined' ? 'undefined' : (0, _typeof3.default)(exportContent)) === 'object' && exportContent !== null ? (0, _lodash.merge)(cur[name], exportContent, mergeArray) : exportContent;

                                                    case 12:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this);
                                    }));

                                    return function (_x) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }()));

                            case 22:
                                temp = config.env || {};

                                if (temp[this.env]) {
                                    (0, _lodash.merge)(config, temp[this.env], mergeArray);
                                }

                            case 24:
                                return _context2.abrupt('return', config);

                            case 25:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function read() {
                return _ref.apply(this, arguments);
            }

            return read;
        }()
    }, {
        key: 'readConfigFile',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.t0 = JsonUtil;
                                _context3.next = 3;
                                return (0, _fsExtra.readFile)((0, _path2.distLavasPath)(this.cwd, _constants.CONFIG_FILE), 'utf8');

                            case 3:
                                _context3.t1 = _context3.sent;
                                return _context3.abrupt('return', _context3.t0.parse.call(_context3.t0, _context3.t1));

                            case 5:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function readConfigFile() {
                return _ref3.apply(this, arguments);
            }

            return readConfigFile;
        }()
    }]);
    return ConfigReader;
}();

exports.default = ConfigReader;