/**
 * @file errorHandler config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    /**
     * default error redirect url
     *
     * @type {string}
     */
    target: '/500',

    /**
     * the specific redirect urls of different error codes
     *
     * @type {Object}
     */
    statusCode: {
        404: {
            target: '/404'
        },
        500: {
            target: '/500'
        }
    }

};
