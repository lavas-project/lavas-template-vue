/**
 * @file appShell/common module
 * @author lavas
 */

export const SET_PAGE_SWITCHING = 'SET_PAGE_SWITCHING';

export const state = () => {
    return {
        /**
         * 多个页面是否处于切换中
         *
         * @type {boolean}
         */
        isPageSwitching: false
    };
};

export const mutations = {
    [SET_PAGE_SWITCHING](state, isPageSwitching) {
        state.isPageSwitching = isPageSwitching;
    }
};

export const actions = {

    /**
     * 设置页面是否处于切换中
     *
     * @param {Function} commit commit
     * @param {boolean} isPageSwitching isPageSwitching
     */
    setPageSwitching({commit}, isPageSwitching) {
        commit(SET_PAGE_SWITCHING, isPageSwitching);
    }
};
