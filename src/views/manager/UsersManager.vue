<template>
    <div class="user-management">
        <!-- 搜索和筛选 -->
        <div class="filter-bar">
            <div class="filter-controls">
                <a-input-search v-model:value="searchQuery" placeholder="搜索用户名" class="input-search" allow-clear
                    :loading="isSearching" @search="handleSearch" />
                <a-select v-model:value="userRole" placeholder="用户角色" class="select-filter"
                    @change="handleFilterChange">
                    <a-select-option value="">全部用户</a-select-option>
                    <a-select-option value="admin">管理员</a-select-option>
                    <a-select-option value="user">普通用户</a-select-option>
                    <a-select-option value="vip">VIP用户</a-select-option>
                </a-select>
                <a-select v-model:value="userStatus" placeholder="状态" class="select-filter"
                    @change="handleFilterChange">
                    <a-select-option value="">全部状态</a-select-option>
                    <a-select-option value="active">正常</a-select-option>
                    <a-select-option value="blocked">已封禁</a-select-option>
                </a-select>
            </div>
            <a-button type="primary" class="add-user-btn" @click="showAddModal">
                <PlusOutlined />添加用户
            </a-button>
        </div>

        <!-- 用户列表 -->
        <a-table :columns="userColumns" :data-source="userList" :pagination="{
            pageSize: pagination.pageSize,
            current: pagination.current,
            total: pagination.total,
            showTotal: (total) => `共 ${total} 条记录`,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange
        }" class="user-table" :loading="loading" :row-key="record => record?.id || 0">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'userAvatar'">
                    <a-avatar
                        :src="record && record.userAvatar ? record.userAvatar : getDefaultAvatar(record ? record.userName : '')" />
                </template>
                <template v-if="column.key === 'userRole'">
                    <a-tag :class="['role-tag', getRoleClass((record as User).userRole)]">
                        {{ getRoleText((record as User).userRole) }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'status'">
                    <a-tag :class="['status-tag', getStatusClass((record as User).status)]">
                        {{ getStatusText((record as User).status) }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <div class="action-buttons">
                        <a-button type="link" @click="showEditModal(record as User)">
                            <EditOutlined class="action-icon edit-icon" />
                        </a-button>
                        <a-button type="link" @click="showDeleteConfirm(record as User)">
                            <DeleteOutlined class="action-icon delete-icon" />
                        </a-button>
                        <a-button v-if="(record as User).status !== 'blocked'" type="link"
                            @click="showBlockConfirm(record as User)">
                            <LockOutlined class="action-icon ban-icon" />
                        </a-button>
                        <a-button v-else type="link" @click="showUnblockConfirm(record as User)">
                            <UnlockOutlined class="action-icon unban-icon" />
                        </a-button>
                    </div>
                </template>
            </template>
        </a-table>

        <!-- 添加用户 -->
        <a-modal v-model:visible="addModalVisible" title="添加用户" @ok="handleAddUser" @cancel="resetForm"
            :confirm-loading="modalLoading" centered class="custom-modal">
            <a-form :model="formState" :rules="formRules" ref="addFormRef" layout="vertical">
                <a-form-item label="账号" name="userAccount">
                    <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
                </a-form-item>
                <a-form-item label="用户名" name="userName">
                    <a-input v-model:value="formState.userName" placeholder="请输入用户名" />
                </a-form-item>
                <a-form-item label="密码" name="userPassword">
                    <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
                </a-form-item>
                <a-form-item label="确认密码" name="confirmPassword">
                    <a-input-password v-model:value="formState.confirmPassword" placeholder="请再次输入密码" />
                </a-form-item>
                <a-form-item label="用户角色" name="userRole">
                    <a-radio-group v-model:value="formState.userRole">
                        <a-radio value="user">普通用户</a-radio>
                        <a-radio value="vip">VIP用户</a-radio>
                        <a-radio value="admin">管理员</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item label="状态" name="status">
                    <a-radio-group v-model:value="formState.status">
                        <a-radio value="active">正常</a-radio>
                        <a-radio value="blocked">已封禁</a-radio>
                    </a-radio-group>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 编辑用户 -->
        <a-modal v-model:visible="editModalVisible" title="编辑用户" @ok="handleEditUser" @cancel="resetForm"
            :confirm-loading="modalLoading" centered class="custom-modal">
            <a-form :model="editFormState" :rules="editFormRules" ref="editFormRef" layout="vertical">
                <a-form-item label="账号">
                    <a-input v-model:value="editFormState.userAccount" disabled />
                </a-form-item>
                <a-form-item label="用户名" name="userName">
                    <a-input v-model:value="editFormState.userName" placeholder="请输入用户名" />
                </a-form-item>
                <a-form-item label="密码" name="userPassword" extra="如不修改密码，请留空">
                    <a-input-password v-model:value="editFormState.userPassword" placeholder="请输入新密码" />
                </a-form-item>
                <a-form-item label="用户角色" name="userRole">
                    <a-radio-group v-model:value="editFormState.userRole">
                        <a-radio value="user">普通用户</a-radio>
                        <a-radio value="vip">VIP用户</a-radio>
                        <a-radio value="admin">管理员</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item label="状态" name="status">
                    <a-radio-group v-model:value="editFormState.status">
                        <a-radio value="active">正常</a-radio>
                        <a-radio value="blocked">已封禁</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item label="用户信息">
                    <div class="user-stats">
                        <p>创建时间: {{ formatDateTime(editFormState.createTime) }}</p>
                        <p>更新时间: {{ formatDateTime(editFormState.updateTime) }}</p>
                        <p>编辑时间: {{ formatDateTime(editFormState.editTime) }}</p>
                    </div>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { getUsers, addUser, updateUser, deleteUser, blockUser, unblockUser, getUserById } from '@/apis/userApi';

// 用户类型
interface User {
    id: number;
    userAccount: string;
    userName: string;
    userRole: string;
    userAvatar?: string;
    status: string;
    createTime: string;
    updateTime: string;
    editTime: string;
    userPassword?: string;
    isDelete: number;
}

// 声明表单类型
interface UserFormState {
    userAccount: string;
    userName: string;
    userPassword: string;
    confirmPassword: string;
    userRole: string;
    status: string;
}

// 表格列类型定义
interface TableColumn {
    title: string;
    dataIndex?: string;
    key: string;
    width?: number;
}

// 分页参数
interface Pagination {
    current: number;
    pageSize: number;
    total: number;
}

// 查询参数
interface QueryParams {
    page: number;
    size: number;
    role?: string;
    status?: string;
    keyword?: string;
}

// 筛选条件
const searchQuery = ref('');
const userRole = ref('');
const userStatus = ref('');
const loading = ref(false);
const isSearching = ref(false);

// 模态框状态
const addModalVisible = ref(false);
const editModalVisible = ref(false);
const modalLoading = ref(false);
const addFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();

// 分页
const pagination = reactive<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0
});

