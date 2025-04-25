<template>
    <div class="app-container">
        <!-- 题目管理 -->
        <div class="questions">
            <!-- 操作栏卡片 -->
            <div class="card actions-card">
                <div class="actions">
                    <div class="filters">
                        <!-- 搜索框 -->
                        <a-input-search 
                            v-model:value="searchQuery" 
                            placeholder="搜索题目标题、ID..." 
                            class="input-search"
                            @search="handleSearch" 
                            allow-clear
                            :loading="isSearching"
                        />
                        <!-- 筛选选项 -->
                        <a-select v-model:value="difficulty" placeholder="难度" class="select-filter">
                            <a-select-option value="all">全部难度</a-select-option>
                            <a-select-option value="easy">简单</a-select-option>
                            <a-select-option value="medium">中等</a-select-option>
                            <a-select-option value="hard">困难</a-select-option>
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
                                    <td>#{{ question.id }}</td>
                                    <td>{{ question.title }}</td>
                                    <td>
                                        <span :class="difficultyClass(question.difficulty)" class="difficulty-tag">
                                            {{ question.difficulty }}
                                        </span>
                                    </td>
                                    <td>
                                        <transition-group name="tag" class="tag-container">
                                            <span v-for="tag in question.tags" :key="tag" class="tag">{{ tag }}</span>
                                        </transition-group>
                                    </td>
                                    <td>{{ question.submissions }}</td>
                                    <td>
                                        <span :class="passRateClass(question.passRate)">
                                            {{ question.passRate }}
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
                    <a-pagination v-model:current="currentPage" v-model:pageSize="itemsPerPage" :total="totalItems"
                        :showTotal="showTotal" :pageSizeOptions="pageSizeOptions" showSizeChanger showQuickJumper
                        @change="handlePageChange" @showSizeChange="handlePageSizeChange" />
                    <div class="pagination-info">
                        当前显示: {{ (currentPage - 1) * itemsPerPage + (totalItems > 0 ? 1 : 0) }}-{{ Math.min(currentPage
                            * itemsPerPage, totalItems) }} 条，共 {{ totalItems }} 条
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

                <a-form-item label="统计信息">
                    <div class="statistics-info">
                        <p>提交次数: {{ editForm.submissions || 0 }}</p>
                        <p>通过率: {{ editForm.passRate || '0%' }}</p>
                        <p>最近更新: {{ editForm.lastUpdated || '暂无记录' }}</p>
                    </div>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 预览题目 -->
        <a-modal v-model:visible="previewModalVisible" title="题目预览" width="800px" :footer="null" 
            :maskClosable="true" :destroyOnClose="true">
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
                            <span class="question-id">题目ID：#{{ previewQuestion.id }}</span>
                        </div>
                    </div>

                    <div class="preview-tags">
                        <transition-group name="tag">
                            <span v-for="tag in previewQuestion.tags" :key="tag" class="tag">{{ tag }}</span>
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
// import { addQuestion, updateQuestion, deleteQuestion, getQuestionBanks, getQuestions } from '@/api/questionApi';

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
    lastUpdated?: string;
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
const itemsPerPage = ref(10);
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
const questionBanks = ref<Array<{ id: number; title: string }>>([]);

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
    submissions: 0,
    passRate: '',
    lastUpdated: ''
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

// 筛选后的题目列表
const filteredQuestionList = computed(() => {
    return questionList.value.filter(question => {
        // 搜索过滤 - 模糊搜索
        const searchLower = searchQuery.value.toLowerCase().trim();
        const searchMatch = !searchLower || 
            question.title.toLowerCase().includes(searchLower) || 
            String(question.id).includes(searchLower);

        // 难度过滤
        const difficultyMatch = difficulty.value === 'all' ||
            (difficulty.value === 'easy' && question.difficulty === '简单') ||
            (difficulty.value === 'medium' && question.difficulty === '中等') ||
            (difficulty.value === 'hard' && question.difficulty === '困难');

        // 题库过滤
        const bankMatch = bank.value === 'all' ||
            question.questionBankId === bank.value;

        return searchMatch && difficultyMatch && bankMatch;
    });
});

// 处理搜索事件
const handleSearch = () => {
    isSearching.value = true;
    currentPage.value = 1;
    
    // 模拟搜索延迟
    setTimeout(() => {
        isSearching.value = false;
    }, 300);
};

