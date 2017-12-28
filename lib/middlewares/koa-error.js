'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = function (errPath) {
    var _this = this;

    return function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
            var errorMsg;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!ctx.req.lavasIgnoreFlag) {
                                _context.next = 4;
                                break;
                            }

                            _context.next = 3;
                            return next();

                        case 3:
                            return _context.abrupt('return', _context.sent);

                        case 4:
                            _context.prev = 4;
                            _context.next = 7;
                            return next();

                        case 7:
                            _context.next = 22;
                            break;

                        case 9:
                            _context.prev = 9;
                            _context.t0 = _context['catch'](4);
                            errorMsg = 'Internal Server Error';

                            if (_context.t0.status !== 404) {
                                console.log('[Lavas] error middleware catch error:');
                                console.log(_context.t0);
                            } else {
                                errorMsg = ctx.req.url + ' not found';
                                console.log(errorMsg);
                            }

                            if (!(ctx.headerSent || !ctx.writable)) {
                                _context.next = 16;
                                break;
                            }

                            _context.t0.headerSent = true;
                            return _context.abrupt('return');

                        case 16:
                            if (!(errPath === ctx.path)) {
                                _context.next = 19;
                                break;
                            }

                            ctx.res.end();
                            return _context.abrupt('return');

                        case 19:
                            ctx.res._headers = {};

                            ctx.redirect(errPath + '?error=' + encodeURIComponent(errorMsg));

                            ctx.res.end();

                        case 22:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[4, 9]]);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();
};

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];