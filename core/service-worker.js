/**
 * @file service-worker.js with workbox api
 * @desc [example](https://developers.google.com/web/tools/workbox/modules/)
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

importScripts('/static/js/workbox-v3.0.0-alpha.3/workbox-sw.js');

workbox.setConfig({
    modulePathPrefix: '/static/js/workbox-v3.0.0-alpha.3/'
});

var APP_SHELL_REVISION = self.__precacheManifest.reduce(function(prev, cur) {
    return prev + cur.revision;
}, '');

// Define precache injection point.
workbox.precaching.precacheAndRoute(
    (self.__precacheManifest || [])
        // Exclude .map, sw-register.js and hot-update files in development mode.
        .filter(function(entry) {
            return !/((\.map)|(\.hot-update\.js(on)?)|(sw-register\.js))$/.test(entry.url);
        })
        // In SSR mode, request `/appshell` in precaching process.
        // .concat([
        //     {
        //         revision: APP_SHELL_REVISION,
        //         url: '/appshell/main'
        //     }
        // ])
);

// Control current page ASAP and skip the default service worker lifecycle.
workbox.skipWaiting();
workbox.clientsClaim();

// In SPA/MPA, respond to navigation requests with HTML precached.
workbox.routing.registerNavigationRoute('main.html');
// In SSR mode, respond to navigation requests with appshell precached.
// workbox.routing.registerNavigationRoute('/appshell/main');

// Define runtime cache.
workbox.routing.registerRoute(new RegExp('https://query\.yahooapis\.com/v1/public/yql'),
    workbox.strategies.networkFirst());
