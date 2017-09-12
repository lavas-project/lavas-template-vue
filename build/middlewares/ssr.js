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

        if (core.isProd
            && matchedRoute && matchedRoute.static) {
            console.log(`[Lavas] route middleware: static ${req.url}`);

            res.end(await core.routeManager.getStaticHtml(matchedRoute));
        }
        else {
            console.log(`[Lavas] route middleware: ssr ${req.url}`);

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
