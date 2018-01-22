/**
 * @file server.dev.js
 * @author lavas
 */

const LavasCore = require('lavas-core-vue');
const express = require('express');
const stoppable = require('stoppable');
const proxy = require('http-proxy-middleware');


let configPath = './lavas.config.js';
// fix https://github.com/lavas-project/lavas/issues/50
if (process.argv.length >= 3 && process.argv[2] !== 'dev') {
    configPath = process.argv[2];
}

let lavasConfig = require(configPath);

let port = process.env.PORT || 3000;
let core = new LavasCore(__dirname);
let app;
let server;

/**
 * start dev server
 */
function startDevServer() {
    app = express();
    core.build()
        .then(() => {
            // API Proxying during development
            // see https://github.com/chimurai/http-proxy-middleware
            let proxyTable = lavasConfig.proxyTable;
            if (proxyTable) {
                Object.keys(proxyTable).forEach(pattern => {
                    app.use(pattern, proxy(proxyTable[pattern]));
                });
            }

            app.use(core.expressMiddleware());

            /**
             * server.close() only stop accepting new connections,
             * we need to close existing connections with help of stoppable
             */
            server = stoppable(app.listen(port, () => {
                console.log('server started at localhost:' + port);
            }));
        })
        .catch(err => {
            console.log(err);
        });
}

let config;

// fix https://github.com/lavas-project/lavas/issues/50
if (process.argv.length >= 3 && process.argv[2] !== 'dev') {
    config = process.argv[2];
}

/**
 * every time lavas rebuild, stop current server first and restart
 */
core.on('rebuild', () => {
    core.close().then(() => {
        server.stop();

        lavasConfig = require(configPath);
        startDevServer();
    });
});

core.init(process.env.NODE_ENV || 'development', true, {configPath})
    .then(() => startDevServer());

// catch promise error
process.on('unhandledRejection', err => {
    console.warn(err);
});

