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
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(err, req, res, next) {
            var errorMsg, target;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!req.lavasIgnoreFlag) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt('return', next());

                        case 2:
                            errorMsg = 'Internal Server Error';

                            if (err.status !== 404) {
                                console.log('[Lavas] error middleware catch error:');
                                console.log(err);
                            } else {
                                errorMsg = req.url + ' not found';
                                console.log(errorMsg);
                            }

                            if (!(errPath === req.url)) {
                                _context.next = 7;
                                break;
                            }

                            res.end();
                            return _context.abrupt('return');

                        case 7:
                            target = errPath + '?error=' + encodeURIComponent(errorMsg);

                            if (errPath) {
                                res.writeHead(302, { Location: target });
                            }

                            res.end();

                        case 10:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function (_x, _x2, _x3, _x4) {
            return _ref.apply(this, arguments);
        };
    }();
};

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];