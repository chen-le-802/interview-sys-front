<template>
    <div class="container">
        <div class="left">
            <div class="logo-title">
                <div class="logo"></div>
                <p style="font-size: 16px; font-weight: 600;">AI面试官</p>
            </div>
            <div class="nav">
                <a-button class="add-interview-btn" @click="startNewInterview" :loading="startingInterview">
                    <PlusOutlined />新建面试
                </a-button>

                <!-- 面试记录 -->
                <div class="nav-section">
                    <div class="section-title">
                        <ClockCircleOutlined />
                        <span>面试记录</span>
                    </div>
                    <div class="interview-list">
                        <div v-for="record in interviewRecords" :key="record.id" class="interview-item"
                            :class="{ active: currentInterviewId === record.id }" @click="switchInterview(record)">
                            {{ record.name || `面试记录-${record.id}` }}
                        </div>
                        <div v-if="interviewRecords.length === 0" class="empty-text">
                            暂无面试记录
                        </div>
                    </div>
                </div>

                <!-- 我的简历 -->
                <div class="nav-section">
                    <div class="section-title my-resume-title">
                        <div>
                            <SolutionOutlined />
                            <span>我的简历</span>
                        </div>
                        <a-button type="text" class="add-btn">
                            <PlusOutlined style="margin-left: 5px;" />
                        </a-button>
                    </div>
                    <div class="resume-list">
                        <div class="resume-item">张三 - 市场营销（demo）</div>
                        <div class="resume-item">李四 - 后端技术开发（demo）</div>
                    </div>
                </div>
            </div>
            <a-button class="go-to-home" @click="$router.push('/')">退出</a-button>
        </div>

        <div class="right">
            <div class="header-container">
                <div class="header-box">
                    <a-button type="text" style="background-color: #e6f4ff;color:#1677FF">面试记录</a-button>
                    <a-button type="text" style="background-color: #f5f5f5;">评估报告</a-button>
                </div>

                <!-- 面试状态提示 -->
                <div class="interview-status" v-if="currentInterviewId">
                    <span v-if="isInterviewActive" class="status-active">
                        <span class="status-dot"></span>
                        正在进行面试
                    </span>
                    <span v-else class="status-history">
                        <span class="status-dot"></span>
                        查看历史记录
                    </span>
                </div>

                <div class="interview-controls" v-if="isInterviewActive">
                    <a-button danger @click="endCurrentInterview" :loading="endingInterview">
                        结束面试
                    </a-button>
                </div>
            </div>

            <div class="content">
                <div class="chat-record" ref="chatContainer">
                    <div v-if="chatMessages.length === 0" class="empty-chat">
                        <div class="empty-icon">💬</div>
                        <p class="empty-text">点击"新建面试"开始你的AI面试体验</p>
                    </div>

                    <div v-for="(message, index) in chatMessages" :key="index" class="chat-bubble"
                        :class="message.type">
                        <div class="chat-header">
                            {{ message.type === 'ai' ? 'AI面试官' : '面试者' }}
                        </div>
                        <div class="chat-content">
                            {{ message.content }}
                        </div>
                        <div class="chat-time">
                            {{ formatTime(message.timestamp) }}
                        </div>
                    </div>

                    <!-- AI正在输入提示 -->
                    <div v-if="aiTyping" class="chat-bubble ai typing">
                        <div class="chat-header">AI面试官</div>
                        <div class="chat-content">
                            <div class="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            正在思考中...
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-container">
                <div class="chat-input-box">
                    <div class="input-container">
                        <textarea v-model="inputMessage" placeholder="请输入你的回答..." rows="3" class="message-input"
                            :disabled="!isInterviewActive || sending" @keydown.ctrl.enter="sendMessage"></textarea>
                        <a-button type="primary" class="send-button" @click="sendMessage"
                            :disabled="!inputMessage.trim() || !isInterviewActive" :loading="sending">
                            发送
                        </a-button>
                    </div>
                    <div class="input-tip" v-if="isInterviewActive">
                        💡按 Ctrl + Enter 快速发送
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PlusOutlined, ClockCircleOutlined, SolutionOutlined } from "@ant-design/icons-vue"
import { interviewApi, type InterviewVO, type BaseResponse } from '@/apis/interviewApi'

const router = useRouter()

// 响应式数据
const interviewRecords = ref<InterviewVO[]>([])
const currentInterviewId = ref<number | null>(null)
const inputMessage = ref('')
const chatMessages = ref<Array<{
    type: 'ai' | 'user'
    content: string
    timestamp: Date
}>>([])

// 状态管理
const startingInterview = ref(false)
const endingInterview = ref(false)
const sending = ref(false)
const aiTyping = ref(false)
const isInterviewActive = ref(false)

// DOM引用
const chatContainer = ref<HTMLElement>()

// 计算属性
const currentInterview = computed(() => {
    return interviewRecords.value.find(record => record.id === currentInterviewId.value)
})

// 页面加载时获取数据
onMounted(async () => {
    await loadInterviewRecords()
})

// 获取面试记录列表
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

