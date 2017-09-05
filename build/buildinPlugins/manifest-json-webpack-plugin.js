/**
 * @file Lavas 内置的 manifest.json 生成的 webpack 插件
 * @author mj(zoumiaojiang@gmail.com)
 */

const MANIFEST_ASSET_NAME = 'static/manifest.json';

/**
 * Manifest Webpack plugin
 *
 * @constructor
 *
 * @param {Object} opts 插件配置
 */
function ManifestJson(opts) {
    this.config = opts.config;
}

/* eslint-disable fecs-camelcase */
ManifestJson.prototype.apply = function (compiler) {

    let conf = this.config || {};
    let manifestContent = JSON.stringify(conf);

    compiler.plugin('emit', (compilation, callback) => {
        compilation.assets[MANIFEST_ASSET_NAME] = {
            source() {
                return manifestContent;
            },

            size() {
                return manifestContent.length;
            }
        };
        callback();
    });
};


module.exports = ManifestJson;
