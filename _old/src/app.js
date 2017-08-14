/**
 * @file entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import VueMeta from 'vue-meta';
import Vuetify from 'vuetify';
import {createRouter} from './router';
import {createStore} from './store';
import App from './App.vue';
import Icon from 'vue-awesome/components/Icon.vue';

Vue.use(Vuetify);
Vue.use(VueMeta, {
    keyName: 'head', // vuemeta的参数名称
    attribute: 'data-vue-meta', // 由vue-meta渲染的元素会添加一个属性 <title data-vue-meta=""></title>
    ssrAttribute: 'data-vue-meta-server-rendered', // 由服务器端渲染的vue-meta元素的自定义属性名称
    tagIDKeyName: 'vmid' // vue-meta用于确定是否覆盖或附加标签的属性名称
});
Vue.component('icon', Icon);
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
