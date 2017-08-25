/**
 * @file 工具包
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const config = require('./config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const glob = require('glob');

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
        stylus: generateLoaders('stylus', {
            'import': '~extensions/appShell/styles/variables.styl'
        }),
        styl: generateLoaders('stylus', {
            'import': '~extensions/appShell/styles/variables.styl'
        })
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
 * @param {string} baseDir root folder path
 * @return {Promise} resolve generated router, reject error
 */
exports.generateRouter = function (baseDir) {
    return getDirs(baseDir, '.vue')
        .then(dirs => {
            let tree = mapDirsInfo(dirs, baseDir)
                .reduce((tree, info) => appendToTree(tree, info.level, info), []);
            return treeToRouter(tree[0].children, {dir: baseDir});
        });
};

function getDirs(baseDir, ext = '') {
    return new Promise((resolve, reject) => {
        glob(path.resolve(baseDir, '**/*' + ext), (err, dirs) => {
            if (err) {
                reject(err);
            }
            else {
                let set = dirs.reduce((set, dir) => {
                    set.add(dir);
                    set.add(path.dirname(dir));
                    return set;
                }, new Set());
                resolve(Array.from(set));
            }
        });
    });
}

function mapDirsInfo(dirs, baseDir) {
    let baseFolder = path.basename(baseDir);

    return dirs.map(dir => {
        let info = {
            dir: dir,
            level: generateDirLevel(dir, {baseDir, baseFolder}),
            type: isFolder(dir, dirs) ? 'folder' : 'file'
        };

        if (info.type === 'folder' && dirs.indexOf(dir + '.vue') > -1) {
            info.nested = true;
        }

        return info;
    })
    .filter(({type, dir}) => {
        if (type === 'folder') {
            return true;
        }

        if (dir.slice(-4) === '.vue' && dirs.indexOf(dir.slice(0, -4)) === -1) {
            return true;
        }

        return false;
    })
    .sort((a, b) => a.level.length - b.level.length);
}

function generateDirLevel(dir, {baseDir, baseFolder = path.basename(baseDir)}) {
    return [baseFolder]
        .concat(dir.slice(baseDir.length).split('/'))
        .filter(str => str !== '');
}

function isFolder(dir, dirs) {
    dir = dir.replace(/\/$/, '') + '/';
    return dirs.some(fileDir => fileDir.indexOf(dir) === 0);
}

function appendToTree(tree, levels, info) {
    let levelLen = levels.length;
    let node = tree;

    for (let i = 0; i < levelLen; i++) {
        let nodeLen = node.length;
        let j;

        for (j = 0; j < nodeLen; j++) {
            if (node[j].name === levels[i]) {
                if (i === levelLen - 1) {
                    node[j].info = info;
                }
                else {
                    node[j].children = node[j].children || [];
                    node = node[j].children;
                }

                break;
            }
        }

        if (j === nodeLen) {
            if (i === levelLen - 1) {
                node.push({
                    name: levels[i],
                    info: info
                });
            }
            else {
                node.push({
                    name: levels[i],
                    children: []
                });
                node = node[j].children;
            }
        }
    }

    return tree;
}

function treeToRouter(tree, parent) {
    return tree.reduce((router, {info, children}) => {
        if (info.type === 'folder' && !info.nested) {
            return router.concat(treeToRouter(children, parent));
        }

        let route = {
            path: info.dir.slice(parent.dir.length)
                .replace(/_/g, ':')
                .replace(/(\/?index)?\.vue$/, ''),
            component: info.level.join('/')
        };

        if (parent.nested) {
            route.path = route.path.replace(/^\//, '');
        }
        else if (route.path === '') {
            route.path = '/';
        }

        if (children) {
            route.component += '.vue';
            route.children = treeToRouter(children, info);
        }
        else {
            route.name = info.level.slice(1).join('-')
                .replace(/_/g, '')
                .replace(/(-index)?\.vue$/, '');
        }

        router.push(route);
        return router;
    }, []);
}
