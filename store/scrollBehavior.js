export const SET_PAGE_SCROLL_POSITION = 'SET_PAGE_SCROLL_POSITION';

export const state = () => {
    return {
        /**
         * 保存页面滚动位置，以 `route.fullPath` 为键
         * {'/': 0, '/detail/1': 100, '/detail/2': 200}
         *
         * @type {Object}
         */
        scrollPostionMap: {}
    };
};

export const mutations = {
    [SET_PAGE_SCROLL_POSITION](state, {pageId, scrollPosition}) {
        state.scrollPostionMap = {
            ...state.scrollPostionMap,
            [pageId]: scrollPosition
        };
    }
};

export const actions = {
    /**
     * 保存页面滚动位置
     *
     * @param {Function} commit commit
     * @param {Object} payload
     * @param {string} payload.pageId 页面 ID
     * @param {Object} payload.scrollPosition 滚动位置对象 {x:, y:}
     */
    savePageScrollPosition({commit}, {pageId, scrollPosition}) {
        commit(SET_PAGE_SCROLL_POSITION, {pageId, scrollPosition});
    }
};
