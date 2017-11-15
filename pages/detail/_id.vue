<template>
    <div class="detail-wrapper">
        <article class="detail-content text-xs-center">
            <header class="detail-title text-xs-center">
                Detail {{$route.params.id}}
            </header>
            <lavas-link :to="{
                name: 'detailId',
                params: {
                    id: Number($route.params.id) + 1
                }
            }">
                Detail {{Number($route.params.id) + 1}}
            </lavas-link>
            <p>
            Progressive Web Apps are user experiences that have the reach of the web, and are:
Reliable - Load instantly and never show the downasaur, even in uncertain network conditions.
Fast - Respond quickly to user interactions with silky smooth animations and no janky scrolling.
            </p>
            <img src="https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=3956514070,2615060783&fm=58">
            <span style="background-image: url('https://gss0.bdstatic.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/pwa/projects/http:is2.mzstatic.comimagethumbPurple128v4f24f30f24f302c-f3ed-55de-257c-ef85f8a4baecsource175x175bb.jpg_1509448166926.jpg');width: 72px; height: 72px;display: inline-block;background-size:cover"></span>
            <lavas-link to="/">
                Back to home
            </lavas-link>
        </article>
    </div>
</template>

<script>

function setState(store) {}

export default {
    name: 'detail-_id',
    head() {
        return {
            title: `Detail ${this.$route.params.id}`,
            titleTemplate: '%s - Lavas',
            meta: [
                {name: 'keywords', content: `detail ${this.$route.params.id}`},
                {name: 'description', content: `detail ${this.$route.params.id}`}
            ]
        };
    },
    async asyncData({store, route}) {
        setState(store);
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 500);
        });
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
