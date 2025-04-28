<template>
    <div class="questionbank">
        <!-- 搜索和筛选 -->
        <div class="header">
            <div class="filter-controls">
                <a-input-search v-model:value="searchQuery" placeholder="搜索题库名称" class="input-search" allow-clear
                    :button="true" @search="handleSearch" />
                <a-select v-model:value="bankStatus" placeholder="状态" class="select-filter"
                    @change="handleStatusChange">
                    <a-select-option value="all">全部状态</a-select-option>
                    <a-select-option value="0">已启用</a-select-option>
                    <a-select-option value="1">已停用</a-select-option>
                </a-select>
            </div>
            <a-button type="primary" class="add-bank-btn" @click="showAddModal">
                <PlusOutlined />新增题库
            </a-button>
        </div>

        <!-- 分类列表 -->
        <div class="bank-list-container">
                <transition name="fade">
                    <div v-if="!loading && filteredBankList.length === 0" class="empty-state-container">
                        <div :class="['empty-state', { 'search-empty': searchQuery || bankStatus !== 'all' }]">
                            <a-empty :description="getEmptyDescription">
                                <template #description>
                                    <div v-if="searchQuery || bankStatus !== 'all'" class="empty-description">
                                        <p>{{ getEmptyDescription }}</p>
                                        <div class="suggestion-text">请尝试以下操作：</div>
                                        <ul class="suggestion-list">
                                            <li v-if="searchQuery">修改搜索关键词</li>
                                            <li v-if="bankStatus !== 'all'">重置状态筛选条件</li>
                                            <li>检查拼写是否正确</li>
                                        </ul>
                                    </div>
                                    <div v-else class="empty-description">
                                        <p>{{ getEmptyDescription }}</p>
                                        <p class="empty-tips">点击下方按钮开始创建您的第一个题库</p>
                                    </div>
                                </template>
                                <div class="empty-action">
                                    <a-button v-if="searchQuery || bankStatus !== 'all'" @click="clearFilters" ghost
                                        type="primary" size="large">
                                        清除筛选
                                    </a-button>
                                    <a-button v-else type="primary" @click="showAddModal" size="large">
                                        <PlusOutlined /> 创建题库
                                    </a-button>
                                </div>
                            </a-empty>
                        </div>
                    </div>
                </transition>

                <transition name="fade">
                    <div v-if="!loading && filteredBankList.length > 0" class="bank-list">
                        <div v-for="bank in filteredBankList" :key="bank.id" class="bank-card">
                            <div class="bank-header">
                                <div class="icon-box">
                                    <BankIcon :name="bank.title" :iconName="bank.iconName" size="medium"
                                        class="bank-icon-display" />
                                </div>
                                <div class="bank-info">
                                    <h3>{{ bank.title }}</h3>
                                    <p class="question-count">{{ bank.questionCount || 0 }}题</p>
                                </div>
                                <div class="bank-actions">
                                    <button class="action-container" type="button" @click="showEditModal(bank)">
                                        <EditOutlined class="edit-icon" />
                                    </button>
                                    <button class="action-container" type="button" @click="handleDelete(bank)">
                                        <DeleteOutlined class="delete-icon" />
                                    </button>
                                </div>
                            </div>

                            <!-- 进度条和难度、活跃度显示 -->
                            <div class="bank-stats">
                                <div class="progress">
                                    <span class="progress-text">完成率:</span>
                                    <span class="completion-rate-value">{{ bank.completionRate || 0 }}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div :style="{ width: `${bank.completionRate || 0}%` }" class="progress-fill"></div>
                                </div>

                                <!-- 平均难度和活跃度 -->
                                <div class="bank-level">
                                    <div :class="getDifficultyClass(bank.avgDifficulty || 0)">
                                        <span class="difficulty-text">平均难度:</span>
                                        <span class="difficulty-value">{{ getDifficultyText(bank.avgDifficulty || 0)
                                            }}</span>
                                    </div>
                                    <div :class="getActiveLevelClass(bank.activeLevel || '低')">
                                        <span class="active-text">活跃度:</span>
                                        <span class="active-value">{{ bank.activeLevel || '低' }}</span>
                                    </div>
                                </div>

                                <!-- 最近更新时间 -->
                                <div class="last-updated">
                                    最近更新：{{ formatDate(bank.updateTime) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>
        </div>

        <!-- 新增题库 -->
        <a-modal v-model:visible="addModalVisible" title="新增题库" width="600px" @ok="handleAddBank"
            @cancel="handleCancelAdd" :confirm-loading="addLoading">
            <a-form :model="addForm" :rules="bankFormRules" ref="addFormRef" :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }">
                <a-form-item label="题库名称" name="title">
                    <a-input v-model:value="addForm.title" placeholder="请输入题库名称" />
                </a-form-item>

                <a-form-item label="题库图标" name="picture">
                    <a-select v-model:value="addForm.picture" placeholder="请选择题库图标">
                        <a-select-option v-for="(path, name) in iconMap" :key="name" :value="name">
                            {{ getIconDisplayName(name) }}
                        </a-select-option>
                    </a-select>
                    <div class="icon-preview" v-if="addForm.picture">
                        <BankIcon :iconName="addForm.picture" size="medium" class="preview-icon" />
                        <span class="icon-name">{{ getIconDisplayName(addForm.picture) }}</span>
                    </div>
                </a-form-item>

                <a-form-item label="描述" name="description">
                    <a-textarea v-model:value="addForm.description" placeholder="请输入题库描述" :rows="4" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 编辑题库-->
        <a-modal v-model:visible="editModalVisible" title="编辑题库" width="600px" @ok="handleEditBank"
            @cancel="handleCancelEdit" :confirm-loading="editLoading">
            <a-form :model="editForm" :rules="bankFormRules" ref="editFormRef" :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }">
                <a-form-item label="题库ID">
                    <a-input v-model:value="editForm.id" disabled />
                </a-form-item>

                <a-form-item label="题库名称" name="title">
                    <a-input v-model:value="editForm.title" placeholder="请输入题库名称" />
                </a-form-item>

                <a-form-item label="题库图标" name="picture">
                    <a-select v-model:value="editForm.picture" placeholder="请选择题库图标">
                        <a-select-option v-for="(path, name) in iconMap" :key="name" :value="name">
                            {{ getIconDisplayName(name) }}
                        </a-select-option>
                    </a-select>
                    <div class="icon-preview" v-if="editForm.picture">
                        <BankIcon :iconName="editForm.picture" size="medium" class="preview-icon" />
                        <span class="icon-name">{{ getIconDisplayName(editForm.picture) }}</span>
                    </div>
                </a-form-item>

                <a-form-item label="描述" name="description">
                    <a-textarea v-model:value="editForm.description" placeholder="请输入题库描述" :rows="4" />
                </a-form-item>

                <a-form-item label="统计信息">
                    <div class="statistics-info">
                        <p>题目数量: {{ editForm.questionCount || 0 }}</p>
                        <p>完成率: {{ editForm.completionRate || 0 }}%</p>
                        <p>最近更新: {{ formatDate(editForm.updateTime) }}</p>
                    </div>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import type { FormInstance } from 'ant-design-vue';
