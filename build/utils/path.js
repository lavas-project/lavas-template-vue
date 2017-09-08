import {join} from 'path';
import {LAVAS_DIRNAME_IN_DIST} from '../constants';

export function distLavasPath(rootDir, path) {
    return join(rootDir, LAVAS_DIRNAME_IN_DIST, path);
}
