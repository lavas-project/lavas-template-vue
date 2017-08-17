/**
 * @file prerender
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

const routeManager = require('./route-manager');

(async () => {

    await routeManager.autoCompileRoutes();

    await routeManager.prerenderMultiEntries();

})();
