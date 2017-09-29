<template>
    <div>
        <p>{{ message }}</p>
    </div>
</template>
<script>
export default {
    name: 'error',
    computed: {
        message () {
            return this.$route.params.message || 'Oops! Something is not quite right o(╥﹏╥)o'
        }
    }
};
</script>
