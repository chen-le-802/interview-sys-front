<template>
    <div class="container">
        <!-- 侧边栏 -->
        <div class="left" :class="{ collapsed: sidebarCollapsed }">
            <!-- 侧边栏头部 -->
            <div class="sidebar-header">
                <div class="logo-title" v-if="!sidebarCollapsed">
                    <div class="logo"></div>
                    <p style="font-size: 16px; font-weight: 600;">AI面试官</p>
                </div>
                <div class="logo-only" v-else>
                    <div class="logo"></div>
                </div>
                <a-button type="text" class="collapse-btn" @click="toggleSidebar">
                    <template #default>
                        <MenuUnfoldOutlined v-if="sidebarCollapsed" />
                        <MenuFoldOutlined v-else />
                    </template>
                </a-button>
            </div>

            <div class="nav">
                <a-button class="add-interview-btn" @click="showInterviewDialog" :loading="startingInterview"
                    :title="sidebarCollapsed ? '新建面试' : ''">
                    <PlusOutlined />
                    <span v-if="!sidebarCollapsed">新建面试</span>
                </a-button>

                <!-- 面试记录 -->
                <div class="nav-section">
                    <div class="section-title" :title="sidebarCollapsed ? '面试记录' : ''">
                        <ClockCircleOutlined />
                        <span v-if="!sidebarCollapsed">面试记录</span>
                    </div>

                    <!-- 展开状态 -->
                    <div class="interview-list" v-if="!sidebarCollapsed">
                        <div v-for="record in interviewRecords" :key="record.id" class="interview-item"
                            :class="{ active: currentInterviewId === record.id }" @click="switchInterview(record)">
                            {{ getDisplayInterviewName(record.name) }}
                        </div>
                        <div v-if="interviewRecords.length === 0" class="empty-text">
                            暂无面试记录
                        </div>
                    </div>

                    <!-- 收缩状态 -->
                    <div v-else class="collapsed-interview-list">
                        <div v-for="(record, index) in interviewRecords.slice(0, 3)" :key="record.id"
                            class="collapsed-interview-item" :class="{ active: currentInterviewId === record.id }"
                            @click="switchInterview(record)" :title="getDisplayInterviewName(record.name)">
                            {{ index + 1 }}
                        </div>
                    </div>
                </div>

                <!-- 我的简历 -->
                <div class="nav-section">
                    <div class="section-title my-resume-title" :title="sidebarCollapsed ? '我的简历' : ''">
                        <div>
                            <SolutionOutlined />
                            <span v-if="!sidebarCollapsed">我的简历</span>
                        </div>
                        <a-button type="text" class="add-btn" v-if="!sidebarCollapsed" @click="showUploadModal">
                            <PlusOutlined style="margin-left: 5px;" />
                        </a-button>
                    </div>
                    <div class="resume-list" v-if="!sidebarCollapsed">
                        <div 
                            v-for="resume in resumes" 
                            :key="resume.id" 
                            class="resume-item"
                            :class="{ active: selectedResumeId === resume.id }"
                            @click="selectResume(resume)"
                        >
                            {{ resume.name }}
                            <a-button type="text" class="preview-btn" @click.stop="previewResume(resume)">
                                <EyeOutlined />
                            </a-button>
                        </div>
                    </div>
                </div>
            </div>

            <a-button class="go-to-home" @click="$router.push('/')" :title="sidebarCollapsed ? '退出' : ''">
                <LogoutOutlined v-if="sidebarCollapsed" />
                <span v-else>退出</span>
            </a-button>
        </div>

        <!-- 主内容区域 -->
        <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
            <!-- 固定头部 -->
            <div class="header-container">
                <div class="header-box">
                    <a-button 
                        type="text" 
                        :style="{
                            backgroundColor: currentPage === 'interview' ? '#e6f4ff' : '#f5f5f5',
                            color: currentPage === 'interview' ? '#1677FF' : '#333',
                            fontWeight: currentPage === 'interview' ? 'bold' : 'normal'
                        }"
                        @click="changeCurrentPage('interview')"
                    >
                        面试记录
                    </a-button>
                    <a-button 
                        type="text" 
                        :style="{
                            backgroundColor: currentPage === 'report' ? '#e6f4ff' : '#f5f5f5',
                            color: currentPage === 'report' ? '#1677FF' : '#333',
                            fontWeight: currentPage === 'report' ? 'bold' : 'normal'
                        }"
                        @click="changeCurrentPage('report')"
                    >
                        评估报告
                    </a-button>
                    
                </div>

                <!-- 面试状态提示 -->
                <div class="interview-status" v-if="currentInterviewId">
                    <span v-if="isInterviewActive" class="status-active">
                        <span class="status-dot"></span>正在进行面试
                    </span>
                    <span v-else class="status-history">
                        <span class="status-dot"></span>查看历史记录
                    </span>
                </div>

                <div class="interview-controls" v-if="isInterviewActive">
                    <a-button danger @click="endCurrentInterview" :loading="endingInterview">结束面试</a-button>
                </div>
            </div>
            
            <!-- 聊天内容区域 -->
            <div class="chat-container" v-if="currentPage==='interview'">
                <div class="chat-content" ref="chatContainer">
                    <div v-if="chatMessages.length === 0" class="empty-chat" @click="showInterviewDialog">
                        <div class="empty-icon">💬</div>
                        <p class="empty-text">点击"新建面试"开始你的AI面试体验</p>
                    </div>

                    <div v-for="(message, index) in chatMessages" :key="index" class="chat-bubble"
                        :class="message.type">
                        <div class="chat-header">{{ message.type === 'ai' ? 'AI面试官' : '面试者' }}</div>
                        <div class="chat-content">{{ message.content }}</div>
                        <div class="chat-time">{{ formatTime(message.timestamp) }}</div>
                    </div>

                    <!-- AI 正在输入 -->
                    <div v-if="aiTyping" class="chat-bubble ai typing">
                        <div class="chat-header">AI面试官</div>
                        <div class="chat-content">
                            <div class="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                            正在思考中...
                        </div>
                    </div>

                    <!-- 底部占位 -->
                    <div class="chat-bottom-spacer"></div>
                </div>
            </div>

            <!-- 固定输入框 -->
            <div class="footer-container" v-if="currentPage==='interview'">
                <div class="chat-input-box">
                    <div class="input-container">
                        <textarea v-model="inputMessage" placeholder="请输入你的回答..." rows="3" class="message-input"
                            :disabled="!isInterviewActive || sending" @keydown.ctrl.enter="sendMessage"></textarea>
                        <a-button type="primary" class="send-button" @click="sendMessage"
                            :disabled="!inputMessage.trim() || !isInterviewActive" :loading="sending">
                            发送
                        </a-button>
                    </div>
                    <div class="input-tip" v-if="isInterviewActive">💡按 Ctrl + Enter 快速发送</div>
                </div>
            </div>
            <InterviewReport v-if="currentPage === 'report'" :interviewId="currentInterviewId" />
        </div>
    </div>

    <!-- 面试岗位选择模态框，只展示用户个人信息中的目标岗位 -->
    <a-modal v-model:open="showInterviewModal" title="选择面试岗位" :width="400" :maskClosable="false"
        @ok="confirmStartInterview" @cancel="showInterviewModal = false">
        <div class="interview-modal-content">
            <p class="modal-description">请选择您想要参与面试的岗位：</p>
            <div class="job-position-selector">
                <label class="selector-label">我想参与</label>
                <a-select v-model:value="selectedJobPosition" class="job-select" placeholder="请选择岗位"
                    :disabled="selectablePositions.length === 0">
                    <a-select-option v-for="option in selectablePositions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </a-select-option>
                </a-select>
                <label class="selector-label">岗位的面试</label>
            </div>
            <div v-if="selectablePositions.length === 0" style="margin-top: 8px; color: #ff4d4f; text-align: center;">
                您的个人信息尚未设置目标岗位，请先前往个人中心添加
            </div>
        </div>
        <template #footer>
            <a-button @click="showInterviewModal = false">取消</a-button>
            <a-button type="primary" @click="confirmStartInterview" :loading="startingInterview"
                :disabled="!selectedJobPosition">
                确认开始面试
            </a-button>
        </template>
    </a-modal>
    <!-- 上传简历 -->
    <a-modal 
    v-model:open="showUploadResumeModal" 
    title="上传简历" 
    :width="600"
    :maskClosable="false"
    :footer="null"
