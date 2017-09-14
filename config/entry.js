/**
 * @file webpack config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = [
    {
        name: 'detail',
        ssr: false,
        routes: /^\/detail\/.*$/
    },
    {
        name: 'main',
        /**
         * 是否启用 ssr，决定上面那些属性会有效
         *
         */
        ssr: false,

        /**
         * 这个模块匹配的路径，default 的优先级最低
         *
         * @type {RegExp|string|Array.<RegExp|string>}
         */
        routes: /^.*$/
    }
];
