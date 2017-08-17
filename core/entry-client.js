/**
 * @file client entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import FastClick from 'fastclick';
import {createApp} from './app';
import ProgressBar from './components/ProgressBar.vue';

// 全局的进度条，在组件中可通过 $loading 访问
let loading = Vue.prototype.$loading = new Vue(ProgressBar).$mount();
let {app, router, store} = createApp();

if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__);
}

document.body.appendChild(loading.$el);
FastClick.attach(document.body);

Vue.mixin({

    // 当复用的路由组件参数发生变化时，例如/detail/1 => /detail/2
    beforeRouteUpdate(to, from, next) {

        // asyncData方法中包含异步数据请求
        let asyncData = this.$options.asyncData;

        if (asyncData) {
            loading.start();
            asyncData.call(this, {
                store: this.$store,
                route: to
            }).then(() => {
                loading.finish();
                next();
            }).catch(next);
        }
        else {
            next();
        }
    }

    // beforeRouteEnter(to, from, next) {
    //     next(vm => {});
    // },
    // beforeRouteLeave(to, from, next) {
    //     next();
    // }
});

// 此时异步组件已经加载完成
router.beforeResolve((to, from, next) => {
    let matched = router.getMatchedComponents(to);
    let prevMatched = router.getMatchedComponents(from);

    // [a, b]
    // [a, b, c, d]
    // => [c, d]
    let diffed = false;
    let activated = matched.filter((c, i) => diffed || (diffed = (prevMatched[i] !== c)));

    if (!activated.length) {
        return next();
    }

    loading.start();
    Promise.all(activated.map(c => {

        /**
         * 两种情况下执行asyncData:
         * 1. 非keep-alive组件每次都需要执行
         * 2. keep-alive组件首次执行，执行后添加标志
         */
        if (c.asyncData && (!c.asyncDataFetched || to.meta.notKeepAlive)) {
            return c.asyncData({
                store,
                route: to
            }).then(() => {
                c.asyncDataFetched = true;
            });
        }
    })).then(() => {
        loading.finish();
        next();
    }).catch(next);
});

router.onReady(() => app.$mount('#app'));
