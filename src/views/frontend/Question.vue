<template>
    <div class="container">
        <FrontendHeader class="header"></FrontendHeader>
        <div class="main-content">
            <QuestionList @select="handleQuestionSelect"></QuestionList>
            <div class="question-box">
                <div class="question-content">
                    <div class="question-title-box">
                        <div class="question-title">{{ `${currentQuestion.id}. ${currentQuestion.title}` }}</div>
                        <div class="question-tags">
                            <el-tag size="small" class="tag-difficulty"
                                :style="{ backgroundColor: difficultyColors[currentQuestion.difficulty] }">
                                {{ difficultyMap[currentQuestion.difficulty] }}
                            </el-tag>
                            <el-tag v-for="tag in currentQuestion.tags" :key="tag" size="small" class="tag-item">
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
                    <QuestionAnswer :question-id="currentQuestion.id"></QuestionAnswer>
                    <div class="control-box">
                        <div class="pre">上一题
                            <div class="pre-next-question-title">
                                <DoubleLeftOutlined />
                                415.Java中什么是反射机制?
                            </div>
                        </div>

                        <div class="next">下一题
                            <div class="pre-next-question-title">
                                417.Java中什么是序列化?
                                <DoubleRightOutlined />
                            </div>
                        </div>
                    </div>
                    <div class="comment-box"></div>
                </div>
                <div class="right">
                    <div class="context-box">
                        <div class="context-header">
                            <span>目录</span>
                            <span>
                                <DoubleRightOutlined />
                            </span>
                        </div>
                        <div class="context-body">
                            <div class="context-item context-active">
                                回答重点
                            </div>
                            <div class="context-item">
                                扩展知识
                            </div>
                        </div>
                    </div>
                    <RankList :questions="questions" :list-title="'热门题目榜'" :width="250"></RankList>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    PriceTag,
    Share,
    View,
    Star
} from '@element-plus/icons-vue'
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons-vue';
interface Question {
    id: number
    title: string
    difficulty: 'easy' | 'medium' | 'hard'
    tags?: string[]
    views: number
    stars: number
}

const questions = ref([
    { title: '你认为Java的优势是什么?', heat: 52140 },
    { title: 'Java中的序列化和反...', heat: 47358 },
    { title: '什么是Java的多态特性?', heat: 36373 },
    { title: 'MySQL中的数据排...', heat: 33784 },
    { title: '什么是Java中的不可变类?', heat: 33551 },

])
// 问题详情数据
const currentQuestion = ref<Question & { views: number; stars: number }>({
    id: 416,
    title: '什么是Java中的不可变类?',
    difficulty: 'medium',
    tags: ['Java基础', 'Java'],
    views: 31524,
    stars: 246
})

// 难度映射
const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
} as const

// 难度颜色
const difficultyColors = {
    easy: '#67c23a',
    medium: '#fd9815',
    hard: '#f56c6c'
}

// 操作选项配置
const questionOptions = computed(() => [
    { action: 'mark', icon: PriceTag, label: '标记' },
    { action: 'share', icon: Share, label: '分享' },
    { action: 'star', icon: Star, label: formatNumber(currentQuestion.value.stars) },
    { action: 'view', icon: View, label: formatNumber(currentQuestion.value.views) }
])

// 处理问题选择（接收子组件事件）
const handleQuestionSelect = (questionId: number) => {
    // 这里可以添加获取问题详情的逻辑
    console.log('加载问题详情:', questionId)
}

// 处理操作点击
const handleOptionClick = (action: string) => {
    switch (action) {
        case 'mark':
            console.log('标记问题')
            break
        case 'share':
            console.log('分享问题')
            break
        case 'star':
            console.log('收藏问题')
            break
    }
}

// 数字格式化
const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 1000).toFixed(1)}k`
    if (num >= 1000) return `${Math.round(num / 1000)}k`
    return num.toString()
}
</script>

<style lang="css" scoped>
/* 保持原有样式不变 */
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
    overflow: hidden;
    cursor: default;
}

.header {
    position: sticky;
    top: 0;
    z-index: 100;
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
}

.question-content {
    flex: 1;
    padding: 20px 20px 0 20px;
    height: 100%;
}

.question-title-box {
    width: 100%;
    height: 168px;
    background-color: #ffffff;
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 26px;
}

.question-title-box .question-title {
    font-size: 22px;
    font-weight: 600;
}

.question-tags {
    margin-top: 10px;
    font-size: 12px;

}

.question-options {
    display: flex;
    margin-top: 35px;
    color: #989a9a;
}

.question-options .option-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-right: 25px;
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
    height: 100px;
    background-color: #ffffff;
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 25px;
}

.next {
    display: flex;
    flex-direction: column;
    align-items: end;
}

.pre-next-question-title {
    margin-top: 4px;
    font-size: 12px;
    color: #1677ff;
    cursor: pointer;
}

.comment-box {
    width: 100%;
    height: 1000px;
    background-color: #ffffff;
    border-radius: 10px;
}

.right {
    display: flex;
    flex-wrap: wrap;
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
}

.context-item {
    width: 100%;
    margin-bottom: 8px;
    padding: 0 15px;
    cursor: pointer;

}

.context-active {
    border-left: #1890ff 3px solid;
    color: #1890ff;
    font-weight: 600;
}
</style>