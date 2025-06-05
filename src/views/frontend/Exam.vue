<template>
<div style="background-color: #f5f5f5;">
<FrontendHeader></FrontendHeader>
<div class="header">
    <div class="header-box">
    <a-button type="text" style=" font-size: 15px;" @click="router.back"><ArrowLeftOutlined />退出答题</a-button>
    <div class="title">Java 热门面试题 200 道 - 在线测验</div>
    </div>
</div>
<div class="exam-box">
    <TestContent></TestContent>
</div>
</div>
</template>
<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
const router = useRouter();
</script>
<style scoped>
.header{
    width: 100%;
    height: 56px;
    padding: 12px;
    background-color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
   
}
.header .header-box{
    width: 89%;
    height: 56px;
    padding: 12px;
    background-color: #FFFFFF;
    display: flex;
    align-items: center;
    font-size: 16px;
}
.header .title{
    margin: 0 auto;
    font-weight: 600;
}
.exam-box{
    margin: 40px auto;
    width: 1144px;
    background-color: #FFFFFF;
    padding: 12px;
    border-radius: 20px;

}
</style>