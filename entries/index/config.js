
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
    }
    // serviceWorker and templatePath if needed
};
