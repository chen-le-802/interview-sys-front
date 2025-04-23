<template>
    <div class="app-container">
        <!-- 题目管理 -->
        <div class="questions">
            <!-- 操作栏卡片 -->
            <div class="card actions-card">
                <div class="actions">
                    <div class="filters">
                        <!-- 搜索框 -->
                        <a-input-search v-model="searchQuery" placeholder="搜索题目标题、ID..." class="input-search" />
                        <!-- 筛选选项 -->
                        <a-select v-model:value="difficulty" placeholder="难度" class="select-filter">
                            <a-select-option value="all">全部难度</a-select-option>
                            <a-select-option value="easy">简单</a-select-option>
                            <a-select-option value="medium">中等</a-select-option>
                            <a-select-option value="hard">困难</a-select-option>
                        </a-select>
                        <a-select v-model:value="category" placeholder="分类" class="select-filter">
                            <a-select-option value="all">全部分类</a-select-option>
                            <a-select-option value="os">操作系统</a-select-option>
                            <a-select-option value="network">计算机网络</a-select-option>
                            <a-select-option value="database">数据库</a-select-option>
                            <a-select-option value="java">Java</a-select-option>
                            <a-select-option value="distributed">分布式系统</a-select-option>
                        </a-select>
                        <a-select v-model:value="status" placeholder="状态" class="select-filter">
                            <a-select-option value="all">全部状态</a-select-option>
                            <a-select-option value="active">已启用</a-select-option>
                            <a-select-option value="inactive">已禁用</a-select-option>
                        </a-select>
                    </div>
                    <div class="buttons">
                        <a-button class="export-button">
                            <DownloadOutlined class="export-icon" />导出题目
                        </a-button>
                        <a-button type="primary" class="add-button">
                            <PlusOutlined class="add-icon" />新增题目
                        </a-button>
                    </div>
                </div>
            </div>

            <!-- 题目列表卡片 -->
            <div class="card problem-list-card">
                <div class="problem-list">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>题目ID</th>
                                <th>题目名称</th>
                                <th>难度</th>
                                <th>标签</th>
                                <th>提交次数</th>
                                <th>通过率</th>
                                <th>所属题库</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="problem in problemList" :key="problem.id">
                                <td>#{{ problem.id }}</td>
                                <td>{{ problem.title }}</td>
                                <td>
                                    <span :class="difficultyClass(problem.difficulty)" class="difficulty-tag">
                                        {{ problem.difficulty }}
                                    </span>
                                </td>
                                <td>
                                    <span v-for="tag in problem.tags" :key="tag" class="tag">{{ tag }}</span>
                                </td>
                                <td>{{ problem.submissions }}</td>
                                <td>
                                    <span :class="passRateClass(problem.passRate)">
                                        {{ problem.passRate }}
                                    </span>
                                </td>
                                <td>{{ problem.library }}</td>
                                <td>
                                    <button class="edit-btn">
                                        <EditOutlined class="edit-icon" />编辑
                                    </button>
                                    <button class="preview-btn">
                                        <FolderViewOutlined class="preview-icon" />预览
                                    </button>
                                    <button class="delete-btn">
                                        <DeleteOutlined class="delete-icon" />删除
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <a-pagination :current="currentPage" :total="totalItems" :pageSize="itemsPerPage"
                    @change="handlePageChange" showQuickJumper style="margin-top: 20px; text-align: center;" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { DownloadOutlined, PlusOutlined, EditOutlined, FolderViewOutlined, DeleteOutlined } from '@ant-design/icons-vue';

const difficulty = ref('all');
const category = ref('all');
const status = ref('all');
const searchQuery = ref('');

// 页码相关状态
const currentPage = ref(1); // 当前页码
const totalItems = ref(100); // 数据总数
const itemsPerPage = ref(10); // 每页显示的条数

// 示例数据
const problemList = [
    { id: 1, title: '进程与线程的区别', difficulty: '简单', tags: ['操作系统', '基础概念'], submissions: 12543, passRate: '65%', library: '操作系统' },
    { id: 2, title: 'HTTP与HTTPS的区别', difficulty: '中等', tags: ['网络协议', '安全'], submissions: 8765, passRate: '48%', library: '网络' },
    { id: 3, title: 'Redis分布式锁实现', difficulty: '困难', tags: ['分布式', '缓存'], submissions: 5432, passRate: '35%', library: '分布式' },
    { id: 4, title: 'TCP三次握手详解', difficulty: '简单', tags: ['计算机网络', '协议'], submissions: 9876, passRate: '72%', library: '网络' },
    { id: 5, title: 'MySQL索引原理', difficulty: '中等', tags: ['数据库', '性能优化'], submissions: 7654, passRate: '52%', library: '数据库' },
];

// 难度标签样式
const difficultyClass = (difficulty: string) => {
    switch (difficulty) {
        case '简单':
            return 'difficulty-easy';
        case '中等':
            return 'difficulty-medium';
        case '困难':
            return 'difficulty-hard';
        default:
            return '';
    }
};

// 通过率样式
const passRateClass = (rate: string) => {
    const pass = parseInt(rate.replace('%', ''));
    if (pass >= 60) return 'pass-rate-high';
    if (pass >= 40) return 'pass-rate-medium';
    return 'pass-rate-low';
};

// 分页控制
const handlePageChange = (page: number) => {
    currentPage.value = page;
    console.log(`Page changed to: ${page}`);
};
</script>

<style scoped>
@import "../../assets/styles/manager/QuestionsManager.css";
</style>