<template>
    <div class="container">
        <FrontendHeader />
        <Bank :bankId="bankId"></Bank>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Bank from '@/components/shared/Bank.vue';

const route = useRoute();

// 从路由参数中获取题库ID
const bankId = computed(() => {
    return route.params.id as string;
});
</script>
<style lang="css" scoped>
.container {
    width: 100%;
    height: 100vh;
    background-color: #f5f5f5;
}
</style>