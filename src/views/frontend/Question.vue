<template>
    <div class="container">
        <FrontendHeader class="header"></FrontendHeader>
        <div class="main-content">
            <QuestionList :question-bank-id="questionBankId" :selected-question-id="currentQuestionId"
                :current-question-id="currentQuestionId" @select="handleQuestionSelect">
            </QuestionList>
            <div class="question-box">
                <div class="question-content">
                    <!-- 题目标题区域 -->
                    <div class="question-title-box" v-if="currentQuestion">
                        <div class="question-title">{{ currentQuestion.title }}</div>
                        <div class="question-tags">
                            <el-tag size="small" class="tag-difficulty"
                                :style="{ backgroundColor: difficultyColors[currentQuestion.difficulty] || '#909399' }">
                                {{ difficultyMap[currentQuestion.difficulty] || currentQuestion.difficulty }}
                            </el-tag>
                            <el-tag v-for="tag in currentQuestion.tagList" :key="tag" size="small" class="tag-item">
                                {{ tag }}
                            </el-tag>
                        </div>
                        <div class="question-options">
                            <div v-for="option in questionOptions" :key="option.action" class="option-item"
                                @click="handleOptionClick(option.action)">
                                <el-icon class="icon">
                                    <component :is="option.icon" />
                                </el-icon>
                                {{ option.label }}
                            </div>
                        </div>
                    </div>

                    <!-- 加载状态 -->
                    <div v-if="loading" class="loading-wrapper">
                        <el-skeleton :rows="8" animated />
                    </div>

                    <!-- 答案内容区域 -->
                    <QuestionAnswer v-else-if="currentQuestion" :question-id="currentQuestion.id"
                        :content="currentQuestion.content" :answer="currentQuestion.answer">
                    </QuestionAnswer>

                    <!-- 上一题下一题控制区 -->
                    <div class="control-box" v-if="!loading">
                        <div class="pre" v-if="adjacentQuestions?.previous"
                            @click="navigateToQuestion(adjacentQuestions.previous.id)">
                            上一题
                            <div class="pre-next-question-title">
                                <DoubleLeftOutlined />
                                {{ adjacentQuestions.previous.title }}
                            </div>
                        </div>
                        <div v-else class="pre disabled">
                            上一题
                            <div class="pre-next-question-title disabled">
                                没有上一题
                            </div>
                        </div>

                        <div class="next" v-if="adjacentQuestions?.next"
                            @click="navigateToQuestion(adjacentQuestions.next.id)">
                            下一题
                            <div class="pre-next-question-title">
                                {{ adjacentQuestions.next.title }}
                                <DoubleRightOutlined />
                            </div>
                        </div>
                        <div v-else class="next disabled">
                            下一题
                            <!-- <div class="pre-next-question-title disabled"> -->
                            <div class="next">
                                请介绍操作系统的内存管理方式...
                            </div>
                        </div>
                    </div>

                    <Comments v-if="!loading" :question-id="currentQuestionId"></Comments>
                    <div style="width: 120px;height: 80px;"></div>
                </div>

                <!-- 右侧边栏 -->
                <div class="right">
                    <!-- 目录区域 -->
                    <div class="context-box">
                        <div class="context-header">
                            <span>目录</span>
                            <span>
                                <DoubleRightOutlined />
                            </span>
                        </div>
                        <div class="context-body">
                            <div v-for="item in tableOfContents" :key="item.id" class="context-item"
                                :class="{ 'context-active': activeSection === item.id }"
                                @click="scrollToSection(item.id)"
                                :style="{ paddingLeft: `${15 + (item.level - 2) * 10}px` }">
                                {{ item.title }}
                            </div>
                        </div>
                    </div>
                    <RankList :list-title="'热门题目榜'" :width="250"></RankList>
                </div>
            </div>
        </div>

        <!-- 回到顶部 -->
        <el-backtop :bottom="90" :right="40" target=".question-box">
            <div style="
                height: 100%;
                width: 100%;
                background-color: var(--el-bg-color-overlay);
                box-shadow: var(--el-box-shadow-lighter);
                text-align: center;
                line-height: 40px;
                color: #1989fa;
              ">
                <el-icon>
                    <CaretTop />
                </el-icon>
            </div>
        </el-backtop>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
    PriceTag,
    Share,
    View,
    Star,
    CaretTop
} from '@element-plus/icons-vue'
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons-vue'
import { getQuestionVOById, getAdjacentQuestions } from '@/apis/questionApi'

// 接口定义
interface UserVO {
    id: number;
    jobPosition: string[];
    userAccount: string;
    userAvatar: string;
    userName: string;
    userProfile: string;
}

interface QuestionVO {
    answer: string;
    content: string;
    difficulty: string;
    id: string;
    passRate: string;
    tagList: string[];
    title: string;
    user: UserVO;
    userId: string;
}

