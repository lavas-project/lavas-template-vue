/**
 * @file test case for utils/router.js
 * @author panyuqi (pyqiverson@gmail.com)
 */

import {generateRoutes} from '../../lib/utils/router';
import {join, resolve} from 'path';
import test from 'ava';

test('it should generate routes according to the structure of directory', async t => {
    let routes = await generateRoutes(resolve(__dirname, '../fixtures/pages'));

    t.true(routes.length === 2);

    t.deepEqual(routes[0], {
        path: '/detail/:id',
        component: 'pages/detail/_id.vue',
        name: 'detail-id'
    });

    t.deepEqual(routes[1], {
        path: '/',
        component: 'pages/index.vue',
        name: 'index'
    });
});