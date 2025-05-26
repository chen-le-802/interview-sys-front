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
            <a-spin :spinning="loading" tip="数据加载中...">
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
                                    <img v-if="bank.picture" :src="bank.picture" :alt="bank.title"
                                        class="bank-icon-display uploaded-icon" @error="handleImageError" />
                                    <img v-else src="/src/assets/images/icon/default.png" :alt="bank.title"
                                        class="bank-icon-display default-icon-img" />
                                </div>
                                <div class="bank-info">
                                    <h3>{{ bank.title }}</h3>
                                    <p class="question-count">{{ bank.questionCount || 0 }}题</p>
                                    <div class="bank-status">
                                        <span :class="getStatusClass(bank.isDelete)" class="status-tag">
                                            {{ getStatusText(bank.isDelete) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="bank-actions">
                                    <button class="action-container" type="button" @click="showEditModal(bank)">
                                        <EditOutlined class="edit-icon" />
                                    </button>
                                    <button class="action-container" type="button" @click="handleSoftDelete(bank)">
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
                                    <div :class="getDifficultyClass(bank.avgDifficulty || '')">
                                        <span class="difficulty-text">平均难度:</span>
                                        <span class="difficulty-value">{{ bank.avgDifficulty || '未知' }}</span>
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
            </a-spin>
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
                    <a-upload v-model:file-list="addForm.fileList" :before-upload="beforeUpload" :max-count="1"
                        accept="image/*" list-type="picture-card" :show-upload-list="true">
                        <div v-if="addForm.fileList && addForm.fileList.length < 1">
                            <PlusOutlined />
                            <div style="margin-top: 8px">上传图标</div>
                        </div>
                    </a-upload>
                    <div class="upload-tip">
                        <p>支持 JPG、PNG、GIF 格式，大小不超过 2MB</p>
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
                    <a-upload v-model:file-list="editForm.fileList" :before-upload="beforeUpload" :max-count="1"
                        accept="image/*" list-type="picture-card" :show-upload-list="true">
                        <div v-if="editForm.fileList && editForm.fileList.length < 1">
                            <PlusOutlined />
                            <div style="margin-top: 8px">上传图标</div>
                        </div>
                    </a-upload>
                    <div class="upload-tip">
                        <p>支持 JPG、PNG、GIF 格式，大小不超过 2MB</p>
                        <p>不上传则保持原图标不变</p>
                    </div>
                </a-form-item>

                <a-form-item label="描述" name="description">
                    <a-textarea v-model:value="editForm.description" placeholder="请输入题库描述" :rows="4" />
                </a-form-item>

                <a-form-item label="统计信息">
                    <div class="statistics-info">
                        <p>题目数量: {{ editForm.questionCount || 0 }}</p>
                        <p>完成率: {{ editForm.completionRate || 0 }}%</p>
                        <p>平均难度: {{ editForm.avgDifficulty || '未知' }}</p>
                        <p>状态: <span :class="getStatusClass(editForm.isDelete)">{{ getStatusText(editForm.isDelete) }}</span></p>
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
import { getQuestionBankList, addQuestionBank, updateQuestionBank, deleteQuestionBank, getQuestionBankAnalyzeList } from '@/apis/questionBankApi';

// 数据接口定义
interface QuestionBank {
    id: number;
    title: string;
    description?: string;
    picture?: string;
    createTime?: string;
    updateTime?: string;
    userId?: number;
    isDelete?: number;
    // 前端计算属性
    questionCount?: number;
    completionRate?: number;
    avgDifficulty?: string;
    activeLevel?: string;
}

// 题库统计信息接口
interface QuestionBankAnalyze {
    id: number;
    title: string;
    questionCount: number;
    completeRate: string;
    averageDifficulty: string;
    activity: string;
}

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
    description: '',
    fileList: [] as any[],
    pictureFile: null as File | null
});

// 编辑题库表单
const editForm = reactive<QuestionBank & { fileList: any[], pictureFile: File | null }>({
    id: 0,
    title: '',
    picture: '',
    description: '',
    questionCount: 0,
    completionRate: 0,
    avgDifficulty: '',
    activeLevel: '低',
    updateTime: '',
    isDelete: 0,
    fileList: [],
    pictureFile: null
});

// 表单验证规则
const bankFormRules: Record<string, Rule[]> = {
    title: [
        { required: true, message: '请输入题库名称', trigger: 'blur' },
        { min: 2, max: 50, message: '题库名称长度应在 2-50 个字符之间', trigger: 'blur' }
    ]
};

