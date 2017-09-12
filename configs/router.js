/**
 * @file router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    // 自定义路由规则
    rewrite: [
        {from: /^(.*)$/, to: '/msie/$1'},
        {from: '/user/index', to: '/user'}
    ],

    routes: [
        {
            route: /^\/user\/index/,
            options: {
                keepAlive: true
            }
        },
        {
            route: /^\/.*/,
            options: {
                keepAlive: false
            }
        }
    ]

};
