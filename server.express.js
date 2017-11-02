/**
 * @file server.express.js
 * @author lavas
 */

const LavasCore = require('./lib');
const express = require('express');
const stoppable = require('stoppable');

let port = process.env.PORT || 3000;
let core = new LavasCore(__dirname);
let app;
let server;

function startDevServer() {
    app = express();
    core.build()
        .then(() => {
            app.use(core.expressMiddleware());

            /**
             * server.close() only stop accepting new connections,
             * we need to close existing connections with help of stoppable
             */
            server = stoppable(app.listen(port, () => {
                console.log('server started at localhost:' + port);
            }));
        }).catch(err => {
            console.log(err);
        });
}

/**
 * every time lavas rebuild, stop current server first and restart
 */
core.on('rebuild', () => {
    core.close().then(() => {
        server.stop();
        startDevServer();
    });
});

core.init('development', true)
    .then(() => startDevServer());

// catch promise error
process.on('unhandledRejection', (err, promise) => {
    console.log('in unhandledRejection');
    console.log(err);
    // cannot redirect without ctx!
});
