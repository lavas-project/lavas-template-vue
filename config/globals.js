/**
 * @file globals config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');

module.exports = {

    /**
     * project root directory
     *
     * @type {string}
     */
    rootDir: path.join(__dirname, '../..'),

    /**
     * source code directory
     *
     * @type {string}
     */
    srcDir: path.join(__dirname, '../..'),

};