import BankIcon from '@/components/BankIcon.vue';
import { getQuestionBankList, addQuestionBank, updateQuestionBank, deleteQuestionBank } from '@/apis/questionBankApi';

// 数据接口定义
interface QuestionBank {
    id: number;
    title: string;
    description?: string;
    picture?: string;
    iconName?: string; // 前端使用
    createTime?: string;
    updateTime?: string;
    userId?: number;
    isDelete?: number;
    // 前端计算属性
    questionCount?: number;
    completionRate?: number;
    avgDifficulty?: number;
    activeLevel?: string;
}

// 查询参数接口
interface QueryParams {
    current: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: string;
    title?: string;
    isDelete?: number;
}

// 图标映射
const iconMap: Record<string, string> = {
    'default': '/src/assets/images/icon/default.png',
    'database': '/src/assets/images/icon/数据库.png',
    'network': '/src/assets/images/icon/计算机网络.png',
    'os': '/src/assets/images/icon/操作系统.png',
    'java': '/src/assets/images/icon/java.png',
    'distributed': '/src/assets/images/icon/分布式系统.png',
    'algorithm': '/src/assets/images/icon/算法.png',
    'o&m': '/src/assets/images/icon/系统运维.png',
    'Android': '/src/assets/images/icon/Android.png',
    'C++': '/src/assets/images/icon/C++.png',
    'css': '/src/assets/images/icon/css.png',
    'html': '/src/assets/images/icon/html.png',
    'javascript': '/src/assets/images/icon/JavaScript.png',
    'typescript': '/src/assets/images/icon/typescript.png',
    'python': '/src/assets/images/icon/Python.png',
    'react': '/src/assets/images/icon/React.png',
    'vue': '/src/assets/images/icon/Vue.png',
    'webpack': '/src/assets/images/icon/Webpack.png',
    'spring': '/src/assets/images/icon/spring.png',
    'springboot': '/src/assets/images/icon/SPRINGBOOT.png',
    'springcloud': '/src/assets/images/icon/SPRINGCLOUD.png',
    'mybatis': '/src/assets/images/icon/mybatis.png',
    'mysql': '/src/assets/images/icon/MySQL.png',
    'redis': '/src/assets/images/icon/Redis.png',
    'docker': '/src/assets/images/icon/Docker.png',
    'linux': '/src/assets/images/icon/linux.png',
    'go': '/src/assets/images/icon/GO.png',
    'elastic': '/src/assets/images/icon/Elastic.png',
};

