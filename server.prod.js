/**
 * @file server.prod.js
 * @author lavas
 */

const LavasCore = require('lavas-core');
const Koa = require('koa');
const app = new Koa();
const mount = require('koa-mount');
const koaStatic = require('koa-static');

let port = process.env.PORT || 3000;

let core = new LavasCore(__dirname);

core.init('production')
    .then(() => core.runAfterBuild())
    .then(() => {
        let base = core.config.entry
            && core.config.entry.length
            && core.config.entry[0].base || '/';

        app.use(mount(base, koaStatic(core.cwd)));
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
