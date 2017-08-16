/**
 * @file 开发环境 webpack 配置文件
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const utils = require('./utils');
const config = require('./config');
const merge = require('webpack-merge');
const clientWebpackConfig = require('./webpack.client.conf');

// const SkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin');
const MultipageWebpackPlugin = require('multipage-webpack-plugin');

module.exports = merge(clientWebpackConfig, {
    // module: {
    //     rules: utils.styleLoaders({sourceMap: config.dev.cssSourceMap})
    //         .concat(SkeletonWebpackPlugin.loader({
    //             resource: resolve('src/router.js'),
    //             options: {
    //                 entry: Object.keys(utils.getEntries('./src/pages')),
    //                 importTemplate: 'import [nameCap] from \'@/pages/[name]/[nameCap].skeleton.vue\';'
    //             }
    //         }))
    // },
    plugins: [

        // new SkeletonWebpackPlugin({
        //     webpackConfig: require('./webpack.skeleton.conf')
        // }),

        new MultipageWebpackPlugin({
            bootstrapFilename: 'manifest',
            templateFilename: 'index.html',
            templatePath: '[name]',
            htmlTemplatePath: path.join(config.globals.rootDir, './core/index.template.html'),
            htmlWebpackPluginOptions: {
                inject: true,
                favicon: utils.assetsPath('img/icons/favicon.ico')
            }
        })
    ]
});