// 题库列表
const bankList = ref<QuestionBank[]>([]);

// 筛选后的题库列表
const filteredBankList = computed(() => {
    let result = [...bankList.value];

    // 按标题搜索
    if (searchQuery.value.trim()) {
        result = result.filter(bank =>
            bank.title.toLowerCase().includes(searchQuery.value.trim().toLowerCase())
        );
    }

    // 按状态筛选
    if (bankStatus.value !== 'all') {
        const isDeleteValue = parseInt(bankStatus.value);
        result = result.filter(bank => bank.isDelete === isDeleteValue);
    }

    return result;
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

// 获取状态文本
const getStatusText = (isDelete?: number) => {
    return isDelete === 0 ? '已启用' : '已停用';
};

// 获取状态样式类
const getStatusClass = (isDelete?: number) => {
    return isDelete === 0 ? 'status-active' : 'status-inactive';
};

// 获取难度类名（根据字符串）
const getDifficultyClass = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
        case '简单':
        case 'easy':
            return 'difficulty-easy';
        case '中等':
        case 'medium':
            return 'difficulty-medium';
        case '困难':
        case 'hard':
            return 'difficulty-hard';
        default:
            return 'difficulty-unknown';
    }
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

// 合并题库基本信息和统计信息
const mergeBankData = (basicBanks: QuestionBank[], analyzeBanks: QuestionBankAnalyze[]): QuestionBank[] => {
    // 创建统计信息的映射表
    const analyzeMap = new Map<number, QuestionBankAnalyze>();
    analyzeBanks.forEach(analyze => {
        analyzeMap.set(analyze.id, analyze);
    });

    // 合并数据
    return basicBanks.map(bank => {
        const analyze = analyzeMap.get(bank.id);

        return {
            ...bank,
            questionCount: analyze?.questionCount || 0,
            completionRate: analyze?.completeRate ? parseFloat(analyze.completeRate.replace('%', '')) : 0,
            avgDifficulty: analyze?.averageDifficulty || '未知',
            activeLevel: analyze?.activity || '低'
        };
    });
};

// 图片加载失败处理
const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    // 图片加载失败时，显示默认图标
    img.src = '/src/assets/images/icon/default.png';
    img.onerror = null; // 防止无限循环
};

// 文件上传前的验证
const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('图片大小不能超过 2MB！');
        return false;
    }

    return false; // 阻止自动上传，手动控制
};

// 清除筛选条件
const clearFilters = () => {
    isManualClear.value = true;
    message.loading({ content: '正在重置筛选条件...', key: 'clearMessage', duration: 0 });

    searchQuery.value = '';
    bankStatus.value = 'all';

    setTimeout(() => {
        message.destroy('clearMessage');
        setTimeout(() => {
            isManualClear.value = false;
        }, 300);
    }, 300);
};

