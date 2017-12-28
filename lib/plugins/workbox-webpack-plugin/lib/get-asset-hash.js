'use strict';

var crypto = require('crypto');

module.exports = function (asset) {
  return crypto.createHash('md5').update(asset.source(), 'utf8').digest('hex');
};