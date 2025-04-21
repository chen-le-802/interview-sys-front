<template>
    <HomeView />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import HomeView from '@/views/frontend/HomeView.vue'

export default defineComponent({
    name: 'App',
    components: {
        HomeView
    }
})
</script>
<style scoped></style>
