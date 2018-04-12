
module.exports = {
    skeleton: {
        enable: true,
        routes: [
            {
                path: '/detail/:id',
                componentPath: 'entries/detail/DetailSkeleton.vue'
            },
            {
                path: '*',
                componentPath: 'entries/detail/Skeleton.vue'
            }
        ]
    },
    templateObject: {
        title: 'This is Detail Page'
    },
    // only support Lv1 dir name
    pages: ['detail', 'info'],

    serviceWorker: {
        swName: 'someName_detail_service_worker.js',
        swRegisterName: 'someName_detail_sw_register.js',
        scope: '/tb/mobile/detail'
    }
};
