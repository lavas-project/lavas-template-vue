/**
 * @file privateFileMiddlewareFactory.js
 * @author lavas
 */

import {posix} from 'path';

/**
 * generate private file middleware
 * which prevents user from getting in touch with some private files
 *
 * @param {Object} core lavas core
 * @return {Function} koa middleware
 */
export default function (core) {
    let privateFiles = [
        'server.prod.js',
        'package.json',
        'lib/',
        'node_modules/',
        'lavas/'
    ];
    let entryConfig = core.config.entry;
    let base = entryConfig.length && entryConfig[0].base || '/';

    return async function (req, res, next) {
        if (privateFiles.find(file => req.url.startsWith(posix.join(base, file)))
            && !req.lavasIgnoreFlag) {
            await next({status: 404});
        }
        else {
            await next();
        }
    };
}
