/**
 * @file ssr server
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const getRenderer = require('./ssr-renderer');

const app = new Koa();
const router = new Router();

router.get('/static/(.*)', async ctx => await send(ctx, ctx.path));
router.get('/assets/(.*)', async ctx => await send(ctx, ctx.path));
router.get('/service-worker.js', async ctx => await send(ctx, ctx.path, {root: './.lavas'}));
router.get('/manifest.json', async ctx => await send(ctx, ctx.path, {root: './lavas'}));


let renderer;

// init renderer
getRenderer(app).then(r => renderer = r);

router.all('/', async ctx => {
    ctx.body = await new Promise((resolve, reject) => {
        // render to string
        renderer.renderToString(ctx, (err, html) => {
            if (err) {
                return reject(err);
            }

            resolve(html);
        });
    });
});

app.use(router.routes());
app.use(router.allowedMethods());

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('server started at localhost:' + port);
});
