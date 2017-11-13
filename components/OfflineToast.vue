<template>
    <transition name="popup">
        <div class="offline-toast" v-show="show">
            <span>{{ text }}</span>
            <span class="offline-toast-close-btn" @click="show = false">
                <i class="iconfont icon-close"></i>
            </span>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'offlineToast',
    props: {
        text: {
            type: String,
            default: '当前处于离线状态'
        }
    },
    data() {
        return {
            show: false
        };
    },
    mounted() {
        this.show = !navigator.onLine;
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);
    },
    beforeDestroy() {
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
    },
    methods: {
        handleOnline() {
            this.show = false;
        },
        handleOffline() {
            this.show = true;
        }
    }
};
</script>

<style lang="stylus" scoped>
$height = 56px
$close-btn-height = 28px

.offline-toast
    position fixed
    left 0
    right 0
    bottom 0
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    background-color #dc322f
    color #ffffff
    font-size 16px
    height $height
    line-height $height
    padding 0 8px
    opacity 1
    transform translateY(0)

    &.popup-enter-active,
    &.popup-leave-active
        transition all .5s ease-in-out

    &.popup-enter,
    &.popup-leave-to
        opacity 0
        transform translateY($height)

    &-close-btn
        width $close-btn-height
        height $close-btn-height
        line-height $close-btn-height
        text-align center
        border-radius $close-btn-height
        background rgba(0, 0, 0, 0.2)
</style>
