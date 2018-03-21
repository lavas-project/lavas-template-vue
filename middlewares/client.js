/**
 * @file 示例客户端中间件
 * @author wangyisheng@baidu.com (wangyisheng)
 */

export default function ({store, redirect, route}) {
    console.log('in sample client middleware.', store, route);
}
