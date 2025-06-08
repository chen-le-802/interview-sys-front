<template>
    <div class="containner">
        <div class="content" v-for="(question, index) in questions" :key="index">
            <div class="title">
                {{ question.title }}
                <!-- 错题本图标（仅当已提交且答错时显示） -->
                <a-tooltip v-if="submitted && !isCorrect(index)" title="加入错题本">
                    <book-outlined class="wrong-book-icon" @click="addToWrongBook(index)" />
                </a-tooltip>
            </div>

            <!-- 使用Ant Design单选框 -->
            <a-radio-group v-model:value="answers[index]" :disabled="submitted">
                <div v-for="(option, optionIndex) in question.options" :key="optionIndex" :class="['item', {
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
        <a-modal v-model:visible="wrongBookModalVisible" title="选择错题本" @ok="confirmAddToWrongBook"
            @cancel="cancelAddToWrongBook" width="500px" :bodyStyle="{ padding: '24px' }">
            <div class="modal-content">
                <!-- 选择现有错题本 -->
                <div class="section">
                    <div class="section-title">
                        <BookOutlined class="section-icon" />
                        选择错题本：
                    </div>
                    <div class="book-list">
                        <div v-for="book in errorStore.books" :key="book.id"
                            :class="['book-option', { selected: selectedBookId === book.id }]"
                            @click="selectedBookId = book.id">
                            <div class="book-option-left">
                                <a-radio :value="book.id" :checked="selectedBookId === book.id" @click.stop />
                                <BookFilled :style="{ color: book.color, fontSize: '18px' }" />
                                <div class="book-info">
                                    <div class="book-name">{{ book.name }}</div>
                                    <div class="book-meta">{{ book.count }}题 · {{ book.createTime }}</div>
                                </div>
                            </div>
                            <div class="book-count-badge">{{ book.count }}</div>
                        </div>
                    </div>
                </div>

                <!-- 创建新错题本 -->
                <div class="section">
                    <div class="section-title">
                        <PlusCircleOutlined class="section-icon" />
                        或创建新错题本：
                    </div>
                    <div class="create-book-form">
                        <a-input v-model:value="newBookName" placeholder="输入新错题本名称" class="book-name-input"
                            @pressEnter="createAndSelectBook" />

                        <div class="color-selector">
                            <div class="color-label">选择颜色：</div>
                            <div class="color-options">
                                <div v-for="color in bookColors" :key="color"
                                    :class="['color-option', { selected: newBookColor === color }]"
                                    :style="{ backgroundColor: color }" @click="newBookColor = color">
                                    <CheckOutlined v-if="newBookColor === color" class="check-icon" />
                                </div>
                            </div>
                        </div>

                        <a-button type="dashed" block @click="createAndSelectBook" :disabled="!newBookName.trim()"
                            class="create-btn">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                            创建并选择
                        </a-button>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="modal-footer">
                    <a-button @click="cancelAddToWrongBook">取消</a-button>
                    <a-button type="primary" @click="confirmAddToWrongBook" :disabled="!selectedBookId">
                        确定添加
                    </a-button>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import {
    BookOutlined,
    BookFilled,
    PlusCircleOutlined,
    PlusOutlined,
    CheckOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useErrorNotebookStore, type Question } from '@/stores/errorNoteBook';

// 使用错题本 store
const errorStore = useErrorNotebookStore();

// 定义题目数据结构接口
interface QuestionWithCorrectAnswer extends Question {
    // 继承了 Question 的所有属性
}

// 带解析的题目数据
const questions = ref<QuestionWithCorrectAnswer[]>([
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
const selectedBookId = ref<number>(); // 不设默认值，强制用户选择
const currentQuestionIndex = ref(-1); // 当前要加入错题本的题目索引
const newBookName = ref(''); // 新错题本名称
const newBookColor = ref('#DE868F'); // 新错题本颜色

// 颜色选项
const bookColors = [
    '#DE868F', '#65A1DC', '#FCD13C', '#50BF5B', '#EF6973',
    '#BABBCF', '#35C9DD', '#EE9762', '#3FD2A6', '#E573B4'
];

// 计算属性：获取可用的错题本（从store中获取）
const availableBooks = computed(() => errorStore.books);

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

        // 统计错题数量
        const wrongCount = questions.value.filter((_, index) => !isCorrect(index)).length;
        if (wrongCount > 0) {
            message.info(`本次测试完成！共有 ${wrongCount} 道错题，可点击错题本图标加入错题本`);
        } else {
            message.success('恭喜！全部答对了！');
        }
    }
};

