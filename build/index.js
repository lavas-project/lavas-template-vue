/**
 * @file index.js
 * @author lavas
 */
import RouteManager from './RouteManager';
import Renderer from './Renderer';
import WebpackConfig from './WebpackConfig';
import ConfigReader from './ConfigReader';
import ConfigValidator from './ConfigValidator';
import serve from 'koa-static';
import {emptyDir} from 'fs-extra';
import privateFile from './middlewares/privateFile';
import etpl from 'etpl';

export default class LavasCore {
    constructor(cwd = process.cwd(), app) {
        this.cwd = cwd;
        this.app = app;
    }

    async init(env = 'development') {
        this.env = env || process.env.NODE_ENV;
        this.isProd = this.env === 'production';

        this.config = await ConfigReader.read(this.cwd, this.env);

        ConfigValidator.validate(this.config);

        this.renderer = new Renderer(this);

        this.webpackConfig = new WebpackConfig(this.config, this.env);

        this.routeManager = new RouteManager(this.config, this.env, this.webpackConfig);
    }

    async build() {
        // clear dist/
        await emptyDir(this.config.webpack.base.output.path);

        // build routes' info and source code
        await this.routeManager.buildRoutes();

        // add extension's hooks
        if (this.config.extensions) {
            this.config.extensions.forEach(({name, init}) => {
                console.log(`[Lavas] ${name} extension is running...`);
                this.webpackConfig.addHooks(init);
            });
        }

        // webpack client & server config
        let clientConfig = this.webpackConfig.client(this.config);
        let serverConfig = this.webpackConfig.server(this.config);

        // build bundle renderer
        await this.renderer.build(clientConfig, serverConfig);

        if (this.isProd) {
            // compile multi entries only in production mode
            await this.routeManager.buildMultiEntries();
            // store routes info in routes.json for later use
            await this.routeManager.writeRoutesFile();
        }
    }

    async run() {
        if (this.isProd) {
            // create with routes.json
            await this.routeManager.createWithRoutesFile();
            // create with bundle & manifest
            await this.renderer.createWithBundle();
        }

        this.setupMiddlewares();
        this.setupErrorHandler();
    }

    setupErrorHandler() {
        const errConfig = this.config.errorHandler;

        errConfig.statusCode = errConfig.statusCode || [];

        const errPaths = new Set([errConfig.target]);

        // add all paths to errPaths set
        Object.keys(errConfig.statusCode).forEach(key => {
            errPaths.add(errConfig.statusCode[key].target);
        });

        this.app.context.onerror = onerror;

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

            if (err.status !== 404) {
                console.error(err);
            }

            // clear headers
            this.res._headers = {};

            // get the right target url
            let target = errConfig.target;
            if (errConfig.statusCode[err.status]) {
                target = errConfig.statusCode[err.status].target;
            }

            // redirect to the corresponding url
            // this.status = err.status;
            this.redirect(target);
            this.res.end();
        }
    }

    setupMiddlewares() {
        if (this.app) {
            // add static middleware
            this.app.use(serve(this.config.webpack.base.output.path));
            // protected some static files such as routes.json, bundle.json
            // this.app.use(privateFile([...this.routeManager.privateFiles,
            //     ...this.renderer.privateFiles]));
        }
    }

    async koaMiddleware(ctx, next) {
        // find matched route object for current path
        let matchedRoute = this.routeManager.findMatchedRoute(ctx.path);
        let config = this.config;
        // use prerenderred html only in prod mode
        if (this.isProd
            && matchedRoute && matchedRoute.prerender) {
            console.log(`[Lavas] prerender ${ctx.path}`);

            ctx.body = await this.routeManager.prerender(matchedRoute);
        }
        else {
            console.log(`[Lavas] ssr ${ctx.path}`);

            let renderer = await this.renderer.getRenderer();
            ctx.body = await new Promise((resolve, reject) => {
                renderer.renderToString(ctx, (err, html) => {
                    if (err) {
                        return reject(err);
                    }
                    etpl.config({
                        commandOpen: '<!----',
                        commandClose: '---->'
                    });
                    html = etpl.compile(html)(config);
                    resolve(html);
                });
            });
        }
    }
}
