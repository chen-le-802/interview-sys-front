<template>
    <div class="container">

        <div class="search-container">
            <el-input v-model="searchTag" placeholder="输入标签进行搜索" clearable style="width: 300px;"
                @keyup.enter="handleSearch" />
        </div>

        <el-table :data="filteredData" :style="{ width: tableWidth }" size="large">
            <el-table-column prop="question" label="题目" width="490" />
            <el-table-column prop="difficulty" label="难度" sortable width="100" />
            <el-table-column prop="tags" label="标签" width="calc(tableWidth - 590px)">
                <template #default="{ row }">
                    <el-tag v-for="(tag, index) in row.tags" :key="index" size="small" class="tag-item">
                        {{ tag }}
                    </el-tag>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination background layout="prev, pager, next" :total="filteredData.length" class="pagination" />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
const props = defineProps({
    tableWidth: {
        type: String,
        default: '900px' // 默认宽度
    }
});
interface Question {
    question: string;
    difficulty: string;
    tags: string[];
}

// 原始数据源
const rawData: Question[] = [
    {
        question: '两数之和',
        difficulty: '简单',
        tags: ['数组', '哈希表']
    },
    {
        question: '反转链表',
        difficulty: '中等',
        tags: ['链表', '递归']
    },
    {
        question: '二叉树的中序遍历',
        difficulty: '中等',
        tags: ['栈', '树']
    },
    {
        question: '最长回文子串',
        difficulty: '困难',
        tags: ['字符串', '动态规划']
    },
    {
        question: '合并两个有序数组',
        difficulty: '简单',
        tags: ['数组', '双指针']
    }
];

const searchTag = ref('');

// 计算属性实现过滤逻辑
const filteredData = computed(() => {
    const searchText = searchTag.value.trim().toLowerCase();
    if (!searchText) return rawData;

    return rawData.filter(item =>
        item.tags.some(tag =>
            tag.toLowerCase().includes(searchText)
        )
    );
});

// 可选：处理回车搜索
const handleSearch = () => {
    // 可添加额外的搜索逻辑
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
</style>