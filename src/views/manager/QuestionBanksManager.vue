<template>
    <div class="questionbank">
        <!-- 搜索和筛选 -->
        <div class="header">
            <div class="filter-controls">
                <a-input-search v-model="searchQuery" placeholder="搜索题库" class="input-search" />
                <a-select v-model:value="bankStatus" placeholder="状态" class="select-filter">
                    <a-select-option value="active">已启用</a-select-option>
                    <a-select-option value="inactive">已停用</a-select-option>
                </a-select>
            </div>
            <a-button type="primary" class="add-bank-btn">
                <PlusOutlined />新增题库</a-button>
        </div>

        <!-- 分类列表 -->
        <div class="bank-list">
            <div v-for="bank in bankList" :key="bank.id" class="bank-card">
                <div class="bank-header">
                    <div class="icon-box">
                        <img :src="bank.icon" alt="icon" class="bank-icon" />
                    </div>
                    <div class="bank-info">
                        <h3>{{ bank.name }}</h3>
                        <p class="question-count">{{ bank.problemCount }}题</p>
                    </div>
                    <div class="bank-actions">
                        <button class="action-container" type="link" @click="editbank(bank.id)">
                            <EditOutlined class="edit-icon" />
                        </button>
                        <button class="action-container" type="link" @click="deletebank(bank.id)">
                            <DeleteOutlined class="delete-icon" />
                        </button>
                    </div>
                </div>

                <!-- 进度条和难度、活跃度显示 -->
                <div class="bank-stats">
                    <div class="progress">
                        <span class="progress-text">完成率:</span>
                        <span class="completion-rate-value">{{ bank.completionRate }}%</span>
                    </div>
                    <div class="progress-bar">
                        <div :style="{ width: `${bank.completionRate}%` }" class="progress-fill"></div>
                    </div>

                    <!-- 平均难度和活跃度 -->
                    <div class="bank-level">
                        <div :class="getDifficultyClass(bank.avgDifficulty)">
                            <span class="difficulty-text">平均难度:</span>
                            <span class="difficulty-value">{{ getDifficultyText(bank.avgDifficulty) }}</span>
                        </div>
                        <div :class="getActiveLevelClass(bank.activeLevel)">
                            <span class="active-text">活跃度:</span>
                            <span class="active-value">{{ bank.activeLevel }}</span>
                        </div>
                    </div>

                    <!-- 最近更新时间 -->
                    <div class="last-updated">
                        最近更新：{{ bank.lastUpdated }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { EditOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons-vue';

const searchQuery = ref('');
const bankStatus = ref('active');

const bankList = [
    {
        id: 1,
        name: '操作系统',
        icon: 'https://ai-public.mastergo.com/ai/img_res/c50f2553577cd3fccc745032b70a6c24.jpg',
        problemCount: 156,
        completionRate: 75,
        avgDifficulty: 3.2,
        activeLevel: '高',
        lastUpdated: '2024-01-15 14:30'
    },
    {
        id: 2,
        name: '计算机网络',
        icon: 'https://ai-public.mastergo.com/ai/img_res/37de84b2b732967ed9b4ad7d287fadc8.jpg',
        problemCount: 189,
        completionRate: 68,
        avgDifficulty: 3.8,
        activeLevel: '中',
        lastUpdated: '2024-01-14 16:45'
    },
    {
        id: 3,
        name: '数据库',
        icon: 'https://ai-public.mastergo.com/ai/img_res/bd74c04598832006c3e2ff0cbc1056d5.jpg',
        problemCount: 142,
        completionRate: 82,
        avgDifficulty: 2.9,
        activeLevel: '高',
        lastUpdated: '2024-01-13 09:15'
    },
    {
        id: 4,
        name: 'Java开发',
        icon: 'https://ai-public.mastergo.com/ai/img_res/dd1376912383c45951070cbad21d29fb.jpg',
        problemCount: 235,
        completionRate: 71,
        avgDifficulty: 3.5,
        activeLevel: '高',
        lastUpdated: '2024-01-15 11:20'
    },
    {
        id: 5,
        name: '分布式系统',
        icon: 'https://ai-public.mastergo.com/ai/img_res/fee4f193e152d4a4916cfa9ccf435cab.jpg',
        problemCount: 98,
        completionRate: 45,
        avgDifficulty: 4.2,
        activeLevel: '中',
        lastUpdated: '2024-01-14 13:40'
    },
    {
        id: 6,
        name: '算法与数据结构',
        icon: 'https://ai-public.mastergo.com/ai/img_res/dd0790cf194275b74c21a99ff0b10ded.jpg',
        problemCount: 312,
        completionRate: 63,
        avgDifficulty: 3.7,
        activeLevel: '高',
        lastUpdated: '2024-01-15 10:05'
    }
];

const getDifficultyText = (value: number) => {
    if (value < 3) return '简单';
    if (value < 4) return '中等';
    return '困难';
};

// 获取难度类名
const getDifficultyClass = (value: number) => {
    if (value < 3) return 'difficulty-easy';
    if (value < 4) return 'difficulty-medium';
    return 'difficulty-hard';
};

// 获取活跃度类名
const getActiveLevelClass = (level: string) => {
    if (level === '高') return 'active-high';
    if (level === '中') return 'active-medium';
    return 'active-low';
};

const editbank = (id: number) => {
    console.log(`Editing bank with ID: ${id}`);
};

const deletebank = (id: number) => {
    console.log(`Deleting bank with ID: ${id}`);
};
</script>

<style scoped>
@import '../../assets/styles/manager/QuestionBanksManager.css';
</style>