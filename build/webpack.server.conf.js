/**
 * @file webpack server config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const webpackBaseConfig = require('./webpack.base.conf');

const server = merge(webpackBaseConfig, {
    target: 'node',
    entry: './core/entry-server.js',
    output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {},
    // https://webpack.js.org/configuration/externals/#externals
    // https://github.com/liady/webpack-node-externals
    externals: nodeExternals({
        // do not externalize CSS files in case we need to import it from a dep
        whitelist: [/\.(css|vue)$/]
    }),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.VUE_ENV': '"server"',
            'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
        }),
        new VueSSRServerPlugin()
    ]
});

// run extend function
if (typeof config.webpack.extend === 'function') {
    let extendedConfig = config.webpack.extend.call(null, server, {
        isProd,
        isClient: false
    });

    if (extendedConfig) {
        server = extendedConfig;
    }
}

module.exports = server;
