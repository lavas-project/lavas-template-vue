'use strict';

module.exports = function () {
  for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
    paths[_key] = arguments[_key];
  }

  return paths.join('');
};