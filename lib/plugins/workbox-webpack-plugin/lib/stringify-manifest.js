'use strict';

var stringify = require('json-stable-stringify');

var PRECACHE_MANIFEST_VAR = '__precacheManifest';

module.exports = function (manifestEntries) {
  var sortedEntries = manifestEntries.sort(function (a, b) {
    return a.url < b.url;
  });

  var entriesJson = stringify(sortedEntries, { space: 2 });
  return 'self.' + PRECACHE_MANIFEST_VAR + ' = ' + entriesJson + ';';
};