// 图标显示名称
const getIconDisplayName = (name: string): string => {
    const displayNameMap: Record<string, string> = {
        'default': '默认图标',
        'database': '数据库',
        'network': '计算机网络',
        'os': '操作系统',
        'java': 'Java',
        'distributed': '分布式系统',
        'algorithm': '算法',
        'o&m': '系统运维',
        'Android': 'Android',
        'C++': 'C++',
        'css': 'CSS',
        'html': 'HTML',
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'python': 'Python',
        'react': 'React',
        'vue': 'Vue',
        'webpack': 'Webpack',
        'spring': 'Spring',
        'springboot': 'Spring Boot',
        'springcloud': 'Spring Cloud',
        'mybatis': 'MyBatis',
        'mysql': 'MySQL',
        'redis': 'Redis',
        'docker': 'Docker',
        'linux': 'Linux',
        'go': 'Go',
        'elastic': 'Elastic Search'
    };

    return displayNameMap[name] || name;
};

// 加载状态
const loading = ref(false);
const current = ref(1);
const total = ref(0);

// 搜索防抖相关变量
const searchTimer = ref<number | null>(null);
const isManualClear = ref(false);

// 筛选相关
const searchQuery = ref('');
const bankStatus = ref('all');

// 新增题库相关
const addModalVisible = ref(false);
const addLoading = ref(false);
const addFormRef = ref<FormInstance>();

// 编辑题库相关
const editModalVisible = ref(false);
const editLoading = ref(false);
const editFormRef = ref<FormInstance>();

// 新增题库表单
const addForm = reactive({
    title: '',
    picture: 'default',
    description: ''
});

// 编辑题库表单
const editForm = reactive<QuestionBank>({
    id: 0,
    title: '',
    picture: '',
    description: '',
    questionCount: 0,
    completionRate: 0,
    avgDifficulty: 0,
    activeLevel: '低',
    updateTime: ''
});

// 表单验证规则
const bankFormRules: Record<string, Rule[]> = {
    title: [
        { required: true, message: '请输入题库名称', trigger: 'blur' },
        { min: 2, max: 50, message: '题库名称长度应在 2-50 个字符之间', trigger: 'blur' }
    ],
    picture: [
        { required: true, message: '请选择题库图标', trigger: 'change' }
    ]
};

// 题库列表
const bankList = ref<QuestionBank[]>([]);

// 筛选后的题库列表
const filteredBankList = computed(() => {
    return bankList.value;
});

