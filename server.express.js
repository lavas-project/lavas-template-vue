/**
 * @file server.express.js
 * @author lavas
 */

const LavasCore = require('./lib');
const express = require('express');
const app = express();

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
    app.use(core.expressMiddleware());

    app.listen(port, () => {
        console.log('server started at localhost:' + port);
    });
}).catch((err) => {
    console.log(err);
});