>
    <div class="resume-upload-container">
        <a-upload-dragger
            name="resume"
            :multiple="false"
            :before-upload="beforeUpload"
            :showUploadList="true"
            accept=".pdf"
        >
            <p class="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽PDF文件到此处上传</p>
            <p class="ant-upload-hint">仅支持PDF格式，文件大小不超过5MB</p>
        </a-upload-dragger>
        
        <div v-if="uploading" class="uploading-progress">
            <a-progress :percent="uploadProgress" status="active" />
            <p>正在上传 {{ uploadFileName }}...</p>
        </div>
        
        <div class="upload-actions" v-if="selectedFile">
            <a-button @click="cancelUpload">取消</a-button>
            <a-button type="primary" @click="handleUpload" :loading="uploading">开始上传</a-button>
        </div>
    </div>
</a-modal>
<!-- 简历预览模态框 -->
<a-modal 
    v-model:open="showPreviewResumeModal" 
    title="简历预览" 
    :width="1200"
    :footer="null"
    wrapClassName="resume-preview-modal"
    style="top:20px"
>
    <div class="resume-preview-container">
        <div class="preview-toolbar">
            <a-button @click="currentPageNum > 1 ? currentPageNum-- : null" :disabled="currentPageNum <= 1">
                <LeftOutlined />
            </a-button>
            <span>第 {{ currentPageNum }} 页 / 共 {{ totalPages }} 页</span>
            <a-button @click="currentPageNum < totalPages ? currentPageNum++ : null" :disabled="currentPageNum >= totalPages">
                <RightOutlined />
            </a-button>
        </div>
        
        <div class="pdf-viewer-container">
            <vue-pdf-embed 
                :source="previewResumeUrl" 
                :page="currentPageNum"
                class="pdf-viewer"
                :width="1200"
                
            />
        </div>
    </div>
