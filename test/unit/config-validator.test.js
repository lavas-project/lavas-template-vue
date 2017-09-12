/**
 * @file test case for ConfigValidator.js
 * @author panyuqi (pyqiverson@gmail.com)
 */

import {join, resolve} from 'path';
import test from 'ava';
import ConfigValidator from '../../lib/validator';

test('it should throw validation errors when missing some required props', t => {
    let config = {};
    let error = t.throws(() => {
        ConfigValidator.validate(config);
    }, Error);

    t.true(error.message.indexOf('should have required property \'globals\'\n') > -1);

    config = {
        globals: {}
    };
    error = t.throws(() => {
        ConfigValidator.validate(config);
    }, Error);

    t.true(error.message.indexOf('.globals should have required property \'rootDir\'\n') > -1);
});

test('it should throw validation errors when the prop\'s type is invalid', t => {
    let config = {
        globals: {
            rootDir: false
        },
        webpack: {
            base: {
                output: {
                    path: 123
                }
            }
        }
    };
    let error = t.throws(() => {
        ConfigValidator.validate(config);
    }, Error);

    t.true(error.message.indexOf('.globals.rootDir should be string\n') > -1);
});

test('it should pass the validation', t => {
    let config = {
        globals: {
            rootDir: 'xxx'
        }
    };
    t.notThrows(() => {
        ConfigValidator.validate(config);
    });
});
