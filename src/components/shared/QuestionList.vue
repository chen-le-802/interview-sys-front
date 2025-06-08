<template>
    <div class="question-list">
        <div class="search">
            <el-input placeholder="搜索题目" v-model="searchQuery" @keyup.enter="handleSearch" @input="handleSearchInput"
                :loading="loading">
                <template #suffix>
                    <div class="search-button" @click="handleSearch">
                        <el-icon :color="searchInfoColor">
                            <Search />
                        </el-icon>
                    </div>
                </template>
            </el-input>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading && !questions.length" class="loading-container">
            <el-skeleton :rows="5" animated />
        </div>

        <!-- 题目列表 -->
        <ul v-else-if="filteredQuestions.length > 0" class="question-ul">
            <li v-for="question in filteredQuestions" :key="question.id" :class="{
                'question-active': question.id === selectedQuestionId,
                'question-navigating': isNavigating && question.id === selectedQuestionId
            }" @click="!isNavigating ? handleQuestionClick(question.id) : null" :title="question.title"
                class="question-item-li">
                <div class="question-item">
                    <div class="question-header">
                        <div class="header-left">
                            <el-icon v-if="isNavigating && question.id === selectedQuestionId" class="loading-icon">
                                <Loading />
                            </el-icon>
                        </div>
                        <div class="header-right">
                            <el-tag v-if="question.difficulty" size="small"
                                :type="getDifficultyType(question.difficulty)" class="difficulty-tag">
                                {{ getDifficultyText(question.difficulty) }}
                            </el-tag>
                        </div>
                    </div>
                    <div class="question-title">{{ question.title }}</div>
                </div>
            </li>
        </ul>

        <!-- 空状态 -->
        <div v-else-if="!loading && !findingBank" class="empty-state">
            <el-empty :description="getEmptyDescription()" :image-size="100">
                <el-button v-if="searchQuery.trim()" @click="clearSearch" type="primary" size="small">
                    清空搜索
                </el-button>
                <el-button v-else @click="handleRetry" type="primary" size="small">
                    重试
                </el-button>
            </el-empty>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'
import { getQuestionsByBankId, getQuestionBanksByQuestionId } from '@/apis/questionBankQuestionApi'
import { getQuestionVOById } from '@/apis/questionApi'

// Props定义
interface Props {
    questionBankId?: string;
    selectedQuestionId?: string;
    currentQuestionId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    questionBankId: '',
    selectedQuestionId: '',
    currentQuestionId: ''
})

const emit = defineEmits<{
    select: [questionId: string];
}>()

export interface Question {
    id: string;
    title: string;
    content?: string;
    tagList?: string[];
    difficulty?: string;
    passRate?: string;
    submissionQuantity?: number;
    updateTime?: string;
    user?: any;
    userId?: string;
}

// 响应式数据
const searchQuery = ref('')
const searchInfoColor = ref('#dcdfe6')
const selectedQuestionId = ref<string>(props.selectedQuestionId || '')
const questions = ref<Question[]>([])
const loading = ref(false)
const autoFoundQuestionBankId = ref('')
const findingBank = ref(false)
const effectiveQuestionBankId = ref('')
const isNavigating = ref(false)

// 搜索防抖timer
let searchTimer: number | null = null
let clickTimer: number | null = null

// 计算属性 - 过滤后的题目列表
const filteredQuestions = computed(() => {
    if (!searchQuery.value.trim()) {
        return questions.value
    }

    const query = searchQuery.value.trim().toLowerCase()
    return questions.value.filter(q =>
        q.title.toLowerCase().includes(query) ||
        q.id.toLowerCase().includes(query) ||
        (q.tagList && q.tagList.some(tag => tag.toLowerCase().includes(query)))
    )
})

// 获取空状态描述
const getEmptyDescription = () => {
    if (searchQuery.value.trim()) {
        return '未找到相关题目'
    }
    if (!effectiveQuestionBankId.value) {
        return '无法确定题库信息'
    }
    return '暂无题目数据'
}

// 获取难度类型
const getDifficultyType = (difficulty: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
        '简单': 'success',
        '中等': 'warning',
        '困难': 'danger'
    }
    return typeMap[difficulty] || 'info'
}

// 获取难度文本
const getDifficultyText = (difficulty: string) => {
    const textMap: Record<string, string> = {
        '简单': '简单',
        '中等': '中等',
        '困难': '困难'
    }
    return textMap[difficulty] || difficulty
}

// 根据题目ID查找对应的题库
const findQuestionBankByQuestionId = async (questionId: string): Promise<string | null> => {
    try {
        findingBank.value = true
        const response = await getQuestionBanksByQuestionId(questionId)

        if (response.code === 0 && response.data?.records?.length > 0) {
            const firstBank = response.data.records[0]
            const bankId = firstBank.questionBankId || firstBank.id
            return bankId
        } else {
            return null
        }
    } catch (error) {
        return null
    } finally {
        findingBank.value = false
    }
}

