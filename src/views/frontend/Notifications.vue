<template>
  <div class="notifications-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <el-button @click="goBack" :icon="ArrowLeft" circle class="back-button" />
          <h1 class="page-title">我的通知</h1>
        </div>
        <div class="header-actions">
          <el-button type="primary" plain @click="markAllAsRead" :disabled="totalUnread === 0 || marking"
            :loading="marking">
            <el-icon>
              <Check />
            </el-icon>
            全部已读
          </el-button>
        </div>
      </div>

      <div class="notification-container">
        <div class="tabs-wrapper">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="评论互动" name="comment">
              <template #label>
                <div class="tab-label">
                  评论互动
                  <el-badge :value="commentUnreadCount" :hidden="commentUnreadCount === 0" class="tab-badge" />
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="系统通知" name="system">
              <template #label>
                <div class="tab-label">
                  系统通知
                  <el-badge :value="systemUnreadCount" :hidden="systemUnreadCount === 0" class="tab-badge" />
                </div>
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="content-area">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-wrapper">
            <el-icon class="is-loading" size="32">
              <Loading />
            </el-icon>
            <p>加载中...</p>
          </div>

          <!-- 空状态 -->
          <el-empty v-else-if="filteredTotal === 0" description="暂无通知" class="empty-state">
            <template #image>
              <el-icon size="64" color="#d9d9d9">
                <Bell />
              </el-icon>
            </template>
          </el-empty>

          <!-- 通知列表 -->
          <div v-else class="notification-list">
            <div v-for="item in pagedNotifications" :key="item.id" class="notification-card"
              :class="{ 'is-unread': !item.read, 'is-jumping': item.jumping }" @click="handleNotificationClick(item)">

              <div class="card-content">
                <div class="notification-avatar">
                  <el-avatar :size="40" :src="item.avatar">
                    <el-icon>
                      <Bell />
                    </el-icon>
                  </el-avatar>
                  <span v-if="!item.read" class="unread-indicator"></span>
                </div>

                <div class="notification-body">
                  <div class="notification-header">
                    <h3 class="notification-title">{{ item.title }}</h3>
                    <span class="notification-time">{{ formatTime(item.time) }}</span>
                  </div>

                  <div class="notification-content">
                    <p v-html="formatCommentContent(item.content)"
                      :class="{ 'is-collapsed': item.expandable && !item.expanded }"></p>
                    <el-button v-if="item.expandable" type="text" size="small" @click.stop="toggleExpand(item.id)">
                      {{ item.expanded ? '收起' : '展开' }}
                    </el-button>
                  </div>

                  <!-- 跳转状态提示 -->
                  <div v-if="item.jumping" class="jumping-indicator">
                    <el-icon class="is-loading" size="14">
                      <Loading />
                    </el-icon>
                    <span>正在跳转到题目详情...</span>
                  </div>

                  <!-- 评论通知的查看提示 -->
                  <div v-if="item.type === 'comment'" class="view-hint">
                    <el-icon size="12">
                      <ArrowRight />
                    </el-icon>
                    <span>点击查看题目详情</span>
                  </div>
                </div>
              </div>

              <div class="card-actions" @click.stop>
                <el-button v-if="!item.read" link size="small" @click="markAsRead(item.id)"
                  :loading="markingIds.includes(item.id)">
                  标记已读
                </el-button>
                <el-button v-if="item.read && !item.important && activeTab === 'system'" link size="small"
                  @click="deleteNotification(item.id)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="filteredTotal > 0">
            <div class="total-info">
              共 {{ filteredTotal }} 条通知
              <span v-if="totalUnread > 0" class="unread-info">
                ，{{ totalUnread }} 条未读
              </span>
            </div>
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="filteredTotal"
              :page-sizes="[10, 20, 30, 50]" layout="sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Check,
  Bell,
  Loading,
  Delete,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { getNotifications, getUnreadCount, markAsRead as apiMarkAsRead, getQuestionByCommentId, type CommentNotification } from '@/apis/commentApi'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface Notification {
  id: string
  type: 'comment' | 'system'
  read: boolean
  title: string
  content: string
  avatar: string
  time: string
  important: boolean
  link?: string
  expandable?: boolean
  expanded?: boolean
  jumping?: boolean // 跳转状态
  originalData?: CommentNotification
}

const router = useRouter()

