/**
 * @file server.js
 * @author lavas
 */

const LavasCore = require('./lib');
const Koa = require('koa');

let port = process.env.PORT || 3000;
let core = new LavasCore(__dirname);
let app;
let server;

function startDevServer() {
    app = new Koa();
    core.build()
        .then(() => {
            app.use(core.koaMiddleware());

            server = app.listen(port, () => {
                console.log('server started at localhost:' + port);
            });
        }).catch((err) => {
            console.log(err);
        });
}

core.on('rebuild', () => {
    core.close().then(() => {
        server.close();
        startDevServer();
    });
});

core.init('development', true)
    .then(() => startDevServer());

// catch promise error
process.on('unhandledRejection', (err, promise) => {
    console.log('in unhandledRejection')
    console.log(err);
    // cannot redirect without ctx!
});
