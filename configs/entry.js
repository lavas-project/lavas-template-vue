/**
 * @file webpack config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = [
    {
        name: 'detail',
        /**
         * 是否启用ssr
         *
         */
        ssr: true,

        /**
         * 这个模块匹配的路径，不匹配继续往下找
         *
         * @type {RegExp|string|Array.<RegExp|string>}
         */
        routes: /^rewrite\/detail\/.+$/
    },
    {
        name: 'main',
        ssr: true,
        routes: /^.*$/
    }
];
