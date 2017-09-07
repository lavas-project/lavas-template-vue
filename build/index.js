/**
 * @file index.js
 * @author lavas
 */
import {emptyDir} from 'fs-extra';
import RouteManager from './RouteManager';
import Renderer from './Renderer';
import WebpackConfig from './WebpackConfig';
import ConfigReader from './ConfigReader';
import ConfigValidator from './ConfigValidator';

import decorateContextFactory from './middlewares/decorateContext';
import privateFileFactory from './middlewares/privateFile';
import ssrFactory from './middlewares/ssr';
import errorFactory from './middlewares/error';

import ora from 'ora';

import Koa from 'koa';
import compose from 'koa-compose';
import serve from 'koa-static';

export default class LavasCore {
    constructor(cwd = process.cwd()) {
        this.cwd = cwd;
    }

    async initBeforeBuild() {
        this.config = await ConfigReader.read(this.cwd, this.env);

        ConfigValidator.validate(this.config);

        this.renderer = new Renderer(this);

        this.webpackConfig = new WebpackConfig(this.config, this.env);

        this.routeManager = new RouteManager(this.config, this.env, this.webpackConfig);
    }

    async build(env = 'development') {
        this.env = env || process.env.NODE_ENV;
        this.isProd = this.env === 'production';

        if (!this.isProd) {
            // in production mode we don't need to run server
            this.app = new Koa();
        }
        await this.initBeforeBuild();

        let spinner = ora();
        spinner.start();

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
            // store config which will be used in online server
            // await ConfigReader.write
            // compile multi entries only in production mode
            await this.routeManager.buildMultiEntries();
            // store routes info in routes.json for later use
            await this.routeManager.writeRoutesFile();
        }

        spinner.succeed();
    }

    async runAfterBuild() {
        this.app = new Koa();

        this.config = await ConfigReader.readJson(this.cwd);

        this.renderer = new Renderer(this);

        this.routeManager = new RouteManager(this.config, this.env);

        // create with routes.json
        await this.routeManager.createWithRoutesFile();
        // create with bundle & manifest
        await this.renderer.createWithBundle();
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

    // expressMiddleware() {
    //     let koamid = async (ctx, next) => {
    //         console.log(ctx.path);
    //         await next();
    //     };
    //
    //     return (req, res, next) => {
    //         // this.koaMiddleware()({
    //         //     req,
    //         //     res
    //         // }, next)
    //
    //         next();
    //     };
    // }
}