</a-modal>

</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { message } from 'ant-design-vue';
import VuePdfEmbed from 'vue-pdf-embed';
import {
    PlusOutlined,
    ClockCircleOutlined,
    SolutionOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    InboxOutlined, EyeOutlined, LeftOutlined, RightOutlined 
} from '@ant-design/icons-vue'
import { interviewApi, type InterviewVO, type BaseResponse } from '@/apis/interviewApi'
import { getCurrentUser } from '@/apis/authApi'

// 全量岗位选项，用于 value => label 的映射
interface JobPositionOption {
    label: string
    value: string
}
const allJobPositionOptions: JobPositionOption[] = [
    { label: 'JAVA工程师', value: 'java' },
    { label: '前端工程师', value: 'frontend' },
    { label: '后端工程师', value: 'backend' },
    { label: '全栈工程师', value: 'fullstack' },
    { label: '测试工程师', value: 'qa' },
    { label: '运维工程师', value: 'ops' },
    { label: '数据工程师', value: 'data' },
    { label: '产品经理', value: 'pm' },
    { label: 'UI/UX设计师', value: 'design' },
    { label: '市场营销', value: 'marketing' },
    { label: '其他', value: 'other' }
]

const router = useRouter()
// 响应式数据
const interviewRecords = ref<InterviewVO[]>([])
const currentInterviewId = ref<string | null>(null)
const inputMessage = ref('')
const chatMessages = ref<Array<{ type: 'ai' | 'user'; content: string; timestamp: Date }>>([])

// 用户信息
const currentUser = ref<{ jobPosition: string[] } | null>(null)

// 侧边栏状态
const sidebarCollapsed = ref(false)

// 模态框相关
const showInterviewModal = ref(false)
const selectedJobPosition = ref('')

// 状态管理
const startingInterview = ref(false)
const endingInterview = ref(false)
const sending = ref(false)
const aiTyping = ref(false)
const isInterviewActive = ref(false)
const currentPage = ref('interview') // 当前页面，默认为面试页面;
const showUploadResumeModal = ref(false);
const showPreviewResumeModal = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadFileName = ref('');
const selectedFile = ref<File | null>(null);
const previewResumeUrl = ref('');
const currentPageNum = ref(1);
const totalPages = ref(1);
const selectedResumeId = ref<string | null>(null);

// 时间管理
const baseTime = ref<Date | null>(null)

// DOM 引用
const chatContainer = ref<HTMLElement>()

// 改变当前页面
const changeCurrentPage = (page: 'interview' | 'report') => {
    currentPage.value = page
}

// 计算属性：当前面试
const currentInterview = computed(() =>
    interviewRecords.value.find((r) => r.id === currentInterviewId.value)
)

