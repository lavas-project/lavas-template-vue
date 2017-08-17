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
            name: 'detail-_id',
            prerender: true,
            chunkname: '',
            pagename: 'detail',
            // path: '/detail/rewrite/:id',
            // meta: {},
            template: ''
            // entry: '',
            // skeleton: ''
        }
    ]

};
