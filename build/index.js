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
import serve from 'serve-static';
import favicon from 'serve-favicon';
import compression from 'compression';

import {join} from 'path';
import EventEmitter from 'events';

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
        if (this.isProd) {
            /**
             * add static files middleware only in prod mode,
             * we already have webpack-dev-middleware in dev mode
             */
            this.internalMiddlewares.push(serve(this.cwd));
        }
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
        let ssrExists = this.config.entry.some(e => e.ssr);
        // transform express/connect style middleware to koa style
        return composeKoa([
            koaErrorFactory(this),
            async (ctx, next) => {
                // koa defaults to 404 when it sees that status is unset
                ctx.status = 200;
                await next();
            },
            c2k(privateFileFactory(this)),
            ...this.internalMiddlewares.map(c2k),
            ssrExists ? c2k(ssrFactory(this)) : () => {}
        ]);
    }

    /**
     * compose all the middlewares
     *
     * @return {Function} express middleware
     */
    expressMiddleware() {
        let ssrExists = this.config.entry.some(e => e.ssr);
        return compose([
            privateFileFactory(this),
            ...this.internalMiddlewares,
            ssrExists ? ssrFactory(this) : () => {},
            expressErrorFactory(this)
        ]);
    }

    async close() {
        await this.builder.close();
        console.log('[Lavas] lavas closed.');
    }
}
