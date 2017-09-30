/**
 * @file koaError.js, error handler middleware for koa
 * @author lavas
 */

/**
 * generate error middleware
 *
 * @param {Object} core lavas core
 * @return {Function} koa middleware
 */
export default function (core) {

    const errPath = core.config.errorHandler.errorPath;

    return async (ctx, next) => {
        try {
            await next();
        }
        catch (err) {
            console.log('[Lavas] error middleware catch error: ', err);

            if (ctx.headerSent || !ctx.writable) {
                err.headerSent = true;
                return;
            }

            if (errPath === ctx.path) {
                // if already in error procedure, then end this request immediately, avoid infinite loop
                ctx.res.end();
                return;
            }

            if (err.status !== 404) {
                console.error(err);
            }

            // clear headers
            ctx.res._headers = {};

            // redirect to the corresponding url
            ctx.redirect(`${errPath}?error=${encodeURIComponent('Internal Error')}`);

            ctx.res.end();
        }
    };
}
