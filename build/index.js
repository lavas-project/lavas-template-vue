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

    /**
     * invoked by build & runAfterBuild, do something different in each senario
     *
     * @param {boolean} isInBuild is in build process
     */
    async _init(isInBuild) {
        this.isProd = this.env === 'production';
        this.configReader = new ConfigReader(this.cwd, this.env);

        /**
         * in a build process, we need to:
         * 1. read config by scan a directory
         * 2. validate the config
         * 3. create a webpack config for later use
         *
         * run after build:
         * 1. read config.json directly
         */
        if (isInBuild) {
            // scan directory
            this.config = await this.configReader.read();
            // validate props in config
            ConfigValidator.validate(this.config);
            this.webpackConfig = new WebpackConfig(this.config, this.env);
        }
        else {
            // read config from config.json
            this.config = await this.configReader.readConfigFile(this.cwd);
        }

        // in prod build process we don't need to run a server
        if (!isInBuild || !this.isProd) {
            this.app = new Koa();
        }

        // init renderer & routeManager
        this.renderer = new Renderer(this);
        this.routeManager = new RouteManager(this);
    }

    /**
     * build in dev & prod mode
     *
     * @param {string} env NODE_ENV
     */
    async build(env = 'development') {
        this.env = env || process.env.NODE_ENV;

        await this._init(true);

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
            await this.configReader.writeConfigFile(this.config);
            // compile multi entries only in production mode
            await this.routeManager.buildMultiEntries();
            // store routes info in routes.json for later use
            await this.routeManager.writeRoutesFile();
        }

        spinner.succeed();
    }

    /**
     * must run after build in prod mode
     *
     */
    async runAfterBuild() {
        this.env = 'production';
        await this._init();
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
