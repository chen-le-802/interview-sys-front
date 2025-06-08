<template>
    <div class="containner">
        <div class="content" v-for="(question, index) in questions" :key="index">
            <div class="title">
                {{ question.title }}
                <!-- 错题本图标（仅当已提交且答错时显示） -->
                <a-tooltip v-if="submitted && !isCorrect(index)" title="加入错题本">
                    <book-outlined 
                        class="wrong-book-icon" 
                        @click="addToWrongBook(index)"
                    />
                </a-tooltip>
            </div>
            
            <!-- 使用Ant Design单选框 -->
            <a-radio-group v-model:value="answers[index]" :disabled="submitted">
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

        <!-- 错题本选择模态框 -->
        <a-modal 
            v-model:visible="wrongBookModalVisible" 
            title="选择错题本" 
            @ok="confirmAddToWrongBook"
            @cancel="wrongBookModalVisible = false"
        >
            <div style="margin-bottom: 16px;">
                <a-radio-group v-model:value="selectedBookId">
                    <a-radio 
                        v-for="book in availableBooks" 
                        :key="book.id" 
                        :value="book.id"
                        style="display: block; margin-bottom: 8px;"
                    >
                        {{ book.name }}
                    </a-radio>
                </a-radio-group>
            </div>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { BookOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 定义题目数据结构
interface Question {
    title: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    knowledgePoint: string;
    relatedQuestion: string;
}

// 定义错题本数据结构
interface Book {
    id: number;
    name: string;
    type: string;
    count: number;
}

// 模拟从API获取的错题本数据
const availableBooks = computed(() => {
    return [
        { id: 1, name: '前端错题', type: 'front', count: 42 },
        { id: 2, name: '后端错题', type: 'back', count: 28 },
        { id: 3, name: '运维错题', type: 'ops', count: 15 }
    ];
});

// 带解析的题目数据
const questions = ref<Question[]>([
    {
        title: "1.下列关于进程和线程的描述，正确的是：",
        options: [
            "A. 进程是任务执行的基本单位，线程是资源分配的基本单位",
            "B. 进程是资源分配的基本单位，线程是任务执行的基本单位",
            "C. 进程和线程都是资源分配的基本单位",
            "D. 进程和线程都是任务执行的基本单位"
        ],
        correctAnswer: "B",
        explanation: " 进程是操作系统资源分配的基本单位，拥有独立的内存空间；线程是进程内的任务执行单位，共享所属进程的资源。",
        knowledgePoint: "进程与线程",
        relatedQuestion: "在Linux系统中，执行fork()系统调用后，父进程和子进程的关系是什么？子进程会继承父进程的哪些资源？"
    },
    {
        title: "2.关于进程和线程的资源管理和通信机制，下列说法错误的是：",
        options: [
            "A. 进程间通信需要使用IPC机制，如管道、信号量、共享内存等",
            "B. 线程可以直接读写进程内存，但需要同步控制避免竞态条件",
            "C. 进程切换开销较高，因为需要切换虚拟地址空间",
            "D. 线程间可以直接共享文件句柄和系统资源"
        ],
        correctAnswer: "D",
        explanation: " 线程共享所属进程的资源，包括内存空间，但文件句柄等系统资源是进程级别的。线程间通信主要通过共享内存变量实现，而不是直接共享系统资源。",
        knowledgePoint: "进程间通信",
        relatedQuestion: "请比较管道(pipe)、消息队列(message queue)、共享内存(shared memory)三种IPC机制的特点，并说明各自的适用场景。"
    },
    {
        title: "3.以下应用场景中，最适合使用多进程架构而非多线程架构的是：",
        options: [
            "A. GUI应用程序中分离界面线程和业务逻辑线程",
            "B. Web服务器使用连接线程池处理用户请求",
            "C. 浏览器为每个标签页分配独立的执行环境",
            "D. 游戏引擎中分离渲染线程、逻辑线程和音频线程"
        ],
        correctAnswer: "C",
        explanation: "浏览器标签页使用多进程架构可以确保一个标签页崩溃不影响其他标签页，提高稳定性。其他选项都更适合多线程架构，因为需要高效的数据共享和低切换开销。",
        knowledgePoint: "多进程架构",
        relatedQuestion: " Apache Web服务器的prefork模式和worker模式分别采用什么并发模型？各有什么优缺点？在什么情况下选择哪种模式？"
    },
    {
    title: `4.考虑以下代码场景，在多线程环境下访问全局变量 global_counter：
        cint global_counter = 0;
        void increment() {
            global_counter++;  // 非原子操作
        }
        关于这种情况的分析，正确的是：`,
        options: [
                "A. 多个线程同时调用increment()是安全的，因为线程共享进程内存",
                "B. 需要使用互斥锁等同步机制保护临界区，防止竞态条件",
                "C. 应该为每个线程创建独立的进程来避免数据冲突",
                "D. 可以通过进程间通信(IPC)来安全地访问共享变量"
        ],
        correctAnswer: "B",
        explanation: "虽然线程可以直接访问共享内存，但对共享变量的非原子操作会产生竞态条件。需要使用mutex、semaphore等同步机制来保护临界区，确保数据一致性。选项C和D的解决方案过度复杂且不必要。",
        knowledgePoint: "多线程编程",
        relatedQuestion: "请设计一个生产者-消费者模型，使用信号量(semaphore)机制解决同步问题。说明如何避免缓冲区溢出和数据竞争。"
    }
]);

// 存储用户选择的答案（格式：{0: 'A', 1: 'B'}）
const answers = ref<Record<number, string>>({});

// 标记是否已提交
const submitted = ref(false);

// 错题本相关状态
const wrongBookModalVisible = ref(false);
const selectedBookId = ref(1); // 默认选择第一个错题本
const currentQuestionIndex = ref(-1); // 当前要加入错题本的题目索引

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

// 点击错题本图标
const addToWrongBook = (index: number) => {
    if (!isCorrect(index)) {
        currentQuestionIndex.value = index;
        wrongBookModalVisible.value = true;
    }
};

// 确认加入错题本
const confirmAddToWrongBook = () => {
    if (!selectedBookId.value) {
        message.warning('请选择一个错题本');
        return;
    }

    const question = questions.value[currentQuestionIndex.value];
    const selectedBook = availableBooks.value.find(b => b.id === selectedBookId.value);
    
    if (selectedBook) {
        // 调用API将题目添加到错题本
        message.success(`已加入错题本: ${selectedBook.name}`);
        
        // 模拟添加到错题本
        console.log('添加到错题本:', {
            bookId: selectedBookId.value,
            question: question
        });
    }
    
    wrongBookModalVisible.value = false;
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
    display: flex;
    align-items: center;
    white-space: pre-line;
}

.wrong-book-icon {
    margin-left: 12px;
    color: #ff4d4f;
    cursor: pointer;
    font-size: 16px;
}

.wrong-book-icon:hover {
    color: #ff7875;
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