// 获取有效的题库ID
const getEffectiveQuestionBankId = async (): Promise<string | null> => {
    if (props.questionBankId) {
        effectiveQuestionBankId.value = props.questionBankId
        return props.questionBankId
    }

    if (props.currentQuestionId) {
        const foundBankId = await findQuestionBankByQuestionId(props.currentQuestionId)
        if (foundBankId) {
            autoFoundQuestionBankId.value = foundBankId
            effectiveQuestionBankId.value = foundBankId
            return foundBankId
        }
    }

    if (autoFoundQuestionBankId.value) {
        effectiveQuestionBankId.value = autoFoundQuestionBankId.value
        return autoFoundQuestionBankId.value
    }

    effectiveQuestionBankId.value = ''
    return null
}

// 获取题库题目列表
const fetchQuestionList = async () => {
    loading.value = true
    try {
        const bankId = await getEffectiveQuestionBankId()

        if (!bankId) {
            questions.value = []
            return
        }

        const response = await getQuestionsByBankId(bankId, {
            current: 1,
            pageSize: 200, // 一次获取更多题目
            sortField: 'createTime',
            sortOrder: 'desc'
        })

        if (response.code === 0 && response.data) {
            const { records = [] } = response.data

            if (records.length > 0) {
                const firstRecord = records[0]

                if (firstRecord.questionId && !firstRecord.title) {
                    await processQuestionRelations(records)
                } else {
                    processCompleteQuestions(records)
                }
            } else {
                questions.value = []
            }
        }
    } catch (error) {
        const bankId = await getEffectiveQuestionBankId()
    } finally {
        loading.value = false
    }
}

// 处理题库题目关联数据
const processQuestionRelations = async (relations: any[]) => {
    try {
        const questionIds = relations.map(relation => relation.questionId).filter(Boolean)

        if (questionIds.length === 0) {
            questions.value = []
            return
        }

        const batchSize = 5
        const questionList: any[] = []

        for (let i = 0; i < questionIds.length; i += batchSize) {
            const batch = questionIds.slice(i, i + batchSize)

            const batchPromises = batch.map(async (questionId: string) => {
                try {
                    const response = await getQuestionVOById(questionId)
                    if (response.code === 0 && response.data) {
                        return {
                            id: response.data.id,
                            title: response.data.title,
                            content: response.data.content,
                            difficulty: response.data.difficulty,
                            tagList: response.data.tagList || (response.data.tags ? response.data.tags.split(',') : []),
                            passRate: response.data.passRate,
                            submissionQuantity: response.data.submissionQuantity,
                            updateTime: response.data.updateTime,
                            user: response.data.user,
                            userId: response.data.userId
                        }
                    } else {
                        return null
                    }
                } catch (error) {
                    return null
                }
            })

            const batchResults = await Promise.allSettled(batchPromises)
            const batchQuestions = batchResults
                .filter(result => result.status === 'fulfilled' && result.value !== null)
                .map(result => (result as PromiseFulfilledResult<any>).value)

            questionList.push(...batchQuestions)
        }

        questions.value = questionList

        if (!selectedQuestionId.value && questionList.length > 0) {
            handleQuestionClick(questionList[0].id)
        }

    } catch (error) {
        questions.value = []
    }
}

// 处理完整题目数据
const processCompleteQuestions = (records: any[]) => {
    try {
        const questionList = records.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            difficulty: item.difficulty,
            tagList: item.tagList || (item.tags ? item.tags.split(',') : []),
            passRate: item.passRate,
            submissionQuantity: item.submissionQuantity,
            updateTime: item.updateTime,
            user: item.user,
            userId: item.userId
        }))

        questions.value = questionList

        if (!selectedQuestionId.value && questionList.length > 0) {
            handleQuestionClick(questionList[0].id)
        }
    } catch (error) {
        questions.value = []
    }
}

// 搜索处理
const handleSearch = () => {
    if (searchTimer) {
        window.clearTimeout(searchTimer)
        searchTimer = null
    }
    searchInfoColor.value = searchQuery.value.trim() ? '#1677ff' : '#dcdfe6'
}

// 搜索输入处理
const handleSearchInput = () => {
    if (searchTimer) {
        window.clearTimeout(searchTimer)
    }

    searchTimer = window.setTimeout(() => {
        handleSearch()
    }, 300)
}

// 清空搜索
const clearSearch = () => {
    searchQuery.value = ''
    searchInfoColor.value = '#dcdfe6'
}

// 重试
const handleRetry = () => {
    autoFoundQuestionBankId.value = ''
    effectiveQuestionBankId.value = ''
    fetchQuestionList()
}

