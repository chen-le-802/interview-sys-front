<template>
    <div class="app-container">
        <!-- 题目管理 -->
        <div class="questions">
            <!-- 操作栏卡片 -->
            <div class="card actions-card">
                <div class="actions">
                    <div class="filters">
                        <!-- 搜索框 -->
                        <a-input-search v-model:value="searchQuery" placeholder="搜索题目标题、ID..." class="input-search"
                            @search="handleSearch" allow-clear :loading="isSearching" />
                        <!-- 筛选选项 -->
                        <a-select v-model:value="difficulty" placeholder="难度" class="select-filter">
                            <a-select-option value="all">全部难度</a-select-option>
                            <a-select-option value="简单">简单</a-select-option>
                            <a-select-option value="中等">中等</a-select-option>
                            <a-select-option value="困难">困难</a-select-option>
                        </a-select>
                        <a-select v-model:value="bank" placeholder="题库" class="select-filter">
                            <a-select-option value="all">全部题库</a-select-option>
                            <a-select-option v-for="bankItem in questionBanks" :key="bankItem.id" :value="bankItem.id">
                                {{ bankItem.title }}
                            </a-select-option>
                        </a-select>
                    </div>
                    <div class="buttons">
                        <a-button class="export-button" @click="exportQuestionData" :loading="isExporting">
                            <DownloadOutlined class="export-icon" />导出题目
                        </a-button>
                        <a-button type="primary" class="add-button" @click="showAddModal">
                            <PlusOutlined class="add-icon" />新增题目
                        </a-button>
                    </div>
                </div>
            </div>

            <!-- 题目列表卡片 -->
            <div class="card Question-list-card">
                <a-spin :spinning="loading">
                    <div class="Question-list">
                        <table class="custom-table">
                            <thead>
                                <tr>
                                    <th>题目ID</th>
                                    <th>题目名称</th>
                                    <th>难度</th>
                                    <th>标签</th>
                                    <th>提交次数</th>
                                    <th>通过率</th>
                                    <th>所属题库</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <transition-group name="list" tag="tbody" v-if="paginatedQuestionList.length > 0">
                                <tr v-for="question in paginatedQuestionList" :key="question.id">
                                    <td>{{ question.id }}</td>
                                    <td>{{ question.title }}</td>
                                    <td>
                                        <span :class="difficultyClass(question.difficulty)" class="difficulty-tag">
                                            {{ question.difficulty }}
                                        </span>
                                    </td>
                                    <td>
                                        <transition-group name="tag" class="tag-container">
                                            <span v-for="tag in question.tagList" :key="tag" class="tag">{{ tag
                                            }}</span>
                                        </transition-group>
                                    </td>
                                    <td>{{ question.submissionQuantity || 0 }}</td>
                                    <td>
                                        <span :class="passRateClass(question.passRate)">
                                            {{ question.passRate || '0%' }}
                                        </span>
                                    </td>
                                    <td>{{ getQuestionBankName(question.questionBankId) }}</td>
                                    <td>
                                        <button class="edit-btn" @click="showEditModal(question)">
                                            <EditOutlined class="edit-icon" />编辑
                                        </button>
                                        <button class="preview-btn" @click="showPreviewModal(question)">
                                            <FolderViewOutlined class="preview-icon" />预览
                                        </button>
                                        <button class="delete-btn" @click="handleDelete(question)">
                                            <DeleteOutlined class="delete-icon" />删除
                                        </button>
                                    </td>
                                </tr>
                            </transition-group>
                            <tbody v-else>
                                <tr>
                                    <td colspan="8">
                                        <div class="empty-data">
                                            <a-empty description="暂无符合条件的题目" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </a-spin>
                <div class="pagination-container">
                    <a-pagination v-model:current="currentPage" v-model:pageSize="pageSize" :total="total"
                        :showTotal="showTotal" :pageSizeOptions="pageSizeOptions" showSizeChanger showQuickJumper
                        @change="handlePageChange" @showSizeChange="handlePageSizeChange" />
                    <div class="pagination-info">
                        当前显示: {{ (currentPage - 1) * pageSize + (total > 0 ? 1 : 0) }}-{{ Math.min(currentPage
                            * pageSize, total) }} 条，共 {{ total }} 条
                    </div>
                </div>
            </div>
        </div>

        <!-- 新增题目 -->
        <a-modal v-model:visible="addModalVisible" title="新增题目" width="800px" @ok="handleAddQuestion"
            @cancel="handleCancelAdd" :confirm-loading="addLoading" :maskClosable="false">
            <a-form :model="addForm" :rules="addFormRules" ref="addFormRef" :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }">
                <a-form-item label="题目标题" name="title">
                    <a-input v-model:value="addForm.title" placeholder="请输入题目标题" />
                </a-form-item>

                <a-form-item label="题目内容" name="content">
                    <a-textarea v-model:value="addForm.content" placeholder="请输入题目内容" :rows="6" />
                </a-form-item>

                <a-form-item label="参考答案" name="answer">
                    <a-textarea v-model:value="addForm.answer" placeholder="请输入参考答案" :rows="4" />
                </a-form-item>

                <a-form-item label="难度" name="difficulty">
                    <a-select v-model:value="addForm.difficulty" placeholder="请选择难度">
                        <a-select-option value="简单">简单</a-select-option>
                        <a-select-option value="中等">中等</a-select-option>
                        <a-select-option value="困难">困难</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="标签" name="tags">
                    <a-select v-model:value="addForm.tags" mode="tags" style="width: 100%" placeholder="请选择或输入标签">
                        <a-select-option v-for="tag in tagsList" :key="tag" :value="tag">
                            {{ tag }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="题库" name="questionBankId">
                    <a-select v-model:value="addForm.questionBankId" placeholder="请选择题库">
                        <a-select-option v-for="bankItem in questionBanks" :key="bankItem.id" :value="bankItem.id">
                            {{ bankItem.title }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 编辑题目 -->
        <a-modal v-model:visible="editModalVisible" title="编辑题目" width="800px" @ok="handleEditQuestion"
            @cancel="handleCancelEdit" :confirm-loading="editLoading" :maskClosable="false">
            <a-form :model="editForm" :rules="editFormRules" ref="editFormRef" :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }">
                <a-form-item label="题目ID">
                    <a-input v-model:value="editForm.id" disabled />
                </a-form-item>

                <a-form-item label="题目标题" name="title">
                    <a-input v-model:value="editForm.title" placeholder="请输入题目标题" />
                </a-form-item>

                <a-form-item label="题目内容" name="content">
                    <a-textarea v-model:value="editForm.content" placeholder="请输入题目内容" :rows="6" />
                </a-form-item>

                <a-form-item label="参考答案" name="answer">
                    <a-textarea v-model:value="editForm.answer" placeholder="请输入参考答案" :rows="4" />
                </a-form-item>

                <a-form-item label="难度" name="difficulty">
                    <a-select v-model:value="editForm.difficulty" placeholder="请选择难度">
                        <a-select-option value="简单">简单</a-select-option>
                        <a-select-option value="中等">中等</a-select-option>
                        <a-select-option value="困难">困难</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="标签" name="tags">
                    <a-select v-model:value="editForm.tags" mode="tags" style="width: 100%" placeholder="请选择或输入标签">
                        <a-select-option v-for="tag in tagsList" :key="tag" :value="tag">
                            {{ tag }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="题库" name="questionBankId">
                    <a-select v-model:value="editForm.questionBankId" placeholder="请选择题库">
                        <a-select-option v-for="bankItem in questionBanks" :key="bankItem.id" :value="bankItem.id">
                            {{ bankItem.title }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 预览题目 -->
        <a-modal v-model:visible="previewModalVisible" title="题目预览" width="800px" :footer="null" :maskClosable="true"
            :destroyOnClose="true">
            <transition name="fade" mode="out-in">
                <div class="preview-container" v-if="previewQuestion">
                    <div class="preview-header">
                        <h3>{{ previewQuestion.title }}</h3>
                        <div class="preview-meta">
                            <span :class="difficultyClass(previewQuestion.difficulty)" class="difficulty-tag">
                                {{ previewQuestion.difficulty }}
                            </span>
                            <span class="meta-divider">|</span>
                            <span class="bank-name">题库：{{ getQuestionBankName(previewQuestion.questionBankId) }}</span>
                            <span class="meta-divider">|</span>
                            <span class="question-id">题目ID：{{ previewQuestion.id }}</span>
                        </div>
                    </div>

                    <div class="preview-tags">
                        <transition-group name="tag">
                            <span v-for="tag in previewQuestion.tagList" :key="tag" class="tag">{{ tag }}</span>
                        </transition-group>
                    </div>

                    <div class="preview-content">
                        <h4>题目内容</h4>
                        <div class="content-box">{{ previewQuestion.content || '暂无内容' }}</div>
                    </div>

                    <div class="preview-answer">
                        <h4>参考答案</h4>
                        <div class="content-box">{{ previewQuestion.answer || '暂无答案' }}</div>
                    </div>

                    <div class="preview-statistics">
                        <div class="statistics-box">
                            <div class="stat-item">
                                <span class="stat-label">提交次数：</span>
                                <span class="stat-value">{{ previewQuestion.submissionQuantity || 0 }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">通过率：</span>
                                <span class="stat-value" :class="passRateClass(previewQuestion.passRate)">
                                    {{ previewQuestion.passRate || '0%' }}
                                </span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">最近更新：</span>
                                <span class="stat-value">{{ formatDateTime(previewQuestion.updateTime) }}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </transition>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { DownloadOutlined, PlusOutlined, EditOutlined, FolderViewOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import type { FormInstance } from 'ant-design-vue';
import { formatDateTime } from '@/utils/dateTimeFormat';
import { addQuestion, updateQuestion, deleteQuestion, getQuestionList } from '@/apis/questionApi';
import { getQuestionBankList } from '@/apis/questionBankApi';
import { addQuestionToBank, getQuestionBanksByQuestionId, updateQuestionBankRelation } from '@/apis/questionBankQuestionApi';

// 题目接口
interface Question {
    id: number;
    title: string;
    content?: string;
    answer?: string;
    difficulty: string;
    tagList?: string[];
    tags?: string;
    submissionQuantity?: number;
    passQuantity?: number;
    passRate?: string;
    questionBankId?: number;
    updateTime?: string;
    userId?: number;
}

// 题库接口
interface QuestionBank {
    id: number;
    title: string;
    description?: string;
    picture?: string;
}

// 标签列表
const tagsList = ref([
    '操作系统',
    '计算机网络',
    '数据库',
    'Java',
    'Spring',
    '分布式系统',
    '基础概念',
    '网络协议',
    '安全',
    '性能优化',
    '算法',
    '排序',
    '并发编程',
    'JVM',
    '缓存',
    'Redis',
    '理论基础',
    '内存管理',
    '动态规划'
]);

// 筛选相关
const difficulty = ref('all');
const bank = ref<number | 'all'>('all');
const searchQuery = ref('');
const isSearching = ref(false);
const isExporting = ref(false);
const loading = ref(false);

// 页码相关状态
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const pageSizeOptions = ref(['10', '20', '50', '100']);
const showTotal = (total: number) => `共 ${total} 条记录`;

// 新增题目相关
const addModalVisible = ref(false);
const addLoading = ref(false);
const addFormRef = ref<FormInstance>();

// 编辑题目相关
const editModalVisible = ref(false);
const editLoading = ref(false);
const editFormRef = ref<FormInstance>();

// 预览题目相关
const previewModalVisible = ref(false);
const previewQuestion = ref<Question | null>(null);

// 题库列表
const questionBanks = ref<QuestionBank[]>([]);

// 题目列表
const questionList = ref<Question[]>([]);

// 新增题目表单
const addForm = reactive({
    title: '',
    content: '',
    answer: '',
    difficulty: undefined as string | undefined,
    tags: [] as string[],
    questionBankId: undefined as number | undefined
});

// 编辑题目表单
const editForm = reactive({
    id: 0,
    title: '',
    content: '',
    answer: '',
    difficulty: '',
    tags: [] as string[],
    questionBankId: undefined as number | undefined,
    submissionQuantity: 0,
    passRate: '',
    updateTime: ''
});

// 表单验证规则
const addFormRules: Record<string, Rule[]> = {
    title: [
        { required: true, message: '请输入题目标题', trigger: 'blur' },
        { min: 2, max: 100, message: '标题长度应在 2-100 个字符之间', trigger: 'blur' }
    ],
    content: [
        { required: true, message: '请输入题目内容', trigger: 'blur' },
        { min: 10, message: '题目内容至少 10 个字符', trigger: 'blur' }
    ],
    answer: [
        { required: true, message: '请输入参考答案', trigger: 'blur' }
    ],
    difficulty: [
        { required: true, message: '请选择难度', trigger: 'change' }
    ],
    tags: [
        { required: true, message: '请至少选择一个标签', trigger: 'change', type: 'array' }
    ],
    questionBankId: [
        { required: true, message: '请选择题库', trigger: 'change' }
    ]
};

const editFormRules = addFormRules;

// 获取请求参数
const getRequestParams = () => {
    const params = {
        current: currentPage.value,
        pageSize: pageSize.value,
        searchText: searchQuery.value || undefined,
        difficulty: difficulty.value === 'all' ? undefined : difficulty.value,
        questionBankId: bank.value === 'all' ? undefined : bank.value
    };
    return params;
};

// 处理搜索事件
const handleSearch = () => {
    isSearching.value = true;
    currentPage.value = 1;
    fetchQuestionList();
};

// 分页后的题目列表
const paginatedQuestionList = computed(() => {
    return questionList.value;
});

// 获取题库名称
const getQuestionBankName = (questionBankId?: number) => {
    if (!questionBankId) return '未分配题库';
    const bank = questionBanks.value.find(bank => bank.id === questionBankId);
    return bank ? bank.title : '未知题库';
};

// 获取题库列表
const fetchQuestionBanks = async () => {
    try {
        const response = await getQuestionBankList();
        if (response.code === 0) {
            questionBanks.value = response.data || [];
        } else {
            message.error(response.message || '获取题库列表失败');
        }
    } catch (error) {
        console.error('获取题库列表失败:', error);
        message.error('获取题库列表失败');
    }
};

// 获取题目列表
const fetchQuestionList = async () => {
    try {
        loading.value = true;
        isSearching.value = true;

        const params = getRequestParams();
        const response = await getQuestionList(params);

        if (response.code === 0) {
            // 处理后端返回的数据
            const data = response.data;
            const questions = data.records || [];
            total.value = data.total || 0;

            // 处理标签数据并获取题库关联信息
            const processedQuestions = await Promise.all(questions.map(async (question: Question) => {
                // 处理标签
                if (question.tags && typeof question.tags === 'string') {
                    try {
                        // 尝试解析JSON字符串
                        const tagsArray = JSON.parse(question.tags);
                        question.tagList = Array.isArray(tagsArray) ? tagsArray : question.tags.split(',');
                    } catch (e) {
                        // 如果解析失败，尝试直接分割字符串
                        question.tagList = question.tags.replace(/[\[\]"]/g, '').split(',').map(tag => tag.trim()).filter(Boolean);
                    }
                } else if (!question.tagList) {
                    question.tagList = [];
                }

                // 查询题目关联的题库
                try {
                    const bankResponse = await getQuestionBanksByQuestionId(question.id);
                    if (bankResponse.code === 0) {
                        const records = bankResponse.data?.records || [];
                        if (records.length > 0) {
                            question.questionBankId = records[0].questionBankId;
                        }
                    }
                } catch (error) {
                    console.error(`获取题目[${question.id}]的题库关联失败:`, error);
                }

                return question;
            }));

            questionList.value = processedQuestions;

            // 更新标签列表
            const allTags = new Set<string>();
            questionList.value.forEach(question => {
                if (question.tagList && question.tagList.length > 0) {
                    question.tagList.forEach(tag => allTags.add(tag));
                }
            });

            const existingTags = new Set(tagsList.value);
            allTags.forEach(tag => existingTags.add(tag));
            tagsList.value = Array.from(existingTags);
        } else {
            message.error(response.message || '获取题目列表失败');
        }
    } catch (error) {
        console.error('获取题目列表失败:', error);
        message.error('获取题目列表失败');
    } finally {
        loading.value = false;
        isSearching.value = false;
    }
};

// 难度标签样式
const difficultyClass = (difficulty: string) => {
    switch (difficulty) {
        case '简单':
            return 'difficulty-easy';
        case '中等':
            return 'difficulty-medium';
        case '困难':
            return 'difficulty-hard';
        default:
            return '';
    }
};

// 通过率样式
const passRateClass = (rate?: string) => {
    if (!rate) return 'pass-rate-low';
    const pass = parseInt(rate.replace('%', ''));
    if (pass >= 60) return 'pass-rate-high';
    if (pass >= 40) return 'pass-rate-medium';
    return 'pass-rate-low';
};

// 分页变化处理函数
const handlePageChange = (page: number) => {
    currentPage.value = page;
    fetchQuestionList();
    window.scrollTo(0, 0);
};

// 每页显示条数变化处理函数
const handlePageSizeChange = (current: number, size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchQuestionList();
};

// 导出题目数据
const exportQuestionData = async () => {
    try {
        // 确认有数据可导出
        if (questionList.value.length === 0) {
            message.warning('没有符合条件的题目可导出');
            return;
        }

        isExporting.value = true;

        // CSV导出逻辑
        let csvContent = '题目ID,题目标题,难度,标签,提交次数,通过率,所属题库,最近更新\n';

        questionList.value.forEach(question => {
            // 处理标签中的逗号，避免CSV格式错误
            const formattedTags = `"${question.tagList?.join(',') || ''}"`;
            const bankName = getQuestionBankName(question.questionBankId);
            const formattedTime = question.updateTime ? formatDateTime(question.updateTime) : '';

            csvContent += `${question.id},${question.title},${question.difficulty},${formattedTags},${question.submissionQuantity || 0},${question.passRate || '0%'},${bankName},${question.updateTime || ''}\n`;
        });

        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `题目列表_${formatDateTime(new Date(), 'YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);

        // 触发下载
        link.click();

        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        message.success('题目导出成功');
    } catch (error) {
        console.error('导出题目失败:', error);
        message.error('导出题目失败，请重试');
    } finally {
        isExporting.value = false;
    }
};

// 添加筛选条件变化监听器
watch([searchQuery, difficulty, bank], () => {
    currentPage.value = 1;
    fetchQuestionList();
}, { deep: true });

// 题目增删改查Modal

const showAddModal = () => {
    addForm.title = '';
    addForm.content = '';
    addForm.answer = '';
    addForm.difficulty = undefined;
    addForm.tags = [];
    addForm.questionBankId = undefined;

    addModalVisible.value = true;
};

const showEditModal = async (question: Question) => {
    editForm.id = question.id;
    editForm.title = question.title;
    editForm.content = question.content || '';
    editForm.answer = question.answer || '';
    editForm.difficulty = question.difficulty;
    editForm.tags = [...(question.tagList || [])];
    editForm.submissionQuantity = question.submissionQuantity || 0;
    editForm.passRate = question.passRate || '0%';
    editForm.updateTime = question.updateTime ? formatDateTime(question.updateTime) : '暂无记录';

    // 获取题目关联的题库
    try {
        const bankResponse = await getQuestionBanksByQuestionId(question.id);
        if (bankResponse.code === 0) {
            const records = bankResponse.data?.records || [];
            if (records.length > 0) {
                editForm.questionBankId = records[0].questionBankId;
            } else {
                editForm.questionBankId = undefined;
            }
        }
    } catch (error) {
        console.error('获取题目题库关联失败:', error);
        editForm.questionBankId = undefined;
    }

    editModalVisible.value = true;
};

const showPreviewModal = (question: Question) => {
    previewQuestion.value = {
        ...question,
        updateTime: question.updateTime || undefined
    };

    previewModalVisible.value = true;
};

const handleAddQuestion = async () => {
    try {
        const valid = await addFormRef.value?.validate();
        if (!valid) return;

        addLoading.value = true;

        // 检查难度值是否已定义
        if (!addForm.difficulty) {
            message.error('请选择难度');
            addLoading.value = false;
            return;
        }

        // 检查题库ID是否已定义
        if (!addForm.questionBankId) {
            message.error('请选择题库');
            addLoading.value = false;
            return;
        }

        // 如果添加了新标签，则同步更新标签列表
        if (addForm.tags.length > 0) {
            const newTags = addForm.tags.filter(tag => !tagsList.value.includes(tag));
            if (newTags.length > 0) {
                tagsList.value = [...tagsList.value, ...newTags];
            }
        }

        // 创建题目数据
        const questionData = {
            title: addForm.title,
            content: addForm.content,
            answer: addForm.answer,
            difficulty: addForm.difficulty,
            tags: addForm.tags  // 后端会处理tags数组
        };

        // 添加题目
        const response = await addQuestion(questionData);

        if (response.code === 0) {
            const questionId = response.data;

            // 添加成功后，建立题目与题库的关联
            if (questionId && addForm.questionBankId) {
                try {
                    const bankResult = await addQuestionToBank(questionId, addForm.questionBankId);
                    if (bankResult.code !== 0) {
                        message.warning('题目添加成功，但关联题库失败');
                    }
                } catch (error) {
                    console.error('关联题库失败:', error);
                    message.warning('题目添加成功，但关联题库失败');
                }
            }

            message.success('题目添加成功！');
            addModalVisible.value = false;
            addFormRef.value?.resetFields();
            // 刷新题目列表
            fetchQuestionList();
        } else {
            message.error(response.message || '添加题目失败');
        }
    } catch (error) {
        console.error('添加题目失败:', error);
        message.error('添加题目失败，请重试');
    } finally {
        addLoading.value = false;
    }
};

const handleEditQuestion = async () => {
    try {
        const valid = await editFormRef.value?.validate();
        if (!valid) return;

        editLoading.value = true;

        // 检查题库ID是否已定义
        if (!editForm.questionBankId) {
            message.error('请选择题库');
            editLoading.value = false;
            return;
        }

        // 如果编辑时添加了新标签，则同步更新标签列表
        if (editForm.tags.length > 0) {
            const newTags = editForm.tags.filter(tag => !tagsList.value.includes(tag));
            if (newTags.length > 0) {
                tagsList.value = [...tagsList.value, ...newTags];
            }
        }

        // 更新题目数据
        const updatedQuestion = {
            id: editForm.id,
            title: editForm.title,
            content: editForm.content,
            answer: editForm.answer,
            difficulty: editForm.difficulty,
            tags: editForm.tags  // 后端会处理tags数组
        };

        // 更新题目基本信息
        const response = await updateQuestion(updatedQuestion);

        if (response.code === 0) {
            // 更新题目与题库的关联
            try {
                const bankResult = await updateQuestionBankRelation(editForm.id, editForm.questionBankId);
                if (!bankResult) {
                    message.warning('题目更新成功，但更新题库关联失败');
                }
            } catch (error) {
                console.error('更新题库关联失败:', error);
                message.warning('题目更新成功，但更新题库关联失败');
            }

            message.success('题目更新成功！');
            editModalVisible.value = false;
            // 刷新题目列表
            fetchQuestionList();
        } else {
            message.error(response.message || '更新题目失败');
        }
    } catch (error) {
        console.error('编辑题目失败:', error);
        message.error('编辑题目失败，请重试');
    } finally {
        editLoading.value = false;
    }
};

const handleDelete = (question: Question) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除题目 "${question.title}" 吗？该操作不可恢复！`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
            try {
                message.loading('正在删除...', 0);

                const response = await deleteQuestion(question.id);

                if (response.code === 0) {
                    message.destroy();
                    message.success('题目删除成功！');
                    // 刷新题目列表
                    fetchQuestionList();
                } else {
                    message.destroy();
                    message.error(response.message || '删除题目失败');
                }
            } catch (error) {
                console.error('删除题目失败:', error);
                message.destroy();
                message.error('删除题目失败，请重试');
            }
        }
    });
};

const handleCancelAdd = () => {
    addFormRef.value?.resetFields();
    addModalVisible.value = false;
};

const handleCancelEdit = () => {
    editFormRef.value?.resetFields();
    editModalVisible.value = false;
};

onMounted(() => {
    fetchQuestionBanks();
    fetchQuestionList();
});
</script>

<style scoped>
@import "@/assets/styles/manager/QuestionsManager.css";
</style>