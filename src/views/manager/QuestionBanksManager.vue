<template>
    <div class="questionbank">
        <!-- 搜索和筛选 -->
        <div class="header">
            <div class="filter-controls">
                <a-input-search v-model="searchQuery" placeholder="搜索题库" class="input-search" />
                <a-select v-model:value="bankStatus" placeholder="状态" class="select-filter">
                    <a-select-option value="all">全部状态</a-select-option>
                    <a-select-option value="active">已启用</a-select-option>
                    <a-select-option value="inactive">已停用</a-select-option>
                </a-select>
            </div>
            <a-button type="primary" class="add-bank-btn" @click="showAddModal">
                <PlusOutlined />新增题库
            </a-button>
        </div>

        <!-- 分类列表 -->
        <div class="bank-list">
            <div v-for="bank in filteredBankList" :key="bank.id" class="bank-card">
                <div class="bank-header">
                    <div class="icon-box">
                        <BankIcon :name="bank.name" :iconName="bank.iconName" size="medium" class="bank-icon-display" />
                    </div>
                    <div class="bank-info">
                        <h3>{{ bank.name }}</h3>
                        <p class="question-count">{{ bank.problemCount }}题</p>
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
                        <span class="completion-rate-value">{{ bank.completionRate }}%</span>
                    </div>
                    <div class="progress-bar">
                        <div :style="{ width: `${bank.completionRate}%` }" class="progress-fill"></div>
                    </div>

                    <!-- 平均难度和活跃度 -->
                    <div class="bank-level">
                        <div :class="getDifficultyClass(bank.avgDifficulty)">
                            <span class="difficulty-text">平均难度:</span>
                            <span class="difficulty-value">{{ getDifficultyText(bank.avgDifficulty) }}</span>
                        </div>
                        <div :class="getActiveLevelClass(bank.activeLevel)">
                            <span class="active-text">活跃度:</span>
                            <span class="active-value">{{ bank.activeLevel }}</span>
                        </div>
                    </div>

                    <!-- 最近更新时间 -->
                    <div class="last-updated">
                        最近更新：{{ bank.lastUpdated }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 新增题库模态框 -->
        <a-modal v-model:visible="addModalVisible" title="新增题库" width="600px" @ok="handleAddBank"
            @cancel="handleCancelAdd" :confirm-loading="addLoading">
            <a-form :model="addForm" :rules="bankFormRules" ref="addFormRef" :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }">
                <a-form-item label="题库名称" name="name">
                    <a-input v-model:value="addForm.name" placeholder="请输入题库名称" />
                </a-form-item>

                <a-form-item label="题库图标" name="iconName">
                    <a-select v-model:value="addForm.iconName" placeholder="请选择题库图标">
                        <a-select-option v-for="(name) in iconMap" :key="name" :value="name">
                            {{ getIconDisplayName(name) }}
                        </a-select-option>
                    </a-select>
                    <div class="icon-preview" v-if="addForm.iconName">
                        <BankIcon :iconName="addForm.iconName" size="medium" class="preview-icon" />
                        <span class="icon-name">{{ getIconDisplayName(addForm.iconName) }}</span>
                    </div>
                </a-form-item>

                <a-form-item label="状态" name="status">
                    <a-select v-model:value="addForm.status" placeholder="请选择状态">
                        <a-select-option value="active">启用</a-select-option>
                        <a-select-option value="inactive">停用</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="描述" name="description">
                    <a-textarea v-model:value="addForm.description" placeholder="请输入题库描述" :rows="4" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 编辑题库模态框 -->
        <a-modal v-model:visible="editModalVisible" title="编辑题库" width="600px" @ok="handleEditBank"
            @cancel="handleCancelEdit" :confirm-loading="editLoading">
            <a-form :model="editForm" :rules="bankFormRules" ref="editFormRef" :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }">
                <a-form-item label="题库ID">
                    <a-input v-model:value="editForm.id" disabled />
                </a-form-item>

                <a-form-item label="题库名称" name="name">
                    <a-input v-model:value="editForm.name" placeholder="请输入题库名称" />
                </a-form-item>

                <a-form-item label="题库图标" name="iconName">
                    <a-select v-model:value="editForm.iconName" placeholder="请选择题库图标">
                        <a-select-option v-for="(path, name) in iconMap" :key="name" :value="name">
                            {{ getIconDisplayName(name) }}
                        </a-select-option>
                    </a-select>
                    <div class="icon-preview" v-if="editForm.iconName">
                        <BankIcon :iconName="editForm.iconName" size="medium" class="preview-icon" />
                        <span class="icon-name">{{ getIconDisplayName(editForm.iconName) }}</span>
                    </div>
                </a-form-item>

                <a-form-item label="状态" name="status">
                    <a-select v-model:value="editForm.status" placeholder="请选择状态">
                        <a-select-option value="active">启用</a-select-option>
                        <a-select-option value="inactive">停用</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="描述" name="description">
                    <a-textarea v-model:value="editForm.description" placeholder="请输入题库描述" :rows="4" />
                </a-form-item>

                <a-form-item label="统计信息">
                    <div class="statistics-info">
                        <p>题目数量: {{ editForm.problemCount }}</p>
                        <p>完成率: {{ editForm.completionRate }}%</p>
                        <p>最近更新: {{ editForm.lastUpdated }}</p>
                    </div>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import type { FormInstance } from 'ant-design-vue';
