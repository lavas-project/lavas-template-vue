'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function readFileWrapper(readFileFn, filePath) {
  return new _promise2.default(function (resolve, reject) {
    readFileFn(filePath, 'utf8', function (error, data) {
      if (error) {
        return reject(error);
      }
      resolve(data);
    });
  });
}

module.exports = readFileWrapper;