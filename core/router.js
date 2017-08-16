/**
 * @file router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

let Home = () => import('@/pages/Home.vue');
let Detail = () => import('@/pages/Detail.vue');

export function createRouter() {
    return new Router({
        mode: 'history',
        routes: [
            {
                path: '/',
                name: 'home',
                component: Home
            },
            {
                path: '/detail/:id',
                name: 'detail',
                component: Detail
            }
        ]
    });
}
