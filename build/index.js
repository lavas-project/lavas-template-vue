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

        await this.routeManager.buildRoutes();

        // add extension's hooks
        if (this.config.extensions) {
            this.config.extensions.forEach(({name, init}) => {
                console.log(`[Lavas] ${name} extension is running...`);
                this.webpackConfig.addHooks(init);
            });
        }

        let clientConfig = this.webpackConfig.client(this.config);
        let serverConfig = this.webpackConfig.server(this.config);

        await this.renderer.build(clientConfig, serverConfig);

        if (this.isProd) {
            // compile multi entries only in production mode
            await this.routeManager.buildMultiEntries();
        }
    }

    async run() {
        if (this.isProd) {
            await this.routeManager.createFromRoutesFile();
            await this.renderer.createAfterBuild();
        }

        this.setupMiddlewares();
    }

    setupMiddlewares() {
        if (this.app) {
            // add static middleware
            this.app.use(serve(this.config.webpack.base.output.path));
        }
    }

    async koaMiddleware(ctx, next) {
        let matchedRoute = this.routeManager.findMatchedRoute(ctx.path);
        if (this.isProd
            && matchedRoute && matchedRoute.prerender) {
            ctx.body = await this.routeManager.prerender(matchedRoute);
        }
        else {
            let renderer = await this.renderer.getRenderer();

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
}
