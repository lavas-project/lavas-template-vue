/**
 * @file server entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import FastClick from 'fastclick';
import middleware from './middleware';
import middConf from '@/config/middleware';
import {createApp} from './app';
import ProgressBar from './components/ProgressBar.vue';
import {getContext, middlewareSeries} from './utils';

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
    async beforeRouteUpdate(to, from, next) {

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

router.beforeEach(async (to, from, next) => {

    // Update context
    const ctx = getContext({
        to,
        from,
        store,
        isClient: true,
        next: next.bind(this)
    }, app);

    // console.log(context);

    let matched = router.getMatchedComponents(to);

    if (!matched.length) {
        return next();
    }
    await callMiddleware.call(this, matched, ctx);

    next();
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


function callMiddleware(Components, context) {
    let midd = middConf.clientMidd;
    let unknownMiddleware = false;

    // If Components
    if (Components.length) {
        let componentMidd = [];
        Components.forEach(Component => {
            if (Component.middleware) {
                componentMidd = componentMidd.concat(Component.middleware);
            }
        });
    }

    midd = midd.map(name => {
        if (typeof middleware[name] !== 'function') {
            unknownMiddleware = true;
            // 错误处理
        }
        return middleware[name];
    });

    if (unknownMiddleware) {
        return;
    }
    return middlewareSeries(midd, context);
}

