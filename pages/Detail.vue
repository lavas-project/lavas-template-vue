<template>
    <div>
        <header>Detail Header</header>
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    name: 'detail'
};
</script>
<style scoped lang='stylus'>
header
    background #ccc
    height 16px
</style>
