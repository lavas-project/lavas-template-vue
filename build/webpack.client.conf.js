/**
 * @file webpack client config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const utils = require('./utils');
const config = require('./config');
const webpackBaseConfig = require('./webpack.base.conf');

const isProd = process.env.NODE_ENV === 'production';

const client = merge(webpackBaseConfig, {
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
    plugins: [
        // http://vuejs.github.io/vue-loader/en/workflow/production.html
        new webpack.DefinePlugin({
            'process.env.VUE_ENV': '"client"',
            'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
        }),

        // split vendor js into its own file
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks(module, count) {
                // any required modules inside node_modules are extracted to vendor
                return module.resource
                    && /\.js$/.test(module.resource)
                    && module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0;
            }
        }),

        // split vue, vue-router, vue-meta and vuex into vue chunk
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vue',
            minChunks(module, count) {
                let context = module.context;
                let targets = ['vue', 'vue-router', 'vuex', 'vue-meta'];
                return context
                    && context.indexOf('node_modules') >= 0
                    && targets.find(t => new RegExp('/' + t + '/', 'i').test(context));
            }
        }),

        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['vue']
        }),

        // copy custom static assets
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, '../static'),
            to: config.webpack.output.assetsDir,
            ignore: ['.*']
        }])
    ]
});

// if ssr enabled, add VueSSRClientPlugin
if (config.ssr.enable) {
    client.plugins.push(new VueSSRClientPlugin());
}

// webpack bundle analyzer plugin
if (config.webpack.bundleAnalyzerReport) {
    client.plugins.push(new BundleAnalyzerPlugin(Object.assign({}, config.webpack.bundleAnalyzerReport)));
}

// run extend function
if (typeof config.webpack.extend === 'function') {
    let extendedConfig = config.webpack.extend.call(null, client, {
        isProd,
        isClient: true
    });

    if (extendedConfig) {
        client = extendedConfig;
    }
}

console.log(client);
module.exports = client;
