<template>
  <div style="background-color: #f5f5f5; min-height: 100vh">
    <FrontendHeader />
    <div class="notification-container">
      <div class="notification-header">
        <div class="tabs">
          <div 
            class="tab" 
            :class="{ active: activeTab === 'comment' }"
            @click="switchTab('comment')"
          >
            评论互动
            <span class="badge" v-if="commentUnreadCount > 0">{{ commentUnreadCount }}</span>
          </div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'system' }"
            @click="switchTab('system')"
          >
            系统通知
            <span class="badge" v-if="systemUnreadCount > 0">{{ systemUnreadCount }}</span>
          </div>
        </div>
        <a-button type="text" @click="markAllAsRead" :disabled="totalUnread === 0">
          <template #icon><CheckOutlined /></template>
          全部已读
        </a-button>
      </div>

      <div class="notification-content">
        <a-empty v-if="filteredTotal === 0" description="暂无通知" class="empty-state">
          <template #image>
            <BellOutlined style="font-size: 48px; color: #d9d9d9" />
          </template>
        </a-empty>

        <div class="notification-list" v-else>
          <a-list item-layout="horizontal" :data-source="pagedNotifications">
            <template #renderItem="{ item }">
              <a-list-item class="notification-item" :class="{ unread: !item.read }">
                <template #actions>
                  <span class="time">{{ formatTime(item.time) }}</span>
                  <a-button type="text" size="small" @click.stop="markAsRead(item.id)" v-if="!item.read">
                    标记已读
                  </a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click.stop="deleteNotification(item.id)" 
                    v-if="item.read && !item.important"
                    danger
                  >
                    删除
                  </a-button>
                </template>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :src="item.avatar" style="background-color: #1890ff">
                      <template #icon>
                        <BellOutlined />
                      </template>
                    </a-avatar>
                  </template>
                  <template #title>
                    <span class="title">
                      <span v-if="!item.read" class="unread-marker">●</span>
                      {{ item.title }}
                    </span>
                  </template>
                  <template #description>
                    <div class="content">{{ item.content }}</div>
                    <div class="extra" v-if="item.link">
                      <a :href="item.link" target="_blank" class="view-link">点击查看</a>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>

      <div class="notification-footer" v-if="filteredTotal > 0">
        <div class="total-count">总数 {{ filteredTotal }}</div>
        <a-pagination
          v-model:current="currentPage"
          v-model:pageSize="pageSize"
          :total="filteredTotal"
          :page-size-options="['10', '20', '30', '40']"
          size="small"
          :showSizeChanger="false"
          :showQuickJumper="true"
          :showTotal="total => `共 ${total} 条`"
        />
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  CheckOutlined, 
  BellOutlined, 
  MessageOutlined 
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface Notification {
  id: string;
  type: 'comment' | 'system';
  read: boolean;
  title: string;
  content: string;
  avatar: string;
  time: string;
  important: boolean;
  link?: string;
}

// Mock数据 - 根据图片示例调整
const generateMockNotifications = (): Notification[] => {
  return [
    {
      id: 'notify-1',
      type: 'system',
      read: false,
      title: '关于战略升级及邀请有赏佣金调整的重要公告',
      content: '亲爱的面试斩伙伴，近期我们上线了[专项练习]、[解析面经]、[AI大模型题库]、[AI实战项目]，并将继续深耕，同时对邀请有赏规则作出重要调整',
      avatar: '',
      time: '2023-04-24T20:31:00Z',
      important: true,
      link: '#'
    },
    {
      id: 'notify-2',
      type: 'system',
      read: false,
      title: '系统维护通知',
      content: '系统将于2025-05-01 02:00至04:00进行例行维护，期间服务将短暂不可用',
      avatar: '',
      time: '2023-04-20T10:15:00Z',
      important: false
    },
    {
      id: 'notify-3',
      type: 'system',
      read: false,
      title: '新功能上线',
      content: '我们新增了AI面试官功能，欢迎体验！',
      avatar: '',
      time: '2023-04-18T08:00:00Z',
      important: true
    },
     {
      id: 'notify-4',
      type: 'system',
      read: false,
      title: '新功能上线',
      content: '我们新增了AI面试官功能，欢迎体验！',
      avatar: '',
      time: '2023-04-18T08:00:00Z',
      important: true
    },
     {
      id: 'notify-5',
      type: 'system',
      read: false,
      title: '新功能上线',
      content: '我们新增了AI面试官功能，欢迎体验！',
      avatar: '',
      time: '2023-04-18T08:00:00Z',
      important: true
    },
     {
      id: 'notify-6',
      type: 'system',
      read: false,
      title: '新功能上线',
      content: '我们新增了AI面试官功能，欢迎体验！',
      avatar: '',
      time: '2023-04-18T08:00:00Z',
      important: false
    },
    {
      id: 'comment-1',
      type: 'comment',
      read: false,
      title: '新评论回复',
      content: '用户A回复了你的评论：非常感谢你的分享！',
      avatar: '',
      time: '2023-04-24T20:31:00Z',
      important: false,
      link: './question'
    },
  ];
};

