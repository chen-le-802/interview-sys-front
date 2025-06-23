<template>
    <div class="container">
        <div class="left">
            <div class="navbar">
                <a-input-search v-model:value="searchBook" placeholder="搜索错题本" class="search-input"
                    @search="onSearchBook" />
                <div class="book-nav">
                    <div v-for="book in filteredBooks" :key="book.id" class="item"
                        :class="{ active: activeBookId === book.id }" @click="selectBook(book.id)">
                        <BookFilled :style="{ color: book.color || '#3760f7' }" class="icon" />
                        <span class="book-name">{{ book.name }}</span>
                        <span class="book-count">({{ book.count }})</span>
                    </div>
                    <div class="add-book" @click="showAddBookModal = true">
                        <PlusCircleOutlined class="icon add" />添加错题本
                    </div>
                </div>

                <!-- 统计信息 -->
                <div class="statistics">
                    <div class="stat-title">学习统计</div>
                    <div class="stat-item">
                        <span class="stat-label">总错题：</span>
                        <span class="stat-value">{{ statistics.totalCount }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">已解决：</span>
                        <span class="stat-value correct">{{ statistics.solvedCount }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">解决率：</span>
                        <span class="stat-value">{{ statistics.solvedRate }}</span>
                    </div>
                </div>

                <div class="goback" @click="goback">
                    <RollbackOutlined class="icon" />退出错题本
                </div>
            </div>
        </div>
        <div class="right">
            <div class="main-container">
                <div class="main-content">
                    <div class="search-container">
                        <div class="search-box">
                            <a-input v-model:value="searchKeyword" placeholder="搜索错题或关键字"
                                class="question-search-input" @pressEnter="onQuestionSearch" allow-clear />
                            <a-button type="primary" class="question-search-btn" @click="onQuestionSearch"
                                :icon="h(SearchOutlined)" />
                        </div>

                        <!-- 筛选选项 -->
                        <div class="filter-options">
                            <a-select v-model:value="statusFilter" placeholder="筛选状态"
                                style="width: 120px; margin-right: 12px;" allowClear @change="applyFilters">
                                <a-select-option value="all">全部</a-select-option>
                                <a-select-option value="unsolved">未解决</a-select-option>
                                <a-select-option value="solved">已解决</a-select-option>
                            </a-select>

                            <a-select v-model:value="tagFilter" placeholder="筛选标签" style="width: 120px;" allowClear @change="applyFilters">
                                <a-select-option value="all">全部标签</a-select-option>
                                <a-select-option v-for="tag in availableTags" :key="tag" :value="tag">
                                    {{ tag }}
                                </a-select-option>
                            </a-select>
                        </div>
                    </div>

                    <!-- 当前错题本信息 -->
                    <div class="book-header" v-if="currentBook">
                        <div class="book-info">
                            <BookFilled :style="{ color: currentBook.color }" />
                            <span class="book-title">{{ currentBook.name }}</span>
                            <span class="book-subtitle">{{ currentBook.count }} 道错题</span>
                        </div>
                        <div class="book-actions">
                            <a-button type="default" size="small" @click="showBatchActions = !showBatchActions"
                                :class="{ active: showBatchActions }" class="batch-toggle-btn">
                                <template #icon>
                                    <CheckSquareOutlined />
                                </template>
                                批量操作
                            </a-button>
                            <a-popconfirm title="确定要删除这个错题本吗？" @confirm="deleteCurrentBook" ok-text="确定"
                                cancel-text="取消">
                                <a-button size="small" danger type="text" class="delete-book-btn">
                                    <template #icon>
                                        <DeleteOutlined />
                                    </template>
                                    删除错题本
                                </a-button>
                            </a-popconfirm>
                        </div>
                    </div>

                    <!-- 批量操作栏 -->
                    <div class="batch-actions" v-if="showBatchActions">
                        <div class="batch-left">
                            <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange"
                                class="select-all-checkbox">
                                全选
                            </a-checkbox>
                            <span class="selected-count" v-if="selectedErrors.length > 0">
                                已选择 {{ selectedErrors.length }} 项
                            </span>
                        </div>

                        <div class="batch-right">
                            <a-button size="small" :disabled="!selectedErrors.length" @click="showMoveModal = true"
                                class="batch-action-btn move-btn">
                                <template #icon>
                                    <SwapOutlined />
                                </template>
                                移动 ({{ selectedErrors.length }})
                            </a-button>

                            <a-popconfirm title="确定要删除选中的错题吗？" @confirm="batchDelete" ok-text="确定" cancel-text="取消">
                                <a-button size="small" :disabled="!selectedErrors.length" danger
                                    class="batch-action-btn delete-btn">
                                    <template #icon>
                                        <DeleteOutlined />
                                    </template>
                                    删除 ({{ selectedErrors.length }})
                                </a-button>
                            </a-popconfirm>
                        </div>
                    </div>

                    <!-- 加载状态 -->
                    <div v-if="loading" class="loading-state">
                        <a-spin size="large" tip="加载中..." />
                    </div>

                    <div v-else class="error-cards-container">
                        <div v-if="displayedErrors.length === 0" class="empty-state">
                            <div class="empty-content">
                                <div class="empty-icon">
                                    <BookOutlined />
                                </div>
                                <div class="empty-title">暂无错题数据</div>
                                <div class="empty-description">
                                    {{ searchKeyword ? '没有找到相关错题，试试其他关键词' : '还没有错题记录，完成测试后可以添加错题' }}
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <ErrorCard v-for="error in displayedErrors" :key="error.id" :error="error"
                                :showCheckbox="showBatchActions" :checked="selectedErrors.includes(error.id)"
                                @click="selectError(error)" @check="onCheckError" @delete="deleteError"
                                @update-status="updateErrorStatus" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="ai">
                <div class="ai-box">
                    <div class="title-area">
                        <div class="logo"></div>
                        <p class="title-text">为您找到相关的题目：</p>
                    </div>
                    <div class="question-list">
                        <div v-for="(item, index) in relatedQuestions" :key="item.id" class="question-item"
                            @click="selectRelatedQuestion(item)">
                            <div class="content">
                                <span class="index">{{ index + 1 }}.</span>
                                <span class="question-title">{{ item.title }}</span>
                            </div>
                            <span class="heat">{{ item.heat }}热度</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 添加错题本模态框 -->
        <a-modal v-model:visible="showAddBookModal" title="添加错题本" @ok="handleAddBook"
            @cancel="cancelAddBook" :confirmLoading="addBookLoading">
            <a-input v-model:value="newBookName" placeholder="请输入错题本名称" style="margin-bottom: 16px;" 
                :maxlength="20" show-count />
            <div style="margin-bottom: 8px;">选择图标颜色：</div>
            <a-radio-group v-model:value="newBookColor">
                <a-radio v-for="color in bookColors" :key="color" :value="color">
                    <BookFilled :style="{ color, marginRight: '6px' }" />
                </a-radio>
            </a-radio-group>
        </a-modal>

        <!-- 移动错题模态框 -->
        <a-modal v-model:visible="showMoveModal" title="移动到其他错题本" @ok="handleMoveErrors"
            @cancel="showMoveModal = false" :confirmLoading="moveLoading">
            <div>选择目标错题本：</div>
            <a-radio-group v-model:value="targetBookId" style="margin-top: 12px;">
                <a-radio v-for="book in availableTargetBooks" :key="book.id" :value="book.id"
                    style="display: block; margin-bottom: 8px;">
                    <BookFilled :style="{ color: book.color }" />
                    {{ book.name }} ({{ book.count }}题)
                </a-radio>
            </a-radio-group>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import {
    BookFilled,
    BookOutlined,
    PlusCircleOutlined,
    RollbackOutlined,
    SearchOutlined,
    CheckSquareOutlined,
    DeleteOutlined,
    SwapOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import {
    getMistakeNotebooks,
    addMistakeNotebook,
    deleteMistakeNotebook,
    getWrongQuestionsByNotebookId,
    getWrongQuestionsByCondition,
    removeWrongQuestionFromNotebook,
    setWrongQuestionState,
    batchDeleteWrongQuestions,
    batchMoveWrongQuestions,
    getUserWrongQuestionAnalyze,
    type MistakeNotebook,
    type WrongQuestion,
    type UserWrongQuestionAnalyze
} from '@/apis/mistakeNotebookApi';
import ErrorCard from '@/components/shared/ErrorCard.vue';

const router = useRouter();

// 扩展错题接口，添加前端需要的字段
interface ErrorQuestion extends WrongQuestion {
    title: string;
    status: 'solved' | 'unsolved';
    date: string;
    knowledgePoint: string;
    source?: string;
    options: string[];
    correctAnswer: string;
    userAnswer: string;
    explanation: string;
    relatedQuestion?: string;
    tags: string[];
}

interface RelatedQuestion {
    id: number;
    title: string;
    heat: number;
    tags: string[];
}

// 响应式数据
const loading = ref(false);
const books = ref<MistakeNotebook[]>([]);
const activeBookId = ref<string>('');
const currentErrors = ref<WrongQuestion[]>([]);
const searchBook = ref('');
const searchKeyword = ref('');
const statusFilter = ref<string>('all');
const tagFilter = ref<string>('all');

const showAddBookModal = ref(false);
const newBookName = ref('');
const newBookColor = ref('#DE868F');
const addBookLoading = ref(false);
const bookColors = [
    '#DE868F', '#65A1DC', '#FCD13C', '#50BF5B', '#EF6973',
    '#BABBCF', '#35C9DD', '#EE9762', '#3FD2A6', '#E573B4'
];

const selectedError = ref<ErrorQuestion | null>(null);

// 批量操作相关
const showBatchActions = ref(false);
const selectedErrors = ref<string[]>([]);
const showMoveModal = ref(false);
const targetBookId = ref<string>();
const moveLoading = ref(false);

// 统计数据
const statistics = ref<UserWrongQuestionAnalyze>({
    totalCount: 0,
    solvedCount: 0,
    solvedRate: '0'
});

// 模拟相关题目数据
const relatedQuestions = ref<RelatedQuestion[]>([
    { id: 101, title: '如何优化前端性能？', heat: 1200, tags: ['前端', '性能'] },
    { id: 102, title: 'Vue3的响应式原理是什么？', heat: 800, tags: ['Vue3', '响应式'] },
    { id: 103, title: 'React Hooks使用注意事项', heat: 750, tags: ['React', 'Hooks'] },
    { id: 104, title: 'Spring事务传播机制详解', heat: 600, tags: ['Spring', '事务'] }
]);

// 数据转换函数
const convertWrongQuestionToError = (wrongQuestion: WrongQuestion): ErrorQuestion => {
    let tags: string[] = [];
    if (wrongQuestion.knowledgeTags) {
        if (Array.isArray(wrongQuestion.knowledgeTags)) {
            tags = wrongQuestion.knowledgeTags;
        } else if (typeof wrongQuestion.knowledgeTags === 'string') {
            try {
                const parsed = JSON.parse(wrongQuestion.knowledgeTags);
                tags = Array.isArray(parsed) ? parsed : [wrongQuestion.knowledgeTags];
            } catch {
                tags = wrongQuestion.knowledgeTags.includes(',') 
                    ? wrongQuestion.knowledgeTags.split(',').map(tag => tag.trim()).filter(tag => tag)
                    : [wrongQuestion.knowledgeTags];
            }
        }
    }

    const status: 'solved' | 'unsolved' = wrongQuestion.state === 'solved' ? 'solved' : 'unsolved';
    
    return {
        ...wrongQuestion,
        title: wrongQuestion.topic,
        status: status,
        date: new Date().toLocaleDateString(),
        knowledgePoint: tags[0] || '未分类',
        options: [
            `A.${wrongQuestion.a}`,
            `B.${wrongQuestion.b}`,
            `C.${wrongQuestion.c}`,
            `D.${wrongQuestion.d}`
        ],
        correctAnswer: wrongQuestion.answer.toUpperCase(),
        userAnswer: wrongQuestion.wrongAnswer?.toUpperCase() || 'A',
        explanation: wrongQuestion.answerAnalysis || '暂无解析',
        tags: tags,
        source: '题目练习'
    };
};

// 计算属性
const filteredBooks = computed(() => {
    if (!searchBook.value.trim()) {
        return books.value;
    }
    return books.value.filter(book =>
        book.name.toLowerCase().includes(searchBook.value.toLowerCase())
    );
});

const currentBook = computed(() => 
    books.value.find(book => book.id === activeBookId.value)
);

const errors = computed(() => 
    currentErrors.value.map(convertWrongQuestionToError)
);

const availableTags = computed(() => {
    const tags = new Set<string>();
    errors.value.forEach(error => {
        error.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
});

const filteredErrors = computed(() => {
    let result = errors.value;

    // 搜索关键词过滤
    if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(error => 
            error.title.toLowerCase().includes(keyword) ||
            error.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
            error.knowledgePoint.toLowerCase().includes(keyword)
        );
    }

    return result;
});

const displayedErrors = computed(() => {
    let result = filteredErrors.value;

    // 状态筛选
    if (statusFilter.value && statusFilter.value !== 'all') {
        result = result.filter(error => error.status === statusFilter.value);
    }

    // 标签筛选
    if (tagFilter.value && tagFilter.value !== 'all') {
        result = result.filter(error => error.tags.includes(tagFilter.value));
    }

    return result;
});

const availableTargetBooks = computed(() => {
    return books.value.filter(book => book.id !== activeBookId.value);
});

// 全选相关计算属性
const checkAll = computed(() => {
    return displayedErrors.value.length > 0 && selectedErrors.value.length === displayedErrors.value.length;
});

const indeterminate = computed(() => {
    return selectedErrors.value.length > 0 && selectedErrors.value.length < displayedErrors.value.length;
});

const fetchBooks = async () => {
    try {
        loading.value = true;
        const response = await getMistakeNotebooks();
        if (response.code === 0) {
            books.value = response.data || [];
            
            if (!activeBookId.value && books.value.length > 0) {
                activeBookId.value = books.value[0].id;
            }
        } else {
            message.error(response.message || '获取错题本列表失败');
        }
    } catch (error) {
        message.error('获取错题本列表失败');
        console.error('获取错题本失败:', error);
    } finally {
        loading.value = false;
    }
};

const fetchErrors = async (bookId: string) => {
    if (!bookId) return;
    
    try {
        loading.value = true;
        const response = await getWrongQuestionsByNotebookId(bookId);
        if (response.code === 0) {
            currentErrors.value = response.data || [];
            
            // 同步更新错题本的count
            const book = books.value.find(b => b.id === bookId);
            if (book) {
                book.count = currentErrors.value.length;
            }
        } else {
            message.error(response.message || '获取错题列表失败');
            currentErrors.value = [];
        }
    } catch (error) {
        message.error('获取错题列表失败');
        console.error('获取错题失败:', error);
        currentErrors.value = [];
    } finally {
        loading.value = false;
    }
};

const fetchStatistics = async () => {
    try {
        const response = await getUserWrongQuestionAnalyze();
        if (response.code === 0) {
            statistics.value = response.data;
        }
    } catch (error) {
        console.error('获取统计数据失败:', error);
    }
};

// 方法
const goback = () => router.back();

const selectBook = async (bookId: string) => {
    if (activeBookId.value === bookId) return;
    
    try {
        activeBookId.value = bookId;
        selectedErrors.value = [];
        showBatchActions.value = false;
        statusFilter.value = 'all';
        tagFilter.value = 'all';
        searchKeyword.value = '';
        
        await fetchErrors(bookId);
    } catch (error: any) {
        message.error('切换错题本失败');
    }
};

const onSearchBook = () => {
    console.log('搜索错题本:', searchBook.value);
};

const onQuestionSearch = async () => {
    if (!activeBookId.value) return;
    
    try {
        if (searchKeyword.value.trim()) {
            loading.value = true;
            const response = await getWrongQuestionsByCondition({
                mistakeNotebookId: activeBookId.value,
                topic: searchKeyword.value,
                knowledgeTags: []
            });
            
            if (response.code === 0) {
                currentErrors.value = response.data || [];
            } else {
                // 如果后端搜索失败，使用前端过滤
                console.warn('后端搜索失败，使用前端搜索');
            }
        } else {
            // 重新获取所有错题
            await fetchErrors(activeBookId.value);
        }
    } catch (error) {
        console.error('搜索错题失败:', error);
    } finally {
        loading.value = false;
    }
};

const applyFilters = () => {
    // 过滤逻辑在计算属性中处理
    console.log('应用过滤条件');
};

const selectError = (error: ErrorQuestion) => {
    selectedError.value = error;
    console.log('选中错题:', error);
};

const selectRelatedQuestion = (question: RelatedQuestion) => {
    console.log('选中相关题目:', question);
};

const handleAddBook = async () => {
    if (!newBookName.value.trim()) {
        message.warning('请输入错题本名称');
        return;
    }

    try {
        addBookLoading.value = true;
        const response = await addMistakeNotebook({
            name: newBookName.value.trim(),
            color: newBookColor.value
        });
        
        if (response.code === 0) {
            message.success(`创建错题本 "${newBookName.value}" 成功`);
            await fetchBooks(); // 重新获取错题本列表
            cancelAddBook();
        } else {
            message.error(response.message || '创建错题本失败');
        }
    } catch (error) {
        message.error('创建错题本失败');
    } finally {
        addBookLoading.value = false;
    }
};

const cancelAddBook = () => {
    newBookName.value = '';
    newBookColor.value = '#DE868F';
    showAddBookModal.value = false;
};

const deleteCurrentBook = async () => {
    if (!currentBook.value) return;

    try {
        const bookName = currentBook.value.name;
        const response = await deleteMistakeNotebook(activeBookId.value);
        
        if (response.code === 0) {
            message.success(`删除错题本 "${bookName}" 成功`);
            await fetchBooks();
            
            // 切换到第一个错题本
            if (books.value.length > 0) {
                activeBookId.value = books.value[0].id;
                await fetchErrors(activeBookId.value);
            } else {
                activeBookId.value = '';
                currentErrors.value = [];
            }
        } else {
            message.error(response.message || '删除错题本失败');
        }
    } catch (error) {
        message.error('删除错题本失败');
    }
};

const deleteError = async (errorId: string) => {
    if (!activeBookId.value) return;
    
    try {
        const response = await removeWrongQuestionFromNotebook({
            choiceQuestionId: errorId,
            mistakeNoteBookId: activeBookId.value
        });
        
        if (response.code === 0) {
            selectedErrors.value = selectedErrors.value.filter(id => id !== errorId);
            message.success('删除错题成功');
            await fetchErrors(activeBookId.value); // 重新获取错题列表
            await fetchStatistics(); // 重新获取统计数据
        } else {
            message.error(response.message || '删除错题失败');
        }
    } catch (error) {
        message.error('删除错题失败');
    }
};

const updateErrorStatus = async (errorId: string, status: 'solved' | 'unsolved') => {
    if (!activeBookId.value) return;
    
    try {
        const response = await setWrongQuestionState({
            choiceQuestionId: errorId,
            mistakeNoteBookId: activeBookId.value,
            state: status
        });
        
        if (response.code === 0) {
            message.success(`错题状态已更新为${status === 'solved' ? '已解决' : '未解决'}`);
            await fetchErrors(activeBookId.value); // 重新获取错题列表
            await fetchStatistics(); // 重新获取统计数据
        } else {
            message.error(response.message || '更新错题状态失败');
        }
    } catch (error) {
        message.error('更新错题状态失败');
    }
};

// 批量操作方法
const onCheckAllChange = (e: any) => {
    if (e.target.checked) {
        selectedErrors.value = displayedErrors.value.map(error => error.id);
    } else {
        selectedErrors.value = [];
    }
};

const onCheckError = (errorId: string, checked: boolean) => {
    if (checked) {
        selectedErrors.value.push(errorId);
    } else {
        selectedErrors.value = selectedErrors.value.filter(id => id !== errorId);
    }
};

const batchDelete = async () => {
    if (selectedErrors.value.length === 0 || !activeBookId.value) return;

    try {
        const response = await batchDeleteWrongQuestions({
            choiceQuestionIds: selectedErrors.value,
            mistakeNoteBookId: activeBookId.value
        });
        
        if (response.code === 0) {
            const count = selectedErrors.value.length;
            selectedErrors.value = [];
            message.success(`成功删除 ${count} 道错题`);
            await fetchErrors(activeBookId.value);
            await fetchStatistics();
        } else {
            message.error(response.message || '批量删除失败');
        }
    } catch (error) {
        message.error('批量删除失败');
    }
};

const handleMoveErrors = async () => {
    if (!targetBookId.value || selectedErrors.value.length === 0 || !activeBookId.value) {
        message.warning('请选择目标错题本');
        return;
    }

    try {
        moveLoading.value = true;
        const response = await batchMoveWrongQuestions({
            choiceQuestionIds: selectedErrors.value,
            oldMistakeNoteBookId: activeBookId.value,
            newMistakeNoteBookId: targetBookId.value
        });
        
        if (response.code === 0) {
            const targetBook = books.value.find(b => b.id === targetBookId.value);
            const count = selectedErrors.value.length;
            selectedErrors.value = [];
            showMoveModal.value = false;
            
            message.success(`成功移动 ${count} 道错题到 "${targetBook?.name}"`);
            await fetchErrors(activeBookId.value);
            await fetchBooks(); // 重新获取错题本列表以更新count
        } else {
            message.error(response.message || '移动错题失败');
        }
    } catch (error) {
        message.error('移动错题失败');
    } finally {
        moveLoading.value = false;
    }
};

// 监听器
watch(() => activeBookId.value, () => {
    selectedError.value = null;
    selectedErrors.value = [];
    showBatchActions.value = false;
    statusFilter.value = 'all';
    tagFilter.value = 'all';
    searchKeyword.value = '';
});

watch(showBatchActions, (newVal) => {
    if (!newVal) {
        selectedErrors.value = [];
    }
});

// 生命周期
onMounted(async () => {
    try {
        await Promise.all([
            fetchBooks(),
            fetchStatistics()
        ]);
        
        if (activeBookId.value) {
            await fetchErrors(activeBookId.value);
        }
    } catch (error) {
        console.error('初始化失败:', error);
    }
});
</script>

<style scoped>
/* ... 保持原有样式不变 ... */
.container {
    background-color: #f5f5f5;
    display: flex;
    height: 100vh;
}

.left {
    width: 340px;
    min-width: 300px;
    background: #fdfcfc;
    box-shadow: 2px 0 8px #f0f1f2;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
}

.right {
    height: 100%;
    overflow: hidden;
    flex: 1;
    background-color: #ffffff;
    display: flex;
}

.navbar {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 32px 24px 24px 24px;
    box-sizing: border-box;
}

.search-container {
    position: sticky;
    background-color: #ffffff;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 20px 0;
    margin-bottom: 20px;
}

.search-box {
    width: 40%;
    display: flex;
    align-items: center;
    height: 36px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 0;
    border: 1px solid #e1e8ff;
}

.filter-options {
    display: flex;
    align-items: center;
}

.question-search-input {
    flex: 1;
    height: 30px;
    border: none;
    font-size: 14px;
    padding: 8px 16px;
    background: transparent;
}

.question-search-input:focus {
    box-shadow: none;
}

.question-search-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    border-radius: 0 6px 6px 0;
    font-size: 14px;
    padding: 0 20px;
    background-color: #3760f7;
    border: none;
    transition: all 0.3s;
}

.book-nav {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.book-nav .item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 6px;
    transition: background 0.2s;
    cursor: pointer;
    font-size: 14px;
    color: #333;
}

.book-nav .item:hover {
    background: #f5f5f5;
}

.book-nav .item.active {
    background: #e6f7ff;
    color: #1890ff;
    font-weight: 500;
}

.book-name {
    flex: 1;
}

.book-count {
    font-size: 12px;
    color: #999;
}

.icon {
    margin-right: 8px;
    font-size: 18px;
}

.add-book {
    margin-top: 28px;
    display: flex;
    align-items: center;
    color: #1890ff;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
}

.add-book:hover {
    color: #40a9ff;
}

.statistics {
    margin-top: 30px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}

.stat-title {
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
}

.stat-label {
    color: #666;
}

.stat-value {
    font-weight: 500;
}

.stat-value.correct {
    color: #52c41a;
}

.goback {
    display: flex;
    align-items: center;
    margin-top: auto;
    color: #888;
    cursor: pointer;
    font-size: 15px;
    padding: 10px 0 0 0;
    transition: color 0.2s;
}

.goback:hover {
    color: #1890ff;
}

.main-container {
    flex: 1;
    display: flex;
    height: 100vh;
    justify-content: center;
}

.main-content {
    width: 90%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding-bottom: 20px;
}

.book-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: white;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.book-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.book-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.book-subtitle {
    font-size: 14px;
    color: #666;
}

.book-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.batch-toggle-btn {
    position: relative;
    border: 1px solid #d9d9d9;
    background: #fff;
    color: #595959;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
}

.batch-toggle-btn:hover {
    border-color: #1890ff;
    color: #1890ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.batch-toggle-btn.active {
    background: #1890ff;
    border-color: #1890ff;
    color: #fff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.delete-book-btn {
    color: #ff4d4f;
    border: none;
    background: transparent;
    font-weight: 500;
    transition: all 0.3s;
}

.delete-book-btn:hover {
    background: #fff2f0 !important;
    color: #ff4d4f !important;
    transform: translateY(-1px);
}

.batch-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
    border: 1px solid #91d5ff;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
    backdrop-filter: blur(4px);
}

.batch-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.select-all-checkbox {
    font-weight: 500;
    color: #262626;
}

.selected-count {
    color: #1890ff;
    font-size: 13px;
    font-weight: 500;
    background: rgba(24, 144, 255, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
    border: 1px solid rgba(24, 144, 255, 0.2);
}

.batch-right {
    display: flex;
    gap: 12px;
    align-items: center;
}

.batch-action-btn {
    position: relative;
    font-weight: 500;
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.batch-action-btn:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.move-btn {
    background: #fff;
    border-color: #52c41a;
    color: #52c41a;
}

.move-btn:hover:not(:disabled) {
    background: #f6ffed;
    border-color: #73d13d;
    color: #52c41a;
    box-shadow: 0 3px 8px rgba(82, 196, 26, 0.2);
}

.delete-btn {
    background: #fff;
    border-color: #ff4d4f;
    color: #ff4d4f;
}

.delete-btn:hover:not(:disabled) {
    background: #fff2f0;
    border-color: #ff7875;
    color: #ff4d4f;
    box-shadow: 0 3px 8px rgba(255, 77, 79, 0.2);
}

.batch-action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80px 20px;
    min-height: 400px;
}

.error-cards-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    min-height: 400px;
}

.empty-content {
    text-align: center;
    max-width: 300px;
}

.empty-icon {
    font-size: 64px;
    color: #d9d9d9;
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 100px;
    background: #fafafa;
    border-radius: 50%;
    margin: 0 auto 20px auto;
    border: 2px dashed #e8e8e8;
}

.empty-title {
    font-size: 16px;
    color: #595959;
    margin-bottom: 8px;
    font-weight: 500;
}

.empty-description {
    font-size: 14px;
    color: #8c8c8c;
    line-height: 1.5;
}

.ai {
    width: 300px;
    height: 100%;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: end;
}

.ai .ai-box {
    width: 90%;
    height: 650px;
    background-color: #f0f5ff;
    border-bottom-left-radius: 15px;
    border-top-left-radius: 15px;
    padding: 20px;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.title-area {
    display: flex;
    align-items: center;
    padding-bottom: 15px;
    margin-bottom: 15px;
    border-bottom: 1px solid #e1e8ff;
}

.logo {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: url('../../assets/images/common/logo.png') no-repeat center/contain;
    margin-right: 8px;
}

.title-text {
    font-weight: 600;
    font-size: 16px;
    color: #2c3e50;
    margin: 0;
}

.question-list {
    padding: 5px 0;
    max-height: 580px;
    overflow-y: auto;
}

.question-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin-bottom: 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.question-item:hover {
    background: #f5f7fa;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.content {
    display: flex;
    align-items: flex-start;
    flex: 1;
}

.index {
    color: #7d8db1;
    font-weight: 500;
    margin-right: 5px;
    min-width: 10px;
}

.question-title {
    color: #333;
    font-size: 14px;
    line-height: 1.4;
    word-break: break-word;
}

.heat {
    font-size: 12px;
    color: #999;
    margin-left: 10px;
}

::-webkit-scrollbar {
    display: none;
}
</style>