/**
 * @file server.js
 * @author lavas
 */

const LavasCore = require('./lib');
const Koa = require('koa');

const app = new Koa();

let env = process.env.NODE_ENV;
let port = process.env.PORT || 3000;

(async () => {
    try {
        let core = new LavasCore(__dirname);

        if (env === 'development') {
            await core.build(env);
        }
        else if (env === 'production') {
            await core.runAfterBuild(env);
        }

        app.use(core.koaMiddleware());

        app.listen(port, () => {
            console.log('server started at localhost:' + port);
        });
    }
    catch (e) {
        console.error(e);
    }
})();
