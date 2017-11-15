/**
 * @file entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import {createRouter} from '@/.lavas/main/router';
import {createStore} from '@/core/store';
import '@/core/meta';
import AppComponent from './App.vue';

// import {
//     Vuetify,
//     VApp,
//     VBtn
// } from 'vuetify';
// console.log(Vuetify, VApp, VBtn)

// import Vuetify from 'vuetify/es5/components/Vuetify';
// import VApp from 'vuetify/es5/components/VApp';
// Vue.use(Vuetify, {
//     components: {
//         VApp
//     }
// });

let store;

/* eslint-disable no-new */
export function createApp() {
    let router = createRouter();
    store = createStore();
    let App = Vue.extend({
        router,
        store,
        ...AppComponent
    });
    return {App, router, store};
}

if (module.hot) {
    module.hot.accept(['@/core/store'], () => {});
}