// 获取空状态描述
const getEmptyDescription = computed(() => {
    if (searchQuery.value || bankStatus.value !== 'all') {
        if (searchQuery.value && bankStatus.value !== 'all') {
            return `未找到与"${searchQuery.value}"匹配的${bankStatus.value === '0' ? '已启用' : '已停用'}题库`;
        } else if (searchQuery.value) {
            return `未找到与"${searchQuery.value}"匹配的题库`;
        } else {
            return `暂无${bankStatus.value === '0' ? '已启用' : '已停用'}的题库`;
        }
    }
    return '暂无题库数据';
});

// 获取难度文本
const getDifficultyText = (value: number) => {
    if (value < 3) return '简单';
    if (value < 4) return '中等';
    return '困难';
};

// 获取难度类名
const getDifficultyClass = (value: number) => {
    if (value < 3) return 'difficulty-easy';
    if (value < 4) return 'difficulty-medium';
    return 'difficulty-hard';
};

// 获取活跃度类名
const getActiveLevelClass = (level: string) => {
    if (level === '高') return 'active-high';
    if (level === '中') return 'active-medium';
    return 'active-low';
};

// 格式化日期
const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
};

// 清除筛选条件
const clearFilters = () => {
    isManualClear.value = true;
    message.loading({ content: '正在重置筛选条件...', key: 'clearMessage', duration: 0 });

    searchQuery.value = '';
    bankStatus.value = 'all';

    setTimeout(() => {
        getQuestionBanks().then(() => {
            message.destroy('clearMessage');
            setTimeout(() => {
                isManualClear.value = false;
            }, 300);
        });
    }, 300);
};

// 获取题库列表
const getQuestionBanks = async () => {
    try {
        if (loading.value) return Promise.resolve();

        loading.value = true;

        bankList.value = [];

        const queryParams: QueryParams = {
            current: current.value,
            pageSize: 100,
            sortField: 'updateTime',
            sortOrder: 'descend'
        };

        if (searchQuery.value.trim()) {
            queryParams.title = searchQuery.value.trim();
        }

        if (bankStatus.value !== 'all') {
            queryParams.isDelete = parseInt(bankStatus.value);
        }

        message.destroy();

        message.loading({ content: '题库列表加载中...', key: 'loadingMessage', duration: 0 });

        const response = await getQuestionBankList(queryParams);

        if (response.code === 0) {
            total.value = response.data.total || 0;

            // 为每个题库添加前端需要的计算属性
            const formattedData = (response.data.records || []).map(bank => ({
                ...bank,
                iconName: bank.picture || 'default',
                questionCount: Math.floor(Math.random() * 300), // 模拟数据 TODO
                completionRate: Math.floor(Math.random() * 100), // 模拟数据 TODO
                avgDifficulty: Math.random() * 5, // 模拟数据 TODO
                activeLevel: ['低', '中', '高'][Math.floor(Math.random() * 3)] // 模拟数据 TODO
            }));

            bankList.value = formattedData;

            message.destroy('loadingMessage');
            message.success('题库列表加载成功');
        } else {
            message.destroy('loadingMessage');
            message.error(response.message || '获取题库列表失败');
        }

        return Promise.resolve();
    } catch (error) {
        console.error('获取题库列表失败:', error);
        message.destroy('loadingMessage');
        message.error('获取题库列表失败，请重试');
        return Promise.reject(error);
    } finally {
        setTimeout(() => {
            loading.value = false;
        }, 300);
    }
};

const showAddModal = () => {
    addForm.title = '';
    addForm.picture = 'default';
    addForm.description = '';

    addModalVisible.value = true;
};

const showEditModal = (bank: QuestionBank) => {
    editForm.id = bank.id;
    editForm.title = bank.title;
    editForm.picture = bank.picture || 'default';
    editForm.description = bank.description || '';
    editForm.questionCount = bank.questionCount || 0;
    editForm.completionRate = bank.completionRate || 0;
    editForm.avgDifficulty = bank.avgDifficulty || 0;
    editForm.activeLevel = bank.activeLevel || '低';
    editForm.updateTime = bank.updateTime;

    editModalVisible.value = true;
};