// 用户列表
const userList = ref<User[]>([]);

// 表单状态
const formState = reactive<UserFormState>({
    userAccount: '',
    userName: '',
    userPassword: '',
    confirmPassword: '',
    userRole: 'user',
    userProfile: '',
    status: 'active'
});

// 编辑表单状态
const editFormState = reactive<User>({
    id: 0,
    userAccount: '',
    userName: '',
    userRole: 'user',
    userProfile: '',
    status: 'active',
    createTime: '',
    updateTime: '',
    editTime: '',
    userPassword: '',
    isDelete: 0
});

// 定义规则对象类型
type FormRules = Record<string, Rule[]>;

// 表单验证规则
const formRules: FormRules = {
    userAccount: [
        { required: true, message: '请输入账号', trigger: 'blur' },
        { min: 4, max: 16, message: '账号长度应为4-16个字符', trigger: 'blur' }
    ],
    userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 4, max: 16, message: '用户名长度应为4-16个字符', trigger: 'blur' }
    ],
    userPassword: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 8, message: '密码长度应不少于8个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: async (_rule: Rule, value: string) => {
                if (value !== formState.userPassword) {
                    return Promise.reject('两次输入的密码不一致');
                }
                return Promise.resolve();
            },
            trigger: 'blur'
        }
    ],
    userRole: [
        { required: true, message: '请选择用户角色', trigger: 'change' }
    ],
    status: [
        { required: true, message: '请选择用户状态', trigger: 'change' }
    ]
};

// 编辑表单验证规则
const editFormRules: FormRules = {
    userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 4, max: 16, message: '用户名长度应为4-16个字符', trigger: 'blur' }
    ],
    userPassword: [
        { min: 8, message: '密码长度应不少于8个字符', trigger: 'blur' }
    ],
    userRole: [
        { required: true, message: '请选择用户角色', trigger: 'change' }
    ],
    status: [
        { required: true, message: '请选择用户状态', trigger: 'change' }
    ]
};

