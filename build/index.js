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
import decorateContextFactory from './middlewares/decorateContext';
import privateFileFactory from './middlewares/privateFile';
import ssrFactory from './middlewares/ssr';
import errorFactory from './middlewares/error';

import Koa from 'koa';
import compose from 'koa-compose';

export default class LavasCore {
    constructor(cwd = process.cwd()) {
        this.cwd = cwd;
        this.app = new Koa();
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
            // create with routes.json
            await this.routeManager.createWithRoutesFile();
            // create with bundle & manifest
            await this.renderer.createWithBundle();
        }
    }

    /**
     * compose all the middlewares
     *
     * @return {Function} koa middleware
     */
    koaMiddleware() {
        if (this.isProd) {
            // add static middleware
            this.app.use(serve(this.config.webpack.base.output.path));
        }

        return compose([
            errorFactory(this),
            decorateContextFactory(this),
            privateFileFactory(this),
            ...this.app.middleware,
            ssrFactory(this)
        ]);
    }

    expressMiddleware() {
    }
}
