<template>
    <div class="message">
        <el-dropdown trigger="click" placement="bottom-end" @visible-change="handleDropdownChange"
            popper-class="notification-dropdown">
            <div class="message-bell" @click="handleBellClick">
                <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
                    <div class="bell-icon-wrapper">
                        <el-icon :size="18">
                            <Bell />
                        </el-icon>
                    </div>
                </el-badge>
            </div>

            <template #dropdown>
                <el-dropdown-menu class="notification-panel">
                    <div class="panel-header">
                        <span class="title">通知</span>
                        <el-button link size="small" @click="markAllAsRead" :disabled="unreadCount === 0 || marking">
                            {{ marking ? '标记中...' : '全部已读' }}
                        </el-button>
                    </div>

                    <div class="panel-content">
                        <div v-loading="loading">
                            <div class="tabs">
                                <div class="tab-item" :class="{ active: activeTab === 'comment' }"
                                    @click="switchTab('comment')">
                                    评论回复
                                    <span class="count" v-if="commentUnreadCount > 0">({{ commentUnreadCount }})</span>
                                </div>
                                <div class="tab-item" :class="{ active: activeTab === 'system' }"
                                    @click="switchTab('system')">
                                    系统通知
                                    <span class="count" v-if="systemUnreadCount > 0">({{ systemUnreadCount }})</span>
                                </div>
                            </div>

                            <div class="notification-list">
                                <div v-if="displayNotifications.length === 0" class="empty-state">
                                    <el-icon style="font-size: 24px; color: #d9d9d9; margin-bottom: 8px;">
                                        <Bell />
                                    </el-icon>
                                    <div class="empty-text">暂无通知</div>
                                </div>

                                <div v-else v-for="item in displayNotifications.slice(0, 5)" :key="item.id"
                                    class="notification-item" :class="{ unread: !item.read, jumping: item.jumping }"
                                    @click="handleNotificationClick(item)">
                                    <div class="item-content">
                                        <div class="item-title">
                                            <span v-if="!item.read" class="unread-dot">●</span>
                                            {{ truncateText(item.title, 30) }}
                                        </div>
                                        <div class="item-desc">
                                            {{ truncateText(item.content, 50) }}
                                        </div>
                                        <div class="item-time">
                                            {{ formatRelativeTime(item.time) }}
                                        </div>
                                        <!-- 跳转状态提示 -->
                                        <div v-if="item.jumping" class="jumping-indicator">
                                            <el-icon class="is-loading" size="12">
                                                <Loading />
                                            </el-icon>
                                            <span>跳转中...</span>
                                        </div>
                                    </div>
                                    <div class="item-actions">
                                        <el-button link size="small" @click.stop="markAsRead(item.id)" v-if="!item.read"
                                            :loading="markingIds.includes(item.id)">
                                            标记已读
                                        </el-button>
                                    </div>
                                </div>
                            </div>

                            <div class="panel-footer" v-if="displayNotifications.length > 0">
                                <el-button link @click="goToNotificationPage">
                                    查看全部通知
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Bell, Loading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// API函数变量
let getNotifications: any, getUnreadCount: any, apiMarkAsRead: any, getQuestionByCommentId: any

// 初始化API函数
const initAPI = async () => {
    try {
        const commentApi = await import('@/apis/commentApi')
        getNotifications = commentApi.getNotifications
        getUnreadCount = commentApi.getUnreadCount
        apiMarkAsRead = commentApi.markAsRead
        getQuestionByCommentId = commentApi.getQuestionByCommentId
    } catch (error) {
        // Mock函数
        getNotifications = () => Promise.resolve({ code: 0, data: [] })
        getUnreadCount = () => Promise.resolve({ code: 0, data: 0 })
        apiMarkAsRead = () => Promise.resolve({ code: 0 })
        getQuestionByCommentId = () => Promise.resolve({ code: 0, data: null })
    }
}

interface Notification {
    id: string
    type: 'comment' | 'system'
    read: boolean
    title: string
    content: string
    time: string
    jumping?: boolean // 跳转状态
    originalData?: any
}

// 响应式数据
const activeTab = ref<'comment' | 'system'>('comment')
const notifications = ref<Notification[]>([])
const systemNotifications = ref<Notification[]>([])
const loading = ref(false)
const marking = ref(false)
const markingIds = ref<string[]>([])
const pollingTimer = ref<number | null>(null)

const router = useRouter()

