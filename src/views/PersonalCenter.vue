<template>
    <div class="page-container">
        <!-- 主内容区 -->
        <Header />
        <div class="main-content">

            <!-- 用户个人信息 -->
            <div class="content-wrapper">
                <!-- 返回按钮 -->
                <a-button class="back-button" @click="goBack">
                    <RollbackOutlined />
                </a-button>
                <!-- 个人信息卡片 -->
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="avatar-container">
                            <div class="avatar-wrapper" @click="triggerUpload">
                                <img class="avatar-image" :src="getAvatarUrl" alt="头像">
                                <div class="avatar-overlay">
                                    <CameraOutlined class="camera-icon" />
                                    <div class="upload-text">更换头像</div>
                                </div>
                            </div>
                            <div class="user-info">
                                <h2 class="username">{{ userInfo.userName || '用户名' }}</h2>
                                <p class="user-profile">{{ userInfo.userProfile || '' }}</p>
                            </div>
                            <!-- 隐藏的上传组件 -->
                            <a-upload ref="uploadRef" name="file" list-type="picture-card" class="hidden-uploader"
                                :show-upload-list="false" :before-upload="beforeUpload" @change="handleAvatarChange">
                                <div></div>
                            </a-upload>
                        </div>
                    </div>
                    <div class="profile-content">
                        <div class="stats-row">
                            <div class="stat-item">
                                <p class="stat-label">解题总数</p>
                                <p class="stat-value">1,248</p>
                            </div>
                            <div class="stat-item">
                                <p class="stat-label">连续刷题天数</p>
                                <p class="stat-value">46</p>
                            </div>
                            <div class="stat-item">
                                <p class="stat-label">排名</p>
                                <p class="stat-value stat-rank">#28</p>
                            </div>
                        </div>
                        <div class="activity-section">
                            <h3 class="section-subtitle">刷题记录</h3>
                            <div ref="heatmapRef" class="heatmap-container"></div>
                        </div>
                    </div>
                </div>

                <!-- 个人信息表单 -->
                <div class="info-form-card">
                    <h3 class="section-title">基本信息</h3>
                    <div class="form-grid">
                        <div class="form-column">
                            <label class="form-label">用户名</label>
                            <a-input v-model:value="formData.userName" placeholder="请输入用户名" class="custom-input" />
                        </div>
                        <div class="form-column">
                            <label class="form-label">账号</label>
                            <a-input v-model:value="userInfo.userAccount" class="custom-input" disabled />
                        </div>
                        <div class="form-full-width">
                            <label class="form-label">目标岗位</label>
                            <a-select v-model:value="formData.jobPositions" mode="multiple" placeholder="选择目标岗位(可多选)"
                                class="custom-select-full" :maxTagCount="3" :maxTagTextLength="10">
                                <a-select-option v-for="option in jobPositionOptions" :key="option.value"
                                    :value="option.value">
                                    {{ option.label }}
                                </a-select-option>
                            </a-select>
                        </div>
                        <div class="form-full-width">
                            <label class="form-label">个人简介</label>
                            <a-textarea v-model:value="formData.userProfile" :rows="4" placeholder="请输入个人简介"
                                class="custom-textarea" />
                        </div>
                    </div>
                    <div class="form-buttons">
                        <a-button class="cancel-button" @click="resetForm">取消</a-button>
                        <a-button type="primary" class="save-button" @click="saveUserInfo"
                            :loading="loading">保存更改</a-button>
                    </div>
                </div>

                <!-- 安全设置 -->
                <div class="security-card">
                    <h3 class="section-title">安全设置</h3>
                    <div class="security-items">
                        <div class="security-item">
                            <div class="security-info">
                                <h4 class="security-title">修改密码</h4>
                                <p class="security-desc">定期更改密码以确保账号安全</p>
                            </div>
                            <a-button class="modify-button" @click="showPasswordModal">修改</a-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 修改密码 -->
        <a-modal v-model:visible="passwordModalVisible" title="修改密码" :maskClosable="false" @ok="handlePasswordChange"
            :confirmLoading="passwordLoading" @cancel="resetPasswordForm">
            <a-form :model="passwordForm" layout="vertical">
                <a-form-item label="当前密码" name="oldPassword" :rules="[{ required: true, message: '请输入当前密码' }]">
                    <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入当前密码" />
                </a-form-item>
                <a-form-item label="新密码" name="newPassword" :rules="[
                    { required: true, message: '请输入新密码' },
                    { min: 8, message: '密码长度至少8位' }
                ]">
                    <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
                    <div class="password-hint">密码长度至少8位</div>
                </a-form-item>
                <a-form-item label="确认新密码" name="confirmPassword" :rules="[
                    { required: true, message: '请确认新密码' },
                    { validator: validatePasswordConfirm }
                ]">
                    <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import * as echarts from 'echarts';
