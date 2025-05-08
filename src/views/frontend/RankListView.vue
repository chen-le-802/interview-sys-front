<template>
    <div style="background-color: #f5f5f5;">
        <FrontendHeader></FrontendHeader>
        <div class="container">
            <a-card style="width: 286px;padding: 0;">
                <a-button v-for="item in navItems" :key="item.key" type="text" class="nav-item"
                    @click="handleNavClick(item.rankTheme)">
                    <component :is="item.icon" />
                    <span>{{ item.text }}</span>
                </a-button>
            </a-card>
            <QuestionRankList :theme="rankTheme"></QuestionRankList>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
    FileTextOutlined,
    UserOutlined,
    BookOutlined,
    TeamOutlined,
} from '@ant-design/icons-vue';

const rankTheme = ref('user-rank'); // 默认主题

const navItems = [
    {
        key: 'hot-questions',
        icon: FileTextOutlined,
        text: '热门题目榜',
        rankTheme: 'hot-questions'
    },
    {
        key: 'user-rank',
        icon: UserOutlined,
        text: '用户排行榜',
        rankTheme: 'user-rank'
    },
    {
        key: 'question-rank',
        icon: BookOutlined,
        text: '刷题排行榜',
        rankTheme: 'question-rank'
    },
    {
        key: 'invite-rank',
        icon: TeamOutlined,
        text: '邀请排行榜',
        rankTheme: 'invite-rank'
    }
];

// 点击导航时更新 rankTheme
const handleNavClick = (theme: string) => {
    rankTheme.value = theme;
};
</script>

<style scoped>
.container {
    width: 1200px;
    min-height: 100vh;
    margin: 0 auto;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 24px;
}

.nav-item {
    display: flex;
    align-items: center;
    text-align: start;
    width: 100%;
    height: 40px;
    margin-bottom: 6px;
    gap: 15px;
}
</style>