// 计算属性
const commentUnreadCount = computed(() => {
    return notifications.value.filter(item => !item.read).length
})

const systemUnreadCount = computed(() => {
    return systemNotifications.value.filter(item => !item.read).length
})

const unreadCount = computed(() => {
    return commentUnreadCount.value + systemUnreadCount.value
})

const displayNotifications = computed(() => {
    return activeTab.value === 'comment'
        ? notifications.value
        : systemNotifications.value
})

// 初始化Mock通知数据
const initMockNotifications = () => {
    systemNotifications.value = [
        {
            id: 'sys-1',
            type: 'system',
            read: false,
            title: '新增50道大厂真题',
            content: '系统已更新最新面试题库，快来刷题吧！',
            time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            jumping: false
        },
        {
            id: 'sys-2',
            type: 'system',
            read: false,
            title: '学习提醒',
            content: '你有3个收藏题目待复习',
            time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            jumping: false
        }
    ]
}

// 获取通知数据
const fetchNotifications = async () => {
    loading.value = true
    try {
        if (!getNotifications) {
            await initAPI()
        }

        const response = await getNotifications()
        if (response.code === 0 && response.data?.length > 0) {
            // 如果有真实数据，转换格式
            notifications.value = response.data.map((item: any) => ({
                id: item.id,
                type: 'comment',
                read: item.isRead === 1,
                title: `${item.senderName} 回复了你的评论`,
                content: item.replyContent,
                time: new Date(item.createTime).toISOString(),
                jumping: false,
                originalData: item
            }))
        } else {
            // 使用Mock数据
            initMockNotifications()
        }
    } catch (error) {
        initMockNotifications()
    } finally {
        loading.value = false
    }
}

// 通知相关方法
const handleDropdownChange = (visible: boolean) => {
    if (visible) {
        fetchNotifications()
    }
}

const handleBellClick = () => {
    // 点击铃铛的处理逻辑
}

const switchTab = (tab: 'comment' | 'system') => {
    activeTab.value = tab
}

const markAsRead = async (id: string) => {
    markingIds.value.push(id)
    try {
        if (!apiMarkAsRead) {
            await initAPI()
        }

        if (activeTab.value === 'comment') {
            const notification = notifications.value.find(item => item.id === id)
            if (notification?.originalData) {
                const response = await apiMarkAsRead(notification.originalData.id)
                if (response.code === 0) {
                    notification.read = true
                    notifications.value = [...notifications.value]
                    ElMessage.success('已标记为已读')
                } else {
                    ElMessage.error('标记已读失败')
                }
            } else {
                // Mock数据直接更新
                const notification = notifications.value.find(item => item.id === id)
                if (notification) {
                    notification.read = true
                    notifications.value = [...notifications.value]
                    ElMessage.success('已标记为已读')
                }
            }
        } else {
            const notification = systemNotifications.value.find(item => item.id === id)
            if (notification) {
                notification.read = true
                systemNotifications.value = [...systemNotifications.value]
                ElMessage.success('已标记为已读')
            }
        }
    } catch (error) {
        ElMessage.error('标记已读失败')
    } finally {
        markingIds.value = markingIds.value.filter(markingId => markingId !== id)
    }
}

const markAllAsRead = async () => {
    marking.value = true
    try {
        if (!apiMarkAsRead) {
            await initAPI()
        }

        if (activeTab.value === 'comment') {
            const unreadNotifications = notifications.value.filter(item => !item.read)

            if (unreadNotifications.length === 0) {
                ElMessage.info('没有未读的评论通知')
                return
            }

            try {
                const promises = unreadNotifications.map(item =>
                    item.originalData ? apiMarkAsRead(item.originalData.id) : Promise.resolve()
                )
                await Promise.all(promises)
            } catch (error) {
                console.warn('API调用失败，使用本地更新')
            }

            notifications.value = notifications.value.map(item => ({
                ...item,
                read: true
            }))

            ElMessage.success('已全部标记为已读')
        } else {
            systemNotifications.value = systemNotifications.value.map(item => ({
                ...item,
                read: true
            }))
            ElMessage.success('已全部标记为已读')
        }
    } catch (error) {
        ElMessage.error('标记已读失败')
    } finally {
        marking.value = false
    }
}

