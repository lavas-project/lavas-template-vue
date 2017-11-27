/**
 * @file server.prod.js
 * @author lavas
 */

const LavasCore = require('lavas');
const Koa = require('koa');
const app = new Koa();

let port = process.env.PORT || 3000;

let core = new LavasCore(__dirname);

core.init(process.env.NODE_ENV || 'production')
    .then(() => core.runAfterBuild())
    .then(() => {
        app.use(core.koaMiddleware());
        app.listen(port, () => {
            console.log('server started at localhost:' + port);
        });
    }).catch(err => {
        console.log(err);
    });

// catch promise error
process.on('unhandledRejection', (err, promise) => {
    console.log('in unhandledRejection');
    console.log(err);
    // cannot redirect without ctx!
});
