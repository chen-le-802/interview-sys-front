<template>
    <div class="containner">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <a-spin size="large" tip="加载中...">
                <div style="height: 200px;"></div>
            </a-spin>
        </div>

        <!-- 题目内容 -->
        <div v-else-if="questions.length > 0" class="content" v-for="(question, index) in questions" :key="index">
            <div class="title">
                <span class="question-index">{{ index + 1 }}</span>
                <span class="question-topic">{{ question.topic }}</span>
                <!-- 错题本图标（仅当已提交且答错时显示） -->
                <a-tooltip v-if="submitted && !isCorrect(index)" title="加入错题本">
                    <book-outlined class="wrong-book-icon" @click="addToWrongBook(index)" />
                </a-tooltip>
            </div>

            <!-- 使用Ant Design单选框 -->
            <a-radio-group v-model:value="answers[index]" :disabled="submitted">
                <div v-for="(option, optionKey) in getOptions(question)" :key="optionKey" :class="['item', {
                    'correct-option': submitted && optionKey === question.answer,
                    'incorrect-selected': submitted && answers[index] === optionKey && !isCorrect(index)
                }]" style="font-size: 16px;">
                    <a-radio :value="optionKey">
                        {{ optionKey.toUpperCase() }}. {{ option }}
                    </a-radio>
                </div>
            </a-radio-group>

            <!-- 答案解析区 -->
            <div class="answer-panel" v-if="submitted">
                <div class="result-row">
                    <div class="result-correct">
                        <span class="result-label">正确答案：</span>
                        <span class="result-value">{{ question.answer.toUpperCase() }}</span>
                    </div>
                    <div class="result-user">
                        <span class="result-label">你的答案：</span>
                        <span :class="['result-value', {
                            'correct-answer': isCorrect(index),
                            'incorrect-answer': !isCorrect(index)
                        }]">
                            {{ answers[index]?.toUpperCase() || '未作答' }}
                        </span>
                    </div>
                </div>

                <div class="explanation" v-if="question.answerAnalysis">
                    <div class="explanation-title">官方解析：</div>
                    <div class="explanation-content">{{ question.answerAnalysis }}</div>
                </div>

                <div class="knowledge-point" v-if="question.knowledgeTags?.length">
                    <span class="knowledge-label">知识点：</span>
                    <a-tag v-for="tag in question.knowledgeTags" :key="tag" size="small">{{ tag }}</a-tag>
                </div>
            </div>
        </div>

        <!-- 无题目提示 -->
        <div v-else class="empty-container">
            <a-empty description="暂无测试题目">
                <template #description>
                    <span v-if="apiCallStatus === 'error'">获取测试题失败，请刷新重试</span>
                    <span v-else-if="apiCallStatus === 'success'">当前题目暂无测试题</span>
                    <span v-else>暂无测试题目</span>
                </template>
            </a-empty>
        </div>

        <!-- 提交按钮 -->
        <a-button v-if="questions.length > 0" type="primary" @click="submitAnswers" :loading="submitting"
            style="margin-top: 20px;">
            {{ submitted ? '重新答题' : '提交答案' }}
        </a-button>

        <!-- 错题本选择模态框 -->
        <a-modal v-model:visible="wrongBookModalVisible" title="选择错题本" @ok="confirmAddToWrongBook"
            @cancel="cancelAddToWrongBook" width="500px" :bodyStyle="{ padding: '24px' }">
            <div class="modal-content">
                <!-- 选择现有错题本 -->
                <div class="section" v-if="mistakeNotebooks.length > 0">
                    <div class="section-title">
                        <BookOutlined class="section-icon" />
                        选择错题本：
                    </div>
                    <div class="book-list">
                        <div v-for="book in mistakeNotebooks" :key="book.id"
                            :class="['book-option', { selected: selectedBookId === book.id }]"
                            @click="selectedBookId = book.id">
                            <div class="book-option-left">
                                <a-radio :value="book.id" :checked="selectedBookId === book.id" @click.stop />
                                <BookFilled :style="{ color: book.color, fontSize: '18px' }" />
                                <div class="book-info">
                                    <div class="book-name">{{ book.name }}</div>
                                    <div class="book-meta">{{ formatTime(book.createTime) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 创建新错题本 -->
                <div class="section">
                    <div class="section-title">
                        <PlusCircleOutlined class="section-icon" />
                        {{ mistakeNotebooks.length > 0 ? '或创建新错题本：' : '创建新错题本：' }}
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
                            :loading="creatingBook" class="create-btn">
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
                    <a-button type="primary" @click="confirmAddToWrongBook" :disabled="!selectedBookId"
                        :loading="addingToBook">
                        确定添加
                    </a-button>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import {
    BookOutlined,
    BookFilled,
    PlusCircleOutlined,
    PlusOutlined,
    CheckOutlined
} from '@ant-design/icons-vue';
import { getChoiceQuestionsByQuestionId, type ChoiceQuestion } from '@/apis/choiceQuestionApi';
import { userSignIn } from '@/apis/userApi';
import { getMistakeNotebooks, addMistakeNotebook, addWrongQuestionToNotebook, type MistakeNotebook } from '@/apis/mistakeNotebookApi';

// 定义props
interface TestContentProps {
    questionId: string
}

const props = withDefaults(defineProps<TestContentProps>(), {
    questionId: ''
});

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const questions = ref<ChoiceQuestion[]>([]);
const answers = ref<Record<number, string>>({});
const submitted = ref(false);
const apiCallStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');

// 错题本相关状态
const wrongBookModalVisible = ref(false);
const mistakeNotebooks = ref<MistakeNotebook[]>([]);
const selectedBookId = ref<string>();
const currentQuestionIndex = ref(-1);
const newBookName = ref('');
const newBookColor = ref('#DE868F');
const creatingBook = ref(false);
const addingToBook = ref(false);

// 颜色选项
const bookColors = [
    '#DE868F', '#65A1DC', '#FCD13C', '#50BF5B', '#EF6973',
    '#BABBCF', '#35C9DD', '#EE9762', '#3FD2A6', '#E573B4'
];

// 获取选择题选项
const getOptions = (question: ChoiceQuestion) => {
    return {
        a: question.a,
        b: question.b,
        c: question.c,
        d: question.d
    };
};

// 检查当前题目是否正确
const isCorrect = (index: number) => {
    return answers.value[index] === questions.value[index].answer;
};

// 获取选择题列表
const fetchChoiceQuestions = async () => {
    if (!props.questionId) {
        apiCallStatus.value = 'error';
        return;
    }

    loading.value = true;
    apiCallStatus.value = 'loading';

    try {
        const response = await getChoiceQuestionsByQuestionId(props.questionId);

        if (response.code === 0) {
            questions.value = response.data || [];
            apiCallStatus.value = 'success';

            if (questions.value.length === 0) {
                console.info('当前题目暂无测试题');
            }
        } else {
            apiCallStatus.value = 'error';
            message.error(response.message || '获取测试题失败');
        }
    } catch (error) {
        apiCallStatus.value = 'error';
        message.error('获取测试题失败，请检查网络连接');
    } finally {
        loading.value = false;
    }
};

// 获取错题本列表
const fetchMistakeNotebooks = async () => {
    try {
        const response = await getMistakeNotebooks();
        if (response.code === 0) {
            mistakeNotebooks.value = response.data || [];
        }
    } catch (error) {
        // 静默处理错题本获取失败
    }
};

// 提交/重置答题
const submitAnswers = async () => {
    if (submitted.value) {
        // 重置答题状态
        answers.value = {};
        submitted.value = false;
        return;
    }

    // 检查是否所有题目都已作答
    const unansweredCount = questions.value.length - Object.keys(answers.value).length;
    if (unansweredCount > 0) {
        const confirmed = await new Promise((resolve) => {
            message.warning({
                content: `还有 ${unansweredCount} 道题未作答，确定要提交吗？`,
                duration: 0,
                onClose: () => resolve(true)
            });
        });
        if (!confirmed) return;
    }

    submitting.value = true;
    try {
        // 提交答案
        submitted.value = true;

        // 统计答题结果
        const totalCount = questions.value.length;
        const answeredCount = Object.keys(answers.value).length;
        const correctCount = questions.value.filter((_, index) => isCorrect(index)).length;
        const wrongCount = answeredCount - correctCount;

        // 调用用户签到接口
        try {
            const signInResponse = await userSignIn();

            if (signInResponse.code === 0) {
                message.success('签到成功！');
            } else if (signInResponse.message && !signInResponse.message.includes('已签到')) {
                message.warning(`签到失败: ${signInResponse.message}`);
            }
        } catch (signInError) {
            message.warning('签到失败，但答题结果已保存');
        }

        // 显示答题结果
        if (wrongCount > 0) {
            message.info(`测试完成！答对 ${correctCount}/${totalCount} 题，共有 ${wrongCount} 道错题，可点击错题本图标加入错题本`);
        } else if (answeredCount === totalCount) {
            message.success(`恭喜！全部答对了！答对 ${correctCount}/${totalCount} 题`);
        } else {
            message.info(`测试完成！答对 ${correctCount}/${answeredCount} 题`);
        }

    } catch (error) {
        message.error('提交失败，请重试');
        submitted.value = false;
    } finally {
        submitting.value = false;
    }
};

// 点击错题本图标
const addToWrongBook = async (index: number) => {
    if (isCorrect(index)) {
        message.warning('该题目回答正确，无需加入错题本');
        return;
    }

    currentQuestionIndex.value = index;
    wrongBookModalVisible.value = true;

    // 获取错题本列表
    await fetchMistakeNotebooks();

    // 重置状态
    selectedBookId.value = mistakeNotebooks.value[0]?.id;
    newBookName.value = '';
    newBookColor.value = '#DE868F';
};

// 创建新错题本并选择
const createAndSelectBook = async () => {
    if (!newBookName.value.trim()) {
        message.warning('请输入错题本名称');
        return;
    }

    creatingBook.value = true;
    try {
        const response = await addMistakeNotebook({
            name: newBookName.value.trim(),
            color: newBookColor.value
        });

        if (response.code === 0) {
            message.success(`已创建错题本: ${newBookName.value}`);
            // 重新获取错题本列表
            await fetchMistakeNotebooks();
            // 选择新创建的错题本
            selectedBookId.value = response.data;
            newBookName.value = '';
        } else {
            message.error(response.message || '创建错题本失败');
        }
    } catch (error) {
        message.error('创建错题本失败');
    } finally {
        creatingBook.value = false;
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
const confirmAddToWrongBook = async () => {
    if (!selectedBookId.value) {
        message.warning('请选择一个错题本');
        return;
    }

    const question = questions.value[currentQuestionIndex.value];
    if (!question || !question.id) {
        message.error('题目信息不完整');
        return;
    }

    addingToBook.value = true;
    try {
        const response = await addWrongQuestionToNotebook({
            choiceQuestionId: question.id,
            mistakeNoteBookId: selectedBookId.value
        });

        if (response.code === 0) {
            const selectedBook = mistakeNotebooks.value.find(b => b.id === selectedBookId.value);
            message.success(`已加入错题本: ${selectedBook?.name || '未知'}`);
            wrongBookModalVisible.value = false;
        } else {
            message.error(response.message || '添加到错题本失败');
        }
    } catch (error) {
        message.error('添加到错题本失败');
    } finally {
        addingToBook.value = false;
    }
};

// 格式化时间
const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
};

// 监听questionId变化，重新获取数据
watch(() => props.questionId, (newQuestionId) => {
    if (newQuestionId) {
        // 重置状态
        questions.value = [];
        answers.value = {};
        submitted.value = false;
        apiCallStatus.value = 'idle';
        // 获取新的选择题
        fetchChoiceQuestions();
    }
}, { immediate: true });

// 组件挂载时获取数据
onMounted(() => {
    if (props.questionId) {
        fetchChoiceQuestions();
    }
});
</script>

<style scoped>
.containner {
    width: 100%;
    padding: 20px;
    padding-top: 0px;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

.empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

.containner .content {
    margin-top: 30px;
    width: 100%;
    border-bottom: #F0F0F0 1px dotted;
    padding-bottom: 20px;
    position: relative;
}

/* 题目标题区域 */
.containner .content .title {
    font-size: 18px;
    color: #333;
    font-weight: 600;
    margin-bottom: 30px;
    display: flex;
    align-items: flex-start;
    white-space: pre-line;
    line-height: 1.6;
}

/* 题目序号 */
.question-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #1890ff, #40a9ff);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    margin-right: 12px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

/* 题目内容 */
.question-topic {
    flex: 1;
    min-width: 0;
}

/* 错题本图标 */
.wrong-book-icon {
    margin-left: 12px;
    color: #ff4d4f;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s;
    padding: 4px;
    border-radius: 4px;
}

.wrong-book-icon:hover {
    color: #ff7875;
    transform: scale(1.1);
    background-color: #fff2f0;
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

.knowledge-label {
    color: #666;
    font-weight: 600;
    margin-right: 8px;
}

/* 错题本模态框样式优化 */
.modal-content {
    position: relative;
}

.section {
    margin-bottom: 20px;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
}

.section-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
}

.section-icon {
    margin-right: 6px;
    color: #1890ff;
    font-size: 14px;
}

/* 错题本列表 */
.book-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.book-option {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.book-option:hover {
    border-color: #40a9ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.book-option.selected {
    border-color: #1890ff;
    background-color: #f0f9ff;
}

.book-option-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
}

.book-info {
    flex: 1;
}

.book-name {
    font-weight: 500;
    color: #333;
    margin-bottom: 2px;
    font-size: 14px;
}

.book-meta {
    color: #999;
    font-size: 12px;
}

/* 创建错题本表单 */
.create-book-form {
    background: #fff;
    padding: 16px;
    border-radius: 6px;
    border: 1px solid #e8e8e8;
}

.book-name-input {
    margin-bottom: 12px;
}

.color-selector {
    margin-bottom: 16px;
}

.color-label {
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
    font-size: 13px;
}

.color-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.color-option {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.color-option:hover {
    transform: scale(1.05);
}

.color-option.selected {
    border-color: #1890ff;
    transform: scale(1.05);
}

.check-icon {
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.create-btn {
    width: 100%;
}

/* 模态框底部 */
.modal-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.color-option[style*="#DE868F"] {
    background-color: #DE868F !important;
}

.color-option[style*="#65A1DC"] {
    background-color: #65A1DC !important;
}

.color-option[style*="#FCD13C"] {
    background-color: #FCD13C !important;
}

.color-option[style*="#50BF5B"] {
    background-color: #50BF5B !important;
}

.color-option[style*="#EF6973"] {
    background-color: #EF6973 !important;
}

.color-option[style*="#BABBCF"] {
    background-color: #BABBCF !important;
}

.color-option[style*="#35C9DD"] {
    background-color: #35C9DD !important;
}

.color-option[style*="#EE9762"] {
    background-color: #EE9762 !important;
}

.color-option[style*="#3FD2A6"] {
    background-color: #3FD2A6 !important;
}

.color-option[style*="#E573B4"] {
    background-color: #E573B4 !important;
}

/* 禁用状态样式 */
:where(.css-dev-only-do-not-override-1p3hq3p).ant-radio-wrapper-disabled {
    cursor: not-allowed;
    color: black;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .containner {
        padding: 16px;
    }

    .question-index {
        min-width: 28px;
        height: 28px;
        font-size: 12px;
        margin-right: 8px;
    }

    .containner .content .title {
        font-size: 16px;
        margin-bottom: 20px;
    }

    .result-row {
        flex-direction: column;
        gap: 12px;
    }

    .section {
        padding: 12px;
    }

    .book-option {
        padding: 10px;
    }

    .color-options {
        gap: 4px;
    }

    .color-option {
        width: 24px;
        height: 24px;
    }
}

@media (max-width: 480px) {
    .containner {
        padding: 12px;
    }

    .containner .content .title {
        font-size: 15px;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .question-index {
        align-self: flex-start;
    }

    .wrong-book-icon {
        margin-left: 0;
        margin-top: 4px;
    }
}
</style>