/**
 * @file middleware
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */
'use strict';

let files = require.context('@/middleware', false, /^\.\/.*\.(js|ts)$/);

export default const middleware = files.keys().reduce((obj, filename) => {
    let name = filename.slice(2, -3);
    let file = files(filename);
    obj[name] = file.default || file;
    return obj;
}, {});

// let filenames = files.keys();
// function getModule(filename) {
//     let file = files(filename);
//     return file.default
//         ? file.default
//         : file;
// }

// export default const middleware = {};
// let middleware = {};

// Generate the middleware
// for (let filename of filenames) {
//     let name = filename.replace(/^\.\//, '').replace(/\.(js|ts)$/, '');
//     middleware[name] = getModule(filename);
// }
// export default middleware;
