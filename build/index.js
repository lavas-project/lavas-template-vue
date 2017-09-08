/**
 * @file index.js
 * @author lavas
 */
import RouteManager from './RouteManager';
import Renderer from './Renderer';
import WebpackConfig from './WebpackConfig';
import ConfigReader from './ConfigReader';
import ConfigValidator from './ConfigValidator';

import privateFileFactory from './middlewares/privateFile';
import ssrFactory from './middlewares/ssr';
// import errorFactory from './middlewares/error';

import ora from 'ora';

import connect from 'connect';
import {compose} from 'compose-middleware';
import composeKoa from 'koa-compose';
import c2k from 'koa-connect';
import serve from 'serve-static';

import {emptyDir, copy} from 'fs-extra';
import {join} from 'path';

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
         * but for online server after build, we just:
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
            this.app = connect();
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
            await this.copyServerModuleToDist();
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

        // transform express/connect style middleware to koa style
        let transformedMiddlewares = this.app.stack.map(m => c2k(m.handle));

        return composeKoa([
            async function (ctx, next) {
                // koa defaults to 404 when it sees that status is unset
                ctx.status = 200;
                await next();
            },
            c2k(privateFileFactory(this)),
            ...transformedMiddlewares,
            c2k(ssrFactory(this))
        ]);
    }

    expressMiddleware() {
        if (this.isProd) {
            // add static middleware
            this.app.use(serve(this.config.webpack.base.output.path));
        }

        // use middlewares directly
        let middlewares = this.app.stack.map(m => m.handle);

        return compose([
            privateFileFactory(this),
            ...middlewares,
            ssrFactory(this)
        ]);
    }

    /**
     * copy server relatived files into dist when build
     */
    async copyServerModuleToDist() {
        let libDir = join(this.cwd, './lib');
        let distLibDir = join(this.cwd, './dist/lib');
        let serverDir = join(this.cwd, './server.dev.js');
        let distServerDir = join(this.cwd, './dist/server.js');
        let nodeModulesDir = join(this.cwd, 'node_modules');
        let distNodeModulesDir = join(this.cwd, './dist/node_modules');
        let jsonDir = join(this.cwd, 'package.json');
        let distJsonDir = join(this.cwd, './dist/package.json');

        await Promise.all([
            copy(libDir, distLibDir),
            copy(serverDir, distServerDir),
            copy(nodeModulesDir, distNodeModulesDir),
            copy(jsonDir, distJsonDir)
        ]);
    }
}
