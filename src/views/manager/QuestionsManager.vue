<template>
    <div class="app-container">
        <!-- 题目管理 -->
        <div class="questions">
            <!-- 操作栏卡片 -->
            <div class="card actions-card">
                <div class="actions">
                    <div class="filters">
                        <!-- 搜索框 -->
                        <a-input-search v-model="searchQuery" placeholder="搜索题目标题、ID..." class="input-search" />
                        <!-- 筛选选项 -->
                        <a-select v-model:value="difficulty" placeholder="难度" class="select-filter">
                            <a-select-option value="all">全部难度</a-select-option>
                            <a-select-option value="easy">简单</a-select-option>
                            <a-select-option value="medium">中等</a-select-option>
                            <a-select-option value="hard">困难</a-select-option>
                        </a-select>
                        <a-select v-model:value="bank" placeholder="题库" class="select-filter">
                            <a-select-option value="all">全部题库</a-select-option>
                            <a-select-option 
                                v-for="bankItem in questionBanks" 
                                :key="bankItem.id" 
                                :value="bankItem.id"
                            >
                                {{ bankItem.title }}
                            </a-select-option>
                        </a-select>
                        <a-select v-model:value="status" placeholder="状态" class="select-filter">
                            <a-select-option value="all">全部状态</a-select-option>
                            <a-select-option value="active">已启用</a-select-option>
                            <a-select-option value="inactive">已禁用</a-select-option>
                        </a-select>
                    </div>
                    <div class="buttons">
                        <a-button class="export-button">
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
                        <tbody>
                            <tr v-for="Question in filteredQuestionList" :key="Question.id">
                                <td>#{{ Question.id }}</td>
                                <td>{{ Question.title }}</td>
                                <td>
                                    <span :class="difficultyClass(Question.difficulty)" class="difficulty-tag">
                                        {{ Question.difficulty }}
                                    </span>
                                </td>
                                <td>
                                    <span v-for="tag in Question.tags" :key="tag" class="tag">{{ tag }}</span>
                                </td>
                                <td>{{ Question.submissions }}</td>
                                <td>
                                    <span :class="passRateClass(Question.passRate)">
                                        {{ Question.passRate }}
                                    </span>
                                </td>
                                <td>{{ getQuestionBankName(Question.questionBankId) }}</td>
                                <td>
                                    <button class="edit-btn" @click="showEditModal(Question)">
                                        <EditOutlined class="edit-icon" />编辑
                                    </button>
                                    <button class="preview-btn" @click="showPreviewModal(Question)">
                                        <FolderViewOutlined class="preview-icon" />预览
                                    </button>
                                    <button class="delete-btn" @click="handleDelete(Question)">
                                        <DeleteOutlined class="delete-icon" />删除
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <a-pagination :current="currentPage" :total="totalItems" :pageSize="itemsPerPage"
                    @change="handlePageChange" showQuickJumper style="margin-top: 20px; text-align: center;" />
            </div>
        </div>

        <!-- 新增题目 -->
        <a-modal v-model:visible="addModalVisible" title="新增题目" width="800px" @ok="handleAddQuestion"
            @cancel="handleCancelAdd" :confirm-loading="addLoading">
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
                        <a-select-option value="操作系统">操作系统</a-select-option>
                        <a-select-option value="计算机网络">计算机网络</a-select-option>
                        <a-select-option value="数据库">数据库</a-select-option>
                        <a-select-option value="Java">Java</a-select-option>
                        <a-select-option value="分布式系统">分布式系统</a-select-option>
                        <a-select-option value="基础概念">基础概念</a-select-option>
                        <a-select-option value="网络协议">网络协议</a-select-option>
                        <a-select-option value="安全">安全</a-select-option>
                        <a-select-option value="性能优化">性能优化</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="题库" name="questionBankId">
                    <a-select v-model:value="addForm.questionBankId" placeholder="请选择题库">
                        <a-select-option 
                            v-for="bankItem in questionBanks" 
                            :key="bankItem.id" 
                            :value="bankItem.id"
                        >
                            {{ bankItem.title }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 编辑题目 -->
        <a-modal v-model:visible="editModalVisible" title="编辑题目" width="800px" @ok="handleEditQuestion"
            @cancel="handleCancelEdit" :confirm-loading="editLoading">
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
                        <a-select-option value="操作系统">操作系统</a-select-option>
                        <a-select-option value="计算机网络">计算机网络</a-select-option>
                        <a-select-option value="数据库">数据库</a-select-option>
                        <a-select-option value="Java">Java</a-select-option>
                        <a-select-option value="分布式系统">分布式系统</a-select-option>
                        <a-select-option value="基础概念">基础概念</a-select-option>
                        <a-select-option value="网络协议">网络协议</a-select-option>
                        <a-select-option value="安全">安全</a-select-option>
                        <a-select-option value="性能优化">性能优化</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="题库" name="questionBankId">
                    <a-select v-model:value="editForm.questionBankId" placeholder="请选择题库">
                        <a-select-option 
                            v-for="bankItem in questionBanks" 
                            :key="bankItem.id" 
                            :value="bankItem.id"
                        >
                            {{ bankItem.title }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 预览题目 -->
        <a-modal 
            v-model:visible="previewModalVisible" 
            title="题目预览" 
            width="800px"
            :footer="null"
        >
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
                        <span class="question-id">题目ID：#{{ previewQuestion.id }}</span>
                    </div>
                </div>
                
                <div class="preview-tags">
                    <span v-for="tag in previewQuestion.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
                
                <div class="preview-content">
                    <h4>题目内容</h4>
                    <div class="content-box">{{ previewQuestion.content || '暂无内容' }}</div>
                </div>
                
                <div class="preview-answer">
                    <h4>参考答案</h4>
                    <div class="content-box">{{ previewQuestion.answer || '暂无答案' }}</div>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { DownloadOutlined, PlusOutlined, EditOutlined, FolderViewOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import type { FormInstance } from 'ant-design-vue';
// import { addQuestion, updateQuestion, deleteQuestion, getQuestionBanks } from '@/api/questionApi';

// 题目接口
interface Question {
    id: number;
    title: string;
    content?: string;
    answer?: string;
    difficulty: string;
    tags: string[];
    submissions: number;
    passRate: string;
    questionBankId: number;
}

// 筛选相关
const difficulty = ref('all');
const bank = ref<number | 'all'>('all');
const status = ref('all');
const searchQuery = ref('');

// 页码相关状态
const currentPage = ref(1);
const totalItems = ref(100);
const itemsPerPage = ref(10);

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
const questionBanks = ref<Array<{ id: number; title: string }>>([]);

// 新增题目表单
const addForm = reactive({
    title: '',
    content: '',
    answer: '',
    difficulty: undefined,
    tags: [],
    questionBankId: undefined
});

// 编辑题目表单
const editForm = reactive({
    id: 0,
    title: '',
    content: '',
    answer: '',
    difficulty: '',
    tags: [] as string[],
    questionBankId: undefined as number | undefined
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

// 示例数据
const QuestionList = [
    { 
        id: 1, 
        title: '进程与线程的区别', 
        content: '请详细说明进程与线程的区别，包括它们的定义、特点、优缺点等。',
        answer: '进程是资源分配的基本单位，线程是CPU调度的基本单位。主要区别如下：\n1. 进程有独立的地址空间，线程共享进程的地址空间...',
        difficulty: '简单', 
        tags: ['操作系统', '基础概念'], 
        submissions: 12543, 
        passRate: '65%', 
        questionBankId: 1 
    },
    { 
        id: 2, 
        title: 'HTTP与HTTPS的区别', 
        content: '请比较HTTP和HTTPS协议的区别，说明HTTPS的安全性是如何实现的。',
        answer: 'HTTP是超文本传输协议，HTTPS是HTTP的安全版本。主要区别：\n1. HTTPS使用SSL/TLS加密...',
        difficulty: '中等', 
        tags: ['网络协议', '安全'], 
        submissions: 8765, 
        passRate: '48%', 
        questionBankId: 2 
    },
    { 
        id: 3, 
        title: 'Redis分布式锁实现', 
        content: '请说明Redis如何实现分布式锁，包括实现原理、具体步骤和需要注意的问题。',
        answer: 'Redis分布式锁的实现原理是利用Redis的原子性操作。具体实现：\n1. 使用SETNX命令...',
        difficulty: '困难', 
        tags: ['分布式', '缓存'], 
        submissions: 5432, 
        passRate: '35%', 
        questionBankId: 5 
    },
    { 
        id: 4, 
        title: 'TCP三次握手详解', 
        content: '请详细描述TCP三次握手的过程，并说明为什么需要三次握手而不是两次？',
        answer: 'TCP三次握手过程：\n1. 客户端发送SYN包...\n2. 服务器响应SYN+ACK包...\n3. 客户端发送ACK包...',
        difficulty: '简单', 
        tags: ['计算机网络', '协议'], 
        submissions: 9876, 
        passRate: '72%', 
        questionBankId: 2 
    },
    { 
        id: 5, 
        title: 'MySQL索引原理', 
        content: '请解释MySQL索引的工作原理，包括B+树索引的结构、优化原理等。',
        answer: 'MySQL索引主要使用B+树数据结构。原理如下：\n1. B+树是平衡树结构...\n2. 叶子节点存储数据...',
        difficulty: '中等', 
        tags: ['数据库', '性能优化'], 
        submissions: 7654, 
        passRate: '52%', 
        questionBankId: 3 
    },
];

// 获取题库名称
const getQuestionBankName = (questionBankId: number) => {
    const bank = questionBanks.value.find(bank => bank.id === questionBankId);
    return bank ? bank.title : '未知题库';
};

// 获取题库列表
const fetchQuestionBanks = async () => {
    try {
        // 调用API获取题库列表
        // const response = await getQuestionBanks();
        // questionBanks.value = response.data;
        
        // 示例数据
        questionBanks.value = [
            { id: 1, title: '操作系统' },
            { id: 2, title: '网络' },
            { id: 3, title: '数据库' },
            { id: 4, title: 'Java' },
            { id: 5, title: '分布式' }
        ];
    } catch (error) {
        console.error('获取题库列表失败:', error);
        message.error('获取题库列表失败');
    }
};

// 筛选后的题目列表
const filteredQuestionList = computed(() => {
    return QuestionList.filter(Question => {
        // 搜索过滤
        const searchMatch = searchQuery.value === '' ||
            Question.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            Question.id.toString().includes(searchQuery.value);

        // 难度过滤
        const difficultyMatch = difficulty.value === 'all' ||
            (difficulty.value === 'easy' && Question.difficulty === '简单') ||
            (difficulty.value === 'medium' && Question.difficulty === '中等') ||
            (difficulty.value === 'hard' && Question.difficulty === '困难');

        // 题库过滤
        const bankMatch = bank.value === 'all' ||
            Question.questionBankId === bank.value;

        return searchMatch && difficultyMatch && bankMatch;
    });
});

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
const passRateClass = (rate: string) => {
    const pass = parseInt(rate.replace('%', ''));
    if (pass >= 60) return 'pass-rate-high';
    if (pass >= 40) return 'pass-rate-medium';
    return 'pass-rate-low';
};

// 分页控制
const handlePageChange = (page: number) => {
    currentPage.value = page;
    console.log(`Page changed to: ${page}`);
};

// 题目增删改查Modal

const showAddModal = () => {
    addModalVisible.value = true;
};

const showEditModal = (question: Question) => {
    editForm.id = question.id;
    editForm.title = question.title;
    editForm.content = question.content || '';
    editForm.answer = question.answer || '';
    editForm.difficulty = question.difficulty;
    editForm.tags = [...question.tags];
    editForm.questionBankId = question.questionBankId;
    
    editModalVisible.value = true;
};

const showPreviewModal = (question: Question) => {
    previewQuestion.value = question;
    previewModalVisible.value = true;
};

const handleAddQuestion = async () => {
    try {
        const valid = await addFormRef.value?.validate();
        if (!valid) return;

        addLoading.value = true;

        const requestData = {
            title: addForm.title,
            content: addForm.content,
            answer: addForm.answer,
            tags: addForm.tags,
            questionBankId: addForm.questionBankId,
            'difficulty-value': addForm.difficulty
        };

        // 调用API
        // const response = await addQuestion(requestData);

        // 模拟API调用成功 TO DEL
        console.log('提交数据:', requestData);
        message.success('题目添加成功！');

        addModalVisible.value = false;
        addFormRef.value?.resetFields();

        // 刷新题目列表 TO DO
        // refreshQuestionList();

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

        const requestData = {
            id: editForm.id,
            title: editForm.title,
            content: editForm.content,
            answer: editForm.answer,
            tags: editForm.tags,
            questionBankId: editForm.questionBankId,
            'difficulty-value': editForm.difficulty
        };

        // 调用API
        // const response = await updateQuestion(requestData);

        // 模拟API调用成功 TO DEL
        console.log('编辑数据:', requestData);
        message.success('题目更新成功！');

        editModalVisible.value = false;

        // TO DO
        // refreshQuestionList();

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
        content: `确定要删除题目 "${question.title}" 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
            try {
                // 调用API删除
                // await deleteQuestion(question.id);
                
                // 模拟API调用成功 TO DEL
                console.log('删除题目:', question.id);
                message.success('题目删除成功！');
                
                // TO DO
                // refreshQuestionList();
            } catch (error) {
                console.error('删除题目失败:', error);
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
});
</script>

<style scoped>
@import "../../assets/styles/manager/QuestionsManager.css";
</style>