import 'echarts/theme/macarons';
import { useRouter } from 'vue-router';
import Header from '@/components/layout/FrontendHeader.vue';
import { RollbackOutlined, CameraOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { getCurrentUser } from '@/apis/authApi';
import { updateMyInfo, updateMyPassword } from '@/apis/userApi';
import type { UploadChangeParam, UploadFile } from 'ant-design-vue/es/upload/interface';

// 类型定义
interface UploadChangeInfo {
    file: File;
    fileList: File[];
}

interface FormData {
    userName: string;
    userProfile: string;
    jobPositions: string[];
    avatarUrl: string;
    file: File | null;
}

interface UserInfo {
    id: number;
    userName: string;
    userAccount: string;
    userAvatar: string;
    userProfile: string;
    jobPosition: string | string[];
}

interface PasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface JobPositionOption {
    label: string;
    value: string;
}

// 目标岗位选项数据
const jobPositionOptions: JobPositionOption[] = [
    { label: 'JAVA工程师', value: 'java' },
    { label: '前端工程师', value: 'frontend' },
    { label: '后端工程师', value: 'backend' },
    { label: '全栈工程师', value: 'fullstack' },
    { label: '测试工程师', value: 'qa' },
    { label: '运维工程师', value: 'ops' },
    { label: '数据工程师', value: 'data' },
    { label: '产品经理', value: 'pm' },
    { label: '其他', value: 'other' }
];

const heatmapRef = ref<HTMLElement | null>(null);
const loading = ref(false);
const uploadRef = ref();

// 获取头像URL
const getAvatarUrl = computed(() => {
    if (formData.avatarUrl) {
        return formData.avatarUrl;
    }
    if (userInfo.userAvatar) {
        // 确保头像URL是完整的
        if (userInfo.userAvatar.startsWith('http')) {
            return userInfo.userAvatar;
        } else {
            // 添加API前缀，使用相对路径
            return `/api/avatar/${userInfo.id}`; // 获取头像的API接口
        }
    }
    return '/src/assets/images/common/avatar.png';
});

// 格式化显示用户岗位
const getFormattedJobPositions = computed(() => {
    // 空值检查
    if (!userInfo.jobPosition) {
        return jobPositionOptions[0].label;
    }

    // 当jobPosition已经是数组时
    if (Array.isArray(userInfo.jobPosition) && userInfo.jobPosition.length > 0) {
        const labels = userInfo.jobPosition.map(pos => {
            const option = jobPositionOptions.find(opt => opt.value === pos);
            return option ? option.label : pos;
        });
        return labels.join('、');
    }

    // 当jobPosition是字符串，但可能是JSON字符串
    if (typeof userInfo.jobPosition === 'string') {
        try {
            // 尝试解析JSON字符串
            const positions = JSON.parse(userInfo.jobPosition);
            if (Array.isArray(positions) && positions.length > 0) {
                // 如果是数组，转换成标签
                const labels = positions.map(pos => {
                    const option = jobPositionOptions.find(opt => opt.value === pos);
                    return option ? option.label : pos;
                });
                return labels.join('、');
            }
        } catch (e) {
            // 如果不是JSON，可能是单个值
            const option = jobPositionOptions.find(opt => opt.value === userInfo.jobPosition);
            if (option) {
                return option.label;
            }
        }
    }

    // 兼容旧数据或未知格式
    return String(userInfo.jobPosition);
});

// 密码修改相关
const passwordModalVisible = ref(false);
const passwordLoading = ref(false);
const passwordForm = reactive<PasswordForm>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// 获取当前登录用户信息
const userInfo = reactive<UserInfo>({
    id: 0,
    userName: '',
    userAccount: '',
    userAvatar: '',
    userProfile: '',
    jobPosition: '',
});

// 表单数据
const formData = reactive<FormData>({
    userName: '',
    userProfile: '',
    jobPositions: [],
    avatarUrl: '',
    file: null
});

// 触发文件上传
const triggerUpload = () => {
    // 触发隐藏的上传组件点击
    const uploadElement = uploadRef.value?.$el?.querySelector('input[type=file]');
    if (uploadElement) {
        uploadElement.click();
    }
};

// 初始化表单数据
const initFormData = () => {
    formData.userName = userInfo.userName;
    formData.userProfile = userInfo.userProfile || '';

    // 处理目标岗位数据
    if (Array.isArray(userInfo.jobPosition)) {
        // 如果已经是数组，直接使用
        formData.jobPositions = [...userInfo.jobPosition];
    } else if (typeof userInfo.jobPosition === 'string') {
        try {
            // 尝试解析存储的JSON格式岗位
            const positions = JSON.parse(userInfo.jobPosition);
            if (Array.isArray(positions)) {
                formData.jobPositions = positions;
            } else {
                // 如果不是数组，则作为单个值处理
                formData.jobPositions = userInfo.jobPosition ? [userInfo.jobPosition] : [];
            }
        } catch (e) {
            // 如果解析失败，可能是单个值
            formData.jobPositions = userInfo.jobPosition ? [userInfo.jobPosition] : [];
        }
    } else {
        // 其他情况，设置为空数组
        formData.jobPositions = [];
    }

    formData.avatarUrl = '';
    formData.file = null;
};

// 重置表单
const resetForm = () => {
    initFormData();
    message.info('已重置表单');
};

const showPasswordModal = () => {
    passwordModalVisible.value = true;
};

const validatePasswordConfirm = (_rule: any, value: string) => {
    if (value !== passwordForm.newPassword) {
        return Promise.reject('两次输入的密码不一致');
    }
    return Promise.resolve();
};

const resetPasswordForm = () => {
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    passwordModalVisible.value = false;
};

// 处理密码修改
const handlePasswordChange = async () => {
    if (!passwordForm.oldPassword) {
        message.error('请输入当前密码');
        return;
    }
    if (!passwordForm.newPassword) {
        message.error('请输入新密码');
        return;
    }
    if (passwordForm.newPassword.length < 8) {
        message.error('密码长度至少8位');
        return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
    }

    passwordLoading.value = true;
    try {
        const passwordData = {
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword,
            checkPassword: passwordForm.confirmPassword
        };

        const response = await updateMyPassword(passwordData);
        
        if (response.code === 0) {
            message.success('密码修改成功');
            resetPasswordForm();
        } else {
            message.error(response.message || '密码修改失败');
        }
    } catch (error) {
        console.error('密码修改失败', error);
        message.error('密码修改失败，请稍后重试');
    } finally {
        passwordLoading.value = false;
    }
};

// 保存用户信息
const saveUserInfo = async () => {
    loading.value = true;
    try {
        // 准备FormData对象用于文件上传
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('userName', formData.userName);
        formDataToSubmit.append('userProfile', formData.userProfile);

        // 对于多个目标岗位，使用适当的格式提交
        formData.jobPositions.forEach((position) => {
            formDataToSubmit.append('jobPosition', position);
        });

        // 如果有新头像，添加到formData
        if (formData.file) {
            formDataToSubmit.append('userAvatarFile', formData.file);
        }

        const response = await updateMyInfo(formDataToSubmit);

        if (response.code === 0) {
            message.success('个人信息更新成功');
            // 重新获取用户信息
            await fetchUserInfo();
        } else {
            message.error(response.message || '更新失败');
        }
    } catch (error) {
        console.error('更新用户信息失败', error);
        message.error('更新用户信息失败');
    } finally {
        loading.value = false;
    }
};

// 获取用户信息
const fetchUserInfo = async () => {
    try {
        const res = await getCurrentUser();
        if (res.code === 0 && res.data) {
            const userData = res.data;
            userInfo.id = userData.id;
            userInfo.userName = userData.userName;
            userInfo.userAccount = userData.userAccount || '';
            userInfo.userAvatar = userData.userAvatar || '';
            userInfo.userProfile = userData.userProfile || '';

            // 处理jobPosition，可能是数组或字符串
            if (userData.jobPosition) {
                userInfo.jobPosition = userData.jobPosition;
            } else {
                userInfo.jobPosition = '';
            }

            initFormData();
        }
    } catch (error) {
        console.error('获取用户信息失败', error);
        message.error('获取用户信息失败');
    }
};

// 头像上传前的验证
const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('只能上传JPG或PNG格式的图片!');
        return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('图片必须小于2MB!');
        return false;
    }

    // 不自动上传，返回false
    return false;
};

