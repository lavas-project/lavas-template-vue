/**
 * @file client server
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {createApp} from './app';
import middleware from './middleware';
import middConf from '@/config/middleware';
import {middlewareSeries, getContext} from './utils';
const isDev = process.env.NODE_ENV !== 'production';

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default function (context) {
    return new Promise((resolve, reject) => {
        let {app, router, store} = createApp();

        let url = context.url;
        let fullPath = router.resolve(url).route.fullPath;

        context.store = store;

        context.route = router.currentRoute;

        context.meta = app.$meta();
        console.log(context);


        if (fullPath !== url) {
            reject({url: fullPath});
        }

        // set router's location
        router.push(url);

        // wait until router has resolved possible async hooks
        router.onReady(async () => {
            let matchedComponents = router.getMatchedComponents();

            // no matched routes
            if (!matchedComponents.length) {
                let err = new Error('Not Found');
                // simulate nodejs file not found
                err.code = 'ENOENT';
                err.status = 404;
                reject(err);
            }

            // middleware
            middlewareProcess(matchedComponents);

            // Call fetchData hooks on components matched by the route.
            // A preFetch hook dispatches a store action and returns a Promise,
            // which is resolved when the action is complete and store state has been
            // updated.
            let s = isDev && Date.now();
            Promise.all(matchedComponents.map(({asyncData}) => asyncData && asyncData({
                store,
                route: router.currentRoute
            }))).then(() => {
                isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`);

                // After all preFetch hooks are resolved, our store is now
                // filled with the state needed to render the app.
                // Expose the state on the render context, and let the request handler
                // inline the state in the HTML response. This allows the client-side
                // store to pick-up the server-side state without having to duplicate
                // the initial data fetching on the client.
                context.state = store.state;
                context.isProd = process.env.NODE_ENV === 'production';
                resolve(app);
            }).catch(reject);
        }, reject);

        async function middlewareProcess(matchedComponents) {
            let Components = matchedComponents;

            // Update context
            const ctx = getContext(context, app);

            let unknownMiddleware = false;

            // serverMidd + clientMidd + components Midd
            let midd = middConf.serverMidd.concat(middConf.clientMidd);
            Components.forEach(Component => {
                if (Component.middleware) {
                    midd = midd.concat(Component.middleware);
                }
            });

            midd = midd.map(name => {
                if (typeof middleware[name] !== 'function') {
                    unknownMiddleware = true;
                    // 错误处理
                }
                return middleware[name];
            });

            if (!unknownMiddleware) {
                await middlewareSeries(midd, ctx);
            }

        }


    });
}
