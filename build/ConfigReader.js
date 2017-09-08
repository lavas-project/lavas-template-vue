/**
 * @file ConfigReader
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {ensureFile, writeFile} from 'fs-extra';
import {join} from 'path';
import glob from 'glob';
import _ from 'lodash';
import {CONFIG_FILE} from './constants';
import {distLavasPath} from './utils/path';

export default class ConfigReader {
    constructor(cwd, env) {
        this.cwd = cwd;
        this.env = env;
        this.privateFiles = [];
    }

    async read() {
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

    async readConfigFile() {
        return await import(distLavasPath(this.cwd, CONFIG_FILE));
    }

    async writeConfigFile(config) {
        let configFilePath = distLavasPath(config.webpack.base.output.path, CONFIG_FILE);
        this.privateFiles.push(CONFIG_FILE);
        await ensureFile(configFilePath);
        await writeFile(
            configFilePath,
            JSON.stringify(config),
            'utf8'
        );
    }
}
