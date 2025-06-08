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
                    <li v-for="(category, index) in categories" :key="index" 
                        @click="handleCategoryClick(category)"
                        :class="{ active: activeCategory === category }">
                        {{ category }}
                    </li>
                </ul>
            </div>
        </div>
        <div style="width: 1214px;">
            <BankList :selectedCategory="selectedCategory"></BankList>
        </div>
        <el-button type="primary" color="#3b62f6" style="display: block;margin:0px auto;"
            @click="gotoCategory">查看更多题库</el-button>
    </div>
</template>

<script lang="ts" setup>
import router from '@/router'
import { ref, computed } from 'vue'
import BankList from '@/components/shared/bankList.vue'

// 固定的分类列表 TODO 待后端完成题库分类逻辑实现
const categories = ref<string[]>([
    '热门', '后端开发', '前端开发',
    '移动开发', '游戏开发','算法题库', '数据库技术',
    '计算机网络', '操作系统','计算机基础', '系统设计',
    '分布式系统', '微服务架构','大数据技术', '人工智能', 
    '机器学习', '云计算','DevOps运维', '测试技术',
    '项目经验', '面试经验','真实面经', '其他技术','全部',
])

const activeCategory = ref('热门')

// 计算属性：传递给BankList的选中分类
const selectedCategory = computed(() => {
    if (activeCategory.value === '热门') {
        return 'hot'
    } else if (activeCategory.value === '全部') {
        return 'all'
    } else {
        return activeCategory.value
    }
})

// 事件处理
const handleCategoryClick = (category: string) => {
    if (!category) return
    
    activeCategory.value = category
    console.log('当前分类：', category, '映射为:', selectedCategory.value)
}

const handleStartPractice = () => {
    console.log('开始刷题')
    router.push('/question')
}

const handleHotClick = () => {
    activeCategory.value = '热门'
    console.log('查看热门题目')
    router.push('/category')
}

const gotoCategory = () => {
    console.log('查看更多题库')
    router.push('/category')
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
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-right ul li:hover {
    background-color: #e6f0ff;
    transform: translateY(-2px);
}

.nav-right ul li.active {
    background-color: #3760f7;
    color: white;
}

.nav-right ul li.active:hover {
    background-color: #2952d6;
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
    transition: transform 0.3s ease;
}

.bank-nav .nav-left .bank-start:hover {
    transform: scale(1.1);
}

.bank-nav .nav-left .bank-hot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: url('../../assets/images/frontend/hot.svg');
    background-size: contain;
    margin-bottom: 5px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.bank-nav .nav-left .bank-hot:hover {
    transform: scale(1.1);
}
</style>