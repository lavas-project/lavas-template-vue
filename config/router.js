/**
 * @file router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    /**
     * vue router mode, which is not recommended to change it.
     *
     * @type {string}
     */
    mode: 'history',

    routes: [
        {
            name: 'detail-id',
            prerender: true,
            pagename: 'detail',
            lazyLoading: true,
            chunkname: '',
            // path: '/detail/rewrite/:id',
            // meta: {},
            template: ''
            // entry: '',
            // skeleton: ''
        }
    ]

};
