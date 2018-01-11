/**
 * @file server.js
 * @author lavas
 */

const LavasCore = require('lavas-core-vue');
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

module.exports = options => {
    /**
     * every time lavas rebuild, stop current server first and restart
     */
    core.on('rebuild', () => {
        core.close().then(() => {
            server.stop();
            startDevServer(options);
        });
    });

    core.init(process.env.NODE_ENV || 'development', true, options)
        .then(() => startDevServer());

    // catch promise error
    process.on('unhandledRejection', (err) => {
        console.log(err, 'in unhandledRejection');
    });
}