// 计算属性：可选岗位列表，来自用户个人信息中的 jobPosition 数组
const selectablePositions = computed<JobPositionOption[]>(() => {
    if (!currentUser.value || !Array.isArray(currentUser.value.jobPosition)) {
        return []
    }
    return allJobPositionOptions.filter((opt) =>
        currentUser.value!.jobPosition.includes(opt.value)
    )
})

// 页面加载时，先拉用户信息，再拉面试记录
onMounted(async () => {
    await loadUserInfo()
    await loadInterviewRecords()
    loadResumes();

})

// 切换侧边栏状态
const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
}

// 从后端获取当前用户信息
const loadUserInfo = async () => {
    try {
        const response = await getCurrentUser()
        if (response.code === 0) {
            const raw = response.data.jobPosition
            let jobArr: string[] = []
            if (Array.isArray(raw)) {
                jobArr = raw as string[]
            } else if (typeof raw === 'string' && raw) {
                jobArr = [raw]
            }
            currentUser.value = { jobPosition: jobArr }
        } else {
            ElMessage.error(response.message || '获取用户信息失败')
        }
    } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
    }
}

// 拉取面试记录列表
const loadInterviewRecords = async () => {
    try {
        const response: BaseResponse<InterviewVO[]> = await interviewApi.getUserInterviewRecords()
        if (response.code === 0) {
            interviewRecords.value = response.data || []
        } else {
            ElMessage.error(response.message || '获取面试记录失败')
        }
    } catch (error) {
        console.error('获取面试记录失败:', error)
        ElMessage.error('获取面试记录失败')
    }
}

// 切换面试记录，加载聊天内容
const switchInterview = (record: InterviewVO) => {
    if (currentInterviewId.value === record.id) return
    currentInterviewId.value = record.id
    isInterviewActive.value = false
    loadInterviewMessages(record)
}

// 加载某条记录的聊天内容 
const loadInterviewMessages = (record: InterviewVO) => {
    chatMessages.value = []
    
    // 设置基准时间为面试创建时间
    baseTime.value = new Date(record.createTime)
    let currentTime = new Date(baseTime.value)
    
    const userReplies = record.userReplyList || []
    const aiReplies = record.aireplyList || []

    // 交替添加AI和用户的消息
    const maxLen = Math.max(userReplies.length, aiReplies.length)
    for (let i = 0; i < maxLen; i++) {
        if (aiReplies[i]) {
            chatMessages.value.push({ 
                type: 'ai', 
                content: aiReplies[i], 
                timestamp: new Date(currentTime) 
            })
            // AI消息后加1-2分钟
            currentTime.setMinutes(currentTime.getMinutes() + Math.floor(Math.random() * 2) + 1)
        }

        if (userReplies[i]) {
            chatMessages.value.push({ 
                type: 'user', 
                content: userReplies[i], 
                timestamp: new Date(currentTime) 
            })
            // 用户消息后加1-2分钟
            currentTime.setMinutes(currentTime.getMinutes() + Math.floor(Math.random() * 2) + 1)
        }
    }

    scrollToBottom()
}

// 发送用户消息
const sendMessage = async () => {
    if (!inputMessage.value.trim() || !isInterviewActive.value) return
    const content = inputMessage.value.trim()
    addMessage('user', content)
    inputMessage.value = ''

    try {
        sending.value = true
        aiTyping.value = true
        const response: BaseResponse<string> = await interviewApi.userReply(content)
        if (response.code === 0 && response.data) {
            // 延迟一下，模拟AI思考时间
            setTimeout(() => {
                aiTyping.value = false
                addMessage('ai', response.data)
            }, 1000)
        } else {
            aiTyping.value = false
            ElMessage.error(response.message || '发送失败')
        }
    } catch (error) {
        aiTyping.value = false
        console.error('发送消息失败:', error)
        ElMessage.error('发送消息失败')
    } finally {
        sending.value = false
    }
}

// 结束当前面试
const endCurrentInterview = async () => {
    try {
        endingInterview.value = true
        const response: BaseResponse<string> = await interviewApi.endInterview()

        if (response.code === 0) {
            isInterviewActive.value = false
            ElMessage.success('面试已结束')
            
            // 结束面试后，重新加载面试记录
            await loadInterviewRecords()
            
            // 如果有新的记录，自动切换到最新的记录查看
            if (interviewRecords.value.length > 0) {
                const latest = interviewRecords.value.sort((a, b) => 
                    new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
                )[0]
                
                // 切换到刚结束的面试记录
                switchInterview(latest)
            } else {
                // 如果还是没有记录，清空当前状态
                currentInterviewId.value = null
                chatMessages.value = []
            }
        } else {
            ElMessage.error(response.message || '结束面试失败')
        }
    } catch (error) {
        console.error('结束面试失败:', error)
        ElMessage.error('结束面试失败')
    } finally {
        endingInterview.value = false
    }
}

