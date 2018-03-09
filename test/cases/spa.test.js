/**
 * @file TestCase for SPA
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {join} from 'path';
import test from 'ava';
import {readFileSync} from 'fs';
import LavasCore from 'lavas-core-vue';

import {syncConfig, isKoaSupport, request, createApp} from '../utils';

let app;
let server;
let port = process.env.PORT || 3000;
let core;
let res;

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
    core.config.build.ssr = false;
    syncConfig(core, core.config);
    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    server = app.listen(port);

    // serve main.html
    let skeletonContent = '<div data-server-rendered=true>';
    res = await request(app)
        .get('/index.html');
    t.is(200, res.status);
    // include skeleton
    t.true(res.text.indexOf(skeletonContent) > -1);
});

test.serial('it should run in production mode correctly', async t => {
    await core.init('production', true);

    core.config.build.ssr = false;
    core.config.build.stats = false;
    syncConfig(core, core.config);

    await core.build();

    let htmlContent = readFileSync(join(__dirname, '../../dist/index.html'), 'utf8');

    // include skeleton
    let skeletonContent = '<div data-server-rendered=true>';
    t.true(htmlContent.indexOf(skeletonContent) > -1);

    // include sw-register
    let swRegisterContent = '/sw-register.js?v=';
    t.true(htmlContent.indexOf(swRegisterContent) > -1);
});
