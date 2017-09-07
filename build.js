/**
 * @file build.js
 * @author lavas
 */

const LavasCore = require('./lib');

(async () => {
    try {
        let core = new LavasCore(__dirname);

        await core.build('production');

    }
    catch (e) {
        console.error(e);
    }
})();
