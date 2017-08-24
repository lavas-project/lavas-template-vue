/**
 * @file webpack server config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const config = require('./config');
const path = require('path');

const webpackBaseConfig = require('./webpack.base.conf');

module.exports = merge(webpackBaseConfig, {
    target: 'node',
    entry: './core/entry-server.js',
    output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        alias: {
            'iscroll/build/iscroll-lite$': path.resolve(config.globals.rootDir, 'core/fix-ssr.js')
        }
    },
    // https://webpack.js.org/configuration/externals/#externals
    // https://github.com/liady/webpack-node-externals
    externals: nodeExternals({
        // do not externalize CSS files in case we need to import it from a dep
        whitelist: [/\.(css|vue)$/, /iscroll/]
    }),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.VUE_ENV': '"server"',
            'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
        }),
        new VueSSRServerPlugin()
    ]
});
