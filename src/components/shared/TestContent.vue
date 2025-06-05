<template>
    <div class="containner">
        <div class="content" v-for="(question, index) in questions" :key="index">
            <div class="title">{{ question.title }}</div>
            
            <!-- 使用Ant Design单选框 -->
            <a-radio-group v-model:value="answers[index]" :disabled="submitted" >
                <div v-for="(option, optionIndex) in question.options" :key="optionIndex"
                    :class="['item', {
                        'correct-option': submitted && option.charAt(0) === question.correctAnswer,
                        'incorrect-selected': submitted && answers[index] === option.charAt(0) && !isCorrect(index)
                    }]" style="font-size: 16px;">
                    <a-radio :value="option.charAt(0)">
                        {{ option }}
                    </a-radio>
                </div>
            </a-radio-group>
            
            <!-- 答案解析区 -->
            <div class="answer-panel" v-if="submitted">
                <div class="result-row">
                    <div class="result-correct">
                        <span class="result-label">正确答案：</span>
                        <span class="result-value">{{ question.correctAnswer }}</span>
                    </div>
                    <div class="result-user">
                        <span class="result-label">你的答案：</span>
                        <span :class="['result-value', {
                            'correct-answer': isCorrect(index),
                            'incorrect-answer': !isCorrect(index)
                        }]">
                            {{ answers[index] || '未作答' }}
                        </span>
                    </div>
                </div>
                
                <div class="explanation">
                    <div class="explanation-title">官方解析：</div>
                    <div class="explanation-content">{{ question.explanation }}</div>
                </div>
                
                <div class="knowledge-point">
                    <span class="knowledge-label">知识点：</span>
                    {{ question.knowledgePoint }}
                </div>
                
                <div class="related-question">
                    <span class="related-label">关联题目：</span>
                    {{ question.relatedQuestion }}
                </div>
            </div>
        </div>
        
        <a-button type="primary" @click="submitAnswers" style="margin-top: 20px;">
            {{ submitted ? '重新答题' : '提交答案' }}
        </a-button>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 定义题目数据结构
interface Question {
    title: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    knowledgePoint: string;
    relatedQuestion: string;
}

// 带解析的题目数据
const questions = ref<Question[]>([
    {
        title: "1.什么是线程安全？（ ）",
        options: [
            "A.多线程访问某一共享资源",
            "B.在多线程环境下",
            "C.多个线程同时访问同一资源时",
            "D.多个线程同时访问同一资源时，能够保证数据的一致性和正确性"
        ],
        correctAnswer: "D",
        explanation: "线程安全是指多个线程同时访问同一共享资源时，能够保证资源的状态保持一致且符合预期。选项D准确描述了线程安全的定义。",
        knowledgePoint: "线程安全",
        relatedQuestion: "线程安全的实现方式有哪些?"
    },
    {
        title: "2.Vue3中的Composition API相比Options API的主要优势是？（ ）",
        options: [
            "A.更简洁的语法",
            "B.更好的类型推导支持",
            "C.更好的代码组织和逻辑复用",
            "D.更小的打包体积"
        ],
        correctAnswer: "C",
        explanation: "Composition API的核心优势在于能够更好地组织和复用逻辑代码，特别是在处理复杂组件时。",
        knowledgePoint: "Vue3 Composition API",
        relatedQuestion: "Composition API中ref和reactive的区别?"
    },
    {
        title: "3.TypeScript的主要作用是？（ ）",
        options: [
            "A.提升代码性能",
            "B.提供静态类型检查",
            "C.减少代码量",
            "D.增强CSS功能"
        ],
        correctAnswer: "B",
        explanation: "TypeScript的核心功能是提供静态类型系统，可以在编译时检测类型错误，提高代码质量和开发效率。",
        knowledgePoint: "TypeScript类型系统",
        relatedQuestion: "TypeScript中的interface和type有什么区别?"
    },
    // 添加截图中的题目
    {
        title: "4.以下关于接口成员变量的描述正确的是？（ ）",
        options: [
            "A.接口中的成员变量默认为public static final。",
            "B.接口中的成员变量可以为private。",
            "C.接口中的成员变量是实例变量。",
            "D.接口不能包含成员变量。"
        ],
        correctAnswer: "A",
        explanation: "在接口中，成员变量默认是public static final，即常量。",
        knowledgePoint: "接口成员变量",
        relatedQuestion: "接口和抽象类有什么区别?"
    }
]);

// 存储用户选择的答案（格式：{0: 'A', 1: 'B'}）
const answers = ref<Record<number, string>>({});

// 标记是否已提交
const submitted = ref(false);

// 检查当前题目是否正确
const isCorrect = (index: number) => {
    return answers.value[index] === questions.value[index].correctAnswer;
};

// 提交/重置答题
const submitAnswers = () => {
    if (submitted.value) {
        // 重置答题状态
        answers.value = {};
        submitted.value = false;
    } else {
        // 提交答案
        submitted.value = true;
    }
};
</script>

<style scoped>
.containner {
    width:100%;
    padding: 20px;
    padding-top: 0px;
   
}

.containner .content{
    margin-top: 30px;
    width:100%;
    border-bottom:#F0F0F0 1px dotted ;
    padding-bottom: 20px;
   
}

.containner .content .title {
    font-size: 18px;
    color: #333;
    font-weight: 600;
    margin-bottom: 30px;
}

.containner .content .item {
    margin-bottom: 15px;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.correct-option {
    background-color: #f6ffed !important;
    border-left: 4px solid #52c41a;
}

.incorrect-selected {
    background-color: #fff2f0 !important;
    border-left: 4px solid #ff4d4f;
}

.containner .content .item .ant-radio-wrapper {
    display: block;
    line-height: 1.5;
    font-size: 15px;
}

.containner .content .item .ant-radio {
    margin-right: 8px;
}

/* 答案结果样式 */
.answer-panel {
    margin-top: 20px;
    border-top: 1px dashed #f0f0f0;
    padding-top: 16px;
    font-size: 15px;
}

.result-row {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
}

.result-correct, .result-user {
    display: flex;
    align-items: center;
}

.result-label {
    color: #666;
}

.result-value {
    font-weight: 500;
    margin-left: 8px;
    padding: 2px 8px;
    border-radius: 4px;
}

.correct-answer {
    background-color: #f6ffed;
    color: #52c41a;
}

.incorrect-answer {
    background-color: #fff2f0;
    color: #ff4d4f;
}

.explanation-title {
    font-weight: 600;
    margin-bottom: 8px;
}

.explanation-content {
    background-color: #f9f9f9;
    padding: 12px;
    border-radius: 4px;
    color: #333;
    line-height: 1.6;
}

.knowledge-point{
    margin-top: 12px;
  
}
.related-question {
    margin-top: 12px;
    color: #1677FF;
    cursor: pointer;
}

.knowledge-label, .related-label {
    color: #666;
    font-weight: 600;
}
:where(.css-dev-only-do-not-override-1p3hq3p).ant-radio-wrapper-disabled {
    cursor: not-allowed;
    color: black
}
</style>