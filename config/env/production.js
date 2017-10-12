/**
 * @file development config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    build: {
        cssExtract: true,
        ssrCopy: [
            {
                path: 'lib'
            },
            {
                path: 'server.prod.js'
            },
            {
                path: 'node_modules'
            },
            {
                path: 'package.json'
            }
        ]
    }

};
