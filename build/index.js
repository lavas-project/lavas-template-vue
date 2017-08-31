/**
 * @file index.js
 * @author lavas
 */
import RouteManager from './RouteManager';
import Renderer from './Renderer';
import WebpackConfig from './WebpackConfig';
import ConfigValidator from './ConfigValidator';
import serve from 'koa-static';
import {join} from 'path';
import glob from 'glob';
import _ from 'lodash';

export default class LavasCore {
    constructor(cwd = process.cwd(), app) {
        this.cwd = cwd;
        this.app = app;
    }

    async init(env = 'development') {
        this.env = env || process.env.NODE_ENV;

        this.config = await this.loadConfig();

        ConfigValidator.validate(this.config);

        this.webpackConfig = new WebpackConfig(this.config, this.env);

        this.routeManager = new RouteManager(this.config, this.env, this.webpackConfig);

        this.renderer = new Renderer(this);

        this.setupMiddlewares();
    }

    async loadConfig() {
        const config = {};
        let configDir = join(this.cwd, 'config');
        let files = glob.sync(
            '**/*.js', {
                cwd: configDir,
                ignore: '*.recommend.js'
            }
        );

        // require all files and assign them to config recursively
        await Promise.all(files.map(async filepath => {
            filepath = filepath.substring(0, filepath.length - 3);

            let paths = filepath.split('/');

            let name;
            let cur = config;
            for (let i = 0; i < paths.length - 1; i++) {
                name = paths[i];
                if (!cur[name]) {
                    cur[name] = {};
                }

                cur = cur[name];
            }

            name = paths.pop();

            // load config
            cur[name] = await import(join(configDir, filepath));
        }));

        let temp = config.env || {};

        // merge config according env
        if (temp[this.env]) {
            _.merge(config, temp[this.env]);
        }

        return config;
    }

    async build() {
        await this.routeManager.autoCompileRoutes();

        let clientConfig = this.webpackConfig.client(this.config);
        let serverConfig = this.webpackConfig.server(this.config);

        // execute extensions
        this.config.extensions.forEach(({name, init}) => {
            console.log(`[Lavas] ${name} extension is running...`);

            if (init && typeof init === 'function') {
                init.call(null, {
                    client: clientConfig,
                    server: serverConfig
                });
            }
        });

        await this.renderer.init(clientConfig, serverConfig);

        // compile multi entries in production mode
        if (this.env === 'production') {
            await this.routeManager.compileMultiEntries();
        }
    }

    setupMiddlewares() {
        if (this.app) {
            this.app.use(serve(this.config.webpack.base.output.path));
        }
    }

    async koaMiddleware(ctx, next) {

        if (this.routeManager.shouldPrerender(ctx.path)) {
            ctx.body = await this.routeManager.prerender(ctx.path);
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