import BankIcon from '@/components/BankIcon.vue';
// import { addQuestionBank, updateQuestionBank, deleteQuestionBank } from '@/api/questionBankApi';

interface QuestionBank {
    id: number;
    name: string;
    iconName: string;
    problemCount: number;
    completionRate: number;
    avgDifficulty: number;
    activeLevel: string;
    lastUpdated: string;
    status?: string;
    description?: string;
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

const getIconDisplayName = (name: string): string => {
    // 图标显示名称映射
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
    name: '',
    iconName: 'default',
    status: 'active',
    description: ''
});

// 编辑题库表单
const editForm = reactive({
    id: 0,
    name: '',
    iconName: '',
    status: 'active',
    description: '',
    problemCount: 0,
    completionRate: 0,
    avgDifficulty: 0,
    activeLevel: '',
    lastUpdated: ''
});

// 表单验证规则
const bankFormRules: Record<string, Rule[]> = {
    name: [
        { required: true, message: '请输入题库名称', trigger: 'blur' },
        { min: 2, max: 50, message: '题库名称长度应在 2-50 个字符之间', trigger: 'blur' }
    ],
    iconName: [
        { required: true, message: '请选择题库图标', trigger: 'change' }
    ],
    status: [
        { required: true, message: '请选择题库状态', trigger: 'change' }
    ]
};

// 示例数据
const bankList = ref([
    {
        id: 1,
        name: '操作系统',
        iconName: 'os',
        problemCount: 156,
        completionRate: 75,
        avgDifficulty: 3.2,
        activeLevel: '高',
        lastUpdated: '2024-01-15 14:30',
        status: 'active',
        description: '操作系统相关知识点和面试题，包括进程管理、内存管理、文件系统等。'
    },
    {
        id: 2,
        name: '计算机网络',
        iconName: 'network',
        problemCount: 189,
        completionRate: 68,
        avgDifficulty: 3.8,
        activeLevel: '中',
        lastUpdated: '2024-01-14 16:45',
        status: 'active',
        description: '计算机网络基础知识，包括TCP/IP协议、HTTP协议、网络安全等。'
    },
    {
        id: 3,
        name: '数据库',
        iconName: 'database',
        problemCount: 142,
        completionRate: 82,
        avgDifficulty: 2.9,
        activeLevel: '高',
        lastUpdated: '2024-01-13 09:15',
        status: 'active',
        description: '数据库系统理论与实践，包括SQL语言、数据库设计、索引优化等。'
    },
    {
        id: 4,
        name: 'Java开发',
        iconName: 'java',
        problemCount: 235,
        completionRate: 71,
        avgDifficulty: 3.5,
        activeLevel: '高',
        lastUpdated: '2024-01-15 11:20',
        status: 'active',
        description: 'Java语言特性、JVM原理、多线程并发编程、Java框架等。'
    },
    {
        id: 5,
        name: '分布式系统',
        iconName: 'distributed',
        problemCount: 98,
        completionRate: 45,
        avgDifficulty: 4.2,
        activeLevel: '中',
        lastUpdated: '2024-01-14 13:40',
        status: 'inactive',
        description: '分布式系统设计原理、微服务架构、一致性算法、分布式事务等。'
    },
    {
        id: 6,
        name: '算法与数据结构',
        iconName: 'algorithm',
        problemCount: 312,
        completionRate: 63,
        avgDifficulty: 3.7,
        activeLevel: '高',
        lastUpdated: '2024-01-15 10:05',
        status: 'active',
        description: '常见算法和数据结构，包括排序、搜索、图论、动态规划等。'
    },
    {
        id: 7,
        name: 'Spring Boot',
        iconName: 'springboot',
        problemCount: 189,
        completionRate: 58,
        avgDifficulty: 3.9,
        activeLevel: '高',
        lastUpdated: '2024-01-16 09:25',
        status: 'active',
        description: 'Spring Boot框架开发、自动配置、微服务开发等相关知识点。'
    },
    {
        id: 8,
        name: 'Redis缓存',
        iconName: 'redis',
        problemCount: 135,
        completionRate: 62,
        avgDifficulty: 3.6,
        activeLevel: '中',
        lastUpdated: '2024-01-14 11:50',
        status: 'active',
        description: 'Redis缓存技术、数据结构、持久化、分布式锁等核心知识。'
    },
    {
        id: 9,
        name: 'Python编程',
        iconName: 'python',
        problemCount: 220,
        completionRate: 70,
        avgDifficulty: 3.2,
        activeLevel: '高',
        lastUpdated: '2024-01-16 14:35',
        status: 'active',
        description: 'Python基础语法、数据处理、Web开发、爬虫、机器学习等方向。'
    }
]);

