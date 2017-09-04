/**
 * @file build.js
 * @author lavas
 */

const LavasCore = require('./lib');

(async () => {
    try {
        let core = new LavasCore(__dirname);

        await core.init('production');

        await core.build();

    }
    catch (e) {
        console.error(e);
    }
})();
