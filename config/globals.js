/**
 * @file globals config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');

module.exports = {

    /**
     * root directory of this project
     *
     * @type {string}
     */
    rootDir: path.join(__dirname, '..'),

    /**
     * the directory where the middlewares located
     *
     * @type {string}
     */
    middlewareDir: path.join(__dirname, '../middlewares')

};
