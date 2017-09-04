

'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var utils = require('./utils');
var config = require('./config');
var webpackBaseConfig = require('./webpack.base.conf');

var isProd = process.env.NODE_ENV === 'production';

var client = merge(webpackBaseConfig, {
    entry: {
        app: ['./core/entry-client.js']
    },
    output: {
        path: config.webpack.output.path,
        filename: utils.assetsPath(config.webpack.output.filename),
        chunkFilename: utils.assetsPath('js/[name].[chunkhash:8].js')
    },
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.webpack.cssSourceMap,
            extract: true
        })
    },
    devtool: config.webpack.jsSourceMap ? '#source-map' : false,
    plugins: [new webpack.DefinePlugin({
        'process.env.VUE_ENV': '"client"',
        'process.env.NODE_ENV': '"' + process.env.NODE_ENV + '"'
    }), new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function minChunks(module, count) {
            return module.resource && /\.js$/.test(module.resource) && module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0;
        }
    }), new webpack.optimize.CommonsChunkPlugin({
        name: 'vue',
        minChunks: function minChunks(module, count) {
            var context = module.context;
            var targets = ['vue', 'vue-router', 'vuex', 'vue-meta'];
            return context && context.indexOf('node_modules') >= 0 && targets.find(function (t) {
                return new RegExp('/' + t + '/', 'i').test(context);
            });
        }
    }), new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vue']
    }), new CopyWebpackPlugin([{
        from: path.resolve(__dirname, '../static'),
        to: config.webpack.output.assetsDir,
        ignore: ['.*']
    }])]
});

if (config.ssr.enable) {
    client.plugins.push(new VueSSRClientPlugin());
}

if (config.webpack.bundleAnalyzerReport) {
    client.plugins.push(new BundleAnalyzerPlugin((0, _assign2.default)({}, config.webpack.bundleAnalyzerReport)));
}

if (typeof config.webpack.extend === 'function') {
    var extendedConfig = config.webpack.extend.call(null, client, {
        isProd: isProd,
        isClient: true
    });

    if (extendedConfig) {
        client = extendedConfig;
    }
}

console.log(client);
module.exports = client;