// 状态管理
const activeTab = ref<'comment' | 'system'>('comment')
const notifications = ref<Notification[]>([])
const systemNotifications = ref<Notification[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const marking = ref(false)
const markingIds = ref<string[]>([])

// 生成系统通知的Mock数据
const generateSystemNotifications = (): Notification[] => {
  return [
    {
      id: 'system-1',
      type: 'system',
      read: false,
      title: '关于战略升级及邀请有赏佣金调整的重要公告',
      content: '亲爱的面试斩伙伴，近期我们上线了[专项练习]、[解析面经]、[AI大模型题库]、[AI实战项目]，并将继续深耕，同时对邀请有赏规则作出重要调整。为了让更多朋友受益，我们决定将邀请有赏的佣金从30%调整为15%。',
      avatar: '',
      time: '2023-04-24T20:31:00Z',
      important: true,
      expandable: true,
      expanded: false,
      jumping: false,
      link: '#'
    },
    {
      id: 'system-2',
      type: 'system',
      read: false,
      title: '系统维护通知',
      content: '系统将于2025-05-01 02:00至04:00进行例行维护，期间服务将短暂不可用，请提前安排学习时间。',
      avatar: '',
      time: '2023-04-20T10:15:00Z',
      important: false,
      expandable: false,
      expanded: false,
      jumping: false
    },
    {
      id: 'system-3',
      type: 'system',
      read: false,
      title: '新功能上线 - AI面试官',
      content: '我们新增了AI面试官功能，提供1对1智能面试体验，快来试试吧！',
      avatar: '',
      time: '2023-04-18T08:00:00Z',
      important: true,
      expandable: false,
      expanded: false,
      jumping: false
    }
  ]
}

// 转换评论通知数据格式
const transformCommentNotification = (apiNotification: CommentNotification): Notification => {
  const content = `"${apiNotification.commentContent}" - 回复内容：${apiNotification.replyContent}`
  return {
    id: apiNotification.id,
    type: 'comment',
    read: apiNotification.isRead === 1,
    title: `${apiNotification.senderName} 回复了你的评论`,
    content: content,
    avatar: '',
    time: new Date(apiNotification.createTime).toISOString(),
    important: false,
    expandable: content.length > 100,
    expanded: false,
    jumping: false,
    originalData: apiNotification
  }
}

// 获取评论通知
const fetchCommentNotifications = async () => {
  try {
    const response = await getNotifications()
    if (response.code === 0) {
      notifications.value = (response.data || []).map(transformCommentNotification)
    } else {
      ElMessage.error(response.message || '获取评论通知失败')
    }
  } catch (error) {
    ElMessage.error('获取评论通知失败')
    console.error('获取评论通知失败:', error)
  }
}

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchCommentNotifications(),
      getUnreadCount()
    ])

    // 初始化系统通知
    systemNotifications.value = generateSystemNotifications()
  } catch (error) {
    console.error('初始化数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 计算属性
const filteredNotifications = computed(() => {
  return activeTab.value === 'comment'
    ? notifications.value
    : systemNotifications.value
})

const filteredTotal = computed(() => filteredNotifications.value.length)

const pagedNotifications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredNotifications.value.slice(start, end)
})

const commentUnreadCount = computed(() => {
  return notifications.value.filter(item => !item.read).length
})

const systemUnreadCount = computed(() => {
  return systemNotifications.value.filter(item => !item.read).length
})

const totalUnread = computed(() => {
  return commentUnreadCount.value + systemUnreadCount.value
})

// 方法
const handleTabChange = (name: string | number) => {
  activeTab.value = name as 'comment' | 'system'
  currentPage.value = 1
}

const goBack = () => {
  router.back()
}

const markAllAsRead = async () => {
  if (activeTab.value === 'comment') {
    marking.value = true
    try {
      const unreadNotifications = notifications.value.filter(item => !item.read)

      if (unreadNotifications.length === 0) {
        ElMessage.info('没有未读的评论通知')
        return
      }

      const promises = unreadNotifications.map(item =>
        item.originalData ? apiMarkAsRead(item.originalData.id) : Promise.resolve()
      )

      await Promise.all(promises)

      notifications.value = notifications.value.map(item => ({
        ...item,
        read: true
      }))

      ElMessage.success('已全部标记为已读')
    } catch (error) {
      ElMessage.error('标记已读失败')
    } finally {
      marking.value = false
    }
  } else {
    const unreadCount = systemNotifications.value.filter(item => !item.read).length
    if (unreadCount === 0) {
      ElMessage.info('没有未读的系统通知')
      return
    }

    systemNotifications.value = systemNotifications.value.map(item => ({
      ...item,
      read: true
    }))
    ElMessage.success('已全部标记为已读')
  }
}

const markAsRead = async (id: string) => {
  if (activeTab.value === 'comment') {
    markingIds.value.push(id)
    try {
      const notification = notifications.value.find(item => item.id === id)
      if (notification?.originalData) {
        const response = await apiMarkAsRead(notification.originalData.id)
        if (response.code === 0) {
          notification.read = true
          notifications.value = [...notifications.value]
          ElMessage.success('已标记为已读')
        } else {
          ElMessage.error(response.message || '标记已读失败')
        }
      }
    } catch (error) {
      ElMessage.error('标记已读失败')
    } finally {
      markingIds.value = markingIds.value.filter(markingId => markingId !== id)
    }
  } else {
    const index = systemNotifications.value.findIndex(item => item.id === id)
    if (index !== -1) {
      systemNotifications.value[index].read = true
      systemNotifications.value = [...systemNotifications.value]
      ElMessage.success('已标记为已读')
    }
  }
}

