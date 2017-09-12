/**
 * @file utils.webpack.js
 * @author lavas
 */
import webpack from 'webpack';

/**
 * start to compile with webpack, record the errors & warnings in process
 *
 * @param {Object|Array} config webpack config
 * @return {Promise} promise
 */
export function webpackCompile(config) {
    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            if (err) {
                console.error(err.stack || err);
                if (err.details) {
                    console.error(err.details);
                }
                reject(err);
                return;
            }

            const info = stats.toJson();

            if (stats.hasErrors()) {
                console.error(info.errors);
                reject(info.errors);
                return;
            }

            if (stats.hasWarnings()) {
                console.warn(info.warnings);
            }

            resolve();
        });
    });
}
