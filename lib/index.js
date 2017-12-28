'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

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

var _renderer = require('./renderer');

var _renderer2 = _interopRequireDefault(_renderer);

var _configReader = require('./config-reader');

var _configReader2 = _interopRequireDefault(_configReader);

var _prodBuilder = require('./builder/prod-builder');

var _prodBuilder2 = _interopRequireDefault(_prodBuilder);

var _devBuilder = require('./builder/dev-builder');

var _devBuilder2 = _interopRequireDefault(_devBuilder);

var _middlewareComposer = require('./middleware-composer');

var _middlewareComposer2 = _interopRequireDefault(_middlewareComposer);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LavasCore = function (_EventEmitter) {
    (0, _inherits3.default)(LavasCore, _EventEmitter);

    function LavasCore() {
        var cwd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();
        (0, _classCallCheck3.default)(this, LavasCore);

        var _this = (0, _possibleConstructorReturn3.default)(this, (LavasCore.__proto__ || (0, _getPrototypeOf2.default)(LavasCore)).call(this));

        _this.cwd = cwd;
        return _this;
    }

    (0, _createClass3.default)(LavasCore, [{
        key: 'init',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(env, isInBuild) {
                var _this2 = this;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                this.env = env;
                                this.isProd = this.env === 'production';
                                this.configReader = new _configReader2.default(this.cwd, this.env);

                                if (!isInBuild) {
                                    _context2.next = 9;
                                    break;
                                }

                                _context2.next = 6;
                                return this.configReader.read();

                            case 6:
                                this.config = _context2.sent;
                                _context2.next = 12;
                                break;

                            case 9:
                                _context2.next = 11;
                                return this.configReader.readConfigFile();

                            case 11:
                                this.config = _context2.sent;

                            case 12:

                                this.middlewareComposer = new _middlewareComposer2.default(this);
                                this.renderer = new _renderer2.default(this);
                                this.builder = this.isProd ? new _prodBuilder2.default(this) : new _devBuilder2.default(this);

                                this.koaMiddleware = this.middlewareComposer.koa.bind(this.middlewareComposer);
                                this.expressMiddleware = this.middlewareComposer.express.bind(this.middlewareComposer);

                                if (!this.isProd) {
                                    this.on('start-rebuild', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                                        var newConfig;
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        _context.next = 2;
                                                        return _this2.configReader.read();

                                                    case 2:
                                                        newConfig = _context.sent;

                                                        _this2.builder.init(newConfig);

                                                        _this2.middlewareComposer.clean();

                                                        _this2.emit('rebuild');

                                                    case 6:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this2);
                                    })));
                                }

                            case 18:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function init(_x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return init;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                var spinner;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                spinner = (0, _ora2.default)();

                                spinner.start();

                                if (!this.isProd) {
                                    this.middlewareComposer.setup();
                                }
                                _context3.next = 5;
                                return this.builder.build();

                            case 5:

                                spinner.succeed('[Lavas] ' + this.env + ' build completed.');

                            case 6:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function build() {
                return _ref3.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'runAfterBuild',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                this.middlewareComposer.setup();
                                this.renderer = new _renderer2.default(this);
                                _context4.next = 4;
                                return this.renderer.createWithBundle();

                            case 4:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function runAfterBuild() {
                return _ref4.apply(this, arguments);
            }

            return runAfterBuild;
        }()
    }, {
        key: 'close',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.builder.close();

                            case 2:
                                console.log('[Lavas] lavas closed.');

                            case 3:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function close() {
                return _ref5.apply(this, arguments);
            }

            return close;
        }()
    }, {
        key: 'ignore',
        value: function ignore(req) {
            req.lavasIgnoreFlag = true;
        }
    }]);
    return LavasCore;
}(_events2.default);

exports.default = LavasCore;
module.exports = exports['default'];