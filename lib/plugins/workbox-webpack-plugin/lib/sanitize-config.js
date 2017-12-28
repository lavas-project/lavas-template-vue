'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function forGetManifest(originalConfig) {
  var propertiesToRemove = ['chunks', 'excludeChunks', 'importScripts', 'importWorkboxFrom', 'swDest', 'swSrc'];

  return sanitizeConfig(originalConfig, propertiesToRemove);
}

function forGenerateSWString(originalConfig) {
  var propertiesToRemove = ['chunks', 'excludeChunks', 'importWorkboxFrom', 'swDest'];

  return sanitizeConfig(originalConfig, propertiesToRemove);
}

function sanitizeConfig(originalConfig, propertiesToRemove) {
  var config = (0, _assign2.default)({}, originalConfig);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(propertiesToRemove), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var property = _step.value;

      delete config[property];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return config;
}

module.exports = {
  forGetManifest: forGetManifest,
  forGenerateSWString: forGenerateSWString
};