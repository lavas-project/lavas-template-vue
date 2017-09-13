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
            pattern: 'detail-id',
            // path: '/detail/rewrite/:id',
            meta: {
                keepAlive: true
            }
        }
    ]

    // routes: [
    //     {
    //         name: 'detail-id',
    //         prerender: true,
    //         pagename: 'detail',
    //
    //         // path: '/detail/rewrite/:id',
    //         // meta: {},
    //         template: '',
    //         // entry: '',
    //         skeleton: '@/pages/detail/detail.skeleton'
    //     }
    // ]

};
