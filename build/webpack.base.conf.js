/**
 * @file webpack base config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

const vueLoaderConfig = require('./vue-loader.conf');
const utils = require('./utils');
const config = require('./config');

const isProd = process.env.NODE_ENV === 'production';

const base = {
    output: {
        path: config.webpack.output.path,
        publicPath: config.webpack.output.publicPath
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': config.globals.srcDir,
            '~': config.globals.srcDir,
            '@@': config.globals.rootDir,
            '~~': config.globals.rootDir,
            '$': path.join(config.globals.rootDir, '.lavas')
        }
    },
    module: {
        rules: [{
                test: /\.vue$/,
                use: [{
                    loader: 'vue-loader',
                    options: vueLoaderConfig
                }]
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: config.babel
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    },
    plugins: []
};

if (isProd) {
    // add production plugins
    base.plugins = [
        ...base.plugins,
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: config.webpack.jsSourceMap
        }),
        new OptimizeCSSPlugin({
            cssProcessorOptions: {
                safe: true
            }
        })
    ];
}
else {
    base.plugins.push(new FriendlyErrorsPlugin());
}

if (config.webpack.cssExtract) {
    base.plugins.push(new ExtractTextPlugin({
        filename: utils.assetsPath('css/[name].[contenthash].css')
    }));
}

base.resolve.alias = Object.assign(base.resolve.alias, config.webpack.alias);

module.exports = base;
