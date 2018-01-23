<template>
    <div class="detail-wrapper">
        <article class="detail-content">
            <header class="detail-title">
                Detail {{$route.params.id}}
            </header>
            <router-link :to="{
                name: 'detailId',
                params: {
                    id: Number($route.params.id) + 1
                }
            }">Detail {{Number($route.params.id) + 1}}</router-link>
            <p>
            Progressive Web Apps are user experiences that have the reach of the web, and are:
Reliable - Load instantly and never show the downasaur, even in uncertain network conditions.
Fast - Respond quickly to user interactions with silky smooth animations and no janky scrolling.
            </p>
        </article>
    </div>
</template>

<script>
export default {
    name: 'detail-_id',
    metaInfo() {
        return {
            title: `Lavas Sample Detail ${this.$route.params.id}`,
            titleTemplate: '%s - Lavas',
            meta: [
                {name: 'keywords', content: `Lavas Sample Detail`},
                {name: 'description', content: `Lavas Sample Detail ${this.$route.params.id}`}
            ]
        }
    }
};
</script>

<style lang="stylus" scoped>
.detail-content
    font-size 16px
    line-height 30px
    margin-top 30px

    .detail-title
        margin-bottom 20px
        padding 10px 0
        font-size 36px
        font-weight bold

</style>
