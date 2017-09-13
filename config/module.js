/**
 * @file webpack config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    default: {
        /**
         * 是否启用 ssr，决定上面那些属性会有效
         *
         */
        ssr: true,

        /**
         * entry，如果 module 中没有指定，默认为 @/core/entry-client.js
         *
         * @type {string}
         */
        entry: '@/core/entry-client.js',

        /**
         * skeleton，仅在非 ssr 的情况下有效
         *
         * @type {string}
         */
        skeleton: '@/pages/index.skeleton.vue',

        /**
         * html template，仅在非 ssr 的情况下有效，如果没指定，默认为 @core/index.html
         * 是 mpa 页面的入口
         *
         * @type {string}
         */
        htmlTemplate: '@/core/index.html',

        /**
         * ssr html template，顾名思义，是各 ssr 模块的入口
         *
         * @type {string}
         */
        ssrHtmlTemplate: '@/core/index.template.html',

        /**
         * 这个模块匹配的路径，default 的优先级最低
         *
         * @type {RegExp|string|Array.<RegExp|string>}
         */
        routes: /^.*$/
    },

    detail: {
        ssr: false,
        // entry: '@/modules/user/entry-client.js',
        skeleton: '@/pages/detail/detail.skeleton',
        // htmlTemplate: '@/modules/user/index.html',
        routes: /^\/detail\/.*$/
    }

};