// 把新消息推到聊天列表，并滚动到底
const addMessage = (type: 'ai' | 'user', content: string) => {
    let timestamp: Date
    
    if (chatMessages.value.length > 0) {
        // 基于最后一条消息的时间加1-2分钟
        const lastMessage = chatMessages.value[chatMessages.value.length - 1]
        timestamp = new Date(lastMessage.timestamp)
        timestamp.setMinutes(timestamp.getMinutes() + Math.floor(Math.random() * 2) + 1)
    } else if (baseTime.value) {
        // 如果没有消息但有基准时间，使用基准时间
        timestamp = new Date(baseTime.value)
    } else {
        // 回退到当前时间
        timestamp = new Date()
    }
    
    chatMessages.value.push({ type, content, timestamp })
    scrollToBottom()
}

// 滚动到底
const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' })
        }
    })
}

// 显示"新建面试"弹框：只列出用户个人信息中已有的目标岗位
const showInterviewDialog = () => {
    if (!selectablePositions.value.length) {
        ElMessage.warning('请先在个人信息中设置目标岗位，再新建面试')
        return
    }
    selectedJobPosition.value = selectablePositions.value[0].value
    showInterviewModal.value = true
}

// 确认开始新面试，把选定的岗位 value 传给后端
const confirmStartInterview = async () => {
    if (!selectedJobPosition.value) {
        ElMessage.warning('请选择面试岗位')
        return
    }
    showInterviewModal.value = false
    await startNewInterview(selectedJobPosition.value)
}

// 开始面试
const startNewInterview = async (jobPosition?: string) => {
    try {
        startingInterview.value = true
        chatMessages.value = []
        currentInterviewId.value = null
        isInterviewActive.value = false
        const response: BaseResponse<string> = await interviewApi.startInterview(jobPosition)
        if (response.code === 0) {
            
            currentInterviewId.value = 'current-interview-' + Date.now()
            isInterviewActive.value = true
            chatMessages.value = []
            
            // 设置基准时间为当前时间
            baseTime.value = new Date()
            
            // 显示AI面试官开场白
            if (response.data) {
                addMessage('ai', response.data)
            }

            ElMessage.success('面试开始成功')
            
        } else {
            ElMessage.error(response.message || '开始面试失败')
        }
    } catch (error) {
        ElMessage.error('开始面试失败')
    } finally {
        startingInterview.value = false
    }
}

// 将后端的 record.name转换为中文
const getDisplayInterviewName = (rawName: string): string => {
    // 如果没有"面试"后缀，就直接返回
    if (!rawName.endsWith('面试')) {
        return rawName
    }
    // 去掉末尾"面试"，得到 value 部分
    const valueKey = rawName.slice(0, rawName.length - 2)
    // 在 allJobPositionOptions 里找到对应的 label
    const found = allJobPositionOptions.find((opt) => opt.value === valueKey)
    if (found) {
        return `${found.label}面试`
    }
    // 如果没找到，就原样返回
    return rawName
}

// 格式化时间 - 保持不变，已经是只显示小时和分钟
const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// 简历相关逻辑
// 简历mock数据
const resumes = ref<Array<{
    id: string;
    name: string;
    fileData: string; // 存储为base64
    createdAt: number;
}>>([]);
const showUploadModal = () => {
    showUploadResumeModal.value = true;
};

const beforeUpload = (file: File) => {
    // 验证文件类型
    if (file.type !== 'application/pdf') {
        message.error('只能上传PDF文件');
        return false;
    }
    
    // 验证文件大小
    if (file.size > 5 * 1024 * 1024) {
        message.error('文件大小不能超过5MB');
        return false;
    }
    
    selectedFile.value = file;
    uploadFileName.value = file.name;
    return false; // 阻止自动上传
};
// 使用LocalStorage模拟数据持久化
const RESUME_STORAGE_KEY = 'ai_interviewer_resumes';

