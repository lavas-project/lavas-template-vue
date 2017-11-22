<template>
    <header>Detail Header</header>
</template>

<script>
export default {
    name: 'appshell-detail',
    head: {
        title: 'Detail',
        titleTemplate: '%s - Lavas',
        meta: [
            {name: 'keywords', content: 'lavas PWA'},
            {name: 'description', content: '基于 Vue 的 PWA 解决方案，帮助开发者快速搭建 PWA 应用，解决接入 PWA 的各种问题'}
        ],
        bodyAttrs: {
            'empty-appshell': undefined
        }
    }
};
</script>
<style scoped lang='stylus'>
header
    background #ccc
    height 16px
</style>