// 点击错题本图标
const addToWrongBook = (index: number) => {
    if (!isCorrect(index)) {
        currentQuestionIndex.value = index;
        wrongBookModalVisible.value = true;
        // 重置状态
        selectedBookId.value = errorStore.books[0]?.id; // 默认选择第一个错题本
        newBookName.value = '';
        newBookColor.value = '#DE868F';
    }
};

// 创建新错题本并选择
const createAndSelectBook = () => {
    if (!newBookName.value.trim()) {
        message.warning('请输入错题本名称');
        return;
    }

    try {
        // 创建新错题本
        const newBook = errorStore.addBook(newBookName.value.trim(), newBookColor.value);
        selectedBookId.value = newBook.id;
        newBookName.value = '';
        message.success(`已创建错题本: ${newBook.name}`);
    } catch (error) {
        message.error('创建错题本失败');
        console.error('创建错题本失败:', error);
    }
};

// 取消添加到错题本
const cancelAddToWrongBook = () => {
    wrongBookModalVisible.value = false;
    selectedBookId.value = undefined;
    newBookName.value = '';
    newBookColor.value = '#DE868F';
};

// 确认加入错题本
const confirmAddToWrongBook = () => {
    if (!selectedBookId.value) {
        message.warning('请选择一个错题本');
        return;
    }

    const question = questions.value[currentQuestionIndex.value];
    const userAnswer = answers.value[currentQuestionIndex.value] || '未作答';

    // 使用 store 方法添加错题
    try {
        const newError = errorStore.addErrorToBook(
            selectedBookId.value,
            question,
            userAnswer,
            currentQuestionIndex.value
        );

        const selectedBook = errorStore.books.find(b => b.id === selectedBookId.value);
        if (selectedBook) {
            message.success(`已加入错题本: ${selectedBook.name}`);
        }

        console.log('添加到错题本成功:', newError);
        wrongBookModalVisible.value = false;
    } catch (error) {
        message.error('添加到错题本失败');
        console.error('添加错题失败:', error);
    }
};
</script>

<style scoped>
.containner {
    width: 100%;
    padding: 20px;
    padding-top: 0px;
}

.containner .content {
    margin-top: 30px;
    width: 100%;
    border-bottom: #F0F0F0 1px dotted;
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
    transition: all 0.3s;
}

.wrong-book-icon:hover {
    color: #ff7875;
    transform: scale(1.1);
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

.result-correct,
.result-user {
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

.knowledge-point {
    margin-top: 12px;
}

.related-question {
    margin-top: 12px;
    color: #1677FF;
    cursor: pointer;
}

.knowledge-label,
.related-label {
    color: #666;
    font-weight: 600;
}

:where(.css-dev-only-do-not-override-1p3hq3p).ant-radio-wrapper-disabled {
    cursor: not-allowed;
    color: black
}

/* 模态框样式 */
.modal-content {
    max-height: 500px;
    overflow-y: auto;
}

.section {
    margin-bottom: 24px;
}

.section:last-child {
    margin-bottom: 0;
}

.section-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 16px;
}

.section-icon {
    margin-right: 8px;
    color: #1890ff;
}

.book-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.book-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.book-option:hover {
    border-color: #1890ff;
    background-color: #f0f7ff;
}

.book-option.selected {
    border-color: #1890ff;
    background-color: #e6f7ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.book-option-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.book-info {
    flex: 1;
}

.book-name {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
    margin-bottom: 4px;
}

.book-meta {
    font-size: 12px;
    color: #8c8c8c;
}

.book-count-badge {
    background: #f0f0f0;
    color: #595959;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    min-width: 20px;
    text-align: center;
}

.book-option.selected .book-count-badge {
    background: #1890ff;
    color: white;
}

.create-book-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.book-name-input {
    border-radius: 6px;
}

.color-selector {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.color-label {
    font-size: 14px;
    color: #595959;
    font-weight: 500;
}

.color-options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.color-option {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    position: relative;
}

.color-option:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.color-option.selected {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.check-icon {
    color: white;
    font-size: 14px;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.create-btn {
    border-color: #1890ff;
    color: #1890ff;
    font-weight: 500;
    transition: all 0.3s;
}

.create-btn:hover:not(:disabled) {
    border-color: #40a9ff;
    color: #40a9ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.create-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
</style>