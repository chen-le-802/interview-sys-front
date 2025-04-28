<template>
    <div class="containner">
        <h2 style="margin-top: 40px;margin-bottom: 20px;">面试题库</h2>
        <div class="bank-nav">
            <div class="nav-left">
                <div style="display: flex;flex-direction:column;align-items: center;">
                    <div class="bank-start button" @click="handleStartPractice"></div>
                    <div>开刷</div>
                </div>
                <div style="display: flex;flex-direction:column;align-items: center;">
                    <div class="bank-hot" @click="handleHotClick"></div>
                    <div>热门</div>
                </div>
            </div>
            <el-divider direction="vertical" style="margin: 0 10px;"></el-divider>
            <div class="nav-right">
                <ul>
                    <li v-for="(category, index) in categories" :key="index" @click="handleCategoryClick(category)"
                        :class="{ active: activeCategory === category }">
                        {{ category || placeholder }}
                    </li>
                </ul>
            </div>
        </div>
        <div style="width: 1214px;">
            <BankList></BankList>
        </div>
        <el-button type="primary" color="#3b62f6" style="display: block;margin:0px auto;">查看更多题库</el-button>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// Mock数据
const categories = ref([
    '热门', '后端', '计算机网络', '操作系统',
    '数据库', '前端', '算法', '全部', '面试经验',
    '面试技巧', '面试心得', '面试题库', '面试模板'
])



// 交互状态
const activeCategory = ref('热门')
const placeholder = '分类'


// 事件处理
const handleCategoryClick = (category: string) => {
    if (!category) return
    activeCategory.value = category
    console.log('当前分类：', category)

}

const handleStartPractice = () => {
    console.log('开始刷题')
}

const handleHotClick = () => {
    activeCategory.value = '热门'
    console.log('查看热门题目')
}


</script>

<style scoped>
/* 保持原有样式完全不变 */
.containner {
    width: 1200px;
    margin: 0 auto;
}

.bank-nav {
    display: flex;
    width: 100%;
    height: 164px;
    border-radius: 10px;
    background: linear-gradient(to bottom, #a2a9f3, #d0e8f7);
    font-size: 12px;
    align-items: center;
}

.nav-left {
    display: flex;
    flex: 1;
    justify-content: space-around;
    align-items: center;

}

.nav-right {
    display: flex;
    align-items: center;
    flex: 8;
}

.nav-right ul {
    width: 100%;
    height: 140px;
}

.nav-right ul li {
    display: block;
    width: 9%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background-color: rgb(255, 255, 255);
    float: left;
    margin: 8px 5px;
    border-radius: 130px;
}

.nav-right ul li:hover {
    cursor: pointer;
}

.bank-nav .nav-left .bank-start {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: url('../../assets/images/frontend/bank-start.png');
    background-color: aliceblue;
    background-size: cover;
    margin-bottom: 5px;
    cursor: pointer;
}

.bank-nav .nav-left .bank-hot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: url('../../assets/images/frontend/hot.svg');
    background-size: contain;
    margin-bottom: 5px;
    cursor: pointer;
}



/* 仅新增active样式 */
.nav-right ul li.active {
    background-color: #3760f7;
    color: white;
}
</style>