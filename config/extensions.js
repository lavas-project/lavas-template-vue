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
        init: function (webpackConfig) {
            try {
                let {client, server} = webpackConfig;

                // 修改base，添加stylus global import
                [client, server].forEach(function (config) {
                    let vueLoaders = config.module.rules[0].use[0].options.loaders;

                    let variablesFilePath = '~@/extensions/appShell/styles/variables.styl';
                    vueLoaders.stylus[2].options.import = variablesFilePath;
                    vueLoaders.styl[2].options.import = variablesFilePath;
                });

                // 修改server，为iscroll的服务端增加备用
                if (!server.resolve) {
                    server.resolve = {
                        alias: {}
                    }
                }
                else if (!server.resolve.alias) {
                    server.resolve.alias = {};
                }

                server.resolve.alias['iscroll/build/iscroll-lite$']
                    = path.resolve(globalConfig.rootDir, 'core/fix-ssr.js');
                server.externals = nodeExternals({
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
