
module.exports = {
    skeleton: {
        enable: true,
        routes: [
            {
                path: '*',
                componentPath: 'entries/index/Skeleton.vue'
            }
        ]
    },
    templateObject: {
        title: 'This is Index Page'
    },
    // serviceWorker and templatePath if needed
    serviceWorker: {
        swName: 'someName_index_service_worker.js',
        swRegisterName: 'someName_index_sw_register.js',
        scope: '/tb/mobile/'
    }
};
