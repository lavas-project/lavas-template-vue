/**
 * @file store
 * @author wangyisheng(wangyisheng@baidu.com)
 */

'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
/* ======== lavas extensions start ======== */
import {createAppShellState} from 'extensions/appshell/store/module';
/* ======== lavas extensions end ======== */

Vue.use(Vuex);

export function createStore() {
    return new Vuex.Store({
        /* ======== lavas extensions start ======== */
        modules: {
            appshell: createAppShellState()
        }
        /* ======== lavas extensions end ======== */
    });
}
