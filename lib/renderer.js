'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _fsExtra = require('fs-extra');

var _vueServerRenderer = require('vue-server-renderer');

var _ssrClientPlugin = require('./plugins/ssr-client-plugin');

var _ssrClientPlugin2 = _interopRequireDefault(_ssrClientPlugin);

var _path2 = require('./utils/path');

var _webpack = require('./utils/webpack');

var _template = require('./utils/template');

var _template2 = _interopRequireDefault(_template);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Renderer = function () {
    function Renderer(core) {
        var _this = this;

        (0, _classCallCheck3.default)(this, Renderer);

        this.isProd = core.isProd;
        this.config = core.config;
        this.rootDir = this.config.globals && this.config.globals.rootDir;
        this.cwd = core.cwd;
        this.renderer = {};
        this.serverBundle = null;
        this.clientManifest = null;
        this.templates = null;
        this.resolve = null;
        this.readyPromise = new _promise2.default(function (r) {
            return _this.resolve = r;
        });
    }

    (0, _createClass3.default)(Renderer, [{
        key: 'getTemplatePath',
        value: function getTemplatePath() {
            return (0, _path.join)(this.rootDir, 'core/' + this.getTemplateName());
        }
    }, {
        key: 'getTemplateName',
        value: function getTemplateName() {
            return this.config.router.templateFile || _constants.TEMPLATE_HTML;
        }
    }, {
        key: 'getTemplate',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var base = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';
                var templatePath;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                templatePath = this.getTemplatePath();
                                _context.next = 3;
                                return (0, _fsExtra.pathExists)(templatePath);

                            case 3:
                                if (_context.sent) {
                                    _context.next = 5;
                                    break;
                                }

                                throw new Error(templatePath + ' required');

                            case 5:
                                _context.t0 = _template2.default;
                                _context.next = 8;
                                return (0, _fsExtra.readFile)(templatePath, 'utf8');

                            case 8:
                                _context.t1 = _context.sent;
                                _context.t2 = base;
                                return _context.abrupt('return', _context.t0.server.call(_context.t0, _context.t1, _context.t2));

                            case 11:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function getTemplate() {
                return _ref.apply(this, arguments);
            }

            return getTemplate;
        }()
    }, {
        key: 'addSSRClientPlugin',
        value: function addSSRClientPlugin() {
            this.clientConfig.plugins.push(new _ssrClientPlugin2.default({
                filename: (0, _path.join)(_constants.LAVAS_DIRNAME_IN_DIST, _constants.CLIENT_MANIFEST)
            }));
        }
    }, {
        key: 'createWithBundle',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var templatePath, manifestPath;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return (0, _fsExtra.readJson)((0, _path2.distLavasPath)(this.cwd, _constants.SERVER_BUNDLE));

                            case 2:
                                this.serverBundle = _context2.sent;
                                templatePath = (0, _path2.distLavasPath)(this.cwd, this.getTemplateName());
                                manifestPath = (0, _path2.distLavasPath)(this.cwd, _constants.CLIENT_MANIFEST);

                                if (!this.config.ssr) {
                                    _context2.next = 12;
                                    break;
                                }

                                _context2.next = 8;
                                return (0, _fsExtra.readFile)(templatePath, 'utf-8');

                            case 8:
                                this.templates = _context2.sent;
                                _context2.next = 11;
                                return (0, _fsExtra.readJson)(manifestPath);

                            case 11:
                                this.clientManifest = _context2.sent;

                            case 12:
                                _context2.next = 14;
                                return this.createRenderer();

                            case 14:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function createWithBundle() {
                return _ref2.apply(this, arguments);
            }

            return createWithBundle;
        }()
    }, {
        key: 'buildProd',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                var templateContent, distTemplatePath;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                this.addSSRClientPlugin();

                                _context3.next = 3;
                                return (0, _webpack.webpackCompile)([this.clientConfig, this.serverConfig]);

                            case 3:
                                if (!this.config.ssr) {
                                    _context3.next = 10;
                                    break;
                                }

                                _context3.next = 6;
                                return this.getTemplate(this.config.router.base);

                            case 6:
                                templateContent = _context3.sent;
                                distTemplatePath = (0, _path2.distLavasPath)(this.config.build.path, this.getTemplateName());
                                _context3.next = 10;
                                return (0, _fsExtra.outputFile)(distTemplatePath, templateContent);

                            case 10:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function buildProd() {
                return _ref3.apply(this, arguments);
            }

            return buildProd;
        }()
    }, {
        key: 'buildDev',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
                var _this2 = this;

                var lavasDir, templatePath;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                lavasDir = (0, _path.join)(this.rootDir, './.lavas');
                                templatePath = this.getTemplatePath();

                                this.addWatcher(templatePath, 'change', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                                    return _regenerator2.default.wrap(function _callee4$(_context4) {
                                        while (1) {
                                            switch (_context4.prev = _context4.next) {
                                                case 0:
                                                    _context4.next = 2;
                                                    return _this2.refreshFiles(true);

                                                case 2:
                                                case 'end':
                                                    return _context4.stop();
                                            }
                                        }
                                    }, _callee4, _this2);
                                })));

                                _context5.next = 5;
                                return (0, _webpack.enableHotReload)(lavasDir, this.clientConfig, true);

                            case 5:
                                this.addSSRClientPlugin();

                            case 6:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function buildDev() {
                return _ref4.apply(this, arguments);
            }

            return buildDev;
        }()
    }, {
        key: 'refreshFiles',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
                var changed, templateChanged, clientManifestPath, clientManifestContent, serverBundlePath, serverBundleContent, templateContent;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                console.log('[Lavas] refresh ssr bundle & manifest.');

                                changed = false;
                                templateChanged = false;
                                clientManifestPath = (0, _path2.distLavasPath)(this.clientConfig.output.path, _constants.CLIENT_MANIFEST);

                                if (this.clientMFS.existsSync(clientManifestPath)) {
                                    clientManifestContent = this.clientMFS.readFileSync(clientManifestPath, 'utf-8');

                                    if (this.clientManifest && (0, _stringify2.default)(this.clientManifest) !== clientManifestContent) {
                                        changed = true;
                                    }
                                    this.clientManifest = JSON.parse(clientManifestContent);
                                }

                                serverBundlePath = (0, _path2.distLavasPath)(this.serverConfig.output.path, _constants.SERVER_BUNDLE);

                                if (this.serverMFS.existsSync(serverBundlePath)) {
                                    serverBundleContent = this.serverMFS.readFileSync(serverBundlePath, 'utf8');

                                    if (this.serverBundle && (0, _stringify2.default)(this.serverBundle) !== serverBundleContent) {
                                        changed = true;
                                    }
                                    this.serverBundle = JSON.parse(serverBundleContent);
                                }

                                _context6.next = 9;
                                return this.getTemplate(this.config.router.base);

                            case 9:
                                templateContent = _context6.sent;

                                if (this.templates !== templateContent) {
                                    changed = true;
                                    templateChanged = true;
                                }
                                this.templates = templateContent;

                                if (!changed) {
                                    _context6.next = 16;
                                    break;
                                }

                                _context6.next = 15;
                                return this.createRenderer();

                            case 15:
                                if (templateChanged) {
                                    this.reloadClient();
                                }

                            case 16:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function refreshFiles() {
                return _ref6.apply(this, arguments);
            }

            return refreshFiles;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(clientConfig, serverConfig) {
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                this.clientConfig = clientConfig;
                                this.serverConfig = serverConfig;

                                this.setWebpackEntries();

                                if (!this.isProd) {
                                    _context7.next = 8;
                                    break;
                                }

                                _context7.next = 6;
                                return this.buildProd();

                            case 6:
                                _context7.next = 10;
                                break;

                            case 8:
                                _context7.next = 10;
                                return this.buildDev();

                            case 10:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function build(_x2, _x3) {
                return _ref7.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'setWebpackEntries',
        value: function setWebpackEntries() {
            this.clientConfig.context = this.rootDir;
            this.clientConfig.name = 'ssrclient';
            this.clientConfig.entry = './core/entry-client.js';

            this.serverConfig.context = this.rootDir;
            this.serverConfig.entry = './core/entry-server.js';
        }
    }, {
        key: 'createRenderer',
        value: function () {
            var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
                var isFirstTime;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                if (this.serverBundle && this.clientManifest) {
                                    isFirstTime = !this.renderer;

                                    this.renderer = (0, _vueServerRenderer.createBundleRenderer)(this.serverBundle, {
                                        template: this.templates,
                                        clientManifest: this.clientManifest,
                                        shouldPrefetch: function shouldPrefetch(file, type) {
                                            if (type === 'script') {
                                                return !/(workbox-v\d+\.\d+\.\d+.*)|(sw-register\.js)|(precache-manifest\.)/.test(file);
                                            }
                                            return true;
                                        },
                                        runInNewContext: false,
                                        inject: false
                                    });

                                    if (isFirstTime) {
                                        this.resolve(this.renderer);
                                    }
                                }

                            case 1:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function createRenderer() {
                return _ref8.apply(this, arguments);
            }

            return createRenderer;
        }()
    }, {
        key: 'getRenderer',
        value: function getRenderer() {
            if (this.renderer) {
                return _promise2.default.resolve(this.renderer);
            }

            return this.readyPromise;
        }
    }]);
    return Renderer;
}();

exports.default = Renderer;
module.exports = exports['default'];