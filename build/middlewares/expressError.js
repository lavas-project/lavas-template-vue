/**
 * @file expressError.js, error handler middleware for express
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

    return async (err, req, res, next) => {
        console.log('[Lavas] error middleware catch error: ', err);

        if (errPath === req.url) {
            // if already in error procedure, then end this request immediately, avoid infinite loop
            res.end();
            return;
        }

        if (err.status !== 404) {
            console.error(err);
        }

        // redirect to the corresponding url
        if (errPath) {
            res.writeHead(301, {Location: target});
        }
        res.end();
    };
}
