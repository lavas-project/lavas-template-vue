/**
 * @file store
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
/* ======== lavas extensions start ======== */
import {createAppShellState} from 'extensions/appShell/store/module';
/* ======== lavas extensions end ======== */

Vue.use(Vuex);

export function createStore() {
    return new Vuex.Store({
        /* ======== lavas extensions start ======== */
        modules: {
            appShell: createAppShellState()
        }
        /* ======== lavas extensions end ======== */
    });
}
