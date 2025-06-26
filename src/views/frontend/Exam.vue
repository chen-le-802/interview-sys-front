<template>
    <div style="background-color: #f5f5f5;">
        <FrontendHeader></FrontendHeader>
        <div class="header">
            <div class="header-box">
                <a-button type="text" style="font-size: 15px;" @click="handleExitExam">
                    <ArrowLeftOutlined />退出答题
                </a-button>
                <div class="title">{{ examTitle }} - 在线测验</div>
                <div class="timer" v-if="examStarted && !examFinished">
                    剩余时间: {{ formatTime(remainingTime) }}
                </div>
            </div>
        </div>

        <!-- 考试未开始状态 -->
        <div v-if="!examStarted" class="exam-box">
            <div class="start-exam">
                <h2>在线测验说明</h2>
                <p>• 本次测验共 {{ examQuestions.length }} 道选择题</p>
                <p>• 考试时间：{{ Math.ceil(examQuestions.length * 2) }} 分钟</p>
                <p>• 每题只能选择一个答案</p>
                <p>• 可随时查看答题进度</p>
                <p>• 提交后将显示答题结果和正确答案</p>
                <a-button type="primary" size="large" @click="startExam">开始考试</a-button>
            </div>
        </div>

        <!-- 考试进行中 -->
        <div v-else-if="!examFinished" class="exam-box">
            <div class="progress-section">
                <a-progress :percent="Math.round(((currentQuestionIndex + 1) / examQuestions.length) * 100)"
                    :stroke-width="8" stroke-color="#1677ff" />
                <span class="progress-text">第 {{ currentQuestionIndex + 1 }} 题 / 共 {{ examQuestions.length }} 题</span>
            </div>

            <div class="question-container" v-if="currentQuestion">
                <!-- 题目内容 -->
                <div class="content">
                    <div class="question-header">
                        <span class="question-number">第 {{ currentQuestionIndex + 1 }} 题</span>
                        <span class="question-difficulty"
                            :class="getDifficultyClass(currentQuestion.questionDifficulty)">
                            {{ currentQuestion.questionDifficulty || '未知' }}
                        </span>
                    </div>

                    <div class="title">
                        <span class="question-topic">{{ currentQuestion.choiceDetails.topic }}</span>
                    </div>

                    <!-- 选择题选项 -->
                    <a-radio-group v-model:value="userAnswers[currentQuestionIndex]" size="large">
                        <div v-for="option in ['a', 'b', 'c', 'd']" :key="option" class="item">
                            <a-radio :value="option">
                                {{ option.toUpperCase() }}. {{ currentQuestion.choiceDetails[option] }}
                            </a-radio>
                        </div>
                    </a-radio-group>
                </div>

                <!-- 导航按钮 -->
                <div class="navigation-buttons">
                    <a-button v-if="currentQuestionIndex > 0" @click="previousQuestion" size="large">
                        上一题
                    </a-button>
                    <a-button v-if="currentQuestionIndex < examQuestions.length - 1" type="primary"
                        @click="nextQuestion" size="large">
                        下一题
                    </a-button>
                    <a-button v-if="currentQuestionIndex === examQuestions.length - 1" type="primary"
                        @click="() => submitExam()" size="large" :loading="submitting">
                        提交答卷
                    </a-button>
                </div>
            </div>

            <!-- 答题进度概览 -->
            <div class="progress-overview">
                <div class="overview-title">答题进度</div>
                <div class="question-grid">
                    <div v-for="(question, index) in examQuestions" :key="index" :class="[
                        'question-item',
                        {
                            'current': index === currentQuestionIndex,
                            'answered': userAnswers[index],
                            'unanswered': !userAnswers[index]
                        }
                    ]" @click="jumpToQuestion(index)">
                        {{ index + 1 }}
                    </div>
                </div>
                <div class="legend">
                    <span class="legend-item">
                        <span class="legend-color current"></span>当前题目
                    </span>
                    <span class="legend-item">
                        <span class="legend-color answered"></span>已答题
                    </span>
                    <span class="legend-item">
                        <span class="legend-color unanswered"></span>未答题
                    </span>
                </div>
            </div>
        </div>

        <!-- 考试结果 -->
        <div v-else class="exam-box">
            <div class="result-container">
                <div class="result-header">
                    <h2>考试结果 - 正确率</h2>
                    <div class="score">
                        <span class="score-number">{{ correctCount }}</span>
                        <span class="score-total"> / {{ examQuestions.length }}</span>
                        <span class="score-percentage">({{ Math.round((correctCount / examQuestions.length) * 100)
                        }}%)</span>
                    </div>
                </div>

                <div class="result-stats">
                    <div class="stat-item">
                        <span class="stat-label">正确题数:</span>
                        <span class="stat-value correct">{{ correctCount }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">错误题数:</span>
                        <span class="stat-value wrong">{{ examQuestions.length - correctCount }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">用时:</span>
                        <span class="stat-value">{{ formatTime(totalTime - remainingTime) }}</span>
                    </div>
                </div>

                <div class="result-actions">
                    <a-button type="primary" @click="viewDetailedResults">
                        {{ showDetailedResults ? '收起详情' : '查看详细结果' }}
                    </a-button>
                    <a-button @click="retakeExam">重新考试</a-button>
                    <a-button @click="backToBank">返回题库</a-button>
                </div>

                <!-- 详细结果 -->
                <div v-if="showDetailedResults" class="detailed-results">
                    <h3>答题详情</h3>
                    <div v-for="(question, index) in examQuestions" :key="index" class="result-question">
                        <div class="content">
                            <div class="title">
                                <span class="question-index">{{ index + 1 }}</span>
                                <span class="question-topic">{{ question.choiceDetails.topic }}</span>
                                <!-- 错题本图标（仅当答错时显示） -->
                                <a-tooltip v-if="userAnswers[index] !== question.choiceDetails.answer" title="加入错题本">
                                    <BookOutlined class="wrong-book-icon" @click="addToWrongBook(index)" />
                                </a-tooltip>
                            </div>

                            <!-- 选项显示 -->
                            <div class="options-display">
                                <div v-for="option in ['a', 'b', 'c', 'd']" :key="option" :class="[
                                    'option-item',
                                    {
                                        'correct-option': option === question.choiceDetails.answer,
                                        'incorrect-selected': userAnswers[index] === option && option !== question.choiceDetails.answer,
                                        'user-selected': userAnswers[index] === option
                                    }
                                ]">
                                    <span class="option-label">{{ option.toUpperCase() }}.</span>
                                    <span class="option-text">{{ question.choiceDetails[option] }}</span>
                                </div>
                            </div>

                            <!-- 答案解析区 -->
                            <div class="answer-panel">
                                <div class="result-row">
                                    <div class="result-correct">
                                        <span class="result-label">正确答案：</span>
                                        <span class="result-value">{{ question.choiceDetails.answer.toUpperCase()
                                        }}</span>
                                    </div>
                                    <div class="result-user">
                                        <span class="result-label">你的答案：</span>
                                        <span :class="[
                                            'result-value',
                                            userAnswers[index] === question.choiceDetails.answer ? 'correct-answer' : 'incorrect-answer'
                                        ]">
                                            {{ userAnswers[index]?.toUpperCase() || '未作答' }}
                                        </span>
                                    </div>
                                </div>

                                <div class="explanation" v-if="question.choiceDetails.answerAnalysis">
                                    <div class="explanation-title">官方解析：</div>
                                    <div class="explanation-content">{{ question.choiceDetails.answerAnalysis }}</div>
                                </div>

                                <div class="knowledge-point" v-if="question.choiceDetails.knowledgeTags?.length">
                                    <span class="knowledge-label">知识点：</span>
                                    <a-tag v-for="tag in question.choiceDetails.knowledgeTags" :key="tag"
                                        size="small">{{ tag }}</a-tag>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
                                    <div class="book-meta">{{ formatTime(book.createTime) }} · {{ book.count }}题</div>
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
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeftOutlined, BookOutlined, BookFilled, PlusCircleOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import FrontendHeader from '@/components/layout/FrontendHeader.vue';
import { userSignIn } from '@/apis/userApi';
import { getMistakeNotebooks, addMistakeNotebook, addWrongQuestionToNotebook, type MistakeNotebook } from '@/apis/mistakeNotebookApi';

