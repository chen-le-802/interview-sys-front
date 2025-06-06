<template>
    <div class="question-answer-box">
        <div class="nav">
            <ul>
                <li :class="{ 'nav-active': current === 'answer' }" @click="current = 'answer'">推荐答案</li>
                <li :class="{ 'nav-active': current === 'test' }" @click="current = 'test'">测试一下</li>
            </ul>
            <div v-if="current === 'answer'" class="hide-answer" @click="toggleAnswer">
                <el-icon>
                    <View v-if="!showAnswer"></View>
                    <Hide v-else></Hide>
                </el-icon>
                <span>{{ showAnswer ? '隐藏答案' : '显示答案' }}</span>
            </div>
        </div>

        <!-- 答案内容 -->
        <AnswerContent v-if="current === 'answer'" :question-id="questionId" :content="content" :answer="answer">
        </AnswerContent>

        <!-- 测试内容 -->
        <TestContent v-if="current === 'test'"></TestContent>
    </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'

// Props 接口定义
interface QuestionAnswerProps {
    questionId: string
    content?: string
    answer?: string
}

const props = withDefaults(defineProps<QuestionAnswerProps>(), {
    content: '',
    answer: ''
})

// 响应式数据
const showAnswer = ref(true)
const current = ref('answer')

// 切换答案显示状态
const toggleAnswer = () => {
    showAnswer.value = !showAnswer.value
}

// 向子组件提供显示状态
provide('showAnswer', showAnswer)
</script>

<style lang="css" scoped>
.nav-active {
    border-bottom: 2px solid #1677ff;
    color: #1677ff;
    font-weight: 500;
}

.question-answer-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #ffffff;
    border-radius: 10px;
    margin-bottom: 20px;
}

.question-answer-box .nav {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 60px;
    line-height: 60px;
    border-bottom: #f5f5f5 solid 1.5px;
    padding: 0 25px;
}

.question-answer-box .nav ul {
    font-size: 16px;
    height: 59px;
    display: flex;
}

.question-answer-box .nav ul li {
    display: block;
    margin-right: 30px;
    cursor: pointer;
    transition: color 0.3s;
}

.question-answer-box .nav ul li:hover {
    color: #1677ff;
}

.hide-answer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #c1c1c1;
    margin-right: 10px;
    cursor: pointer;
    transition: color 0.3s;
    font-size: 14px;
    padding: 5px;
    border-radius: 4px;
    user-select: none;
}

.hide-answer:hover {
    color: #1677ff;
    background-color: #f0f7ff;
}

.hide-answer span {
    margin-left: 5px;
}
</style>