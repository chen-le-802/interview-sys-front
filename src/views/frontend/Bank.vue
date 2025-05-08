<template>
    <div class="container">
        <FrontendHeader />
        <Bank></Bank>
    </div>
</template>
<script setup lang="ts">
import Bank from '@/components/shared/Bank.vue'
</script>
<style lang="css" scoped>
.container {
    width: 100%;
    height: 100vh;
    background-color: #f5f5f5;
}
</style>