const router = useRouter();

// 考试数据
const examQuestions = ref<any[]>([]);
const examTitle = ref<string>('在线测验');
const examBankId = ref<string>('');

// 考试状态
const examStarted = ref<boolean>(false);
const examFinished = ref<boolean>(false);
const currentQuestionIndex = ref<number>(0);
const userAnswers = ref<string[]>([]);

// 计时器
const totalTime = ref<number>(0); // 总时间（秒）
const remainingTime = ref<number>(0); // 剩余时间（秒）
const timer = ref<number | null>(null);

// 结果相关
const correctCount = ref<number>(0);
const showDetailedResults = ref<boolean>(false);
const submitting = ref<boolean>(false);

// 错题本相关状态
const wrongBookModalVisible = ref(false);
const mistakeNotebooks = ref<MistakeNotebook[]>([]);
const selectedBookId = ref<string>();
const currentWrongQuestionIndex = ref(-1);
const newBookName = ref('');
const newBookColor = ref('#DE868F');
const creatingBook = ref(false);
const addingToBook = ref(false);

// 颜色选项
const bookColors = [
    '#DE868F', '#65A1DC', '#FCD13C', '#50BF5B', '#EF6973',
    '#BABBCF', '#35C9DD', '#EE9762', '#3FD2A6', '#E573B4'
];