// 目录项接口
interface TableOfContent {
    id: string;
    title: string;
    level: number;
}

// 相邻题目接口
interface AdjacentQuestions {
    previous?: { id: string; title: string };
    next?: { id: string; title: string };
}

const route = useRoute()
const router = useRouter()

// 响应式数据
const currentQuestion = ref<QuestionVO | null>(null)
const adjacentQuestions = ref<AdjacentQuestions | null>(null)
const tableOfContents = ref<TableOfContent[]>([])
const activeSection = ref<string>('')
const loading = ref(false)

// 计算属性
const questionBankId = computed(() => route.query.questionBankId as string || '')
const currentQuestionId = computed(() => route.params.id as string || '')

// 难度映射
const difficultyMap: Record<string, string> = {
    '简单': '简单',
    '中等': '中等',
    '困难': '困难'
}

// 难度颜色
const difficultyColors: Record<string, string> = {
    '简单': '#67c23a',
    '中等': '#fd9815',
    '困难': '#f56c6c'
}

// 操作选项配置
const questionOptions = computed(() => {
    if (!currentQuestion.value) return []
    return [
        { action: 'mark', icon: PriceTag, label: '标记' },
        { action: 'share', icon: Share, label: '分享' },
        { action: 'star', icon: Star, label: '收藏' },
        { action: 'view', icon: View, label: '浏览' }
    ]
})

// 获取题目详情
const fetchQuestionDetail = async (questionId: string) => {
    if (!questionId) return

    loading.value = true
    try {
        const response = await getQuestionVOById(questionId)
        if (response.code === 0) {
            currentQuestion.value = response.data
            // 解析content生成目录
            parseContentToTOC(response.data.content)
            // 获取相邻题目
            await fetchAdjacentQuestions(questionId)
        } else {
            ElMessage.error(response.message || '获取题目详情失败')
            currentQuestion.value = null
        }
    } catch (error) {
        ElMessage.error('获取题目详情失败')
        currentQuestion.value = null
    } finally {
        loading.value = false
    }
}

// 获取相邻题目
const fetchAdjacentQuestions = async (currentId: string) => {
    try {
        const response = await getAdjacentQuestions({
            currentId,
            questionBankId: questionBankId.value
        })
        if (response.code === 0) {
            adjacentQuestions.value = response.data
        }
    } catch (error) {
        // 静默处理错误
    }
}

// 解析content中的markdown二级标题生成目录
const parseContentToTOC = (content: string) => {
    if (!content) {
        tableOfContents.value = []
        return
    }

    const toc: TableOfContent[] = []
    const lines = content.split('\n')

    lines.forEach((line, index) => {
        const trimmed = line.trim()
        // 匹配二级标题 ## 标题
        const match = trimmed.match(/^(#{2,4})\s+(.+)$/)
        if (match) {
            const level = match[1].length
            const title = match[2].trim()
            // 生成唯一ID，使用索引确保唯一性
            const id = `heading-${level}-${index}-${title.replace(/[^\w\u4e00-\u9fa5]/g, '-').toLowerCase()}`

            toc.push({
                id,
                title,
                level
            })
        }
    })

    tableOfContents.value = toc
}

// 滚动到指定章节
const scrollToSection = (sectionId: string) => {
    // 检查答案是否隐藏 - 通过查找隐藏内容的元素
    const hiddenContent = document.querySelector('.hidden-content')
    if (hiddenContent) {
        // 答案隐藏时，只更新选中状态但不滚动
        activeSection.value = sectionId
        return
    }

    // 等待DOM更新后再查找元素
    nextTick(() => {
        // 首先尝试直接查找
        let element = document.getElementById(sectionId)

        if (!element) {
            // 如果找不到，尝试在.content-wrapper中查找
            const contentWrapper = document.querySelector('.content-wrapper')
            if (contentWrapper) {
                element = contentWrapper.querySelector(`#${sectionId}`)
            }
        }

        if (!element) {
            // 如果还找不到，尝试查找所有标题元素并匹配
            const allHeadings = document.querySelectorAll('.markdown-heading')

            // 根据目录中的标题文本查找对应的标题元素
            const targetToc = tableOfContents.value.find(item => item.id === sectionId)
            if (targetToc) {
                // 查找包含相同文本的标题元素
                element = Array.from(allHeadings).find(heading => {
                    const headingText = heading.textContent?.trim()
                    return headingText === targetToc.title
                }) as HTMLElement
            }
        }

        if (element) {
            // 找到滚动容器
            const scrollContainer = document.querySelector('.question-box')

            if (scrollContainer) {
                // 计算元素相对于滚动容器的位置
                const containerRect = scrollContainer.getBoundingClientRect()
                const elementRect = element.getBoundingClientRect()

                // 计算需要滚动的距离
                const scrollTop = scrollContainer.scrollTop
                const targetScrollTop = scrollTop + elementRect.top - containerRect.top - 80

                // 在滚动容器内滚动
                scrollContainer.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                })
            }

            activeSection.value = sectionId
        }
    })
}

