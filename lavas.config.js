/**
 * @file 项目的 Lavas 配置文件
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {
    dev: (process.env.NODE_ENV !== 'production'),
    env: {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    }
    // 暂时先放两个。。
};
