/**
 * @file decorateContextFactory.js
 * @author lavas
 */

/**
 * generate decorateContext middleware
 *
 * @param {Object} core lavas core
 * @return {Function} koa middleware
 */
export default function (core) {
    const config = core.config;

    return async (ctx, next) => {
        // add config to context, index.template.html will use later
        ctx.config = config;
        await next();
    };
}
