import {join} from 'path';
import glob from 'glob';
import _ from 'lodash';

export default class ConfigReader {
    static async read(cwd, env) {
        const config = {};
        let configDir = join(cwd, 'config');
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
        if (temp[env]) {
            _.merge(config, temp[env]);
        }

        return config;
    }
}
