<template>
    <div class="user-management">
        <!-- 搜索和筛选 -->
        <div class="filter-bar">
            <div class="filter-controls">
                <a-input-search 
                    v-model:value="searchQuery" 
                    placeholder="搜索用户名" 
                    class="input-search" 
                    allow-clear
                    :loading="isSearching"
                    @search="handleSearch"
                />
                <a-select 
                    v-model:value="userRole" 
                    placeholder="用户角色" 
                    class="select-filter"
                >
                    <a-select-option value="">全部用户</a-select-option>
                    <a-select-option value="admin">管理员</a-select-option>
                    <a-select-option value="user">普通用户</a-select-option>
                    <a-select-option value="vip">VIP用户</a-select-option>
                </a-select>
                <a-select 
                    v-model:value="userStatus" 
                    placeholder="状态" 
                    class="select-filter"
                >
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
        <a-table 
            :columns="userColumns" 
            :data-source="filteredUserList" 
            :pagination="{ 
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条记录`,
                showSizeChanger: true,
                showQuickJumper: true
            }"
            class="user-table" 
            :loading="loading" 
            :row-key="record => record.id"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'avatar'">
                    <a-avatar :src="(record as User).avatar || getDefaultAvatar((record as User).username)" />
                </template>
                <template v-if="column.key === 'role'">
                    <a-tag :class="['role-tag', getRoleClass((record as User).role)]">
                        {{ getRoleText((record as User).role) }}
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
        <a-modal 
            v-model:visible="addModalVisible" 
            title="添加用户" 
            @ok="handleAddUser" 
            @cancel="resetForm"
            :confirm-loading="modalLoading" 
            centered 
            class="custom-modal"
        >
            <a-form :model="formState" :rules="formRules" ref="addFormRef" layout="vertical">
                <a-form-item label="用户名" name="username">
                    <a-input v-model:value="formState.username" placeholder="请输入用户名" />
                </a-form-item>
                <a-form-item label="密码" name="password">
                    <a-input-password v-model:value="formState.password" placeholder="请输入密码" />
                </a-form-item>
                <a-form-item label="确认密码" name="confirmPassword">
                    <a-input-password v-model:value="formState.confirmPassword" placeholder="请再次输入密码" />
                </a-form-item>
                <a-form-item label="用户角色" name="role">
                    <a-radio-group v-model:value="formState.role">
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
        <a-modal 
            v-model:visible="editModalVisible" 
            title="编辑用户" 
            @ok="handleEditUser" 
            @cancel="resetForm"
            :confirm-loading="modalLoading" 
            centered 
            class="custom-modal"
        >
            <a-form :model="editFormState" :rules="editFormRules" ref="editFormRef" layout="vertical">
                <a-form-item label="用户ID">
                    <a-input v-model:value="editFormState.id" disabled />
                </a-form-item>
                <a-form-item label="用户名" name="username">
                    <a-input v-model:value="editFormState.username" placeholder="请输入用户名" />
                </a-form-item>
                <a-form-item label="密码" name="password" extra="如不修改密码，请留空">
                    <a-input-password v-model:value="editFormState.password" placeholder="请输入新密码" />
                </a-form-item>
                <a-form-item label="用户角色" name="role">
                    <a-radio-group v-model:value="editFormState.role">
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
                        <p>已解题数: {{ editFormState.solved }}</p>
                        <p>注册时间: {{ editFormState.registerTime }}</p>
                        <p>最近登录: {{ editFormState.lastLogin }}</p>
                    </div>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
// import { getUsers, addUser, updateUser, deleteUser, blockUser as apiBlockUser, unblockUser as apiUnblockUser} from '@/api/userApi';

// 用户状态类型
type UserStatus = 'active' | 'blocked';
// 用户角色类型
type UserRole = 'admin' | 'user' | 'vip';

// 用户类型
interface User {
    id: number;
    username: string;
    role: UserRole;
    solved: number;
    registerTime: string;
    lastLogin: string;
    status: UserStatus;
    avatar?: string;
    password?: string;
}

// 声明表单类型
interface UserFormState {
    username: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    status: UserStatus;
}

// 表格列类型定义
interface TableColumn {
    title: string;
    dataIndex?: string;
    key: string;
    width?: number;
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

// 表单状态
const formState = reactive<UserFormState>({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    status: 'active'
});

// 编辑表单状态
const editFormState = reactive<User>({
    id: 0,
    username: '',
    role: 'user',
    solved: 0,
    registerTime: '',
    lastLogin: '',
    status: 'active',
    password: ''
});

// 定义规则对象类型
type FormRules = Record<string, Rule[]>;

// 表单验证规则
const formRules: FormRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度应不少于6个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: async (_rule: Rule, value: string) => {
                if (value !== formState.password) {
                    return Promise.reject('两次输入的密码不一致');
                }
                return Promise.resolve();
            },
            trigger: 'blur'
        }
    ],
    role: [
        { required: true, message: '请选择用户角色', trigger: 'change' }
    ],
    status: [
        { required: true, message: '请选择用户状态', trigger: 'change' }
    ]
};

// 编辑表单验证规则
const editFormRules: FormRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
    ],
    password: [
        { min: 6, message: '密码长度应不少于6个字符', trigger: 'blur' }
    ],
    role: [
        { required: true, message: '请选择用户角色', trigger: 'change' }
    ],
    status: [
        { required: true, message: '请选择用户状态', trigger: 'change' }
    ]
};

// 表格列定义
const userColumns: TableColumn[] = [
    { title: '头像', dataIndex: 'avatar', key: 'avatar', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: '已解题数', dataIndex: 'solved', key: 'solved' },
    { title: '注册时间', dataIndex: 'registerTime', key: 'registerTime' },
    { title: '最近登录', dataIndex: 'lastLogin', key: 'lastLogin' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '操作', key: 'action', width: 120 }
];

// 示例数据
const userList = ref<User[]>([
    {
        id: 1,
        username: '001',
        role: 'admin',
        solved: 328,
        registerTime: '2023-01-15',
        lastLogin: '2024-03-10 15:30',
        status: 'active',
        avatar: ''
    },
    {
        id: 2,
        username: '002',
        role: 'user',
        solved: 312,
        registerTime: '2023-02-20',
        lastLogin: '2024-03-10 14:45',
        status: 'active',
        avatar: ''
    },
    {
        id: 3,
        username: '003',
        role: 'user',
        solved: 289,
        registerTime: '2023-03-10',
        lastLogin: '2024-03-09 16:20',
        status: 'active',
        avatar: ''
    },
    {
        id: 4,
        username: '004',
        role: 'user',
        solved: 276,
        registerTime: '2023-04-05',
        lastLogin: '2024-03-10 11:15',
        status: 'active',
        avatar: ''
    },
    {
        id: 5,
        username: '005',
        role: 'user',
        solved: 245,
        registerTime: '2023-05-18',
        lastLogin: '2024-02-28 09:40',
        status: 'blocked',
        avatar: ''
    },
    {
        id: 6,
        username: '006',
        role: 'vip',
        solved: 400,
        registerTime: '2023-06-01',
        lastLogin: '2024-03-10 12:00',
        status: 'active',
        avatar: ''
    }
]);

// 根据筛选条件过滤用户列表
const filteredUserList = computed(() => {
    return userList.value.filter(user => {
        // 模糊搜索用户名
        const searchLower = searchQuery.value.toLowerCase().trim();
        const usernameMatch = !searchLower || user.username.toLowerCase().includes(searchLower);
        
        // 角色筛选
        const roleMatch = userRole.value === '' || user.role === userRole.value;
        
        // 状态筛选
        const statusMatch = userStatus.value === '' || user.status === userStatus.value;
        
        return usernameMatch && roleMatch && statusMatch;
    });
});

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

// 获取默认头像
const getDefaultAvatar = (username: string) => {
    // 使用用户名生成不同颜色的默认头像
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hash % colors.length;
    return `https://ui-avatars.com/api/?name=${username.charAt(0)}&background=${colors[colorIndex].substring(1)}&color=fff`;
};