// 处理头像变更
const handleAvatarChange = (info: UploadChangeParam<UploadFile<any>>) => {
    // 获取原始File对象
    if (info.file.originFileObj) {
        // 创建一个临时的URL用于预览
        formData.avatarUrl = URL.createObjectURL(info.file.originFileObj);
        formData.file = info.file.originFileObj;
    }
};

const router = useRouter();

function goBack() {
    router.back();
}

onMounted(async () => {
    // 获取用户信息
    await fetchUserInfo();

    // 初始化热力图
    if (heatmapRef.value) {
        const heatmapChart = echarts.init(heatmapRef.value);
        const fixedDate = new Date('2024-01-01');
        const data: [string, number][] = [];

        // 热力图数据模式
        const activityPattern = [
            [0, 1, 0, 1, 2, 3, 0, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2], // 1月
            [1, 2, 0, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 1, 2, 0], // 2月
            [2, 3, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1], // 3月
            [3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2], // 4月
            [0, 2, 3, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 1, 2, 0, 3, 1, 2, 0], // 5月
            [1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 3], // 6月
            [2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2], // 7月
            [3, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0], // 8月
            [0, 3, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1], // 9月
            [1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1], // 10月
            [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0], // 11月
            [3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0], // 12月
        ];

        for (let month = 0; month < 12; month++) {
            const monthData = activityPattern[month];
            for (let day = 0; day < monthData.length; day++) {
                const currentDate = new Date(fixedDate);
                currentDate.setMonth(month);
                currentDate.setDate(day + 1);
                const value = monthData[day] * 3; // 将0-3的活动等级转换为0-9的显示值
                data.push([
                    echarts.format.formatTime('yyyy-MM-dd', currentDate),
                    value
                ]);
            }
        }

        heatmapChart.setOption({
            animation: false,
            tooltip: {
                position: 'top',
                formatter: function (params: any) {
                    return `${params.data[0]}: ${params.data[1]} 题`;
                }
            },
            visualMap: {
                show: false,
                min: 0,
                max: 9,
                inRange: {
                    color: ['#ebedf0', '#e2e8fd', '#bcc7fa', '#93a3f5', '#6474e5']
                }
            },
            calendar: {
                top: 50,
                left: 30,
                right: 30,
                cellSize: ['auto', 13],
                range: '2024',
                itemStyle: {
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                yearLabel: { show: false }
            },
            series: {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: data
            }
        });
    }
});
</script>

<style scoped>
@import "../assets/styles/PersonalCenter.css";
</style>