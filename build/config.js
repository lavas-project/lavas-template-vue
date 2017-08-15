/**
 * @file config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const glob = require('glob');
const _ = require('lodash');

/**
 * exported config
 *
 * @type {Object}
 */
const config = {};

/**
 * all files in config directory
 *
 * @type {Array.<string>}
 */
let files = glob.sync(
    '**/*.js', {
        cwd: path.join(process.cwd(), 'config')
    }
);


// require all files and assign them to config recursively
files.forEach(filepath => {
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
    let obj = require(path.join(__dirname, '../config', filepath));

    cur[name] = obj;
});

let env = process.env.NODE_ENV;
let temp = config.env || {};

// merge config according env
if (temp[env]) {
    _.merge(config, temp[env]);
}

module.exports = config;