// 开始新面试
const startNewInterview = async () => {
    try {
        startingInterview.value = true

        // 清空当前聊天记录，开始全新面试
        chatMessages.value = []
        currentInterviewId.value = null
        isInterviewActive.value = false

        const response: BaseResponse<string> = await interviewApi.startInterview()

        if (response.code === 0) {
            // 重新加载面试记录
            await loadInterviewRecords()

            // 设置当前面试为最新的一个
            if (interviewRecords.value.length > 0) {
                const latestInterview = interviewRecords.value[0]
                currentInterviewId.value = latestInterview.id
                isInterviewActive.value = true

                // 新面试开始时只显示AI的开场白，不加载历史记录
                chatMessages.value = []

                // 添加AI的开场白
                if (response.data) {
                    addMessage('ai', response.data)
                }
            }

        } else {
            ElMessage.error(response.message || '开始面试失败')
        }
    } catch (error) {
        console.error('开始面试失败:', error)
        ElMessage.error('开始面试失败')
    } finally {
        startingInterview.value = false
    }
}

// 切换面试记录
const switchInterview = (record: InterviewVO) => {
    if (currentInterviewId.value === record.id) return // 如果已经是当前面试，不重复切换

    currentInterviewId.value = record.id
    isInterviewActive.value = false // 历史记录不能继续对话
    loadInterviewMessages(record)
}

// 加载面试对话消息
const loadInterviewMessages = (record: InterviewVO) => {
    chatMessages.value = []

    const userReplies = record.userReplyList || []
    const aiReplies = record.aireplyList || []

    // 交替添加AI和用户的消息
    const maxLength = Math.max(userReplies.length, aiReplies.length)

    for (let i = 0; i < maxLength; i++) {
        if (aiReplies[i]) {
            chatMessages.value.push({
                type: 'ai',
                content: aiReplies[i],
                timestamp: new Date()
            })
        }

        if (userReplies[i]) {
            chatMessages.value.push({
                type: 'user',
                content: userReplies[i],
                timestamp: new Date()
            })
        }
    }

    scrollToBottom()
}

// 发送消息
const sendMessage = async () => {
    if (!inputMessage.value.trim() || !isInterviewActive.value) return

    const messageContent = inputMessage.value.trim()
    addMessage('user', messageContent)
    inputMessage.value = ''

    try {
        sending.value = true
        aiTyping.value = true

        const response: BaseResponse<string> = await interviewApi.userReply(messageContent)

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

            // 重新加载面试记录
            await loadInterviewRecords()
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

// 添加消息到聊天记录
const addMessage = (type: 'ai' | 'user', content: string) => {
    chatMessages.value.push({
        type,
        content,
        timestamp: new Date()
    })
    scrollToBottom()
}

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    })
}

// 格式化时间
const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.container {
    width: 100%;
    height: 100vh;
    display: flex;
}

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
}

.right {
    margin-left: 280px;
    flex: 1;
    height: 100vh;
    background-color: #f7f8fc;
    display: flex;
    flex-direction: column;
}

.logo-title {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: url(@/assets/images/common/logo.png);
    background-size: cover;
    margin-right: 12px;
}

.add-interview-btn {
    box-sizing: border-box;
    background-color: #e5ebf7;
    width: 100%;
    height: 40px;
    padding-left: 12px;
    border-radius: 12px;
    border: .5px solid rgba(0, 102, 255, .15);
    color: #0057ff;
    text-align: start;
    font-weight: 600;
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

.section-title :deep(svg) {
    width: 14px;
    margin-right: 8px;
    color: #999;
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

.go-to-home {
    width: 240px;
    height: 40px;
    border-radius: 20px;
    position: absolute;
    bottom: 5px;
}

.header-container {
    position: fixed;
    top: 0;
    left: 280px;
    right: 0;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f7f8fc;
    z-index: 1000;
    gap: 20px;
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

.footer-container {
    position: fixed;
    bottom: 0;
    left: 280px;
    right: 0;
    height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f7f8fc;
    z-index: 1000;
}

.header-box {
    width: 200px;
    height: 50px;
    background-color: #ffffff;
    border-radius: 10px;
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.interview-controls {
    display: flex;
    gap: 10px;
}

.content {
    margin: 0 auto;
    margin-top: 50px;
    padding: 20px;
    overflow: auto;
    height: calc(100vh - 200px);
    width: 800px;
}

/* 聊天记录区域样式 */
.chat-record {
    padding: 30px 20px 20px 20px;
    flex: 1;
    overflow-y: auto;
    max-height: calc(100vh - 250px);
    background: transparent;
    /* 自定义滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: rgba(22, 119, 255, 0.2) transparent;
}

/* Webkit浏览器滚动条样式 */
.chat-record::-webkit-scrollbar {
    width: 6px;
}

.chat-record::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
}

.chat-record::-webkit-scrollbar-thumb {
    background: rgba(22, 119, 255, 0.15);
    border-radius: 3px;
    transition: all 0.3s ease;
}

.chat-record:hover::-webkit-scrollbar-thumb {
    background: rgba(22, 119, 255, 0.3);
}

.chat-record::-webkit-scrollbar-thumb:hover {
    background: rgba(22, 119, 255, 0.5);
}

.chat-record::-webkit-scrollbar-corner {
    background: transparent;
}

.empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    background: linear-gradient(135deg, #f8faff 0%, #e6f4ff 100%);
    border-radius: 16px;
    border: 2px dashed #d0e7ff;
    margin: 20px 0;
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
    text-shadow: none;
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
    padding: 20px;
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
    background: #E6F4FF;
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

/* 输入框区域样式 */
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
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.message-input::placeholder {
    color: #94a3b8;
    font-weight: 300;
}

.message-input:focus {
    outline: none;
    border-color: #1677FF;
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
    background: #1677FF;
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

/* 响应式调整 */
@media (max-width: 768px) {
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

    .content {
        width: 95%;
    }
}
</style>