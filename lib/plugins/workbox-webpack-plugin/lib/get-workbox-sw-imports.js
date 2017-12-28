'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('workbox-build'),
    getModuleUrl = _require.getModuleUrl;

function getWorkboxSWImport(compilation, config) {
  switch (config.importWorkboxFrom) {
    case 'cdn':
      {
        return [getModuleUrl('workbox-sw')];
      }

    case 'local':
      {
        throw Error('importWorkboxFrom \'local\' is not yet supported.');
      }

    case 'disabled':
      {
        return null;
      }

    default:
      {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)(compilation.chunks), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var chunk = _step.value;

            if (chunk.name === config.importWorkboxFrom) {
              config.excludeChunks.push(chunk.name);
              return chunk.files;
            }
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

        throw Error('importWorkboxFrom was set to ' + ('\'' + config.importWorkboxFrom + '\', which is not an existing chunk name.'));
      }
  }
}

module.exports = getWorkboxSWImport;