// 表格列定义
const userColumns: TableColumn[] = [
    { title: '头像', dataIndex: 'userAvatar', key: 'userAvatar', width: 80 },
    { title: '账号', dataIndex: 'userAccount', key: 'userAccount' },
    { title: '用户名', dataIndex: 'userName', key: 'userName' },
    { title: '角色', dataIndex: 'userRole', key: 'userRole' },
    {
        title: '注册时间', dataIndex: 'createTime', key: 'createTime',
        customRender: ({ text }: { text: string }) => formatDateTime(text)
    },
    {
        title: '更新时间', dataIndex: 'updateTime', key: 'updateTime',
        customRender: ({ text }: { text: string }) => formatDateTime(text)
    },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '操作', key: 'action', width: 120 }
];

const getRoleText = (role: string) => {
    switch (role) {
        case 'admin':
            return '管理员';
        case 'user':
            return '普通用户';
        case 'vip':
            return 'VIP用户';
        default:
            return role;
    }
};

const getRoleClass = (role: string) => {
    switch (role) {
        case 'admin':
            return 'role-admin';
        case 'user':
            return 'role-user';
        case 'vip':
            return 'role-vip';
        default:
            return '';
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'active':
            return '正常';
        case 'blocked':
            return '已封禁';
        default:
            return status;
    }
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'active':
            return 'success';
        case 'blocked':
            return 'error';
        default:
            return '';
    }
};

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    try {
        const date = new Date(dateTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
        return dateTime;
    }
};

// 获取默认头像
const getDefaultAvatar = (username: string) => {
    if (!username) {
        return `https://ui-avatars.com/api/?name=U&background=cccccc&color=fff`;
    }

    // 使用用户名生成不同颜色的默认头像
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hash % colors.length;
    return `https://ui-avatars.com/api/?name=${username.charAt(0)}&background=${colors[colorIndex].substring(1)}&color=fff`;
};

// 获取查询参数
const getQueryParams = (): QueryParams => {
    const params: QueryParams = {
        page: pagination.current,
        size: pagination.pageSize
    };

    if (userRole.value) {
        params.role = userRole.value;
    }

    if (userStatus.value) {
        params.status = userStatus.value;
    }

    if (searchQuery.value.trim()) {
        params.keyword = searchQuery.value.trim();
    }

    return params;
};

// 加载用户数据
const loadUserData = async () => {
    loading.value = true;

    try {
        const params = getQueryParams();
        const response = await getUsers(params);

        // 根据API返回格式进行适配
        if (response && response.data) {
            // 确保每个用户对象都有所需的属性，防止渲染错误
            const records = (response.data.records || []).map((user: any) => {
                // 处理时间显示格式化
                let editTimeFormatted = user.editTime;
                let createTimeFormatted = user.createTime;

                return {
                    id: user.id || 0,
                    userAccount: user.userAccount || '',
                    userName: user.userName || '',
                    userRole: user.userRole || 'user',
                    userAvatar: user.userAvatar || '',
                    userProfile: user.userProfile || '',
                    status: user.status || 'active',
                    createTime: createTimeFormatted || '',
                    updateTime: user.updateTime || '',
                    editTime: editTimeFormatted || '',
                    isDelete: user.isDelete || 0
                };
            });

            console.log('API返回的用户数据:', records); // 调试用
            userList.value = records;
            pagination.total = response.data.total || 0;
        } else {
            userList.value = [];
            pagination.total = 0;
        }
    } catch (error) {
        console.error('获取用户数据失败:', error);
        message.error('获取用户数据失败，请重试');
        userList.value = [];
        pagination.total = 0;
    } finally {
        loading.value = false;
    }
};

// 处理表格分页变化
const handleTableChange = (page: number, pageSize: number) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    loadUserData();
};

// 处理搜索
const handleSearch = () => {
    isSearching.value = true;
    pagination.current = 1;
    loadUserData();
    setTimeout(() => {
        isSearching.value = false;
    }, 300);
};

// 处理筛选条件变化
const handleFilterChange = () => {
    pagination.current = 1;
    loadUserData();
};

// 监听搜索输入变化
watch(searchQuery, (newVal, oldVal) => {
    if (newVal !== oldVal && !isSearching.value) {
        handleSearch();
    }
});

const showAddModal = () => {
    addModalVisible.value = true;
};

