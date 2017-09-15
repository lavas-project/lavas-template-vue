/**
 * @file utils.path.js
 * @author lavas
 */
import {join} from 'path';
import {LAVAS_DIRNAME_IN_DIST} from '../constants';

/**
 * concat with lavas dir
 *
 * @param {string} rootDir rootDir
 * @param {string} path path
 * @return {string} resolved path
 */
export function distLavasPath(rootDir, entryName='', path) {
    return join(rootDir, LAVAS_DIRNAME_IN_DIST, entryName, path);
}

/**
 * resolve path with webpack alias
 *
 * @param {Object} alias alias object
 * @param {string} path path starts with alias
 * @return {string} resolved path
 */
export function resolveAliasPath(alias, path) {
    let matchedAliasKey = Object.keys(alias).find(aliasKey => path.startsWith(aliasKey));
    return matchedAliasKey ?
        join(alias[matchedAliasKey], path.substring(matchedAliasKey.length)) : path;
}
