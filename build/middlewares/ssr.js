/**
 * @file ssrMiddlewareFactory.js
 * @author lavas
 */

/**
 * generate ssr middleware
 *
 * @param {Object} core lavas core
 * @return {Function} koa middleware
 */
export default function (core) {
    return async function (ctx, next) {
        // find matched route object for current path
        let matchedRoute = core.routeManager.findMatchedRoute(ctx.path);
        // use prerenderred html only in prod mode
        if (core.isProd
            && matchedRoute && matchedRoute.prerender) {
            console.log(`[Lavas] prerender path: ${ctx.path}`);

            ctx.body = await core.routeManager.prerender(matchedRoute);
        }
        else {
            console.log(`[Lavas] ssr path: ${ctx.path}`);

            let renderer = await core.renderer.getRenderer();

            ctx.body = await new Promise((resolve, reject) => {
                renderer.renderToString(ctx, (err, html) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(html);
                });
            });
        }
    };
}
