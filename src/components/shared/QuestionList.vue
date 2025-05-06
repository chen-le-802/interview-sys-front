<template>
    <div class="question-list">
        <div class="search">
            <el-input placeholder="搜索题目" v-model="searchQuery" @keyup.enter="handleSearch">
                <template #suffix>
                    <div class="search-button" @click="handleSearch">
                        <el-icon :color="searchInfoColor">
                            <Search />
                        </el-icon>
                    </div>
                </template>
            </el-input>
        </div>

        <ul>
            <li v-for="question in filteredQuestions" :key="question.id"
                :class="{ 'question-active': question.id === selectedQuestionId }"
                @click="handleQuestionClick(question.id)">
                {{ question.title }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 问题类型定义
export interface Question {
    id: number
    title: string
    content?: string
    tags?: string[]
    difficulty?: 'easy' | 'medium' | 'hard'
}

// 响应式数据
const searchQuery = ref('')
const searchInfoColor = ref('#dcdfe6')
const selectedQuestionId = ref<number | null>(1)

// Mock数据
const questions = ref<Question[]>([
    { id: 1, title: '什么是Java中的不可变类', tags: ['Java', '基础'], difficulty: 'medium' },
    { id: 2, title: 'JavaScript的事件循环机制', tags: ['JavaScript'], difficulty: 'hard' },
    { id: 3, title: 'Vue3的Composition API优势', tags: ['Vue'], difficulty: 'easy' },
    { id: 4, title: 'CSS的BFC原理及应用', tags: ['CSS'], difficulty: 'medium' },
    { id: 5, title: 'React Hooks的使用最佳实践', tags: ['React'], difficulty: 'hard' },
])

// 计算属性实现过滤（后续可扩展更多过滤逻辑）
const filteredQuestions = computed(() => {
    return questions.value.filter(q =>
        q.title.toLowerCase().includes(searchQuery.value.trim().toLowerCase())
    )
})

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        console.log('执行搜索:', searchQuery.value)
        // 后续可添加实际搜索逻辑
    }
}

const handleQuestionClick = (id: number) => {
    selectedQuestionId.value = id
    // 后续可以添加获取问题详情的逻辑
    console.log('选中问题ID:', id)
}
</script>

<style lang="css" scoped>
/* 保持原有样式不变 */
.question-active {
    background-color: #e6f4ff;
    color: #1677ff;
    font-weight: 600;
}

.question-list {
    height: 100%;
    overflow: auto;
    width: 310px;
    padding: 8px;
    background-color: #ffffff;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.question-list::-webkit-scrollbar {
    display: none;
}

.search {
    margin: 5px auto;
    width: 250px;
    height: 45px;
}

.search-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    cursor: pointer;
}

.question-list ul {
    margin: 0;
    padding: 0;
}

.question-list ul li {
    box-sizing: border-box;
    height: 42px;
    width: 100%;
    line-height: 42px;
    padding: 0 20px;
    border-radius: 8px;
    cursor: pointer;
}

.question-list ul li:hover {
    color: #1677ff;
}
</style>