const paginatedQuestionList = computed(() => {
    const filteredList = filteredQuestionList.value;
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    return filteredList.slice(startIndex, Math.min(endIndex, filteredList.length));
});

const totalItems = computed(() => {
    return filteredQuestionList.value.length;
});


const getQuestionBankName = (questionBankId: number) => {
    const bank = questionBanks.value.find(bank => bank.id === questionBankId);
    return bank ? bank.title : '未知题库';
};

// 获取题库列表
const getQuestionBanks = async () => {
    try {
        // 调用API获取题库列表
        // const response = await getQuestionBanks();
        // questionBanks.value = response.data;

        // 示例数据
        questionBanks.value = [
            { id: 1, title: '操作系统' },
            { id: 2, title: '计算机网络' },
            { id: 3, title: '数据库' },
            { id: 4, title: 'Java' },
            { id: 5, title: '分布式系统' },
            { id: 6, title: '算法与数据结构' }
        ];
    } catch (error) {
        console.error('获取题库列表失败:', error);
        message.error('获取题库列表失败');
    }
};

const getQuestions = async () => {
    try {
        loading.value = true;

        // 调用API获取题目列表
        // const response = await getQuestions();
        // questionList.value = response.data;

        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 从后端获取数据后，为标签管理增加一个额外步骤，收集所有使用过的标签
        const questions = [
            {
                id: 1,
                title: '进程与线程的区别',
                content: '请详细说明进程与线程的区别，包括它们的定义、特点、优缺点等。',
                answer: '进程是资源分配的基本单位，线程是CPU调度的基本单位。主要区别如下：\n1. 进程有独立的地址空间，线程共享进程的地址空间...',
                difficulty: '简单',
                tags: ['操作系统', '基础概念'],
                submissions: 12543,
                passRate: '65%',
                questionBankId: 1,
                lastUpdated: '2024-01-15 13:30'
            },
            {
                id: 2,
                title: 'HTTP与HTTPS的区别',
                content: '请比较HTTP和HTTPS协议的区别，说明HTTPS的安全性是如何实现的。',
                answer: 'HTTP是超文本传输协议，HTTPS是HTTP的安全版本。主要区别：\n1. HTTPS使用SSL/TLS加密...',
                difficulty: '中等',
                tags: ['计算机网络', '安全'],
                submissions: 8765,
                passRate: '48%',
                questionBankId: 2,
                lastUpdated: '2024-01-16 09:45'
            },
            {
                id: 3,
                title: 'Redis分布式锁实现',
                content: '请说明Redis如何实现分布式锁，包括实现原理、具体步骤和需要注意的问题。',
                answer: 'Redis分布式锁的实现原理是利用Redis的原子性操作。具体实现：\n1. 使用SETNX命令...',
                difficulty: '困难',
                tags: ['分布式系统', '缓存'],
                submissions: 5432,
                passRate: '35%',
                questionBankId: 5,
                lastUpdated: '2024-01-14 16:20'
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
                questionBankId: 2,
                lastUpdated: '2024-01-15 10:55'
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
                questionBankId: 3,
                lastUpdated: '2024-01-16 14:30'
            },
            {
                id: 6,
                title: 'Java多线程编程',
                content: '请介绍Java中的多线程实现方式，以及如何保证线程安全。',
                answer: 'Java中实现多线程主要有两种方式：继承Thread类和实现Runnable接口。线程安全保证方法包括：\n1. 使用synchronized关键字...',
                difficulty: '中等',
                tags: ['Java', '并发编程'],
                submissions: 8932,
                passRate: '61%',
                questionBankId: 4,
                lastUpdated: '2024-01-14 09:20'
            },
            {
                id: 7,
                title: '快速排序算法实现',
                content: '请详细描述快速排序算法的原理和实现步骤，并分析其时间复杂度和空间复杂度。',
                answer: '快速排序是一种分治算法，基本思想是：选择一个基准元素，将数组分为两部分，一部分小于基准，另一部分大于基准...',
                difficulty: '中等',
                tags: ['算法', '排序'],
                submissions: 10541,
                passRate: '68%',
                questionBankId: 6,
                lastUpdated: '2024-01-16 11:25'
            },
            {
                id: 8,
                title: 'Spring Bean生命周期',
                content: '请详细描述Spring Bean的完整生命周期。',
                answer: 'Spring Bean的生命周期主要包括：\n1. 实例化\n2. 设置属性值\n3. BeanNameAware接口的setBeanName方法\n4. BeanFactoryAware接口的setBeanFactory方法...',
                difficulty: '中等',
                tags: ['Java', 'Spring'],
                submissions: 6754,
                passRate: '45%',
                questionBankId: 4,
                lastUpdated: '2024-01-15 16:40'
            },
            {
                id: 9,
                title: 'CAP理论详解',
                content: '请详细解释分布式系统中的CAP理论，并举例说明常见系统的取舍。',
                answer: 'CAP理论指的是在一个分布式系统中，Consistency（一致性）、Availability（可用性）、Partition tolerance（分区容错性）三者不可兼得...',
                difficulty: '困难',
                tags: ['分布式系统', '理论基础'],
                submissions: 4532,
                passRate: '39%',
                questionBankId: 5,
                lastUpdated: '2024-01-17 09:10'
            },
            {
                id: 10,
                title: '数据库事务特性与隔离级别',
                content: '请详细描述数据库事务的ACID特性以及四种隔离级别。',
                answer: '数据库事务的ACID特性：\n1. 原子性（Atomicity）\n2. 一致性（Consistency）\n3. 隔离性（Isolation）\n4. 持久性（Durability）...',
                difficulty: '简单',
                tags: ['数据库', '基础概念'],
                submissions: 9876,
                passRate: '75%',
                questionBankId: 3,
                lastUpdated: '2024-01-14 13:50'
            },
            {
                id: 11,
                title: '操作系统内存管理',
                content: '请介绍操作系统的内存管理方式，包括分页、分段和虚拟内存等概念。',
                answer: '操作系统内存管理主要包括以下几种方式：\n1. 分页管理：将物理内存和逻辑内存分为固定大小的块...',
                difficulty: '困难',
                tags: ['操作系统', '内存管理'],
                submissions: 6432,
                passRate: '41%',
                questionBankId: 1,
                lastUpdated: '2024-01-15 14:20'
            },
            {
                id: 12,
                title: 'HTTPS加密原理',
                content: '请详细描述HTTPS的加密原理，包括对称加密和非对称加密的应用场景。',
                answer: 'HTTPS加密过程结合了对称加密和非对称加密的优点：\n1. 使用非对称加密（RSA、ECC等）安全地交换对称密钥...',
                difficulty: '中等',
                tags: ['计算机网络', '安全'],
                submissions: 7123,
                passRate: '58%',
                questionBankId: 2,
                lastUpdated: '2024-01-16 08:30'
            },
            {
                id: 14,
                title: 'Redis数据结构及应用',
                content: '请介绍Redis中的五种基本数据结构及其应用场景。',
                answer: 'Redis的五种基本数据结构：\n1. String（字符串）：缓存、计数器、分布式锁等\n2. List（列表）：消息队列、文章列表等...',
                difficulty: '中等',
                tags: ['数据库', 'Redis'],
                submissions: 8234,
                passRate: '62%',
                questionBankId: 3,
                lastUpdated: '2024-01-17 14:15'
            },
            {
                id: 15,
                title: 'Java垃圾回收机制',
                content: '请详细介绍Java的垃圾回收机制，包括垃圾回收算法和垃圾回收器。',
                answer: 'Java垃圾回收机制主要包括:\n1. 垃圾识别算法：引用计数法和可达性分析法\n2. 垃圾回收算法：标记-清除、复制、标记-整理、分代收集...',
                difficulty: '困难',
                tags: ['Java', 'JVM'],
                submissions: 7543,
                passRate: '42%',
                questionBankId: 4,
                lastUpdated: '2024-01-16 15:50'
            }
        ];
        
        questionList.value = questions;
        
        const allTags = new Set<string>();
        questions.forEach(question => {
            question.tags.forEach(tag => allTags.add(tag));
        });
        
        const existingTags = new Set(tagsList.value);
        allTags.forEach(tag => existingTags.add(tag));
        tagsList.value = Array.from(existingTags);

        message.success('题目列表加载成功');
    } catch (error) {
        console.error('获取题目列表失败:', error);
        message.error('获取题目列表失败');
    } finally {
        loading.value = false;
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
const passRateClass = (rate: string) => {
    const pass = parseInt(rate.replace('%', ''));
    if (pass >= 60) return 'pass-rate-high';
    if (pass >= 40) return 'pass-rate-medium';
    return 'pass-rate-low';
};

// 分页变化处理函数
const handlePageChange = (page: number) => {
    loading.value = true;
    setTimeout(() => {
        currentPage.value = page;
        window.scrollTo(0, 0);
        loading.value = false;
    }, 300);
};

// 每页显示条数变化处理函数
const handlePageSizeChange = (current: number, size: number) => {
    loading.value = true;
    setTimeout(() => {
        itemsPerPage.value = size;
        currentPage.value = 1;
        loading.value = false;
    }, 300);
};

// 重置分页状态的函数（在筛选条件改变时调用）
const resetPagination = () => {
    currentPage.value = 1;
};

// 刷新题目列表
const refreshQuestionList = async () => {
    await getQuestions();
};

// 导出题目数据
const exportQuestionData = async () => {
    try {
        // 确认有数据可导出
        if (filteredQuestionList.value.length === 0) {
            message.warning('没有符合条件的题目可导出');
            return;
        }
        
        isExporting.value = true;
        
        // 模拟导出延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 准备CSV数据
        let csvContent = '题目ID,题目标题,难度,标签,提交次数,通过率,所属题库,最近更新\n';
        
        filteredQuestionList.value.forEach(question => {
            // 处理标签中的逗号，避免CSV格式错误
            const formattedTags = `"${question.tags.join(',')}"`;
            const bankName = getQuestionBankName(question.questionBankId);
            
            csvContent += `${question.id},${question.title},${question.difficulty},${formattedTags},${question.submissions},${question.passRate},${bankName},${question.lastUpdated || ''}\n`;
        });
        
        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `题目列表_${new Date().toISOString().split('T')[0]}.csv`);
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
    resetPagination();
}, { immediate: true });

// 当题目列表变化时自动更新标签列表
watch(questionList, (newQuestions) => {
    if (newQuestions.length > 0) {
        const allTags = new Set<string>();
        newQuestions.forEach(question => {
            question.tags.forEach(tag => allTags.add(tag));
        });
        
        // 更新标签列表，保留原有顺序
        const existingTags = new Set(tagsList.value);
        allTags.forEach(tag => existingTags.add(tag));
        tagsList.value = Array.from(existingTags);
    }
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

const showEditModal = (question: Question) => {
    editForm.id = question.id;
    editForm.title = question.title;
    editForm.content = question.content || '';
    editForm.answer = question.answer || '';
    editForm.difficulty = question.difficulty;
    editForm.tags = [...question.tags];
    editForm.questionBankId = question.questionBankId;
    editForm.submissions = question.submissions;
    editForm.passRate = question.passRate;
    editForm.lastUpdated = question.lastUpdated || new Date().toLocaleString();

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

        const newQuestion = {
            id: questionList.value.length > 0 ? Math.max(...questionList.value.map(q => q.id)) + 1 : 1,
            title: addForm.title,
            content: addForm.content,
            answer: addForm.answer,
            difficulty: addForm.difficulty,
            tags: [...addForm.tags],
            questionBankId: addForm.questionBankId,
            submissions: 0,
            passRate: '0%',
            lastUpdated: new Date().toLocaleString()
        };

        // 调用API
        // await addQuestion(newQuestion);

        // 模拟API调用成功
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('新增题目:', newQuestion);
        questionList.value.push(newQuestion);
        message.success('题目添加成功！');

        addModalVisible.value = false;
        addFormRef.value?.resetFields();

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

        const updatedQuestion = {
            id: editForm.id,
            title: editForm.title,
            content: editForm.content,
            answer: editForm.answer,
            difficulty: editForm.difficulty,
            tags: [...editForm.tags],
            questionBankId: editForm.questionBankId,
            submissions: editForm.submissions,
            passRate: editForm.passRate,
            lastUpdated: new Date().toLocaleString()
        };

        // 调用API
        // await updateQuestion(updatedQuestion);

        // 模拟API调用成功
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('更新题目:', updatedQuestion);

        // 更新本地数据
        const index = questionList.value.findIndex(q => q.id === updatedQuestion.id);
        if (index !== -1) {
            questionList.value[index] = updatedQuestion;
        }

        message.success('题目更新成功！');
        editModalVisible.value = false;

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

                // 调用API删除
                // await deleteQuestion(question.id);

                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log('删除题目:', question.id);

                // 更新本地数据
                questionList.value = questionList.value.filter(q => q.id !== question.id);

                message.destroy();
                message.success('题目删除成功！');
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
    getQuestionBanks();
    getQuestions();
});
</script>

<style scoped>
@import "../../assets/styles/manager/QuestionsManager.css";
</style>