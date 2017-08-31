/**
 * @file entry
 * @author wangyisheng(wangyisheng@baidu.com)
 */

import Vue from 'vue';
import Meta from 'vue-meta';
import {createRouter} from './router';
import {createStore} from './store';
import App from './App.vue';

/* ======== lavas extensions start ======== */
// 增加引用Vuetify
import Vuetify from 'vuetify';

Vue.use(Vuetify);
/* ======== lavas extensions end ======== */

Vue.use(Meta, {
    keyName: 'head',
    attribute: 'data-vue-meta',
    ssrAttribute: 'data-vue-meta-server-rendered',
    tagIDKeyName: 'vmid'
});
Vue.config.productionTip = false;

/* eslint-disable no-new */
export function createApp() {
    let router = createRouter();
    let store = createStore();
    let app = new Vue({
        router,
        store,
        ...App
    });
    return {app, router, store};
}
