/**
 * @file service-worker.js with workbox api
 * @desc [example](https://developers.google.com/web/tools/workbox/modules/)
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

importScripts('/static/js/workbox-v3.0.0-alpha.3/workbox-sw.js');

workbox.setConfig({
    modulePathPrefix: '/static/js/workbox-v3.0.0-alpha.3/'
});

// Define precache injection point.
workbox.precaching.precacheAndRoute(
    (self.__precacheManifest || [])
        // Exclude .map, sw-register.js and hot-update files in development mode.
        .filter(function(entry) {
            return !/((\.map)|(\.hot-update\.js(on)?)|(sw-register\.js))$/.test(entry.url);
        })
);

// Control current page ASAP and skip the default service worker lifecycle.
workbox.skipWaiting();
workbox.clientsClaim();

// In SPA/MPA, respond to navigation requests with HTML precached.
// workbox.routing.registerNavigationRoute('index.html');
// In SSR mode, respond to navigation requests with appshell precached.
workbox.routing.registerNavigationRoute('/appshell');

// Define runtime cache.
workbox.routing.registerRoute(new RegExp('https://query\.yahooapis\.com/v1/public/yql'),
    workbox.strategies.networkFirst());
