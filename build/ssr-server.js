/**
 * @file ssr server
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

const path = require('path');
const url = require('url');
const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const chokidar = require('chokidar');
const rendererFactory = require('./ssr-renderer');
const config = require('./config');
const routeManager = require('./route-manager');
const isProd = process.env.NODE_ENV === 'production';

const app = new Koa();
const router = new Router();

(async () => {
    try {
        await routeManager.autoCompileRoutes();

        if (isProd) {
            await routeManager.compileMultiEntries();
        }

        // watch pages changing, and regenerate files
        chokidar
            .watch(path.join(config.globals.srcDir, 'pages'))
            .on('change', () => routeManager.autoCompileRoutes());

        app.use(serve(config.webpack.output.path));

        // init renderer factory
        rendererFactory.initRenderer(app);

        // handle all requests using vue renderer
        router.all('*', handle);

        // handle error
        app.context.onerror = onerror;

        app.use(router.routes());
        app.use(router.allowedMethods());

        let port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log('server started at localhost:' + port);
        });
    }
    catch (e) {
        console.error(e);
    }
})();


async function handle(ctx) {
    if (routeManager.shouldPrerender(ctx.path)) {
        ctx.body = await routeManager.prerender(ctx.path);
    }
    else {
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
    }

}

function onerror(err) {
    if (null == err) {
        return;
    }

    if (this.headerSent || !this.writable) {
        err.headerSent = true;
        return;
    }

    if (this._IN_ERROR_PROCEDURE_) {
        // if already in error procedure, then end this request immediately, avoid infinite loop
        this.res.end();
        return;
    }

    // set true
    this._IN_ERROR_PROCEDURE_ = true;

    this.res._headers = {};

    let errConfig = config.errorHandler;
    errConfig.statusCode = errConfig.statusCode || [];

    // get the right target url
    let target = errConfig.target;
    if (errConfig.statusCode[err.status]) {
        target = errConfig.statusCode[err.status].target;
    }

    // reassign the value of url and path
    this.url = target;
    this.path = url.parse(target).pathname;

    // re-renderer with new pathname
    handle(this)
        .then(() => {
            this.set(err.headers);
            this.res.end(this.body);
        })
        .catch(e => {
            console.error(e);
            this.res.end(e.stack);
        });
}
