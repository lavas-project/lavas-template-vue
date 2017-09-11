/**
 * @file middleware
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

export function getContext(context, app) {
    let ctx = {
        isServer: !!context.isServer,
        isClient: !!context.isClient,
        isDev: true,
        app: app,
        store: context.store,
        route: (context.to ? context.to : context.route),
        payload: context.payload,
        error: context.error,
        base: '/',
        env: {},
        hotReload: context.hotReload || false
    };
    const next = context.next;
    ctx.params = ctx.route.params || {};
    ctx.query = ctx.route.query || {};
    ctx.redirect = function (status, path, query) {
        if (!status) {
            return;
        }
        ctx._redirected = true; // Used in middleware
        // if only 1 or 2 arguments: redirect('/') or redirect('/', { foo: 'bar' })
        if (typeof status === 'string' && (typeof path === 'undefined' || typeof path === 'object')) {
            query = path || {};
            path = status;
            status = 302;
        }
        next({
            path,
            query,
            status
        });
    };
    if (context.req) {
        ctx.req = context.req;
    }
    if (context.res) {
        ctx.res = context.res;
    }
    if (context.from) {
        ctx.from = context.from;
    }
    // if (ctx.isServer && context.beforeRenderFns) {
    //     ctx.beforeNuxtRender = fn => context.beforeRenderFns.push(fn);
    // }
    return ctx;
}

export async function middlewareSeries(promises, context) {
    if (!promises.length || context._redirected) {
        return;
        // return Promise.resolve();
    }

    for (let i = 0; i < promises.length; i++) {
        await promisify(promises[i], context);
    }
    // await promisify(promises[0], context);
    // return middlewareSeries(promises.slice(1), context);
    // return promisify(promises[0], context)
    // .then(() => middlewareSeries(promises.slice(1), context));
}

export function promisify(fn, context) {
    let promise;
    if (fn.length === 2) {
        // fn(context, callback)
        promise = new Promise(resolve => {
            fn(context, function (err, data) {
                if (err) {
                    // 错误处理
                    // context.error(err);
                }
                resolve(data || {});
            });
        });
    }
    else {
        promise = fn(context);
    }
    if (!promise || (!(promise instanceof Promise) && (typeof promise.then !== 'function'))) {
        promise = Promise.resolve(promise);
    }
    return promise;
}

export function urlJoin(...args) {
    return args.join('/').replace(/\/+/g, '/');
    // return [].slice.call(arguments).join('/').replace(/\/+/g, '/');
}

