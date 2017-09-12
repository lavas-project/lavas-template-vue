/**
 * @file router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    routes: [
        {
            name: 'detail-id',
            prerender: true,
            pagename: 'detail',
            lazyLoading: true,
            chunkname: '',
            // path: '/detail/rewrite/:id',
            // meta: {},
            template: '',
            // entry: '',
            skeleton: '@/components/detail-id.skeleton'
        }
    ]

};
