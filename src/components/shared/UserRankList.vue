<template>
    <div class="user-rank">
        <!-- 标题栏 -->
        <div class="header">
            <h3>刷题排行榜</h3>
            <div class="more">更多</div>
        </div>

        <!-- 用户列表 -->
        <div class="user-list">
            <div v-for="(item, index) in users" :key="index" class="user-item">
                <div class="content">
                    <div class="avatar" :style="{ backgroundImage: 'url(' + item.avatar + ')' }"></div>
                    <span class="username">{{ item.username }}</span>
                </div>
                <div class="heat">
                    <el-icon class="heat-icon">
                        <Star />
                    </el-icon>
                    <span class="heat-value">{{ formatNumber(item.heat) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Star } from '@element-plus/icons-vue'

// Mock数据
const users = ref([
    {
        avatar: new URL('../../assets/images/common/avatar.png', import.meta.url).href,
        username: '张三',
        heat: 10000
    },
    {
        avatar: 'https://cube.elemecdn.com/6/94/4d3ea631728779a6844a56d515a5jpeg.jpeg',
        username: 'hh',
        heat: 9000,
    },
    {
        avatar: 'https://cube.elemecdn.com/6/94/4d3ea631728779a6844a56d515a5jpeg.jpeg',
        username: '王五',
        heat: 8000
    },
])

// 格式化数字
const formatNumber = (num: number) => {
    return num.toLocaleString()
}
</script>

<style scoped>
/* 其他样式保持不变，只修改必要部分 */
.avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    margin-right: 8px;
}

.user-rank {
    width: 280px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: linear-gradient(to bottom, #a2a9f3, #d0e8f7);
    border-radius: 8px 8px 0 0;
}

.header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
}

.more {
    color: #409eff;
    font-size: 14px;
    cursor: pointer;
}

.user-list {
    padding: 12px 0;
    font-size: 14px;
}

.user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 12px;
    transition: background 0.3s;
}

.user-item:hover {
    background: #f5f7fa;
}

.content {
    display: flex;
    align-items: center;
    flex: 1;
}

.index {
    width: 30px;
    color: #666;
    font-weight: 500;
}

.title {
    color: #333;
    font-size: 14px;
}

.heat {
    display: flex;
    align-items: center;
    margin-left: 20px;
}

.avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-size: cover;
}

.heat-value {
    color: #ff9900;
    font-weight: 500;
    min-width: 40px;
    text-align: right;
    font-size: 12px;
}
</style>
