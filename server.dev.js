/**
 * @file server.js
 * @author lavas
 */

const LavasCore = require('lavas-core');
const Koa = require('koa');
const Router = require('koa-router');
const router = new Router();
const stoppable = require('stoppable');

let port = process.env.PORT || 3000;
let core = new LavasCore(__dirname);
let app;
let server;

router.all(['/api', '/let/lavas/ignore/:id'], (ctx, next) => {
    core.ignore(ctx.req);
    next();
});

function startDevServer() {
    app = new Koa();
    core.build()
        .then(() => {
            app.use(router.routes());
            app.use(core.koaMiddleware());

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
