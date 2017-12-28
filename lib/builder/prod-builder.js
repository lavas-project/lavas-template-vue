'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _constants = require('../constants');

var _webpack = require('../utils/webpack');

var _path2 = require('../utils/path');

var _baseBuilder = require('./base-builder');

var _baseBuilder2 = _interopRequireDefault(_baseBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ProdBuilder = function (_BaseBuilder) {
    (0, _inherits3.default)(ProdBuilder, _BaseBuilder);

    function ProdBuilder(core) {
        (0, _classCallCheck3.default)(this, ProdBuilder);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ProdBuilder.__proto__ || (0, _getPrototypeOf2.default)(ProdBuilder)).call(this, core));

        _this.writeFile = _fsExtra.outputFile;
        return _this;
    }

    (0, _createClass3.default)(ProdBuilder, [{
        key: 'build',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var _this2 = this;

                var _config, build, globals, clientConfig, serverConfig;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _config = this.config, build = _config.build, globals = _config.globals;
                                _context2.next = 3;
                                return (0, _fsExtra.emptyDir)(build.path);

                            case 3:
                                _context2.next = 5;
                                return this.routeManager.buildRoutes();

                            case 5:
                                _context2.next = 7;
                                return this.writeRuntimeConfig();

                            case 7:
                                if (!this.ssr) {
                                    _context2.next = 19;
                                    break;
                                }

                                console.log('[Lavas] SSR build starting...');
                                clientConfig = this.webpackConfig.client();
                                serverConfig = this.webpackConfig.server();
                                _context2.next = 13;
                                return this.renderer.build(clientConfig, serverConfig);

                            case 13:
                                _context2.next = 15;
                                return (0, _fsExtra.copy)(this.lavasPath(_constants.CONFIG_FILE), (0, _path2.distLavasPath)(build.path, _constants.CONFIG_FILE));

                            case 15:
                                if (!build.ssrCopy) {
                                    _context2.next = 18;
                                    break;
                                }

                                _context2.next = 18;
                                return _promise2.default.all(build.ssrCopy.map(function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref3) {
                                        var src = _ref3.src,
                                            _ref3$dest = _ref3.dest,
                                            dest = _ref3$dest === undefined ? src : _ref3$dest,
                                            _ref3$options = _ref3.options,
                                            options = _ref3$options === undefined ? {} : _ref3$options;
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        _context.next = 2;
                                                        return (0, _fsExtra.copy)((0, _path.join)(globals.rootDir, src), (0, _path.join)(build.path, dest), options);

                                                    case 2:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this2);
                                    }));

                                    return function (_x) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }()));

                            case 18:
                                console.log('[Lavas] SSR build completed.');

                            case 19:
                                if (this.ssr) {
                                    _context2.next = 28;
                                    break;
                                }

                                console.log('[Lavas] SPA build starting...');
                                _context2.t0 = _webpack.webpackCompile;
                                _context2.next = 24;
                                return this.createMPAConfig();

                            case 24:
                                _context2.t1 = _context2.sent;
                                _context2.next = 27;
                                return (0, _context2.t0)(_context2.t1);

                            case 27:
                                console.log('[Lavas] SPA build completed.');

                            case 28:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function build() {
                return _ref.apply(this, arguments);
            }

            return build;
        }()
    }]);
    return ProdBuilder;
}(_baseBuilder2.default);

exports.default = ProdBuilder;
module.exports = exports['default'];