/**
 * @file server.js
 * @author lavas
 */

const LavasCore = require('./lib');
const Koa = require('koa');
const app = new Koa();

let env = process.env.NODE_ENV || 'production';
let port = process.env.PORT || 3000;

let core = new LavasCore(__dirname);

let startLavasPromise;

if (env === 'development') {
    startLavasPromise = core.init(env, true).then(() => {
        return core.build();
    });
}
else {
    startLavasPromise = core.init(env).then(() => {
        return core.runAfterBuild();
    });
}

startLavasPromise.then(() => {
    app.use(core.koaMiddleware());

    app.listen(port, () => {
        console.log('server started at localhost:' + port);
    });
}).catch((err) => {
    console.log(err);
});
