"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (publicPath) {

  return function (req, res, next) {
    req.url = req.url.substring(publicPath.length);
    next();
  };
};

module.exports = exports["default"];