// 当前题目
const currentQuestion = computed(() => {
    return examQuestions.value[currentQuestionIndex.value] || null;
});

// 页面加载时获取考试数据
onMounted(() => {
    loadExamData();
});

// 清理定时器
onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
    }
});

// 加载考试数据
const loadExamData = () => {
    try {
        const questionsData = sessionStorage.getItem('examQuestions');
        const titleData = sessionStorage.getItem('examBankTitle');
        const bankIdData = sessionStorage.getItem('examBankId');

        if (!questionsData) {
            message.error('未找到考试数据，请重新选择题库');
            router.push('/banks');
            return;
        }

        examQuestions.value = JSON.parse(questionsData);
        examTitle.value = titleData || '在线测验';
        examBankId.value = bankIdData || '';

        // 初始化用户答案数组
        userAnswers.value = new Array(examQuestions.value.length).fill('');

        // 设置考试时间（每题2分钟）
        totalTime.value = examQuestions.value.length * 2 * 60;
        remainingTime.value = totalTime.value;

    } catch (error) {
        console.error('加载考试数据失败:', error);
        message.error('考试数据格式错误');
        router.push('/banks');
    }
};

// 开始考试
const startExam = () => {
    examStarted.value = true;
    startTimer();
};

// 开始计时
const startTimer = () => {
    timer.value = setInterval(() => {
        remainingTime.value--;
        if (remainingTime.value <= 0) {
            message.warning('考试时间到，自动提交答卷');
            submitExam(true);
        }
    }, 1000);
};

// 格式化时间
const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 上一题
const previousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
    }
};

// 下一题
const nextQuestion = () => {
    if (currentQuestionIndex.value < examQuestions.value.length - 1) {
        currentQuestionIndex.value++;
    }
};

// 跳转到指定题目
const jumpToQuestion = (index: number) => {
    currentQuestionIndex.value = index;
};

// 提交考试
const submitExam = async (isAutoSubmit: boolean = false) => {
    // 只有在非自动提交时才检查未答题目并显示确认弹窗
    if (!isAutoSubmit) {
        const unansweredCount = userAnswers.value.filter(answer => !answer).length;
        if (unansweredCount > 0) {
            try {
                await Modal.confirm({
                    title: '确认提交',
                    content: `还有 ${unansweredCount} 道题未作答，确定要提交吗？`,
                    okText: '确定提交',
                    cancelText: '继续答题',
                });
            } catch {
                return; // 用户取消
            }
        }
    }

    submitting.value = true;

    // 停止计时器
    if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
    }

    try {
        // 计算分数
        correctCount.value = examQuestions.value.reduce((count, question, index) => {
            return count + (userAnswers.value[index] === question.choiceDetails.answer ? 1 : 0);
        }, 0);

        // 调用用户签到接口
        try {
            const signInResponse = await userSignIn();
            if (signInResponse.code === 0) {
                message.success('测试完成！签到成功！');
            } else if (signInResponse.message && !signInResponse.message.includes('已签到')) {
                message.warning(`签到失败: ${signInResponse.message}`);
            }
        } catch (signInError) {
            message.warning('签到失败，但考试结果已保存');
        }

        examFinished.value = true;

        // 显示考试结果
        const wrongCount = examQuestions.value.length - correctCount.value;
        if (wrongCount > 0) {
            if (isAutoSubmit) {
                message.info(`时间到！测试完成！答对 ${correctCount.value}/${examQuestions.value.length} 题，错题可加入错题本复习`);
            } else {
                message.info(`测试完成！答对 ${correctCount.value}/${examQuestions.value.length} 题，错题可加入错题本复习`);
            }
        } else {
            message.success(`恭喜！全部答对了！`);
        }

    } catch (error) {
        message.error('提交失败，请重试');
        examFinished.value = false;
    } finally {
        submitting.value = false;
    }
};

