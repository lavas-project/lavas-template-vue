'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parse = exports.stringify = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.deepPick = deepPick;

var _superJson = require('super-json');

var _superJson2 = _interopRequireDefault(_superJson);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsonInstance = _superJson2.default.create({
    magic: '#!',
    serializers: [_superJson2.default.dateSerializer, _superJson2.default.regExpSerializer]
});

var stringify = exports.stringify = jsonInstance.stringify;

var parse = exports.parse = jsonInstance.parse;

function deepPick(object, json) {
    if (Array.isArray(json) && Array.isArray(object)) {
        return object.map(function (item) {
            if ((0, _lodash.isObject)(item)) {
                return deepPick(item, json[0]);
            }
            return item;
        });
    }
    var keys = (0, _keys2.default)(json);
    object = (0, _lodash.pick)(object, keys);
    keys.forEach(function (key) {
        if ((0, _lodash.isObject)(json[key])) {
            object[key] = deepPick(object[key], json[key]);
        }
    });
    return object;
}