// 处理问题选择
const handleQuestionSelect = async (questionId: string) => {
    try {
        if (!questionId || questionId === currentQuestionId.value) {
            return
        }
        await navigateToQuestion(questionId)
    } catch (error) {
        ElMessage.error('切换题目失败')
    }
}

// 跳转到指定题目
const navigateToQuestion = async (questionId: string) => {
    try {
        if (!questionId) {
            throw new Error('题目ID为空')
        }

        const newRoute = {
            name: 'question',
            params: { id: questionId },
            query: { ...route.query }
        }

        await router.replace(newRoute)

    } catch (error: any) {
        if (error?.name === 'NavigationDuplicated' || error?.name === 'NavigationCancelled') {
            return
        }
        throw error
    }
}

// 处理操作点击
const handleOptionClick = (action: string) => {
    switch (action) {
        case 'mark':
            ElMessage.success('标记功能待实现')
            break
        case 'share':
            ElMessage.success('分享功能待实现')
            break
        case 'star':
            ElMessage.success('收藏功能待实现')
            break
        case 'view':
            ElMessage.success('浏览功能待实现')
            break
    }
}

// 监听路由参数变化
watch(() => route.params.id, (newId, oldId) => {
    if (newId && typeof newId === 'string' && newId !== oldId) {
        fetchQuestionDetail(newId)
    }
}, { immediate: true })

// 组件挂载时获取数据
onMounted(() => {
    const questionId = route.params.id as string
    if (questionId) {
        fetchQuestionDetail(questionId)
    }
})
</script>

<style lang="css" scoped>
/* 保持原有样式并添加新样式 */
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
    overflow: hidden;
}

.header {
    position: sticky;
    top: 0;
}

.main-content {
    display: flex;
    align-items: flex-start;
    flex: 1;
    height: 100%;
}

.question-box {
    height: 100%;
    width: 100%;
    display: flex;
    overflow: auto;
    position: relative;
}

.question-content {
    flex: 1;
    padding: 20px 20px 0 20px;
    height: 100%;
}

.loading-wrapper {
    width: 100%;
    background-color: #ffffff;
    border-radius: 10px;
    padding: 26px;
    margin-bottom: 20px;
}

.question-title-box {
    width: 100%;
    min-height: 120px;
    background-color: #ffffff;
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 26px;
}

.question-title-box .question-title {
    font-size: 22px;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 15px;
}

.question-tags {
    margin-bottom: 20px;
    font-size: 12px;
}

.question-options {
    display: flex;
    color: #989a9a;
}

.question-options .option-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-right: 25px;
    transition: color 0.2s;
}

.question-options .option-item:hover {
    color: #1677ff;
}

.question-options .option-item .icon {
    margin-right: 5px;
}

.tag-difficulty {
    margin-right: 7px;
    color: #ffffff;
    border: 0px;
}

.tag-item {
    margin-right: 7px;
    background-color: #fafafa;
    color: #535353;
    border: 1px solid #e6e6e6;
}

.control-box {
    display: flex;
    justify-content: space-between;
    width: 100%;
    min-height: 80px;
    background-color: #ffffff;
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 25px;
}

.pre,
.next {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: color 0.3s;
}

.next {
    align-items: end;
}

.pre:hover:not(.disabled),
.next:hover:not(.disabled) {
    color: #1677ff;
}

.pre.disabled,
.next.disabled {
    color: #ccc;
    cursor: not-allowed;
}

.pre-next-question-title {
    margin-top: 8px;
    font-size: 12px;
    color: #1677ff;
    cursor: pointer;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
}

.pre-next-question-title.disabled {
    color: #ccc;
    cursor: default;
}

.right {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    width: 260px;
    height: 100%;
}

.right .context-box {
    margin: 20px 0;
    width: 250px;
    background-color: #ffffff;
    border-radius: 8px;
}

.context-header {
    display: flex;
    align-items: center;
    width: 100%;
    height: 60px;
    border-bottom: #e6e6e6 1px solid;
    padding: 20px 25px;
    font-weight: 600;
    justify-content: space-between;
}

.context-body {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 15px 0;
    max-height: 400px;
    overflow-y: auto;
}

.context-item {
    width: 100%;
    margin-bottom: 8px;
    padding: 8px 15px;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 4px;
    font-size: 14px;
}

.context-item:hover {
    background-color: #f0f7ff;
    color: #1890ff;
}

.context-active {
    border-left: #1890ff 3px solid;
    color: #1890ff;
    font-weight: 600;
    background-color: #f0f7ff;
}
</style>