// 查看详细结果
const viewDetailedResults = () => {
    showDetailedResults.value = !showDetailedResults.value;
};

// 重新考试
const retakeExam = () => {
    examStarted.value = false;
    examFinished.value = false;
    currentQuestionIndex.value = 0;
    userAnswers.value = new Array(examQuestions.value.length).fill('');
    remainingTime.value = totalTime.value;
    correctCount.value = 0;
    showDetailedResults.value = false;

    if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
    }
};

// 返回题库
const backToBank = () => {
    if (examBankId.value) {
        router.push(`/bank/${examBankId.value}`);
    } else {
        router.push('/banks');
    }
};

// 退出考试
const handleExitExam = async () => {
    if (examStarted.value && !examFinished.value) {
        try {
            await Modal.confirm({
                title: '确认退出',
                content: '考试尚未完成，确定要退出吗？',
                okText: '确定退出',
                cancelText: '继续考试',
            });
        } catch {
            return; // 用户取消
        }
    }

    // 清理定时器
    if (timer.value) {
        clearInterval(timer.value);
    }

    router.back();
};

// 获取难度样式类
const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
        case '简单': return 'difficulty-easy';
        case '中等': return 'difficulty-medium';
        case '困难': return 'difficulty-hard';
        default: return 'difficulty-unknown';
    }
};

// 获取错题本列表
const fetchMistakeNotebooks = async () => {
    try {
        const response = await getMistakeNotebooks();
        if (response.code === 0) {
            mistakeNotebooks.value = response.data || [];
        } else {
            console.error('获取错题本列表失败:', response.message);
        }
    } catch (error) {
        console.error('获取错题本列表失败:', error);
    }
};

// 点击错题本图标
const addToWrongBook = async (index: number) => {
    const question = examQuestions.value[index];
    const userAnswer = userAnswers.value[index];

    if (userAnswer === question.choiceDetails.answer) {
        message.warning('该题目回答正确，无需加入错题本');
        return;
    }

    currentWrongQuestionIndex.value = index;
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

    const question = examQuestions.value[currentWrongQuestionIndex.value];
    const userAnswer = userAnswers.value[currentWrongQuestionIndex.value];

    if (!question || !question.choiceDetails.id) {
        message.error('题目信息不完整');
        return;
    }

    if (!userAnswer) {
        message.error('未找到用户答案');
        return;
    }

    addingToBook.value = true;
    try {
        const response = await addWrongQuestionToNotebook({
            choiceQuestionId: question.choiceDetails.id,
            mistakeNoteBookId: selectedBookId.value,
            wrongAnswer: userAnswer
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

// 格式化时间（用于错题本）
const formatTimeForNotebook = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
}
</script>

<style scoped>
.header {
    width: 100%;
    height: 56px;
    padding: 12px;
    background-color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
}

.header .header-box {
    width: 89%;
    height: 56px;
    padding: 12px;
    background-color: #FFFFFF;
    display: flex;
    align-items: center;
    font-size: 16px;
    position: relative;
}

.header .title {
    margin: 0 auto;
    font-weight: 600;
}

.timer {
    position: absolute;
    right: 0;
    color: #ff4d4f;
    font-weight: bold;
}

.exam-box {
    margin: 40px auto;
    width: 1144px;
    background-color: #FFFFFF;
    padding: 32px;
    border-radius: 20px;
    min-height: 600px;
}

.start-exam {
    text-align: center;
    padding: 60px 0;
}

.start-exam h2 {
    margin-bottom: 30px;
    color: #1677ff;
}

.start-exam p {
    margin: 10px 0;
    font-size: 16px;
    color: #666;
}

.progress-section {
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.progress-text {
    font-weight: bold;
    color: #1677ff;
    white-space: nowrap;
}

.question-container {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
}

.question-container .content {
    flex: 3;
    padding: 30px;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    background-color: #ffffff;
}

.question-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}

.question-number {
    font-size: 18px;
    font-weight: bold;
    color: #1677ff;
}

.question-difficulty {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
}

.difficulty-easy {
    background-color: #f6ffed;
    color: #52c41a;
}

.difficulty-medium {
    background-color: #fff7e6;
    color: #fa8c16;
}

.difficulty-hard {
    background-color: #fff2f0;
    color: #ff4d4f;
}

.difficulty-unknown {
    background-color: #f5f5f5;
    color: #999;
}

.title {
    font-size: 20px;
    color: #333;
    font-weight: 600;
    margin-bottom: 35px;
    display: flex;
    align-items: flex-start;
    white-space: pre-line;
    line-height: 1.6;
}

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

.question-topic {
    flex: 1;
    min-width: 0;
}

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

.item {
    margin-bottom: 18px;
    padding: 16px 20px;
    border-radius: 8px;
    transition: background-color 0.3s;
    border: 1px solid #f0f0f0;
    font-size: 16px;
    width: 100%;
    display: block;
}

.item:hover {
    background-color: #f9f9f9;
}

.navigation-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
}

/* 答题进度概览 */
.progress-overview {
    flex: 1;
    max-width: 280px;
    padding: 20px;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    background-color: #fafafa;
}

.overview-title {
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
}

.question-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-bottom: 15px;
}

.question-item {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    transition: all 0.3s;
}

.question-item.unanswered {
    background-color: #d9d9d9;
    color: #666;
}

.question-item.answered {
    background-color: #52c41a;
    color: white;
}

.question-item.current {
    background-color: #1677ff !important;
    color: white !important;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.3);
    transform: scale(1.05);
}