// 筛选后的题库列表
const filteredBankList = computed(() => {
    return bankList.value.filter(bank => {
        // 搜索过滤
        const searchMatch = searchQuery.value === '' ||
            bank.name.toLowerCase().includes(searchQuery.value.toLowerCase());

        // 状态过滤
        const statusMatch = bankStatus.value === 'all' ||
            bank.status === bankStatus.value;

        return searchMatch && statusMatch;
    });
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

const showAddModal = () => {
    addForm.name = '';
    addForm.iconName = 'default';
    addForm.status = 'active';
    addForm.description = '';

    addModalVisible.value = true;
};

const showEditModal = (bank: QuestionBank) => {
    editForm.id = bank.id;
    editForm.name = bank.name;
    editForm.iconName = bank.iconName;
    editForm.status = bank.status || 'active';
    editForm.description = bank.description || '';
    editForm.problemCount = bank.problemCount;
    editForm.completionRate = bank.completionRate;
    editForm.avgDifficulty = bank.avgDifficulty;
    editForm.activeLevel = bank.activeLevel;
    editForm.lastUpdated = bank.lastUpdated;

    editModalVisible.value = true;
};

// 新增题库
const handleAddBank = async () => {
    try {
        const valid = await addFormRef.value?.validate();
        if (!valid) return;

        addLoading.value = true;

        const newBank = {
            id: bankList.value.length + 1,
            name: addForm.name,
            iconName: addForm.iconName,
            status: addForm.status,
            description: addForm.description,
            problemCount: 0,
            completionRate: 0,
            avgDifficulty: 0,
            activeLevel: '低',
            lastUpdated: new Date().toLocaleString()
        };

        // 调用API
        // await addQuestionBank(newBank);

        // 模拟API调用成功
        console.log('新增题库:', newBank);
        bankList.value.push(newBank);
        message.success('题库添加成功！');

        addModalVisible.value = false;
        addFormRef.value?.resetFields();
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

        const updatedBank = {
            id: editForm.id,
            name: editForm.name,
            iconName: editForm.iconName,
            status: editForm.status,
            description: editForm.description,
            problemCount: editForm.problemCount,
            completionRate: editForm.completionRate,
            avgDifficulty: editForm.avgDifficulty,
            activeLevel: editForm.activeLevel,
            lastUpdated: new Date().toLocaleString()
        };

        // 调用API
        // await updateQuestionBank(updatedBank);

        // 模拟API调用成功
        console.log('更新题库:', updatedBank);
        const index = bankList.value.findIndex(bank => bank.id === updatedBank.id);
        if (index !== -1) {
            bankList.value[index] = updatedBank;
        }
        message.success('题库更新成功！');

        editModalVisible.value = false;
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
        content: `确定要删除题库 "${bank.name}" 吗？该操作将删除题库下的所有题目，且不可恢复！`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
            try {
                // 调用API删除
                // await deleteQuestionBank(bank.id);

                // 模拟API调用成功
                console.log('删除题库:', bank.id);
                bankList.value = bankList.value.filter(item => item.id !== bank.id);
                message.success('题库删除成功！');
            } catch (error) {
                console.error('删除题库失败:', error);
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

onMounted(() => {
    // 获取题库列表数据 TO DO
});
</script>

<style scoped>
@import '../../assets/styles/manager/QuestionBanksManager.css';
</style>