/**
 * @file store
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
import {createAppShellState} from 'extensions/appshell/store/module';

Vue.use(Vuex);

export function createStore() {
    return new Vuex.Store({
        modules: {
            appshell: createAppShellState()
        }
    });
}
