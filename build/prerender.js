/**
 * @file prerender
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

const routeManager = require('./route-manager');

(async () => {

    try {

        await routeManager.autoCompileRoutes();

        await routeManager.prerenderMultiEntries();

    }
    catch (e) {
        console.log(e);
    }

})();