// 状态管理
const activeTab = ref<'comment' | 'system'>('system');
const notifications = ref<Notification[]>([]);
const currentPage = ref(1);
const pageSize = ref(6);

// 初始化mock数据
onMounted(() => {
  notifications.value = generateMockNotifications();
});

// 计算属性
const filteredNotifications = computed(() => {
  return notifications.value.filter(item => item.type === activeTab.value);
});

const filteredTotal = computed(() => filteredNotifications.value.length);

const pagedNotifications = computed(() => {
  return filteredNotifications.value.slice(
    (currentPage.value - 1) * pageSize.value, 
    currentPage.value * pageSize.value
  );
});

const commentUnreadCount = computed(() => {
  return notifications.value.filter(item => item.type === 'comment' && !item.read).length;
});

const systemUnreadCount = computed(() => {
  return notifications.value.filter(item => item.type === 'system' && !item.read).length;
});

const totalUnread = computed(() => {
  return commentUnreadCount.value + systemUnreadCount.value;
});

// 方法
const switchTab = (tab: 'comment' | 'system') => {
  activeTab.value = tab;
  currentPage.value = 1;
};

const markAllAsRead = () => {
  notifications.value = notifications.value.map(item => ({
    ...item,
    read: true
  }));
};

const markAsRead = (id: string) => {
  const index = notifications.value.findIndex(item => item.id === id);
  if (index !== -1) {
    notifications.value[index].read = true;
    notifications.value = [...notifications.value];
  }
};

const deleteNotification = (id: string) => {
  notifications.value = notifications.value.filter(item => item.id !== id);
};

const formatTime = (time: string) => {
  return dayjs(time).format('MM-DD HH:mm');
};
</script>

<style scoped>
.notification-container {
  margin: 0 auto;
  margin-top: 40px;
  max-width: 1000px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.tabs {
  display: flex;
  gap: 24px;
}

.tab {
  position: relative;
  padding: 8px 0;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.tab:hover {
  color: #1890ff;
}

.tab.active {
  color: #1890ff;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #1890ff;
}

.badge {
  position: absolute;
  top: -6px;
  right: -12px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  background-color: #ff4d4f;
  color: white;
  border-radius: 8px;
}

.notification-content {
  min-height: 400px;
  padding: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.notification-list {
  padding: 0;
}

.notification-item {
  padding: 16px 24px;
  transition: background-color 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.notification-item:hover {
  background-color: #fafafa;
}

.notification-item.unread {
  background-color: #f6fbff;
}

.notification-item.unread:hover {
  background-color: #e6f7ff;
}

.notification-item :deep(.ant-list-item-meta-title) {
  margin-bottom: 8px;
  font-size: 16px;
}

.notification-item :deep(.ant-list-item-meta-description) {
  color: #666;
}

.time {
  color: #999;
  font-size: 12px;
}

.title {
  font-weight: 500;
}

.unread-marker {
  color: #ff4d4f;
  margin-right: 8px;
}

.content {
  margin-top: 4px;
  line-height: 1.6;
  color: #333;
}

.view-link {
  color: #1890ff;
  text-decoration: none;
}

.view-link:hover {
  text-decoration: underline;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.total-count {
  color: #999;
  font-size: 14px;
}
</style>