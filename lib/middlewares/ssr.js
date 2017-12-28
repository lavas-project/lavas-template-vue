'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = function (core) {
    var cwd = core.cwd,
        config = core.config,
        renderer = core.renderer,
        builder = core.builder,
        isProd = core.isProd;

    return function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res, next) {
            var url, matchedRenderer, errorHandler, ctx;
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
                            url = req.url;


                            console.log('[Lavas] route middleware: ssr ' + url);
                            _context.next = 6;
                            return renderer.getRenderer();

                        case 6:
                            matchedRenderer = _context.sent;

                            errorHandler = function errorHandler(err) {
                                return next(err);
                            };

                            ctx = {
                                title: 'Lavas',
                                url: url,
                                config: config,
                                req: req,
                                res: res,
                                error: errorHandler
                            };

                            matchedRenderer.renderToString(ctx, function (err, html) {
                                if (err) {
                                    return next(err);
                                }
                                res.end(html);
                            });

                        case 10:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function (_x, _x2, _x3) {
            return _ref.apply(this, arguments);
        };
    }();
};

var _fsExtra = require('fs-extra');

var _path = require('path');

var _router = require('../utils/router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];