/**
 * @file index.js
 * @author lavas
 */

import Renderer from './renderer';
import ConfigReader from './config-reader';
import Builder from './builder';

import privateFileFactory from './middlewares/privateFile';
import ssrFactory from './middlewares/ssr';
import koaErrorFactory from './middlewares/koaError';
import expressErrorFactory from './middlewares/expressError';

import ora from 'ora';

import {compose} from 'compose-middleware';
import composeKoa from 'koa-compose';
import c2k from 'koa-connect';
import mount from 'koa-mount';
import koaStatic from 'koa-static';
import send from 'koa-send';
import serveStatic from 'serve-static';
import favicon from 'serve-favicon';
import compression from 'compression';

import {join, posix} from 'path';
import EventEmitter from 'events';

import {ASSETS_DIRNAME_IN_DIST} from './constants';

export default class LavasCore extends EventEmitter {
    constructor(cwd = process.cwd()) {
        super();
        this.cwd = cwd;
    }

    /**
     * invoked before build & runAfterBuild, do something different in each senario
     *
     * @param {string} env NODE_ENV
     * @param {boolean} isInBuild is in build process
     */
    async init(env, isInBuild) {
        this.env = env;
        this.isProd = this.env === 'production';
        this.configReader = new ConfigReader(this.cwd, this.env);

        /**
         * in a build process, we need to read config by scan a directory,
         * but for online server after build, we just read config.json directly
         */
        if (isInBuild) {
            // scan directory
            this.config = await this.configReader.read();
        }
        else {
            // read config from config.json
            this.config = await this.configReader.readConfigFile();
        }

        this.internalMiddlewares = [];
        this.renderer = new Renderer(this);
        this.builder = new Builder(this);
    }

    /**
     * build in dev & prod mode
     *
     */
    async build() {
        let spinner = ora();

        spinner.start();
        if (this.isProd) {
            await this.builder.buildProd();
        }
        else {
            this.setupInternalMiddlewares();
            await this.builder.buildDev();
        }
        spinner.succeed(`[Lavas] ${this.env} build completed.`);
    }

    /**
     * setup some internal middlewares
     *
     */
    setupInternalMiddlewares() {
        // gzip compression
        this.internalMiddlewares.push(compression());
        // serve favicon
        let faviconPath = join(this.cwd, 'static/img/icons', 'favicon.ico');
        this.internalMiddlewares.push(favicon(faviconPath));
    }

    /**
     * must run after build in prod mode
     *
     */
    async runAfterBuild() {
        this.setupInternalMiddlewares();
        this.renderer = new Renderer(this);
        // create with bundle & manifest
        await this.renderer.createWithBundle();
    }

    /**
     * compose all the middlewares
     *
     * @return {Function} koa middleware
     */
    koaMiddleware() {
        let {entry, build: {publicPath}, serviceWorker} = this.config;
        let ssrExists = entry.some(e => e.ssr);

        // transform express/connect style middleware to koa style
        let middlewares = [
            koaErrorFactory(this),
            async (ctx, next) => {
                // koa defaults to 404 when it sees that status is unset
                ctx.status = 200;
                await next();
            },
            c2k(privateFileFactory(this)),
            ...this.internalMiddlewares.map(c2k)
        ];

        /**
         * add static files middleware only in prod mode,
         * we already have webpack-dev-middleware in dev mode
         */
        if (this.isProd) {
            // serve /static
            middlewares.push(mount(
                posix.join(publicPath, ASSETS_DIRNAME_IN_DIST),
                koaStatic(join(this.cwd, ASSETS_DIRNAME_IN_DIST))
            ));

            // serve sw-register.js & sw.js
            let swFiles = [
                posix.join(publicPath, serviceWorker.filename),
                posix.join(publicPath, 'sw-register.js')
            ];
            middlewares.push(async (ctx, next) => {
                let done = false;
                if (swFiles.includes(ctx.path)) {
                    // Don't cache service-worker.js & sw-register.js.
                    ctx.set('Cache-Control', 'private, no-cache, no-store');
                    done = await send(ctx, ctx.path, {
                        root: this.cwd
                    });
                }
                if (!done) {
                    await next();
                }
            });
        }
        if (ssrExists) {
            middlewares.push(c2k(ssrFactory(this)));
        }

        return composeKoa(middlewares);
    }

    /**
     * compose all the middlewares
     *
     * @return {Function} express middleware
     */
    expressMiddleware() {
        let {entry, build: {publicPath}, serviceWorker} = this.config;
        let ssrExists = entry.some(e => e.ssr);

        /**
         * add static files middleware only in prod mode,
         * we already have webpack-dev-middleware in dev mode
         */
        if (this.isProd) {
            // serve /static
            this.internalMiddlewares.push(
                serveStatic(join(this.cwd, ASSETS_DIRNAME_IN_DIST))
            );

            // serve sw-register.js & sw.js
            let swFiles = [
                posix.join(publicPath, serviceWorker.filename),
                posix.join(publicPath, 'sw-register.js')
            ];
        }

        return compose([
            privateFileFactory(this),
            ...this.internalMiddlewares,
            ssrExists ? ssrFactory(this) : () => {},
            expressErrorFactory(this)
        ]);
    }

    /**
     * close builder in development mode
     *
     */
    async close() {
        await this.builder.close();
        console.log('[Lavas] lavas closed.');
    }

    /**
     * add flag to req which will be ignored by lavas middlewares
     *
     * @param {Request} req req
     */
    ignore(req) {
        req.lavasIgnoreFlag = true;
    }
}
