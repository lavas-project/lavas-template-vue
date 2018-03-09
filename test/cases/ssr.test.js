/**
 * @file TestCase for SSR
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {join} from 'path';
import test from 'ava';
import LavasCore from 'lavas-core-vue';

import {syncConfig, isKoaSupport, request, createApp} from '../utils';

let app;
let server;
let port = process.env.PORT || 3000;
let core;

test.beforeEach('init lavas-core & server', async t => {
    core = new LavasCore(join(__dirname, '../../'));
    app = createApp();
});

test.afterEach('clean', async t => {
    await core.close();
    server && server.close();
});

test.serial('it should run in development mode correctly', async t => {
    await core.init('development', true);
    core.config.build.ssr = true;
    syncConfig(core, core.config);
    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    server = app.listen(port, () => {
        console.log('server started at localhost:' + port);
    });

    // server side render index
    let res = await request(app)
        .get('/?a=1&b=2');
    t.is(200, res.status);
    t.true(res.text.indexOf('<div id="app" data-server-rendered="true">') > -1);

    // serve static assets such as manifest.json
    res = await request(app)
        .get('/static/manifest.json');
    t.is(200, res.status);
    t.true(res.text.indexOf('"start_url": "/?utm_source=homescreen"') > -1);
});

test.serial('it should run in production mode correctly', async t => {
    // build in production mode
    await core.init('production', true);
    core.config.build.ssr = true;
    core.config.build.stats = false;
    syncConfig(core, core.config);
    await core.build();

    // start server in production mode
    core = new LavasCore(join(__dirname, '../../dist/'));
    await core.init('production');
    await core.runAfterBuild();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    server = app.listen(port, () => {
        console.log('server started at localhost:' + port);
    });

    // server side render index
    let res = await request(app)
        .get('/?a=1&b=2');
    t.is(200, res.status);
    t.true(res.text.indexOf('<div id="app" data-server-rendered="true">') > -1);
    t.true(res.text.indexOf('sw-register.js') > -1);

    // serve static assets such as manifest.json
    res = await request(app)
        .get('/static/manifest.json');
    t.is(200, res.status);
    t.true(res.text.indexOf('"start_url": "/?utm_source=homescreen"') > -1);

});