.question-item:hover {
    transform: scale(1.1);
}

.legend {
    display: flex;
    gap: 15px;
    font-size: 12px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

.legend-color.current {
    background-color: #1677ff;
}

.legend-color.answered {
    background-color: #52c41a;
}

.legend-color.unanswered {
    background-color: #d9d9d9;
}

/* 考试结果样式 */
.result-container {
    text-align: center;
}

.result-header h2 {
    margin-bottom: 20px;
    color: #1677ff;
}

.score {
    margin-bottom: 30px;
    font-size: 48px;
    font-weight: bold;
}

.score-number {
    color: #52c41a;
}

.score-total {
    color: #999;
}

.score-percentage {
    font-size: 24px;
    color: #1677ff;
    margin-left: 10px;
}

.result-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 30px;
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 8px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.stat-label {
    font-size: 14px;
    color: #666;
}

.stat-value {
    font-size: 20px;
    font-weight: bold;
}

.stat-value.correct {
    color: #52c41a;
    text-align: center;
}

.stat-value.wrong {
    color: #ff4d4f;
    text-align: center;
}

.result-actions {
    margin-bottom: 40px;
    display: flex;
    justify-content: center;
    gap: 15px;
}

.detailed-results {
    text-align: left;
    border-top: 1px solid #d9d9d9;
    padding-top: 30px;
}

.result-question {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
}

.options-display {
    margin-bottom: 20px;
}

.option-item {
    display: flex;
    align-items: flex-start;
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 4px;
    border: 1px solid #f0f0f0;
}

.option-item.correct-option {
    background-color: #f6ffed !important;
    border-left: 4px solid #52c41a;
}

.option-item.incorrect-selected {
    background-color: #fff2f0 !important;
    border-left: 4px solid #ff4d4f;
}

.option-item.user-selected:not(.correct-option):not(.incorrect-selected) {
    background-color: #e6f7ff;
    border-left: 4px solid #1677ff;
}

.option-label {
    margin-right: 8px;
    font-weight: bold;
}

.option-text {
    flex: 1;
}

.answer-panel {
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

.explanation {
    margin-bottom: 12px;
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

.modal-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 1500px) {
    .exam-box {
        width: 95%;
        margin: 20px auto;
        padding: 30px;
    }
}

@media (max-width: 1200px) {
    .exam-box {
        width: 95%;
        margin: 20px auto;
        padding: 20px;
    }

    .question-container {
        flex-direction: column;
    }

    .progress-overview {
        order: -1;
        max-width: none;
    }
}

@media (max-width: 768px) {
    .header .header-box {
        width: 95%;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .timer {
        position: static;
        align-self: flex-end;
    }

    .question-grid {
        grid-template-columns: repeat(6, 1fr);
    }

    .question-item {
        width: 35px;
        height: 35px;
        font-size: 12px;
    }

    .result-row {
        flex-direction: column;
        gap: 12px;
    }

    .result-stats {
        flex-direction: column;
        gap: 15px;
    }
}
</style>