const deleteNotification = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条通知吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    if (activeTab.value === 'system') {
      systemNotifications.value = systemNotifications.value.filter(item => item.id !== id)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

// 修改后的 handleNotificationClick 方法 - 整条消息都可以点击跳转
const handleNotificationClick = async (item: Notification) => {
  // 如果正在跳转中，不处理点击
  if (item.jumping) {
    return
  }

  // 先标记为已读
  if (!item.read) {
    await markAsRead(item.id)
  }

  // 评论通知：直接跳转到题目详情
  if (item.type === 'comment' && item.originalData && item.originalData.commentId) {
    try {
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
        ElMessage.warning(response.message || '无法找到对应的题目')
        // 降级处理：直接跳转到题目列表
        router.push('/banks')
      }
    } catch (error) {
      console.error('跳转失败:', error)
      ElMessage.error('跳转失败，请稍后重试')

      // 降级处理：跳转到题目列表
      router.push('/banks')
    } finally {
      // 重置跳转状态
      setTimeout(() => {
        item.jumping = false
      }, 1000)
    }
  }
  // 系统通知：如果有链接则跳转
  else if (item.type === 'system' && item.link) {
    if (item.link.startsWith('http')) {
      window.open(item.link, '_blank')
    } else if (item.link !== '#') {
      router.push(item.link)
    }
  }
}

const toggleExpand = (id: string) => {
  const findAndToggle = (notifications: Notification[]): boolean => {
    for (const notification of notifications) {
      if (notification.id === id) {
        notification.expanded = !notification.expanded
        return true
      }
    }
    return false
  }

  if (activeTab.value === 'comment') {
    findAndToggle(notifications.value)
  } else {
    findAndToggle(systemNotifications.value)
  }
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const formatCommentContent = (content: string): string => {
  return content.replace(/@(\S+)/g, '<span class="mention-user">@$1</span>')
}

const formatTime = (time: string) => {
  return dayjs(time).format('MM-DD HH:mm')
}

// 组件挂载时初始化数据
onMounted(() => {
  initData()
})
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  background: #f5f5f5;
  border-color: #e4e7ed;
  color: #606266;
  transition: all 0.3s;
  border: 3px solid #e4e7ed;
}

.back-button:hover {
  background: #3760f7;
  border-color: #3760f7;
  color: white;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.notification-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs-wrapper {
  border-bottom: 1px solid #e4e7ed;
}

.tabs-wrapper :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 24px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-badge :deep(.el-badge__content) {
  position: static;
  transform: none;
  font-size: 12px;
}

.content-area {
  min-height: 500px;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
}

.loading-wrapper p {
  margin-top: 16px;
  font-size: 14px;
}

.empty-state {
  height: 400px;
}

.empty-state :deep(.el-empty__description) {
  color: #909399;
}

.notification-list {
  padding: 16px 24px;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.notification-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.notification-card.is-unread {
  background: #f0f9ff;
  border-color: #3760f7;
}

.notification-card.is-jumping {
  background: #f6ffed;
  border-color: #52c41a;
  cursor: wait;
}

.card-content {
  display: flex;
  flex: 1;
  align-items: flex-start;
}

.notification-avatar {
  position: relative;
  margin-right: 16px;
}

.unread-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: #ff4d4f;
  border-radius: 50%;
  border: 2px solid white;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  margin-left: 16px;
}

.notification-content {
  margin-bottom: 8px;
}

.notification-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  word-break: break-all;
}

.notification-content .is-collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.jumping-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #52c41a;
  font-size: 12px;
  font-weight: 500;
}

.view-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  color: #3760f7;
  font-size: 12px;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
}

.total-info {
  font-size: 14px;
  color: #666;
}

.unread-info {
  color: #ff4d4f;
  font-weight: 500;
}

/* @用户名高亮样式 */
:deep(.mention-user) {
  color: #3760f7;
  font-weight: 500;
  background-color: rgba(55, 96, 247, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notifications-page {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-left {
    justify-content: flex-start;
  }

  .header-actions {
    align-self: flex-end;
  }

  .notification-card {
    flex-direction: column;
    align-items: stretch;
  }

  .card-content {
    flex-direction: column;
  }

  .notification-avatar {
    align-self: flex-start;
    margin-bottom: 12px;
  }

  .card-actions {
    flex-direction: row;
    justify-content: flex-end;
    margin-left: 0;
    margin-top: 12px;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>