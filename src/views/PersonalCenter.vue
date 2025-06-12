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
                                <img class="avatar-image" :src="getAvatarUrl" alt="头像"
                                    :style="{ opacity: formData.file ? '0.8' : '1' }" @error="handleImageError" />
                                <div class="avatar-overlay" :class="{ 'active': formData.file }">
                                    <CameraOutlined class="camera-icon" />
                                    <div class="upload-text">{{ formData.file ? '已选择新头像' : '更换头像' }}</div>
                                </div>
                            </div>
                            <div class="user-info">
                                <h2 class="username">{{ userInfo.userName || '用户名' }}</h2>
                                <p class="user-profile">{{ userInfo.userProfile || '' }}</p>
                            </div>
                            <!-- 隐藏的上传组件 -->
                            <a-upload ref="uploadRef" name="userAvatarFile" list-type="picture-card"
                                class="hidden-uploader" :show-upload-list="false" :before-upload="beforeUpload"
                                @change="handleAvatarChange">
                                <div></div>
                            </a-upload>
                        </div>
                    </div>
                    <div class="profile-content">
                        <div class="stats-row">
                            <div class="stat-item">
                                <p class="stat-label">解题总数</p>
                                <p class="stat-value">{{ totalSolved }}</p>
                            </div>
                            <div class="stat-item">
                                <p class="stat-label">连续刷题天数</p>
                                <p class="stat-value">{{ continuousDays }} 天</p>
                            </div>
                            <div class="stat-item">
                                <p class="stat-label">今日状态</p>
                                <p class="stat-value">
                                    <!-- 显示今日刷题状态，不提供手动操作 -->
                                    <span v-if="hasCompletedToday" class="completed">已刷题</span>
                                    <span v-else class="not-completed">未刷题</span>
                                </p>
                            </div>
                        </div>
                        <div class="activity-section">
                            <h3 class="section-subtitle">刷题记录</h3>

                            <!-- 选择年份 -->
                            <a-select v-model:value="selectedYear" style="width: 120px; margin-bottom: 12px;"
                                @change="onYearChange" :loading="heatmapLoading">
                                <a-select-option v-for="year in yearOptions" :key="year" :value="year">
                                    {{ year }}
                                </a-select-option>
                            </a-select>

                            <!-- 热力图容器 -->
                            <div ref="heatmapRef" class="heatmap-container" v-show="!showEmptyState"></div>
                            
                            <!-- 空状态 -->
                            <div v-if="showEmptyState" class="empty-state">
                                <div class="empty-icon">
                                    <CalendarOutlined />
                                </div>
                                <div class="empty-text">{{ emptyStateText }}</div>
                                <div class="empty-desc">{{ emptyStateDesc }}</div>
                            </div>

                            <!-- 加载状态 -->
                            <div v-if="heatmapLoading" class="loading-state">
                                <a-spin size="large" />
                                <div class="loading-text">加载刷题记录中...</div>
                            </div>
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
import { ref, onMounted, reactive, computed, nextTick } from 'vue';
import * as echarts from 'echarts';
import 'echarts/theme/macarons';
import { useRouter } from 'vue-router';
import Header from '@/components/layout/FrontendHeader.vue';
import { RollbackOutlined, CameraOutlined, CalendarOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { getCurrentUser } from '@/apis/authApi';
import { updateMyInfo, updateMyPassword, getUserSignInRecord } from '@/apis/userApi';
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
    id: string;
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

// 签到记录响应接口
interface SignInRecordResponse {
    code: number;
    data: number[];
    message?: string;
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

// ========== 签到功能相关状态 ==========
// 年份可选范围
const yearOptions = [2023, 2024, 2025];
const selectedYear = ref<number>(new Date().getFullYear()); // 默认当前年

// 用于存储后端返回的"当年第 N 天已刷题"索引列表
const signedDays = ref<number[]>([]);

// 计算出"今日是否已刷题"状态
const hasCompletedToday = ref<boolean>(false);

// 计算"连续刷题天数"，根据 signedDays 和 当前日期算出
const continuousDays = ref<number>(0);

// 解题总数 - 累计所有年份的签到天数
const totalSolved = ref<number>(0);

// 当前年份的签到天数（用于统计显示）
const currentYearSigned = ref<number>(0);

// ECharts 实例与容器
const heatmapRef = ref<HTMLElement | null>(null);
let heatmapChart: echarts.ECharts | null = null;

// 加载和状态控制
const loading = ref(false);
const heatmapLoading = ref(false);
const showEmptyState = ref(false);
const emptyStateText = ref('');
const emptyStateDesc = ref('');
const uploadRef = ref();

// 工具函数：把"第几天"转换为 "yyyy-MM-dd" 字符串
function dayIndexToDateStr(year: number, dayIndex: number): string {
    // new Date(year, 0, dayIndex) 就是当年第 dayIndex 天
    const dt = new Date(year, 0, dayIndex);
    const yyyy = dt.getFullYear();
    const MM = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd}`;
}

function buildHeatmapData(year: number, dayIndices: number[]): [string, number][] {
    const data: [string, number][] = [];
    const signedSet = new Set(dayIndices);

    // 获取当年的总天数
    const totalDays = new Date(year, 11, 31).getDate() === 31 ?
        (new Date(year, 1, 29).getDate() === 29 ? 366 : 365) : 365; // 判断是否为闰年

    // 为整年的每一天都生成数据点
    for (let dayOfYear = 1; dayOfYear <= totalDays; dayOfYear++) {
        const dateStr = dayIndexToDateStr(year, dayOfYear);
        const value = signedSet.has(dayOfYear) ? 1 : 0; // 有刷题记录为1，否则为0
        data.push([dateStr, value]);
    }

    return data;
}

function calcContinuousDays(year: number, dayIndices: number[]): number {
    if (dayIndices.length === 0) {
        return 0;
    }

    // 先对数组排序
    const sorted = [...dayIndices].sort((a, b) => a - b);

    // 判断是否查看的是当前年份
    const today = new Date();
    const todayYear = today.getFullYear();
    if (year !== todayYear) {
        // 往年，只算历史最长连续
        let maxStreak = 0;
        let temp = 1;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i - 1] === 1) {
                temp++;
            } else {
                maxStreak = Math.max(maxStreak, temp);
                temp = 1;
            }
        }
        maxStreak = Math.max(maxStreak, temp);
        return maxStreak;
    }

    // 先算出"今天是当年第几天"
    const startOfYear = new Date(year, 0, 1);
    const diff = today.getTime() - startOfYear.getTime();
    const todayIndex = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // 1-based

    // 构造一个 Set 方便 O(1) 查找
    const set = new Set(sorted);

    // 判断"今日是否已刷题"
    hasCompletedToday.value = set.has(todayIndex);

    // 如果今天已刷题，就从 todayIndex 倒推；否则从 todayIndex-1 倒推
    let checkIdx = hasCompletedToday.value ? todayIndex : todayIndex - 1;
    let streak = 0;

    while (checkIdx > 0 && set.has(checkIdx)) {
        streak++;
        checkIdx--;
    }
    return streak;
}

// 计算累计解题总数
async function calculateTotalSolved() {
    try {
        let total = 0;
        
        // 遍历所有年份，累计签到天数
        for (const year of yearOptions) {
            const response: SignInRecordResponse = await getUserSignInRecord(year);
            if (response.code === 0 && response.data) {
                total += response.data.length;
            }
        }
        
        totalSolved.value = total;
    } catch (error) {
        console.error('计算累计解题总数失败:', error);
        totalSolved.value = 0;
    }
}

// 渲染/更新 Heatmap 的主方法
async function renderHeatmap() {
    heatmapLoading.value = true;
    showEmptyState.value = false;
    
    try {
        // 调用接口获取签到记录
        const response: SignInRecordResponse = await getUserSignInRecord(selectedYear.value);
        
        if (response.code === 0) {
            const apiSignedDays = response.data || [];
            signedDays.value = apiSignedDays;

            // 更新当前年份的签到天数
            currentYearSigned.value = apiSignedDays.length;
            
            // 计算连续刷题天数
            continuousDays.value = calcContinuousDays(selectedYear.value, signedDays.value);

            // 检查是否有记录
            if (apiSignedDays.length === 0) {
                currentYearSigned.value = 0;
                showEmptyState.value = true;
                const currentYear = new Date().getFullYear();
                if (selectedYear.value === currentYear) {
                    emptyStateText.value = '还没有刷题记录';
                    emptyStateDesc.value = '开始你的第一次刷题吧！';
                } else {
                    emptyStateText.value = `${selectedYear.value}年暂无刷题记录`;
                    emptyStateDesc.value = '该年份暂无刷题数据';
                }
                return;
            }

            // 准备 ECharts Heatmap 所需数据
            const heatmapData = buildHeatmapData(selectedYear.value, signedDays.value);

            // 初始化或清空已有实例
            if (!heatmapChart) {
                heatmapChart = echarts.init(heatmapRef.value!);
            }
            heatmapChart.clear();

            // 设置 Heatmap 的配置项
            heatmapChart.setOption({
                animation: false,
                tooltip: {
                    position: 'top',
                    formatter: (params: any) => {
                        const [dateStr, value] = params.data as [string, number];
                        if (value === 1) {
                            return `${dateStr}：已完成刷题`;
                        } else {
                            return `${dateStr}：未刷题`;
                        }
                    }
                },
                visualMap: {
                    show: false,
                    min: 0,
                    max: 1,
                    inRange: {
                        color: ['#f7f8f9', '#6598f7']
                    }
                },
                calendar: {
                    top: 50,
                    left: 30,
                    right: 30,
                    cellSize: ['auto', 13],
                    range: `${selectedYear.value}`, // 整年
                    itemStyle: {
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    yearLabel: { show: false }
                },
                series: {
                    type: 'heatmap',
                    coordinateSystem: 'calendar',
                    data: heatmapData
                }
            });

            // 监听窗口大小变化
            const resizeHandler = () => {
                heatmapChart?.resize();
            };
            window.addEventListener('resize', resizeHandler);

        } else {
            // 接口返回错误
            console.error('获取签到记录失败:', response.message);
            currentYearSigned.value = 0;
            showEmptyState.value = true;
            emptyStateText.value = '获取数据失败';
            emptyStateDesc.value = response.message || '请稍后重试';
            message.error(response.message || '获取刷题记录失败');
        }
    } catch (error) {
        console.error('获取签到记录异常:', error);
        currentYearSigned.value = 0;
        showEmptyState.value = true;
        emptyStateText.value = '网络异常';
        emptyStateDesc.value = '请检查网络连接后重试';
        message.error('获取刷题记录失败，请稍后重试');
    } finally {
        heatmapLoading.value = false;
    }
}

// ========== 切换年份时重新拉取并渲染 ==========
async function onYearChange(value: any) {
    let year: number;

    if (typeof value === 'number') {
        year = value;
    } else if (typeof value === 'string') {
        year = parseInt(value, 10);
    } else if (value && typeof value === 'object' && 'value' in value) {
        // 处理 LabeledValue 类型
        year = typeof value.value === 'number' ? value.value : parseInt(value.value, 10);
    } else {
        console.warn('无法解析年份值:', value);
        return;
    }

    if (!isNaN(year)) {
        selectedYear.value = year;
        await renderHeatmap();
    }
}

// 处理图片加载错误
const handleImageError = (e: Event) => {
    const target = e.target as HTMLImageElement;
    target.src = '/src/assets/images/common/avatar.png';
    target.onerror = null; // 防止循环触发
};

// 获取头像URL
const getAvatarUrl = computed(() => {
    // 如果有临时预览URL（用于新上传的图片），优先使用它
    if (formData.avatarUrl) {
        return formData.avatarUrl;
    }

    // 如果有用户头像URL
    if (userInfo.userAvatar) {
        // 确保URL是绝对路径
        if (userInfo.userAvatar.startsWith('http')) {
            return userInfo.userAvatar;
        } else {
            // 默认使用本地默认头像，避免加载失败
            return '/src/assets/images/common/avatar.png';
        }
    }

    // 默认头像
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
    id: '',
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

    message.success('图片已选择，点击保存更改以上传');
    // 不自动上传，返回false
    return false;
};

// 处理头像变更
const handleAvatarChange = (info: UploadChangeParam<UploadFile<any>>) => {
    // 如果已经有预览URL，先释放它
    if (formData.avatarUrl && formData.avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.avatarUrl);
    }

    // 处理不同的文件状态
    if (info.file.status === 'error') {
        message.error('文件上传失败');
        return;
    }

    try {
        let fileObj;
        // 尝试多种方式获取文件对象
        if (info.file.originFileObj) {
            fileObj = info.file.originFileObj;
        } else if (info.file instanceof File) {
            fileObj = info.file;
        } else if (info.file.uid && info.fileList) {
            // 尝试从fileList中找到对应的文件
            const foundFile = info.fileList.find(f => f.uid === info.file.uid);
            if (foundFile && foundFile.originFileObj) {
                fileObj = foundFile.originFileObj;
            }
        }

        if (fileObj instanceof File) {
            // 保存文件对象以供上传
            formData.file = fileObj;

            // 使用回退机制 - 先尝试使用Blob URL
            try {
                formData.avatarUrl = URL.createObjectURL(fileObj);
            } catch (e) {
                formData.avatarUrl = '';
            }

            // 通过设置临时类名标记已选择图片
            nextTick(() => {
            });
        } else {
            // 尝试直接从event中获取文件
            const inputElement = uploadRef.value?.$el?.querySelector('input[type=file]');
            if (inputElement && inputElement.files && inputElement.files.length > 0) {
                const file = inputElement.files[0];
                formData.file = file;

                try {
                    formData.avatarUrl = URL.createObjectURL(file);
                } catch (e) {
                    formData.avatarUrl = '';
                }
            } else {
                message.error('无法获取上传文件，请重试');
            }
        }
    } catch (error) {
        message.error('处理文件预览时出错，请重试');
    }
};

// 保存用户信息
const saveUserInfo = async () => {
    // 验证用户名不能为空
    if (!formData.userName || formData.userName.trim() === '') {
        message.error('用户名不能为空');
        return;
    }

    loading.value = true;
    try {
        // 准备FormData对象用于文件上传
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('userName', formData.userName);
        formDataToSubmit.append('userProfile', formData.userProfile || '');

        // 对于多个目标岗位，使用适当的格式提交
        if (formData.jobPositions && formData.jobPositions.length > 0) {
            formData.jobPositions.forEach((position) => {
                formDataToSubmit.append('jobPosition', position);
            });
        }

        // 如果有新头像，添加到formData
        if (formData.file) {
            formDataToSubmit.append('userAvatarFile', formData.file);
        }

        const response = await updateMyInfo(formDataToSubmit);

        if (response.code === 0) {
            message.success('个人信息更新成功');

            // 清理资源
            if (formData.avatarUrl && formData.avatarUrl.startsWith('blob:')) {
                URL.revokeObjectURL(formData.avatarUrl);
            }
            formData.avatarUrl = '';
            formData.file = null;

            // 延迟刷新，给服务器处理时间
            setTimeout(async () => {
                try {
                    await fetchUserInfo();
                    message.success('用户信息已更新');
                } catch (error) {
                    // 静默处理错误
                }
            }, 1000);
        } else {
            message.error(response.message || '更新失败');
        }
    } catch (error) {
        message.error('更新用户信息失败，请稍后重试');
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
            // 确保id转换为string类型
            userInfo.id = String(userData.id);
            userInfo.userName = userData.userName;
            userInfo.userAccount = userData.userAccount || '';

            // 处理头像URL - 添加时间戳避免缓存问题
            if (userData.userAvatar) {
                const timestamp = new Date().getTime();
                userInfo.userAvatar = userData.userAvatar.includes('?')
                    ? `${userData.userAvatar}&t=${timestamp}`
                    : `${userData.userAvatar}?t=${timestamp}`;
            } else {
                userInfo.userAvatar = '';
            }

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
        message.error('获取用户信息失败');
    }
};

const router = useRouter();

function goBack() {
    router.back();
}

onMounted(async () => {
    // 获取用户信息
    await fetchUserInfo();

    // 计算累计解题总数
    await calculateTotalSolved();

    // 初始化热力图
    await renderHeatmap();
});
</script>

<style scoped>
@import "../assets/styles/PersonalCenter.css";
</style>