// 题目点击处理
const handleQuestionClick = async (id: string) => {
    try {
        if (!id || id === selectedQuestionId.value || isNavigating.value) {
            return
        }

        if (clickTimer) {
            window.clearTimeout(clickTimer)
        }

        clickTimer = window.setTimeout(async () => {
            try {
                isNavigating.value = true
                selectedQuestionId.value = id

                await nextTick()
                emit('select', id)

            } catch (error) {
                selectedQuestionId.value = props.selectedQuestionId || ''
                ElMessage.error('切换题目失败，请重试')
            } finally {
                setTimeout(() => {
                    isNavigating.value = false
                }, 1000)
            }
        }, 100)

    } catch (error) {
        isNavigating.value = false
    }
}


// 监听题库ID和当前题目ID变化
watch([() => props.questionBankId, () => props.currentQuestionId], ([newBankId, newQuestionId], [oldBankId, oldQuestionId]) => {
    try {
        if (newQuestionId !== oldQuestionId && newQuestionId && !newBankId) {
            autoFoundQuestionBankId.value = ''
            effectiveQuestionBankId.value = ''
        }

        if (newBankId || newQuestionId) {
            if (newBankId !== oldBankId && newBankId) {
                autoFoundQuestionBankId.value = ''
            }

            fetchQuestionList().catch(() => { })
        } else {
            questions.value = []
            autoFoundQuestionBankId.value = ''
            effectiveQuestionBankId.value = ''
        }
    } catch (error) {
        // 静默处理错误
    }
}, { immediate: true })

// 监听选中的题目ID变化
watch(() => props.selectedQuestionId, (newId, oldId) => {
    try {
        if (newId && newId !== oldId && newId !== selectedQuestionId.value) {
            selectedQuestionId.value = newId
            isNavigating.value = false
        }
    } catch (error) {
        // 静默处理错误
    }
})

// 组件挂载时获取数据
onMounted(() => {
    try {
        if (props.questionBankId || props.currentQuestionId) {
            fetchQuestionList().catch(() => { })
        }
    } catch (error) {
        // 静默处理错误
    }
})

// 组件卸载前清理
onBeforeUnmount(() => {
    if (searchTimer) {
        window.clearTimeout(searchTimer)
        searchTimer = null
    }
    if (clickTimer) {
        window.clearTimeout(clickTimer)
        clickTimer = null
    }
    isNavigating.value = false
})

// 暴露方法给父组件
defineExpose({
    refresh: () => fetchQuestionList(),
    clearSearch,
    getSelectedQuestionId: () => selectedQuestionId.value,
    getEffectiveQuestionBankId: () => effectiveQuestionBankId.value
})
</script>

<style lang="css" scoped>
.question-list {
    height: 100%;
    overflow: auto;
    width: 310px;
    padding: 8px;
    background-color: #ffffff;
    scrollbar-width: none;
    -ms-overflow-style: none;
    display: flex;
    flex-direction: column;
}

.question-list::-webkit-scrollbar {
    display: none;
}

.search {
    margin: 5px auto;
    width: 250px;
    height: 45px;
    flex-shrink: 0;
}

.search-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.search-button:hover {
    background-color: #f5f7fa;
}

.loading-container {
    padding: 20px;
    flex: 1;
}

.empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
}

.question-ul {
    margin: 0;
    padding: 0;
    flex: 1;
    overflow-y: auto;
    list-style: none;
}

.question-item-li {
    box-sizing: border-box;
    min-height: 50px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 6px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    background-color: #fafbfc;
}

.question-item-li:hover {
    background-color: #f0f7ff;
    border-color: #d1e7ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.question-active {
    background-color: #e6f4ff !important;
    color: #1677ff !important;
    font-weight: 600;
    border-left: 4px solid #1677ff !important;
    border-color: #1677ff !important;
    box-shadow: 0 2px 8px rgba(22, 119, 255, 0.15);
}

.question-navigating {
    opacity: 0.7;
    pointer-events: none;
}

.question-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    min-width: 20px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 4px;
}

.loading-icon {
    font-size: 12px;
    color: #1677ff;
    animation: rotating 1s linear infinite;
}

.question-title {
    font-size: 14px;
    line-height: 1.4;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

.question-active .question-title {
    color: #1677ff;
}

.difficulty-tag {
    font-size: 10px;
    height: 18px;
    line-height: 16px;
    border: none;
    font-weight: 600;
}

@keyframes rotating {
    0% {
        transform: rotateZ(0deg);
    }

    100% {
        transform: rotateZ(360deg);
    }
}

@media (max-width: 768px) {
    .question-list {
        width: 100%;
        padding: 4px;
    }

    .search {
        width: calc(100% - 10px);
    }

    .question-item-li {
        padding: 8px 10px;
        min-height: 45px;
    }

    .question-title {
        font-size: 13px;
    }
}
</style>