/**
 * @file ConfigReader
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {readFile} from 'fs-extra';
import {join} from 'path';
import glob from 'glob';
import _ from 'lodash';
import {CONFIG_FILE} from './constants';
import {distLavasPath} from './utils/path';
import * as JsonUtil from './utils/json';

const DEFAULT_CONFIG = {
    build: {
        publicPath: '/',
        filenames: {
            entry: 'js/[name].[chunkhash:8].js',
            vendor: 'js/vendor.[chunkhash:8].js',
            vue: 'js/vue.[chunkhash:8].js',
            chunk: 'js/[name].[chunkhash:8].js',
            css: 'css/[name].[contenthash:8].css',
            img: 'img/[name].[hash:8].[ext]',
            fonts: 'fonts/[name].[hash:8].[ext]'
        },
        cssExtract: false,
        cssMinimize: true,
        cssSourceMap: true,
        jsSourceMap: true,
        bundleAnalyzerReport: false,
        defines: {
            base: {},
            client: {},
            server: {}
        },
        alias: {
            base: {},
            client: {},
            server: {}
        },
        plugins: {
            base: [],
            client: [],
            server: []
        },
        nodeExternalsWhitelist: [],
        watch: null,
        extend: null,
        ssrCopy: []
    },
    entry: [],
    production: {
        build: {
            cssExtract: true
        }
    },
    development: {
        build: {
            filenames: {
                entry: 'js/[name].[hash:8].js'
            }
        }
    }
};

export default class ConfigReader {
    constructor(cwd, env) {
        this.cwd = cwd;
        this.env = env;
    }

    /**
     * generate a config object according to config directory and NODE_ENV
     *
     * @return {Object} config
     */
    async read() {
        // add buildVersion
        const config = {
            globals: {
                rootDir: this.cwd
            },
            buildVersion: Date.now()
        };

        // merge with default options
        _.merge(config, DEFAULT_CONFIG);

        if (config[this.env]) {
            _.merge(config, config[this.env]);
        }

        let configDir = join(this.cwd, 'config');
        let files = glob.sync(
            '**/*.js', {
                cwd: configDir
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

            // load config, delete cache first
            let configPath = join(configDir, filepath);
            delete require.cache[require.resolve(configPath)];
            let exportContent = await import(configPath);
            cur[name] = typeof exportContent === 'object' && exportContent !== null
                ? _.merge(cur[name], exportContent) : exportContent;
        }));

        let temp = config.env || {};

        // merge config according env
        if (temp[this.env]) {
            _.merge(config, temp[this.env]);
        }

        return config;
    }

    /**
     * in prod mode, read config.json directly instead of analysing config directory
     *
     * @return {Object} config
     */
    async readConfigFile() {
        return JsonUtil.parse(await readFile(distLavasPath(this.cwd, CONFIG_FILE), 'utf8'));
    }
}
