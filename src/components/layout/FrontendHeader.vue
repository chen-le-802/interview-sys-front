<template>
    <header>
        <div class="header-main">
            <div class="logo-title" @click="handleNavClick({ name: '主页', path: '/' })">
                <div class="logo"></div>
                <div class="title">面试斩</div>
            </div>

            <nav class="nav">
                <ul>
                    <li v-for="item in navItems" :key="item.name" :class="{ active: activeNav === item.name }"
                        @click="handleNavClick(item)">
                        {{ item.name }}
                    </li>
                </ul>
            </nav>

            <div class="search">
                <el-input placeholder="搜索" v-model="searchQuery" @keyup.enter="handleSearch">
                    <template #suffix>
                        <div class="search-button" @click="handleSearch">
                            <el-icon :color="searchInfoColor">
                                <Search />
                            </el-icon>
                        </div>
                    </template>
                </el-input>
            </div>

            <NotificationBell ref="notificationBellRef" />
            
            <div class="errorNoteBook" @click="gotoErrorNoteBook">
                <el-tooltip content="错题本" placement="bottom" effect="light">
                    <span class="errorNoteBook-icon">
                        <BookOutlined />
                    </span>
                </el-tooltip>
            </div>

            <div class="user">
                <UserInfoDropDown />
            </div>
        </div>
    </header>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { BookOutlined } from '@ant-design/icons-vue'
import UserInfoDropDown from '@/components/UserInfoDropDown.vue'
import NotificationBell from '@/components/shared/NotificationBell.vue'

// Mock数据
const navItems = [
    { name: '主页', path: '/' },
    { name: '题库', path: '/banks' },
    { name: '刷题路线', path: '/roadmaps' },
    { name: '每日题单', path: '/daily-list' },
    { name: 'AI面试官', path: '/ai-interview' }
]

// 响应式数据
const searchQuery = ref('')
const searchInfoColor = ref('#ffffff')
const notificationBellRef = ref()

const router = useRouter()
const route = useRoute()

// 计算属性
const activeNav = computed(() => {
    const matchedItem = navItems.find(item => item.path === route.path)
    return matchedItem ? matchedItem.name : ''
})

// 方法
const handleNavClick = (item: { name: string; path: string }) => {
    router.push(item.path)
}

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        console.log('执行搜索:', searchQuery.value)
        // 这里可以添加搜索逻辑，比如跳转到搜索结果页面
        // router.push({ path: '/search', query: { q: searchQuery.value } })
    }
}

const gotoErrorNoteBook = () => {
    // 跳转到错题本页面
    router.push('/error-notebook')
}
</script>

<style scoped>
/* 新增样式 */
.active {
    background-color: #3760f7 !important;
    color: #ffffff !important;
}

.search {
    position: relative;
}

header {
    width: 100%;
    height: 56px;
    line-height: 56px;
    background-color: #fefefe;
    border-bottom: 1px solid #f1efef;
}

.header-main {
    display: flex;
    align-items: center;
    width: 1440px;
    max-width: 1440px;
    margin: 0 auto;
    height: 56px;
}

.logo-title {
    display: flex;
    align-items: center;
    height: 56px;
    cursor: pointer;
}

.search {
    width: 250px;
    height: 56px;
}

.errorNoteBook {
    cursor: pointer;
    height: 56px;
    margin-right: 15px;
}

.user {
    width: 150px;
    height: 56px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.logo {
    width: 40px;
    height: 40px;
    background: url("../../assets/images/common/logo.png");
    background-size: cover;
}

.title {
    font-size: 17px;
    margin-left: 10px;
    font-weight: 600
}

.nav {
    margin: 0 80px;
    flex: 1;
}

.nav ul {
    display: flex;
    align-items: center;
    height: 20px;
}

.nav ul li {
    padding: 0 30px;
    display: block;
    text-align: center;
    margin: 0 5px;
    cursor: pointer;
}

.nav ul li:hover {
    background-color: #3760f7;
    color: #ffffff;
}

.search-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background-color: #3760f6;
    border-radius: 5px;
    cursor: pointer;
}

.user :deep(.el-dropdown-link) {
    color: #333;
    font-size: 14px;
}
</style>