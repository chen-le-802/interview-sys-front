<template>
    <div class="container">
        <FrontendHeader></FrontendHeader>
        <QuestionBank></QuestionBank>
        <div style="width: 1200px; margin: 20px auto;">
            <h2 style="margin-bottom: 20px;">面试题目</h2>
        </div>

        <div style="display: flex;width:1200px;margin: 0 auto;justify-content: space-between;margin-top: 30px;">
            <HomeTable :table-width="900" />
            <div>
                <RankList  :listTitle="'热门题目榜'"></RankList>
                <UserRankList></UserRankList>
                <RankList :listTitle="'热门标签'"></RankList>

            </div>
        </div>
        <Footer></Footer>
    </div>

    <el-backtop :bottom="200">
        <div style="
        height: 100%;
        width: 100%;
        background-color: var(--el-bg-color-overlay);
        box-shadow: var(--el-box-shadow-lighter);
        text-align: center;
        line-height: 40px;
        color: #1989fa;
      ">
            <el-icon>
                <CaretTop />
            </el-icon>
        </div>
    </el-backtop>

</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CaretTop } from '@element-plus/icons-vue'
import FrontendHeader from '@/components/layout/FrontendHeader.vue'
import QuestionBank from '@/components/shared/QuestionBank.vue'
import HomeTable from '@/components/shared/HomeTable.vue'
import RankList from '@/components/shared/RankList.vue'
import UserRankList from '@/components/shared/UserRankList.vue'
import Footer from '@/components/layout/Footer.vue'


</script>


<style scoped>
header {
    width: 100%;
    height: 56px;
    line-height: 56px;
    background-color: #ffffff;
    border-bottom: 1px solid #f1efef;
}

.header-main {
    display: flex;
    width: 1440px;
    max-width: 1440px;
    margin: 0 auto;
    height: 56px;
    background-color: aquamarine;
}

.container {
    width: 100%;
    background-color: #f5f5f5;
}
</style>