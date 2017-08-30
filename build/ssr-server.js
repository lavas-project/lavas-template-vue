/**
 * @file ssr server
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

const path = require('path');
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


const errConfig = config.errorHandler;
errConfig.statusCode = errConfig.statusCode || [];

const errPaths = new Set([errConfig.target]);

// add all paths to errPaths set
Object.keys(errConfig.statusCode).forEach(key => {
    errPaths.add(errConfig.statusCode[key].target);
});

(async () => {
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
})();


/**
 * handle request, use the vue renderer to process requests
 *
 * @param {Context} ctx context
 */
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

/**
 * handle the error threw by vue renderer, redirect to corresponding url
 *
 * @param {Error} err error
 */
function onerror(err) {
    if (null == err) {
        return;
    }

    if (this.headerSent || !this.writable) {
        err.headerSent = true;
        return;
    }

    if (errPaths.has(this.path)) {
        // if already in error procedure, then end this request immediately, avoid infinite loop
        this.res.end();
        return;
    }

    // clear headers
    this.res._headers = {};

    // get the right target url
    let target = errConfig.target;
    if (errConfig.statusCode[err.status]) {
        target = errConfig.statusCode[err.status].target;
    }

    // redirect to the corresponding url
    this.redirect(target);
    this.res.end();
}
