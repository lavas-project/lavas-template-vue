'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.WORKBOX_PATH = undefined;
exports.getWorkboxFiles = getWorkboxFiles;

var _path = require('path');

var WORKBOX_PATH = exports.WORKBOX_PATH = require.resolve('workbox-sw');

function getWorkboxFiles(isProd) {
    var filename = isProd ? (0, _path.basename)(WORKBOX_PATH) : (0, _path.basename)(WORKBOX_PATH).replace('prod', 'dev');
    return [filename, filename + '.map'];
}