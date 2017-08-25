/**
 * @file extensions config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

var path = require('path');
var nodeExternals = require('webpack-node-externals');
var globalConfig = require('./globals');

module.exports = [
    {
        name: 'appShell',
        init: function (webpack) {
            try {
                // 修改base，添加stylus global import
                var vueLoaders = webpack.base.module.rules[0].use[0].options.loaders
                vueLoaders.stylus[2].options.import = '~extensions/appShell/stylus/variables.styl';
                vueLoaders.styl[2].options.import = '~extensions/appShell/stylus/variables.styl';

                // 修改server，为iscroll的服务端增加备用
                if (!webpack.server.resolve) {
                    webpack.server.resolve = {
                        alias: {}
                    }
                }
                else if (!webpack.server.resolve.alias) {
                    webpack.server.resolve.alias = {};
                }

                webpack.server.resolve.alias['iscroll/build/iscroll-lite$']
                    = path.resolve(globalConfig.rootDir, 'core/fix-ssr.js');
                webpack.server.externals = nodeExternals({
                    whitelist: [/\.(css|vue)$/, /iscroll/]
                });
            }
            catch (e) {
                console.log('load extensions config failed');
                console.log(e);
            }
        }
    }
];
