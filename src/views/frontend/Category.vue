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
                <RankList :questions="questions" :listTitle="'热门题目榜'"></RankList>
            </div>
        </div>
        <Footer></Footer>
    </div>
</template>
<script setup lang="ts">
import { Share } from '@element-plus/icons-vue';
// Mock数据
const questions = ref([
    { title: '你认为Java的优势是什么?', heat: 52140 },
    { title: 'Java中的序列化和反序列化...', heat: 47358 },
    { title: '什么是Java的多态特性?', heat: 36373 },
    { title: 'MySQL中的数据排序是怎么...', heat: 33784 },
    { title: '什么是Java中的不可变类?', heat: 33551 },
    { title: '说说Java中HashMap的原...', heat: 32892 },
    { title: 'Java中的参数传递是按值还...', heat: 29074 },
    { title: '详细描述一条SQL语句在...', heat: 29044 },
    { title: 'Java中Exception和Error有...', heat: 28783 },
    { title: 'Java中有哪些集合类?请简..', heat: 27068 }
])

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