const showEditModal = async (user: User) => {
    modalLoading.value = true;

    try {
        const response = await getUserById(user.id);
        const userData = response.data || user;

        editFormState.id = userData.id;
        editFormState.userAccount = userData.userAccount;
        editFormState.userName = userData.userName;
        editFormState.userRole = userData.userRole;
        editFormState.userProfile = userData.userProfile || '';
        editFormState.status = userData.status;
        editFormState.createTime = userData.createTime || '';
        editFormState.updateTime = userData.updateTime || '';
        editFormState.editTime = userData.editTime || '';
        editFormState.userPassword = '';

        editModalVisible.value = true;
    } catch (error) {
        console.error('获取用户详情失败:', error);
        message.error('获取用户详情失败，请重试');
    } finally {
        modalLoading.value = false;
    }
};

const showDeleteConfirm = (user: User) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除用户 "${user.userName}" 吗？此操作不可撤销。`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => handleDeleteUser(user.id)
    });
};

const showBlockConfirm = (user: User) => {
    Modal.confirm({
        title: '确认封禁',
        content: `确定要封禁用户 "${user.userName}" 吗？封禁后该用户将无法登录系统。`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => handleBlockUser(user.id)
    });
};

const showUnblockConfirm = (user: User) => {
    Modal.confirm({
        title: '确认解封',
        content: `确定要解封用户 "${user.userName}" 吗？解封后该用户将可以正常访问系统。`,
        okText: '确认',
        okType: 'primary',
        cancelText: '取消',
        onOk: () => handleUnblockUser(user.id)
    });
};

const handleAddUser = async () => {
    try {
        await addFormRef.value?.validate();
        modalLoading.value = true;

        await addUser({
            userAccount: formState.userAccount,
            userName: formState.userName,
            userPassword: formState.userPassword,
            userRole: formState.userRole,
            userProfile: formState.userProfile,
            status: formState.status
        });

        message.success('用户添加成功');
        addModalVisible.value = false;
        resetForm();

        loadUserData();
    } catch (error) {
        console.error('添加用户失败:', error);
        message.error('添加用户失败，请检查表单信息');
    } finally {
        modalLoading.value = false;
    }
};

const handleEditUser = async () => {
    try {
        await editFormRef.value?.validate();
        modalLoading.value = true;

        // 准备要更新的数据
        const updateData: any = {
            id: editFormState.id,
            userName: editFormState.userName,
            userRole: editFormState.userRole,
            userProfile: editFormState.userProfile,
            status: editFormState.status
        };

        // 如果密码不为空，添加到更新数据中
        if (editFormState.userPassword) {
            updateData.userPassword = editFormState.userPassword;
        }

        await updateUser(updateData);

        message.success('用户信息更新成功');
        editModalVisible.value = false;
        resetForm();

        loadUserData();
    } catch (error) {
        console.error('编辑用户失败:', error);
        message.error('更新用户信息失败，请检查表单信息');
    } finally {
        modalLoading.value = false;
    }
};

const handleDeleteUser = async (id: number) => {
    loading.value = true;

    try {
        await deleteUser(id);
        message.success('用户删除成功');

        loadUserData();
    } catch (error) {
        console.error('删除用户失败:', error);
        message.error('删除用户失败，请重试');
    } finally {
        loading.value = false;
    }
};

const handleBlockUser = async (id: number) => {
    loading.value = true;

    try {
        const response = await blockUser(id);

        if (response && response.code === 0) {
            message.success('用户已封禁');

            await loadUserData();
        } else {
            const errorMsg = (response && response.message) ? response.message : '封禁用户失败，请重试';
            message.error(errorMsg);
            console.error('封禁用户API错误响应:', response);
        }
    } catch (error) {
        console.error('封禁用户失败:', error);
        message.error('封禁用户失败，请重试');
    } finally {
        loading.value = false;
    }
};

const handleUnblockUser = async (id: number) => {
    loading.value = true;

    try {
        const response = await unblockUser(id);

        if (response && response.code === 0) {
            message.success('用户已解封');

            await loadUserData();
        } else {
            const errorMsg = (response && response.message) ? response.message : '解封用户失败，请重试';
            message.error(errorMsg);
            console.error('解封用户API错误响应:', response);
        }
    } catch (error) {
        console.error('解封用户失败:', error);
        message.error('解封用户失败，请重试');
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    if (addModalVisible.value) {
        addFormRef.value?.resetFields();
    } else if (editModalVisible.value) {
        editFormRef.value?.resetFields();
    }

    formState.userAccount = '';
    formState.userName = '';
    formState.userPassword = '';
    formState.confirmPassword = '';
    formState.userRole = 'user';
    formState.userProfile = '';
    formState.status = 'active';
};

onMounted(() => {
    loadUserData();
});
</script>

<style scoped>
@import '@/assets/styles/manager/UsersManager.css';
</style>