/**
 * @file development config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    build: {
        filenames: {
            entry: 'js/[name].[hash:8].js'
        },
        cssExtract: false
    }

};
