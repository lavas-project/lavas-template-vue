/**
 * @file base conf
 * @author panyuqi (pyqiverson@gmail.com)
 */

'use strict';

const path = require('path');
const nodeExternals = require('webpack-node-externals');

function resolve(dir) {
    return path.join(__dirname, dir);
}

module.exports = {
    entry: {
        app: resolve('./server.js')
    },
    target: 'node',
    externals: [
        nodeExternals()
    ],
    output: {
        path: resolve('dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /^server\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.(tpl|html)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {}
                    }
                ]
            }
        ]
    }
};
