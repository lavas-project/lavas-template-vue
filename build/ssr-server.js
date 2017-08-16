/**
 * @file ssr server
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const rendererFactory = require('./ssr-renderer');
const config = require('./config');

const app = new Koa();
const router = new Router();

// init renderer factory
rendererFactory.initRenderer(app);

router.all('/', async ctx => {

    /* eslint-disable fecs-prefer-async-await */
    let renderer = await rendererFactory.getRenderer();

    ctx.body = await new Promise((resolve, reject) => {
        // render to string
        renderer.renderToString(ctx, (err, html) => {
            if (err) {
                return reject(err);
            }

            resolve(html);
        });
    });
    /* eslint-enable fecs-prefer-async-await */
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(serve(config.webpack.output.path));

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('server started at localhost:' + port);
});