// 新增题库
const handleAddBank = async () => {
    try {
        const valid = await addFormRef.value?.validate();
        if (!valid) return;

        addLoading.value = true;

        const response = await addQuestionBank({
            title: addForm.title,
            picture: addForm.picture,
            description: addForm.description
        });

        if (response.code === 0) {
            message.success('题库添加成功！');
            addModalVisible.value = false;
            addFormRef.value?.resetFields();
            getQuestionBanks();
        } else {
            message.error(response.message || '添加题库失败');
        }
    } catch (error) {
        console.error('添加题库失败:', error);
        message.error('添加题库失败，请重试');
    } finally {
        addLoading.value = false;
    }
};

// 编辑题库
const handleEditBank = async () => {
    try {
        const valid = await editFormRef.value?.validate();
        if (!valid) return;

        editLoading.value = true;

        const response = await updateQuestionBank({
            id: editForm.id,
            title: editForm.title,
            picture: editForm.picture,
            description: editForm.description
        });

        if (response.code === 0) {
            message.success('题库更新成功！');
            editModalVisible.value = false;
            getQuestionBanks();
        } else {
            message.error(response.message || '更新题库失败');
        }
    } catch (error) {
        console.error('编辑题库失败:', error);
        message.error('编辑题库失败，请重试');
    } finally {
        editLoading.value = false;
    }
};

// 删除题库
const handleDelete = (bank: QuestionBank) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除题库 "${bank.title}" 吗？该操作将删除题库下的所有题目，且不可恢复！`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
            try {
                message.loading({ content: '正在删除题库...', key: 'deleteMessage', duration: 0 });

                const response = await deleteQuestionBank(bank.id);

                if (response.code === 0) {
                    message.destroy('deleteMessage');
                    message.success('题库删除成功！');
                    getQuestionBanks();
                } else {
                    message.destroy('deleteMessage');
                    message.error(response.message || '删除题库失败');
                }
            } catch (error) {
                console.error('删除题库失败:', error);
                message.destroy('deleteMessage');
                message.error('删除题库失败，请重试');
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

// 处理搜索
const handleSearch = () => {
    if (loading.value) return;

    // 清除可能存在的定时器
    if (searchTimer.value) {
        clearTimeout(searchTimer.value);
        searchTimer.value = null;
    }

    current.value = 1;

    // 显示搜索中消息，先清除已有消息
    message.destroy();
    message.loading({ content: '正在搜索题库...', key: 'searchMessage', duration: 0 });

    // 执行搜索
    getQuestionBanks().then(() => {
        message.destroy('searchMessage');
    });
};

// 处理状态变更
const handleStatusChange = () => {
    // 如果已经在加载中，不要重复触发
    if (loading.value) return;

    current.value = 1;

    // 显示筛选中消息，先清除已有消息
    message.destroy();
    message.loading({ content: '正在筛选题库...', key: 'filterMessage', duration: 0 });

    // 执行筛选
    getQuestionBanks().then(() => {
        message.destroy('filterMessage');
    });
};

// 监听搜索关键词变化，使用防抖处理
watch(searchQuery, (newVal, oldVal) => {
    // 如果是通过clearFilters清空的，不要触发搜索
    if (isManualClear.value) return;

    // 如果是从有内容变为空，应该触发搜索
    if (newVal === '' && oldVal !== '') {
        // 清除可能存在的定时器
        if (searchTimer.value) {
            clearTimeout(searchTimer.value);
        }

        // 设置新的定时器，防抖处理
        searchTimer.value = window.setTimeout(() => {
            if (!loading.value) {
                message.destroy();
                message.loading({ content: '正在重置搜索...', key: 'searchResetMessage', duration: 0 });
                getQuestionBanks().then(() => {
                    message.destroy('searchResetMessage');
                });
            }
            searchTimer.value = null;
        }, 300);
    }
});

onMounted(() => {
    getQuestionBanks();
});
</script>

<style scoped>
@import '../../assets/styles/manager/QuestionBanksManager.css';
</style>