const handleNotificationClick = async (item: Notification) => {
    if (!item.read) {
        await markAsRead(item.id)
    }

    if (item.originalData && item.originalData.commentId) {
        try {
            if (!getQuestionByCommentId) {
                await initAPI()
            }

            // 设置跳转状态
            item.jumping = true

            const response = await getQuestionByCommentId(item.originalData.commentId)

            if (response.code === 0 && response.data) {
                const questionData = response.data

                // 跳转到题目详情页面，带上评论定位参数
                router.push({
                    path: `/question/${questionData.id}`,
                    query: {
                        commentId: item.originalData.commentId,
                        highlightReply: item.originalData.replyId,
                        fromNotification: '1'
                    }
                })

                ElMessage.success('正在跳转到题目详情页面...')
            } else {
                ElMessage.warning('无法找到对应的题目')
                router.push('/banks')
            }
        } catch (error) {
            console.error('跳转失败:', error)
            ElMessage.error('跳转失败，请稍后重试')
            router.push('/banks')
        } finally {
            // 重置跳转状态
            setTimeout(() => {
                item.jumping = false
            }, 1000)
        }
    }
}

const goToNotificationPage = () => {
    router.push('/notifications')
}

const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatRelativeTime = (time: string): string => {
    return dayjs(time).fromNow()
}

// 轮询获取未读通知数量
const startPolling = () => {
    pollingTimer.value = window.setInterval(async () => {
        try {
            if (!getUnreadCount) {
                await initAPI()
            }

            await getUnreadCount()
            if (unreadCount.value > 0) {
                await fetchNotifications()
            }
        } catch (error) {
            console.error('轮询获取通知失败:', error)
        }
    }, 30000) // 每30秒轮询一次
}

const stopPolling = () => {
    if (pollingTimer.value) {
        clearInterval(pollingTimer.value)
        pollingTimer.value = null
    }
}

onMounted(async () => {
    await initAPI()
    fetchNotifications()
    startPolling()
})

onUnmounted(() => {
    stopPolling()
})

// 暴露未读数量给父组件
defineExpose({
    unreadCount,
    refresh: fetchNotifications
})
</script>

<style scoped>
.message {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 56px;
    margin: 0 10px;
}

.message-bell {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.bell-icon-wrapper {
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.bell-icon-wrapper:hover {
    background-color: #f5f5f5;
}

/* 通知面板样式 */
.notification-panel {
    width: 400px;
    max-height: 500px;
    padding: 0;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
}

.panel-header .title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
}

.panel-content {
    max-height: 400px;
    overflow-y: auto;
}

.tabs {
    display: flex;
    border-bottom: 1px solid #f0f0f0;
}

.tab-item {
    flex: 1;
    padding: 12px 16px;
    text-align: center;
    color: #666;
    cursor: pointer;
    transition: all 0.3s;
    border-bottom: 2px solid transparent;
}

.tab-item:hover {
    color: #3760f7;
    background-color: #fafafa;
}

.tab-item.active {
    color: #3760f7;
    border-bottom-color: #3760f7;
}

.tab-item .count {
    font-size: 12px;
    color: #ff4d4f;
}

.notification-list {
    max-height: 300px;
    overflow-y: auto;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #999;
}

.empty-text {
    font-size: 14px;
}

.notification-item {
    display: flex;
    align-items: flex-start;
    padding: 12px 16px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
}

.notification-item:hover {
    background-color: #fafafa;
}

.notification-item.unread {
    background-color: #f6fbff;
}

.notification-item.jumping {
    background-color: #f0f9ff;
    cursor: wait;
}

.item-content {
    flex: 1;
    min-width: 0;
}

.item-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
}

.unread-dot {
    color: #ff4d4f;
    margin-right: 6px;
    font-size: 12px;
}

.item-desc {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
    margin-bottom: 4px;
    word-break: break-all;
}

.item-time {
    font-size: 12px;
    color: #999;
}

.item-actions {
    margin-left: 8px;
    flex-shrink: 0;
}

.panel-footer {
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;
    text-align: center;
}

/* 跳转状态指示器 */
.jumping-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    color: #3760f7;
    font-size: 12px;
}

/* 自定义滚动条 */
.notification-list::-webkit-scrollbar,
.panel-content::-webkit-scrollbar {
    width: 6px;
}

.notification-list::-webkit-scrollbar-track,
.panel-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb,
.panel-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover,
.panel-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>

<style>
/* 全局样式，覆盖 Element Plus 的下拉菜单样式 */
.notification-dropdown {
    padding: 0 !important;
}

.notification-dropdown .el-dropdown-menu {
    padding: 0 !important;
    min-width: 400px !important;
}
</style>