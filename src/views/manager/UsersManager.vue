<template>
    <div class="user-management">
        <!-- 搜索和筛选 -->
        <div class="filter-bar">
            <div class="filter-controls">
                <a-input-search v-model="searchQuery" placeholder="搜索用户" class="input-search" />
                <a-select v-model:value="userRole" placeholder="用户角色" class="select-filter">
                    <a-select-option value="">全部用户</a-select-option>
                    <a-select-option value="admin">管理员</a-select-option>
                    <a-select-option value="user">普通用户</a-select-option>
                    <a-select-option value="vip">VIP用户</a-select-option>
                </a-select>
                <a-select v-model:value="userStatus" placeholder="状态" class="select-filter">
                    <a-select-option value="">全部状态</a-select-option>
                    <a-select-option value="active">活跃</a-select-option>
                    <a-select-option value="inactive">非活跃</a-select-option>
                    <a-select-option value="blocked">已封禁</a-select-option>
                </a-select>
            </div>
            <a-button type="primary" class="add-user-btn">
                <PlusOutlined />添加用户
            </a-button>
        </div>

        <!-- 用户列表 -->
        <a-table :columns="userColumns" :data-source="userList" :pagination="{ pageSize: 10 }" class="user-table">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'avatar'">
                    <a-avatar :src="record.avatar" />
                </template>
                <template v-if="column.key === 'role'">
                    <a-tag :class="['role-tag', getRoleClass(record.role)]">
                        {{ getRoleText(record.role) }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'status'">
                    <a-tag
                        :class="['status-tag', getStatusClass(record.status)]">
                        {{ getStatusText(record.status) }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <div class="action-buttons">
                        <a-button type="link" @click="editCategory(record.id)">
                            <EditOutlined class="action-icon edit-icon" />
                        </a-button>
                        <a-button type="link" @click="deleteCategory(record.id)">
                            <DeleteOutlined class="action-icon delete-icon" />
                        </a-button>
                        <a-button v-if="record.status !== 'blocked'" type="link" @click="blockUser(record.id)">
                            <LockOutlined class="action-icon ban-icon" />
                        </a-button>
                        <a-button v-else type="link" @click="unblockUser(record.id)">
                            <UnlockOutlined class="action-icon unban-icon" />
                        </a-button>
                    </div>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, PlusOutlined } from '@ant-design/icons-vue';

const searchQuery = ref('');
const userRole = ref('');
const userStatus = ref('');

const userColumns = [
    { title: '头像', dataIndex: 'avatar', key: 'avatar', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: '已解题数', dataIndex: 'solved', key: 'solved' },
    { title: '注册时间', dataIndex: 'registerTime', key: 'registerTime' },
    { title: '最近登录', dataIndex: 'lastLogin', key: 'lastLogin' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '操作', key: 'action', width: 120 }
];

const userList = [
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
        status: 'inactive',
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
            return '活跃';
        case 'inactive':
            return '非活跃';
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
        case 'inactive':
            return 'warning';
        case 'blocked':
            return 'error';
        default:
            return '';
    }
};

const editCategory = (id: number) => {
    console.log(`Editing user with ID: ${id}`);
};

const deleteCategory = (id: number) => {
    console.log(`Deleting user with ID: ${id}`);
};

const blockUser = (id: number) => {
    console.log(`Blocking user with ID: ${id}`);
};

const unblockUser = (id: number) => {
    console.log(`Unblocking user with ID: ${id}`);
};
</script>

<style scoped>
@import "../../assets/styles/manager/UsersManager.css";
</style>