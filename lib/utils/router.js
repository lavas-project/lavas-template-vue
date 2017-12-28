'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.routes2Reg = routes2Reg;
exports.matchUrl = matchUrl;
exports.generateRoutes = generateRoutes;

var _path = require('path');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function routes2Reg(routes) {
    var reg = void 0;
    if (typeof routes === 'string') {
        reg = (0, _pathToRegexp2.default)(routes);
    } else if (routes instanceof RegExp) {
        return routes;
    }

    return reg;
}

function matchUrl(routes, url) {
    if (Array.isArray(routes)) {
        return routes.some(function (route) {
            return matchUrl(route, url);
        });
    }

    var reg = void 0;
    if (typeof routes === 'string') {
        reg = new RegExp('^' + routes.replace(/\/:[^\/]*/g, '/[^\/]+') + '\/?');
    } else if ((typeof routes === 'undefined' ? 'undefined' : (0, _typeof3.default)(routes)) === 'object' && typeof routes.test === 'function') {
        reg = routes;
    }

    return reg.test(url);
}

function generateRoutes(baseDir) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        globOptions = _ref.globOptions,
        routerOption = _ref.routerOption;

    return getDirs(baseDir, '.vue', globOptions).then(function (dirs) {
        var tree = mapDirsInfo(dirs, baseDir).reduce(function (tree, info) {
            return appendToTree(tree, info.levels, info);
        }, []);
        return treeToRouter(tree[0].children, { dir: (0, _path.basename)(baseDir) }, routerOption);
    });
}

function getDirs(baseDir) {
    var ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var options = arguments[2];

    return new _promise2.default(function (res, reject) {
        (0, _glob2.default)((0, _path.resolve)(baseDir, '**/*' + ext), options, function (err, dirs) {
            if (err) {
                reject(err);
            } else {
                var set = dirs.reduce(function (set, dir) {
                    return set.add(dir).add((0, _path.dirname)(dir));
                }, new _set2.default());
                res((0, _from2.default)(set));
            }
        });
    });
}

function mapDirsInfo(dirs, baseDir) {
    var baseFolder = (0, _path.basename)(baseDir);

    var infos = dirs.reduce(function (list, dir) {
        var type = void 0;

        if ((0, _path.extname)(dir) === '.vue') {
            var regex = new RegExp('^' + dir.slice(0, -4) + '$', 'i');

            if (dirs.some(function (d) {
                return regex.test(d);
            })) {
                type = 'nested';
            }
        } else {
            var _regex = new RegExp('^' + dir + '.vue$', 'i');

            if (dirs.some(function (d) {
                return _regex.test(d);
            })) {
                return list;
            }

            type = 'flat';
        }

        dir = baseFolder + dir.slice(baseDir.length).replace(/\.vue$/, '');
        var levels = dir.split('/');

        list.push({
            dir: dir,
            type: type,
            levels: levels
        });

        return list;
    }, []).sort(function (a, b) {
        return a.dir.localeCompare(b.dir);
    });

    return infos;
}

function appendToTree(tree, levels, info) {
    var levelLen = levels.length;
    var node = tree;

    for (var i = 0; i < levelLen; i++) {
        var nodeLen = node.length;
        var regex = new RegExp('^' + levels[i] + '$', 'i');
        var j = void 0;

        for (j = 0; j < nodeLen; j++) {
            if (regex.test(node[j].name)) {
                if (i === levelLen - 1) {
                    node[j].info = info;
                } else {
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
            } else {
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
    var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref2$pathRule = _ref2.pathRule,
        pathRule = _ref2$pathRule === undefined ? 'kebabCase' : _ref2$pathRule;

    var rr = tree.reduce(function (router, _ref3) {
        var info = _ref3.info,
            children = _ref3.children;

        if (info.type === 'flat') {
            return router.concat(treeToRouter(children, parent, { pathRule: pathRule }));
        }

        var route = {
            path: generatePath(info, parent, pathRule),
            component: info.dir + '.vue'
        };

        if (!children || children.every(function (child) {
            return !/(\/index)+$/i.test(child.info.dir);
        })) {
            route.name = generateName(info.dir);
        }

        if (children) {
            route.children = treeToRouter(children, info, { pathRule: pathRule });
        }

        router.push(route);
        return router;
    }, []);

    return rr;
}

function generatePath(info, parent, rule) {
    var path = info.dir.slice(parent.dir.length).replace(/_/g, ':').replace(/((^|\/)index)+$/i, '');

    switch (rule) {
        case 'raw':
            break;

        case 'camelCase':
            path = path.replace(/(^|\/)([A-Z]+)/g, function (full, w1, w2) {
                return '' + w1 + w2.toLowerCase();
            });

        case 'lowerCase':
            path = path.replace(/(^|\/)([^:\/]+)/g, function (full, w1, w2) {
                return full.toLowerCase();
            });

        default:
            path = path.replace(/(^|\/)([^:\/]+)/g, function (full, w1, w2) {
                return w1 + w2.replace(/([a-z0-9])([A-Z]+)/g, '$1-$2').toLowerCase();
            });
    }

    if (parent.type === 'nested') {
        path = path.replace(/^\//, '');
    } else if (path === '') {
        path = '/';
    }

    return path;
}

function generateName(dir) {
    var name = dir.replace(/((^|\/)index)+$/i, '').split('/').slice(1).map(function (name, i) {
        name = name.replace(/_/g, '');

        if (i === 0) {
            return name.replace(/^[A-Z]+/, function (w) {
                return w.toLowerCase();
            });
        }

        return name.replace(/^[a-z]/, function (w) {
            return w.toUpperCase();
        });
    }).join('');

    return name || 'index';
}