// 保存简历到localStorage
const saveResumes = () => {
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resumes.value));
};
// 加载保存的简历
const loadResumes = () => {
    const saved = localStorage.getItem(RESUME_STORAGE_KEY);
    if (saved) {
        resumes.value = JSON.parse(saved);
    }
};
const handleUpload = async () => {
    if (!selectedFile.value) return;
    
    uploading.value = true;
    uploadProgress.value = 0;
    
    try {
        // 模拟上传进度
        const interval = setInterval(() => {
            uploadProgress.value += Math.random() * 10;
            if (uploadProgress.value >= 95) clearInterval(interval);
        }, 200);
        
        // 读取文件为base64
        const fileReader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
            fileReader.onload = (e) => resolve(e.target?.result as string);
            fileReader.onerror = reject;
            fileReader.readAsDataURL(selectedFile.value!);
        });
        
        clearInterval(interval);
        uploadProgress.value = 100;
        
        // 添加到简历列表
        const newResume = {
            id: Date.now().toString(),
            name: selectedFile.value.name.replace('.pdf', ''),
            fileData,
            createdAt: Date.now()
        };
        
        resumes.value.push(newResume);
        saveResumes();
        
        message.success('上传成功');
        showUploadResumeModal.value = false;
    } catch (error) {
        message.error('上传失败');
        console.error('上传出错:', error);
    } finally {
        uploading.value = false;
        selectedFile.value = null;
    }
};


const cancelUpload = () => {
    selectedFile.value = null;
    uploading.value = false;
    uploadProgress.value = 0;
};

const selectResume = (resume: any) => {
    selectedResumeId.value = resume.id;
};

const previewResume = async (resume: any) => {
    previewResumeUrl.value = resume.fileData;
    currentPageNum.value = 1;
    showPreviewResumeModal.value = true;
    
    // 获取PDF总页数
    try {
        const pdf = await VuePdfEmbed.getDocument(previewResumeUrl.value).promise;
        totalPages.value = pdf.numPages;
    } catch (error) {
        console.error('获取PDF信息失败:', error);
        totalPages.value = 1;
    }
};
</script>

<style scoped>
.container {
    width: 100%;
    height: 100vh;
    display: flex;
    background-color: #f7f8fc;
}

/* 侧边栏样式 */
.left {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    height: 100vh;
    background-color: #f3f4f6;
    padding: 20px;
    overflow-y: auto;
    z-index: 999;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}

.left.collapsed {
    width: 80px;
    padding: 20px 12px;
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.logo-title {
    display: flex;
    align-items: center;
    flex: 1;
}

.logo-only {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: url(@/assets/images/common/logo.png);
    background-size: cover;
    margin-right: 12px;
    flex-shrink: 0;
}

.collapsed .logo {
    margin-right: 0;
}

.collapse-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
}

.collapse-btn:hover {
    background-color: #e5ebf7;
    color: #1677FF;
}