const handleSearch = () => {
    isSearching.value = true;
    
    setTimeout(() => {
        isSearching.value = false;
    }, 300);
};

// 监听搜索和筛选条件变化，自动更新列表
watch([searchQuery, userRole, userStatus], () => {
    // 这里可以添加API调用来获取过滤后的数据
}, { immediate: false });

const showAddModal = () => {
    addModalVisible.value = true;
};

const showEditModal = (user: User) => {
    editFormState.id = user.id;
    editFormState.username = user.username;
    editFormState.role = user.role;
    editFormState.status = user.status;
    editFormState.solved = user.solved;
    editFormState.registerTime = user.registerTime;
    editFormState.lastLogin = user.lastLogin;
    editFormState.avatar = user.avatar;

    editFormState.password = '';
    editModalVisible.value = true;
};

const showDeleteConfirm = (user: User) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除用户 "${user.username}" 吗？此操作不可撤销。`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => handleDeleteUser(user.id)
    });
};

const showBlockConfirm = (user: User) => {
    Modal.confirm({
        title: '确认封禁',
        content: `确定要封禁用户 "${user.username}" 吗？封禁后该用户将无法登录系统。`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => handleBlockUser(user.id)
    });
};

const showUnblockConfirm = (user: User) => {
    Modal.confirm({
        title: '确认解封',
        content: `确定要解封用户 "${user.username}" 吗？解封后该用户将可以正常访问系统。`,
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

        const newUser: User = {
            id: userList.value.length + 1,
            username: formState.username,
            role: formState.role,
            status: formState.status,
            solved: 0,
            registerTime: new Date().toISOString().split('T')[0],
            lastLogin: '未登录',
            avatar: ''
        };

        // 调用API添加用户
        // await addUser({
        //     username: formState.username,
        //     password: formState.password,
        //     role: formState.role,
        //     status: formState.status
        // });

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        userList.value.push(newUser);
        message.success('用户添加成功');
        addModalVisible.value = false;
        resetForm();
    } catch (error) {
        console.error('添加用户验证失败:', error);
        message.error('添加用户失败，请检查表单信息');
    } finally {
        modalLoading.value = false;
    }
};

// 处理编辑用户
const handleEditUser = async () => {
    try {
        await editFormRef.value?.validate();
        modalLoading.value = true;

        // 调用API更新用户 TO DO
        // await updateUser({
        //     id: editFormState.id,
        //     username: editFormState.username,
        //     password: editFormState.password, // 如果密码为空，API应该忽略密码更新
        //     role: editFormState.role,
        //     status: editFormState.status
        // });

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const index = userList.value.findIndex(user => user.id === editFormState.id);
        if (index !== -1) {
            const updatedUser: User = {
                ...userList.value[index],
                username: editFormState.username,
                role: editFormState.role,
                status: editFormState.status
            };
            userList.value[index] = updatedUser;
        }
        
        message.success('用户信息更新成功');
        editModalVisible.value = false;
        resetForm();
    } catch (error) {
        console.error('编辑用户验证失败:', error);
        message.error('更新用户信息失败，请检查表单信息');
    } finally {
        modalLoading.value = false;
    }
};

const handleDeleteUser = async (id: number) => {
    loading.value = true;

    try {
        // 调用API删除用户 TO DO
        // await deleteUser(id);

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        userList.value = userList.value.filter(user => user.id !== id);
        message.success('用户删除成功');
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
        // 调用API封禁用户 TO DO
        // await apiBlockUser(id);

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = userList.value.find(user => user.id === id);
        if (user) {
            user.status = 'blocked';
        }
        message.success('用户已封禁');
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
        // 调用API解封用户 TO DO
        // await apiUnblockUser(id);

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = userList.value.find(user => user.id === id);
        if (user) {
            user.status = 'active';
        }
        message.success('用户已解封');
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

    formState.username = '';
    formState.password = '';
    formState.confirmPassword = '';
    formState.role = 'user';
    formState.status = 'active';
};

onMounted(async () => {
    loading.value = true;

    try {
        // 调用API获取用户列表
        // const response = await getUsers();
        // userList.value = response.data;

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
        message.error('获取用户数据失败');
        console.error(error);
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
@import '@/assets/styles/manager/UsersManager.css';
</style>