// 获取题库列表
const getQuestionBanks = async () => {
    try {
        if (loading.value) return Promise.resolve();

        loading.value = true;
        bankList.value = [];

        message.destroy();
        message.loading({ content: '题库列表加载中...', key: 'loadingMessage', duration: 0 });

        // 并发获取基本信息和统计信息
        const [basicResponse, analyzeResponse] = await Promise.all([
            getQuestionBankList(),
            getQuestionBankAnalyzeList()
        ]);

        if (basicResponse.code === 0 && analyzeResponse.code === 0) {
            const basicBanks: QuestionBank[] = basicResponse.data || [];
            const analyzeBanks: QuestionBankAnalyze[] = analyzeResponse.data || [];

            total.value = basicBanks.length;

            // 合并基本信息和统计信息
            const mergedBanks = mergeBankData(basicBanks, analyzeBanks);
            bankList.value = mergedBanks;

            message.destroy('loadingMessage');
            message.success('题库列表加载成功');
        } else {
            message.destroy('loadingMessage');
            const errorMsg = basicResponse.code !== 0 ? basicResponse.message : analyzeResponse.message;
            message.error(errorMsg || '获取题库列表失败');
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
    addForm.description = '';
    addForm.fileList = [];
    addForm.pictureFile = null;

    addModalVisible.value = true;
};

const showEditModal = (bank: QuestionBank) => {
    editForm.id = bank.id;
    editForm.title = bank.title;
    editForm.picture = bank.picture || '';
    editForm.description = bank.description || '';
    editForm.questionCount = bank.questionCount || 0;
    editForm.completionRate = bank.completionRate || 0;
    editForm.avgDifficulty = bank.avgDifficulty || '未知';
    editForm.activeLevel = bank.activeLevel || '低';
    editForm.updateTime = bank.updateTime;
    editForm.isDelete = bank.isDelete || 0;
    editForm.fileList = [];
    editForm.pictureFile = null;

    editModalVisible.value = true;
};

// 软删除题库
const handleSoftDelete = (bank: QuestionBank) => {
    const action = bank.isDelete === 0 ? '停用' : '启用';
    
    // 如果是已停用的题库，提示用户这是启用操作
    const confirmContent = bank.isDelete === 0 
        ? `确定要停用题库 "${bank.title}" 吗？停用后用户将无法访问此题库。`
        : `题库 "${bank.title}" 当前已停用，确定要重新启用吗？`;
    
    Modal.confirm({
        title: `确认${action}题库`,
        content: confirmContent,
        okText: '确认',
        cancelText: '取消',
        okType: bank.isDelete === 0 ? 'danger' : 'primary',
        onOk: async () => {
            try {
                message.loading({ content: `正在${action}题库...`, key: 'softDeleteMessage', duration: 0 });
                const response = await deleteQuestionBank(bank.id);

                if (response.code === 0) {
                    message.destroy('softDeleteMessage');
                    message.success(`题库${action}成功！`);
                    // 刷新列表以获取最新状态
                    getQuestionBanks();
                } else {
                    message.destroy('softDeleteMessage');
                    message.error(response.message || `${action}题库失败`);
                }
            } catch (error) {
                console.error(`${action}题库失败:`, error);
                message.destroy('softDeleteMessage');
                message.error(`${action}题库失败，请重试`);
            }
        }
    });
};

// 新增题库
const handleAddBank = async () => {
    try {
        await addFormRef.value?.validate();

        addLoading.value = true;

        // 使用 FormData 来处理文件上传
        const formData = new FormData();
        formData.append('title', addForm.title);
        formData.append('description', addForm.description);

        // 如果有上传的图片文件，添加到 FormData 中
        if (addForm.fileList && addForm.fileList.length > 0) {
            const file = addForm.fileList[0].originFileObj || addForm.fileList[0];
            formData.append('picture', file);
        }

        const response = await addQuestionBank(formData);

        if (response.code === 0) {
            message.success('题库添加成功！');
            addModalVisible.value = false;
            addFormRef.value?.resetFields();
            // 重置文件列表
            addForm.fileList = [];
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
        await editFormRef.value?.validate();

        editLoading.value = true;

        // 使用 FormData 来处理文件上传
        const formData = new FormData();
        formData.append('id', editForm.id.toString());
        formData.append('title', editForm.title);
        formData.append('description', editForm.description || '');

        // 如果有上传的新图片文件，添加到 FormData 中
        if (editForm.fileList && editForm.fileList.length > 0) {
            const file = editForm.fileList[0].originFileObj || editForm.fileList[0];
            formData.append('picture', file);
        }

        const response = await updateQuestionBank(formData);

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

const handleCancelAdd = () => {
    addFormRef.value?.resetFields();
    addForm.fileList = [];
    addForm.pictureFile = null;
    addModalVisible.value = false;
};

const handleCancelEdit = () => {
    editFormRef.value?.resetFields();
    editForm.fileList = [];
    editForm.pictureFile = null;
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

    // 前端筛选，无需重新请求API
    setTimeout(() => {
        message.destroy('searchMessage');
        if (filteredBankList.value.length > 0) {
            message.success(`找到 ${filteredBankList.value.length} 个匹配的题库`);
        } else {
            message.info('未找到匹配的题库');
        }
    }, 300);
};

// 处理状态变更
const handleStatusChange = () => {
    // 如果已经在加载中，不要重复触发
    if (loading.value) return;

    current.value = 1;

    // 显示筛选中消息，先清除已有消息
    message.destroy();
    message.loading({ content: '正在筛选题库...', key: 'filterMessage', duration: 0 });

    // 前端筛选，无需重新请求API
    setTimeout(() => {
        message.destroy('filterMessage');
        if (filteredBankList.value.length > 0) {
            message.success(`找到 ${filteredBankList.value.length} 个符合条件的题库`);
        } else {
            message.info(`未找到${bankStatus.value === '0' ? '已启用' : '已停用'}的题库`);
        }
    }, 300);
};

// 监听搜索关键词变化
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
                handleSearch();
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