.nav {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.add-interview-btn {
    box-sizing: border-box;
    background-color: #e5ebf7;
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border-radius: 12px;
    border: 0.5px solid rgba(0, 102, 255, 0.15);
    color: #0057ff;
    text-align: start;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
}

.collapsed .add-interview-btn {
    justify-content: center;
    padding: 0;
}

.nav-section {
    margin: 24px 0;
}

.section-title {
    display: flex;
    align-items: center;
    color: #666;
    margin-bottom: 12px;
    padding: 0 8px;
}

.collapsed .section-title {
    justify-content: center;
    padding: 0;
}

.section-title :deep(svg) {
    width: 14px;
    margin-right: 8px;
    color: #999;
}

.collapsed .section-title :deep(svg) {
    margin-right: 0;
}

.interview-list,
.resume-list {
    padding: 0 8px;
}

.interview-item,
.resume-item {
    padding: 10px 22px;
    margin-bottom: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    color: #333;
    transition: all 0.2s;
}

.interview-item:hover,
.resume-item:hover {
    background-color: #e8f0fe;
    color: #0057ff;
}

.interview-item.active {
    background: linear-gradient(135deg, #1677FF 0%, #4096ff 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
    transform: translateX(4px);
}

.collapsed-interview-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.collapsed-interview-item {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #e5ebf7;
    color: #1677FF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.collapsed-interview-item:hover {
    background-color: #1677FF;
    color: white;
    transform: scale(1.1);
}

.collapsed-interview-item.active {
    background: linear-gradient(135deg, #1677FF 0%, #4096ff 100%);
    color: white;
}

.empty-text {
    padding: 20px;
    text-align: center;
    color: #999;
    font-size: 12px;
}

.add-btn {
    color: #666 !important;
    padding: 0 4px !important;
    height: auto !important;
}

.add-btn:hover {
    background-color: #e5ebf7 !important;
}

.my-resume-title {
    justify-content: space-between;
}

.collapsed .my-resume-title {
    justify-content: center;
}

.go-to-home {
    width: 100%;
    height: 40px;
    border-radius: 20px;
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.collapsed .go-to-home {
    width: 40px;
    border-radius: 50%;
    align-self: center;
}

/* 主内容区域 */
.main-content {
    margin-left: 280px;
    flex: 1;
    height: 100vh;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
}

.main-content.sidebar-collapsed {
    margin-left: 80px;
}

.header-container {
    position: fixed;
    top: 0;
    left: 280px;
    right: 0;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f7f8fc;
    z-index: 1000;
    gap: 20px;
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.sidebar-collapsed .header-container {
    left: 80px;
}

.header-box {
    width: 200px;
    height: 40px;
    background-color: #ffffff;
    border-radius: 10px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.interview-status {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 20px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.status-active {
    color: #52c41a;
    display: flex;
    align-items: center;
    gap: 6px;
}

.status-history {
    color: #999;
    display: flex;
    align-items: center;
    gap: 6px;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
}

.status-active .status-dot {
    background: #52c41a;
    animation: pulse 2s infinite;
}

.status-history .status-dot {
    background: #999;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.interview-controls {
    display: flex;
    gap: 10px;
}

/* 聊天容器 */
.chat-container {
    flex: 1;
    margin-top: 60px;
    margin-bottom: 120px;
    overflow-y: auto;
    scroll-behavior: smooth;
    scrollbar-color: rgba(22, 119, 255, 0.2) transparent;
}

.chat-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 30px 20px;
}

.main-content.sidebar-collapsed .chat-content {
    max-width: 900px;
}

.main-content:not(.sidebar-collapsed) .chat-content {
    max-width: 800px;
}

.chat-bottom-spacer {
    height: 40px;
}

/* 空状态样式 */
.empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    background: linear-gradient(135deg, #f8faff 0%, #e6f4ff 100%);
    border-radius: 16px;
    border: 2px dashed #d0e7ff;
    margin: 40px 0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.empty-chat:hover {
    border-color: #1677FF;
    background: linear-gradient(135deg, #e6f4ff 0%, #d0e7ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(22, 119, 255, 0.15);
}

.empty-text {
    font-size: 20px;
    font-weight: 600;
    background: linear-gradient(to bottom right, #6168f2, #3e7ff5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
    margin: 0;
}

.empty-icon {
    font-size: 68px;
    margin-bottom: 16px;
    filter: grayscale(0.3);
    animation: float 3s ease-in-out infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }
}

/* 聊天泡泡样式 */
.chat-bubble {
    max-width: 75%;
    margin-bottom: 24px;
    padding: 10px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    position: relative;
    transition: all 0.3s ease;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.chat-bubble:hover {
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.chat-bubble.ai {
    margin-right: auto;
    background: #fff;
    border-left: 4px solid #1677FF;
}

.chat-bubble.user {
    margin-left: auto;
    background: #e6f4ff;
    border-right: 4px solid #1677FF;
}

.chat-bubble.user .chat-header {
    color: #1677FF !important;
}

.chat-bubble.user .chat-content {
    color: #333;
}

.chat-bubble.user .chat-time {
    color: #999 !important;
}

.chat-bubble.typing {
    opacity: 0.8;
    background: #f0f7ff;
}

.chat-header {
    font-weight: 600;
    color: #1677FF;
    margin-bottom: 12px;
    font-size: 13px;
}

.chat-content {
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
    font-size: 14px;
    margin-bottom: 8px;
}

.chat-time {
    position: absolute;
    bottom: 8px;
    right: 16px;
    font-size: 10px;
    color: #999;
    font-weight: 500;
}

/* 输入中动画 */
.typing-indicator {
    display: inline-flex;
    gap: 4px;
    margin-right: 8px;
    align-items: center;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1677FF 0%, #4096ff 100%);
    animation: typing 1.4s infinite ease-in-out;
    box-shadow: 0 2px 4px rgba(22, 119, 255, 0.3);
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {

    0%,
    60%,
    100% {
        transform: translateY(0) scale(1);
        opacity: 0.4;
    }

    30% {
        transform: translateY(-12px) scale(1.2);
        opacity: 1;
    }
}

/* 固定输入框 */
.footer-container {
    position: fixed;
    bottom: 0;
    left: 280px;
    right: 0;
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(180deg, rgba(247, 248, 252, 0.8) 0%, #f7f8fc 100%);
    backdrop-filter: blur(10px);
    z-index: 1000;
    transition: all 0.3s ease;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.sidebar-collapsed .footer-container {
    left: 80px;
}

.chat-input-box {
    width: 800px;
    margin: 0 auto;
}

.input-container {
    display: flex;
    gap: 16px;
    align-items: flex-end;
    width: 100%;
    position: relative;
}

.message-input {
    flex: 1;
    padding: 14px 52px 14px 20px;
    border: 1px solid #e0e7ff;
    border-radius: 12px;
    resize: none;
    font-size: 14px;
    line-height: 1.5;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: #ffffff;
    box-shadow: 0 2px 8px -2px rgba(22, 119, 255, 0.08);
}

.message-input:disabled {
    background-color: #f5f4f6;
    cursor: not-allowed;
}

.message-input::placeholder {
    color: #94a3b8;
    font-weight: 300;
}

.message-input:focus {
    outline: none;
    border-color: #1677ff;
    box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.1),
        0 4px 20px -4px rgba(22, 119, 255, 0.15);
}

.send-button {
    position: absolute;
    right: 12px;
    bottom: 12px;
    height: 40px;
    padding: 0 24px;
    border-radius: 8px;
    font-weight: 500;
    background: #1677ff;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 6px -2px rgba(22, 119, 255, 0.4);
}

.send-button:hover:not(:disabled) {
    background: #4096ff !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px -2px rgba(22, 119, 255, 0.4);
}

.send-button:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px -2px rgba(22, 119, 255, 0.4);
}

.input-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #999;
    text-align: center;
}

/* 面试模态框样式 */
.interview-modal-content {
    padding: 20px 0;
}

.modal-description {
    margin-bottom: 20px;
    color: #666;
    font-size: 14px;
    text-align: center;
}

.job-position-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
}

.selector-label {
    color: #333;
    font-weight: 500;
    white-space: nowrap;
}

.job-select {
    min-width: 140px;
    flex: 1;
    max-width: 200px;
}

/* 模态框按钮调整 */
:deep(.ant-modal-footer) {
    text-align: right;
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
}

:deep(.ant-modal-footer .ant-btn) {
    margin-left: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .left {
        width: 280px;
    }

    .left.collapsed {
        width: 60px;
    }

    .main-content {
        margin-left: 280px;
    }

    .main-content.sidebar-collapsed {
        margin-left: 60px;
    }

    .header-container {
        left: 280px;
    }

    .sidebar-collapsed .header-container {
        left: 60px;
    }

    .footer-container {
        left: 280px;
    }

    .sidebar-collapsed .footer-container {
        left: 60px;
    }

    .chat-input-box {
        width: 95%;
        margin: 0 auto;
    }

    .message-input {
        padding-right: 60px;
    }

    .send-button {
        padding: 0 18px;
    }

    .chat-content {
        width: 95%;
        padding: 20px 15px;
    }
}
/* 简历部分css*/
.resume-upload-container {
    padding: 20px;
}

.uploading-progress {
    margin-top: 20px;
    text-align: center;
}

.upload-actions {
    margin-top: 20px;
    text-align: right;
}

.resume-item {
    padding: 8px 12px;
    margin: 4px 0;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;
}

.resume-item:hover {
    background-color: #f0f0f0;
}

.resume-item.active {
    background-color: #e6f7ff;
    color: #1890ff;
}

.preview-btn {
    color: #666;
}

.preview-btn:hover {
    color: #1890ff;
}

.resume-preview-container {
    display: flex;
    flex-direction: column;
    height: 700px;
    width: 100%;
}

.preview-toolbar {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;
}

.pdf-viewer-container {
    flex: 1;
    overflow: auto;
    border: 1px solid #f0f0f0;
}
.pdf-viewer-container {
    transform: scale(0.8); /* 缩小到80% */
    transform-origin: top left;
    width: 125%; /* 反向调整宽度以补偿缩放 */
    height: 125%; /* 反向调整高度以补偿缩放 */
}
/* 调整PDF预览样式 */
.resume-preview-modal .ant-modal-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.pdf-viewer {
    width: 100%;
    height: 100%;
}
</style>