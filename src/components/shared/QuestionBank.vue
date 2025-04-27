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
        <div class="bank-list">
            <ul>
                <li v-for="(item, index) in questionList" :key="index" @click="handleQuestionClick(item)">
                    <div class="bank-logo" :style="{ backgroundImage: `url(${item.logo})` }"></div>
                    <div class="bank-info">
                        <div class="bank-title">{{ item.title }}</div>
                        <div class="bank-desc">{{ item.description }}</div>
                    </div>
                </li>
            </ul>
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

const questionList = ref([
    {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    },
    {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    },
    // 添加更多mock数据...
])

// 交互状态
const activeCategory = ref('热门')
const placeholder = '分类'
const router = useRouter()

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

const handleQuestionClick = (item: any) => {
    console.log('查看题目集：', item.title)
    router.push("/bank")
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

.bank-list {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;

    margin-top: 20px;
}

.bank-list ul {
    width: 100%;
    height: 100%;

}

.bank-list ul li {
    display: flex;
    align-items: center;
    width: 288.5px;
    height: 100px;
    background-color: #fff;
    border-radius: 10px;
    float: left;
    margin-bottom: 15px;
    margin-right: 15px;
    cursor: pointer;
}

.bank-list ul li:nth-child(4n) {
    margin-right: 0 !important;
}

.bank-list ul li .bank-logo {

    width: 40px;
    margin-left: 20px;
    height: 40px;
    background: url('../../assets/images/frontend/java.png');
    background-size: cover;
}

.bank-list ul li .bank-info {
    height: 50%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 10px;
}

.bank-list ul li .bank-title {
    font-size: 16px;
    font-weight: bold;
}

/* 仅新增active样式 */
.nav-right ul li.active {
    background-color: #3760f7;
    color: white;
}
</style>