/**
 * @file router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    /**
     * route rewrite rules
     *
     * example:
     * ```javascript
     * [{from: '/from/detail/:id', to: '/to/detial/:id'}]
     * ```
     *
     * @type {Array.<Object>}
     */
    rewrite: [
        // {from: /^\/(detail.*)$/, to: '/rewrite/$1'},
        // {from: '/detail', to: '/rewrite'}
    ],

    routes: [
        {
<<<<<<< HEAD
            pattern: '/detail',
            // path: '/rewrite/detail',
=======
            pattern: /^\/detail/,
            // meta: {
            //     keepAlive: true
            // },
>>>>>>> 2a797b17b265f4ec34ea250776c14d9f3a60dd8a
            lazyLoading: true,
            chunkname: 'detail'
        }
    ]
};
