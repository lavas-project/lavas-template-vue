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
    return async function (req, res, next) {
        // find matchessd route object for current path
        let matchedRoute = core.routeManager.findMatchedRoute(req.url);
        let html;

        if (core.isProd
            && matchedRoute && matchedRoute.prerender) {
            console.log(`[Lavas] prerender ${req.url}`);
            html = await core.routeManager.prerender(matchedRoute);
            res.end(html);
        }
        else {
            console.log(`[Lavas] ssr ${req.url}`);

            let renderer = await core.renderer.getRenderer();
            let ctx = {
                title: 'Lavas', // default title
                url: req.url,
                config: core.config, // mount config to ctx which will be used when rendering template
                req,
                res,
                error: err => next(err)
            };
            // render to string
            renderer.renderToString(ctx, (err, html) => {
                if (err) {
                    return next(err);
                }

                res.end(html);
            });
        }
    };
}
