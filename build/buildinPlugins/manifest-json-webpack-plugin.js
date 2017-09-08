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
    this.path = opts.path;
}

/* eslint-disable fecs-camelcase */
ManifestJson.prototype.apply = function (compiler) {

    let manifestContent = JSON.stringify(this.config);

    compiler.plugin('emit', (compilation, callback) => {
        compilation.assets[this.path] = {
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
