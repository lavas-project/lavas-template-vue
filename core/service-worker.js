/**
 * @file service-worker.js with workbox api
 * @desc [example](https://workbox-samples.glitch.me/examples/workbox-sw/)
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

/**
 * Import polyfill & workbox-sw with `importScripts` function.
 * 1. Need adding publicPath manually.
 * 2. If the version of workbox updated, modification is also required.
 */
importScripts('/game/static/js/broadcast-channel-polyfill.js');
importScripts('/game/static/js/workbox-sw.dev.v2.1.1.js');

const workboxSW = new WorkboxSW({
    // cacheId: 'your-custom-cache-name',
    // directoryIndex: 'index.html',
    // ignoreUrlParametersMatching: [/^utm_/],
    skipWaiting: true,
    clientsClaim: true,
    precacheChannelName: 'sw-precache'
});

// Define precache injection point.
workboxSW.precache([]);

// Respond to navigation requests with appshell precached.
workboxSW.router.registerNavigationRoute('/game/appshell');

// Define runtime cache.
workboxSW.router.registerRoute(new RegExp('https://query\.yahooapis\.com/v1/public/yql'),
    workboxSW.strategies.networkFirst());
