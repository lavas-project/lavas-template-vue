/**
 * @file 工具包
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const fs = require('fs');
const config = require('./config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

exports.assetsPath = function (newPath) {
    return path.posix.join(config.webpack.output.assetsDir, newPath);
};

exports.cssLoaders = function (options = {}) {

    let cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: process.env.NODE_ENV === 'production',
            sourceMap: options.sourceMap
        }
    };

    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions) {
        let loaders = [cssLoader];

        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            });
        }

        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (options.extract) {
            return ExtractTextPlugin.extract({
                use: loaders,
                fallback: 'vue-style-loader'
            });
        }

        return ['vue-style-loader', ...loaders];
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', {
            indentedSyntax: true
        }),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    };
};

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
    let output = [];
    let loaders = exports.cssLoaders(options);

    Object.keys(loaders).forEach(function (extension) {
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loaders[extension]
        });
    });

    return output;
};

/**
 * generate router by the structure of pages/
 *
 * @param {Object=} options options of generate
 * @param {string} options.baseDir root folder, default value is path.resolve(__dirname, '../pages')
 * @return {Array} router tree
 */
exports.generateRouter = function (options = {}) {

    let baseDir = options.baseDir || path.resolve(__dirname, '../pages');
    let parentFolders = options.folders || [path.basename(baseDir)];
    let foldersWithoutBase = parentFolders.slice(1);
    let relativeFolders;

    if (options.rootRouteFolders) {
        relativeFolders = parentFolders.slice(options.rootRouteFolders.length);
    }
    else {
        relativeFolders = foldersWithoutBase;
    }

    let parentDir = path.resolve(baseDir, ...foldersWithoutBase);

    return fs.readdirSync(parentDir)
        .reduce((res, dirname) => {
            let currentFolders = [...parentFolders, dirname];
            let currentDir = path.resolve(parentDir, dirname);
            let filename = path.basename(dirname, '.vue');
            // replace "_" with ":" in route path
            let pathSegment = filename.replace(/^_/, ':');

            let currentPath;

            if (options.rootRouteFolders) {
                currentPath = [...relativeFolders, pathSegment];
            }
            else {
                currentPath = ['', ...relativeFolders, pathSegment];
            }

            currentPath = currentPath
                .join('/')
                .replace(/\/?index$/, '');

            if (!options.rootRouteFolders) {
                currentPath = currentPath || '/';
            }

            let info = {
                path: currentPath,
                component: currentFolders.join('/')
            };

            let stat = fs.statSync(currentDir);
            if (stat.isDirectory()) {
                let vueFile = path.resolve(parentDir, dirname + '.vue');
                if (fs.existsSync(vueFile)) {
                    info.children = exports.generateRouter({
                        baseDir: baseDir,
                        folders: currentFolders,
                        rootRouteFolders: currentFolders
                    });
                    info.component = info.component + '.vue';
                }
                else {
                    let children = exports.generateRouter({
                        baseDir: baseDir,
                        folders: currentFolders,
                        rootRouteFolders: options.rootRouteFolders
                    });

                    return res.concat(children);
                }
            }
            else {
                info.name = [...foldersWithoutBase, filename]
                    .join('-')
                    .replace(/-?index$/, '')
                    || 'index';
            }

            return res.concat(info);
        }, [])
        .filter((route, i, arr) => route.children || arr.every(function (item) {
            return !item.children || item.component !== route.component;
        }));
};
