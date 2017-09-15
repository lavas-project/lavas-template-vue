/**
 * @file ssrMiddlewareFactory.js
 * @author lavas
 */

import {matchUrl} from '../utils/router';

/**
 * generate ssr middleware
 *
 * @param {Object} core lavas core
 * @return {Function} koa middleware
 */
export default function (core) {
    return async function (req, res, next) {
        let url = req.url;
        let matchedEntry = core.config.entry.find(entryConfig => matchUrl(entryConfig.routes, url));

        // find matchessd route object for current path
        let matchedRoute = core.routeManager.findMatchedRoute(url);

        if (core.isProd
            && matchedRoute && matchedRoute.static) {
            console.log(`[Lavas] route middleware: static ${url}`);

            res.end(await core.routeManager.getStaticHtml(matchedRoute));
        }
        else {
            console.log(`[Lavas] route middleware: ssr ${url}`);
            let entryName = matchedEntry.name;
            let renderer = await core.renderer.getRenderer(entryName);
            let ctx = {
                title: 'Lavas', // default title
                url,
                entryName,
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
