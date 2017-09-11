/**
 * @file middleware
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

export function middlewareSeries(promises, context) {
    if (!promises.length || context._redirected) {
        return Promise.resolve();
    }
    return promisify(promises[0], context)
    .then(() => middlewareSeries(promises.slice(1), context));
}

export function promisify(fn, context) {
    let promise;
    if (fn.length === 2) {
        // fn(context, callback)
        promise = new Promise((resolve, reject) => {
            fn(context, function (err, data) {
                if (err) {
                    // 错误处理
                    context.error(err);
                    reject(err);
                    return;
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

export function urlJoin() {
    return [].slice.call(arguments).join('/').replace(/\/+/g, '/');
}

