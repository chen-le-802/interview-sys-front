<template>
    <div class="container">
        <div class="search-container">
            <el-input v-model="searchTag" placeholder="输入标签进行搜索" clearable style="width: 300px;"
                @keyup.enter="handleSearch" />
        </div>

        <el-table :data="paginatedData" :style="{ width: tableWidth + 'px' }" size="large" @row-click="handleClickItem"
            v-loading="loading" element-loading-text="加载中...">
            <el-table-column prop="question" label="题目" width="460" />
            <el-table-column label="难度" width="130">
                <template #header>
                    <div class="difficulty-header">
                        <span>难度</span>
                        <el-tooltip :content="difficultyTooltip" placement="top">
                            <div class="sort-icon" :class="difficultySortClass" @click="handleDifficultySort">
                                <el-icon>
                                    <ArrowUp v-if="difficultySortStatus === 'asc'" />
                                    <ArrowDown v-else-if="difficultySortStatus === 'desc'" />
                                    <Sort v-else />
                                </el-icon>
                            </div>
                        </el-tooltip>
                    </div>
                </template>
                <template #default="{ row }">
                    <el-tag :type="getDifficultyType(row.difficulty)" size="small">
                        {{ row.difficulty }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="tags" label="标签" :width="tableWidth - 590">
                <template #default="{ row }">
                    <el-tag v-for="(tag, index) in row.tags" :key="index" size="small" class="tag-item">
                        {{ tag }}
                    </el-tag>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination background layout="prev, pager, next, total" :total="totalData" class="pagination"
            :page-size="pageSize" :current-page="currentPage" @current-change="handlePageChange" />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowUp, ArrowDown, Sort } from '@element-plus/icons-vue';

const router = useRouter();

// Props
const props = defineProps({
    tableWidth: {
        type: Number,
        default: 900
    },
    questions: {
        type: Array as () => Question[],
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

interface Question {
    id?: string;
    question: string;
    difficulty: string;
    tags: string[];
}

// 响应式数据
const searchTag = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const difficultySortStatus = ref<'none' | 'asc' | 'desc'>('none');

// 难度权重映射
const difficultyWeight: Record<string, number> = {
    简单: 1,
    中等: 2,
    困难: 3,
    未知: 4
};

// 难度提示文本
const difficultyTooltip = computed(() => {
    switch (difficultySortStatus.value) {
        case 'none':
            return '点击升序';
        case 'asc':
            return '点击降序';
        case 'desc':
            return '取消排序';
    }
    return '点击升序';
});

// 难度排序图标样式
const difficultySortClass = computed(() => {
    return {
        'sort-active': difficultySortStatus.value !== 'none',
        'sort-asc': difficultySortStatus.value === 'asc',
        'sort-desc': difficultySortStatus.value === 'desc'
    };
});

// 按标签过滤
const filteredData = computed(() => {
    const txt = searchTag.value.trim().toLowerCase();
    if (!txt) return props.questions;
    return props.questions.filter((item) =>
        item.tags.some((tag) => tag.toLowerCase().includes(txt))
    );
});

// 按难度排序
const sortedData = computed(() => {
    if (difficultySortStatus.value === 'none') {
        return filteredData.value;
    }
    return [...filteredData.value].sort((a, b) => {
        const wA = difficultyWeight[a.difficulty] || 999;
        const wB = difficultyWeight[b.difficulty] || 999;
        if (difficultySortStatus.value === 'asc') {
            return wA - wB;
        } else {
            return wB - wA;
        }
    });
});

// 分页后的数据
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return sortedData.value.slice(start, end);
});

// 总数据量
const totalData = computed(() => sortedData.value.length);

// 切换难度排序状态：none -> asc -> desc -> none
const handleDifficultySort = () => {
    switch (difficultySortStatus.value) {
        case 'none':
            difficultySortStatus.value = 'asc';
            break;
        case 'asc':
            difficultySortStatus.value = 'desc';
            break;
        case 'desc':
            difficultySortStatus.value = 'none';
            break;
    }
    currentPage.value = 1;
};

// 搜索时重置到第一页
const handleSearch = () => {
    currentPage.value = 1;
    difficultySortStatus.value = 'none';
};

// 分页页码变化
const handlePageChange = (page: number) => {
    currentPage.value = page;
};

// 点击行跳转
const handleClickItem = (row: Question) => {
    if (row.id) {
        router.push(`/question/${row.id}`);
    } else {
        router.push('/question');
    }
};

// 根据难度返回 tag 类型
const getDifficultyType = (difficulty: string) => {
    switch (difficulty) {
        case '简单':
            return 'success';
        case '中等':
            return 'warning';
        case '困难':
            return 'danger';
        default:
            return 'info';
    }
};
</script>

<style scoped>
.search-container {
    margin-bottom: 20px;
}

.tag-item {
    margin-right: 5px;
    margin-bottom: 2px;
}

.pagination {
    margin-top: 20px;
    justify-content: flex-end;
}

.difficulty-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    cursor: pointer;
    padding: 8px 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    color: #606266;
    min-height: 20px;
    user-select: none;
}

.difficulty-header:hover {
    background-color: #f5f7fa;
    color: #409eff;
}

.difficulty-header.sort-active {
    color: #409eff;
}

.difficulty-header.sort-asc {
    color: #67c23a;
}

.difficulty-header.sort-desc {
    color: #e6a23c;
}

.sort-icon {
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
}

:deep(.el-table__header .el-table__cell) {
    color: #606266 !important;
}

:deep(.el-table__header .el-table__cell .cell) {
    color: #606266 !important;
}

:deep(.el-table__body .el-table__row .el-table__cell:nth-child(2)) {
    text-align: center;
}

:deep(.el-table__body .el-table__row .el-table__cell:nth-child(2) .cell) {
    display: flex;
    justify-content: center;
}
</style>