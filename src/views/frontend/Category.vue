<template>
    <div style="background-color:#f5f5f5">
        <FrontendHeader></FrontendHeader>
        <div class="containner">
            <div class="left">
                <div class="title-box">
                    <div class="bank-logo"></div>
                    <div class="bank-info">
                        <div class="bank-name">热门面试题库</div>
                        <div class="bank-desc">
                            本专题汇集了当前最受关注和讨论最多的技术话题与面试题，涵盖后端、前端、算法、数据库等多个技术方向的经典题目。通过这些热门面试题的练习，你可以深入了解当前行业的技术趋势，掌握最受欢迎的技术技能，显著提升在求职面试中的竞争力，轻松获取理想职位。
                        </div>
                        <div class="options">
                            <el-button type="primary" size="default" color="#1677ff" round>开始刷题</el-button>
                            <el-button type="default" size="default" round>
                                <el-icon style="margin-right: 5px;">
                                    <Share />
                                </el-icon>分享</el-button>
                        </div>
                    </div>
                </div>
                <div style="width: 920px;">
                    <BankList></BankList>
                </div>
            </div>
            <div class="right">
                <RankList :listTitle="'热门题目榜'"></RankList>
            </div>
        </div>
        <Footer></Footer>
    </div>
</template>
<script setup lang="ts">
import { Share } from '@element-plus/icons-vue';
// Mock数据


</script>
<style scoped>
.containner {
    display: flex;
    align-items: flex-start;
    width: 1200px;
    margin: 32px auto;

}

.title-box {
    display: flex;
    align-items: center;
    width: 895px;
    height: 249px;

    background-color: #fff;
    border-radius: 8px;
    padding: 24px
}

.title-box .bank-logo {
    width: 100px;
    height: 100px;
    background-color: antiquewhite;
    background: url(../../assets/images/frontend/hot.webp) no-repeat center center;
    background-size: contain;
}

.title-box .bank-info {
    margin-left: 30px;
    height: 179px;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;

}

.title-box .bank-info .bank-name {
    height: 40px;
    font-size: 30px;
    font-weight: bold;
}

.title-box .bank-info .options {
    display: flex;
    align-items: center;
    height: 24px;
}

.table-box {
    width: 1141px;
    margin: 0 auto;
}
</style>