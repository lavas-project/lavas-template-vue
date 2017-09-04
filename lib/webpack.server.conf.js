'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var webpack = require('webpack');
var merge = require('webpack-merge');
var nodeExternals = require('webpack-node-externals');
var VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

var webpackBaseConfig = require('./webpack.base.conf');
var config = require('./config');

var server = merge(webpackBaseConfig, {
    target: 'node',
    entry: './core/entry-server.js',
    output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {},

    externals: nodeExternals({
        whitelist: [/\.(css|vue)$/].concat((0, _toConsumableArray3.default)(config.webpack.nodeExternalsWhilelist))
    }),
    plugins: [new webpack.DefinePlugin({
        'process.env.VUE_ENV': '"server"',
        'process.env.NODE_ENV': '"' + process.env.NODE_ENV + '"'
    }), new VueSSRServerPlugin()]
});

if (typeof config.webpack.extend === 'function') {
    var extendedConfig = config.webpack.extend.call(null, server, {
        isProd: isProd,
        isClient: false
    });

    if (extendedConfig) {
        server = extendedConfig;
    }
}

module.exports = server;