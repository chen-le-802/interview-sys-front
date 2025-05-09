<template>
    <div class="discussion-container">
        <!-- 标题区域 -->
        <div class="discussion-header">
            <div class="discussion-title">
                <div style="margin-right: 20px;cursor: pointer;" class="active">回答讨论（{{ data.length }}个）</div>
                <div style="cursor: pointer;">我的回答</div>
            </div>
            <!-- 登录提示 -->

            <div v-if="!isLogin" class="login-add-comment">
                <a-avatar :size="32" :src="avatarImg" />
                <div class="login-add-comment-box">
                    <div class="login-add-comment-input">
                        <span class="blue-text" @click="handleLogin">点击登录</span>
                        <span>，快来和大家讨论吧~</span>
                    </div>
                </div>
            </div>
            <div v-else class="add-comment-box">
                <div style="height: 350px;width: 100%;">
                    <Editor></Editor>
                </div>
                <a-button type="primary" style="width: 120px;margin-top: 20px;">发布回答</a-button>
            </div>


        </div>

        <!-- 回答列表 -->
        <a-list item-layout="vertical" :data-source="data">
            <template #renderItem="{ item }">
                <a-list-item>
                    <a-comment :author="item.author" :avatar="item.avatar">
                        <!-- 用户信息区域 -->
                        <template #author>

                            <div class="user-info">
                                <span class="nickname">{{ item.author }}</span>
                                <span :class="getUserLevelClass(item.level)">
                                    {{ item.level }}
                                </span>
                            </div>
                        </template>
                        <template #avatar>
                            <a-avatar :src="item.avatar" alt="Han Solo" />
                        </template>
                        <!-- 回答内容 -->
                        <template #content>
                            <div class="answer-content">
                                <p :class="{ 'collapsed-text': item.expandable && !item.expanded }">
                                    {{ item.content }}
                                </p>
                                <a-button v-if="item.expandable" type="link" size="small" @click="toggleExpand(item)">
                                    {{ item.expanded ? '收起' : '展开' }}
                                </a-button>
                            </div>
                        </template>

                        <!-- 互动操作 -->
                        <template #actions>
                            <div class="action-buttons">
                                <span class="action-item">
                                    <like-outlined />
                                    {{ item.likes || 0 }}
                                </span>
                                <span class="action-item">
                                    <star-outlined />
                                    {{ item.collects || 0 }}
                                </span>
                                <span class="action-item">
                                    <message-outlined />
                                    {{ item.replies || 0 }} 回复
                                </span>
                                <span class="answer-time">{{ formatTime(item.datetime) }}</span>
                            </div>
                        </template>
                    </a-comment>
                </a-list-item>
            </template>
        </a-list>
    </div>
</template>

<script setup lang="ts">
import avatarImg from '@/assets/images/common/avatar.png';
import { ref } from 'vue';
import {
    LikeOutlined,
    StarOutlined,
    MessageOutlined
} from '@ant-design/icons-vue';
import dayjs, { Dayjs } from 'dayjs';
import { getItem } from '@/utils/storage';

const isLogin = (getItem('token') !== null); // 登录状态

interface CommentItem {
    author: string;
    avatar: string;
    level: string;
    content: string;
    datetime: Dayjs;
    likes?: number;
    collects?: number;
    replies?: number;
    expandable?: boolean;
    expanded?: boolean;
}

const data = ref<CommentItem[]>([
    {
        author: '面试斩9880',
        avatar: avatarImg,
        level: 'V2',
        content: `在JDK 1.8中，HashMap引入了红黑树的结构，以优化其在某些极端情况下的性能。具体来说，红黑树的引入是为了提高在哈希冲突严重的情况下的查找效率。在JDK 1.8之前，HashMap仅使用链表来处理哈希冲突，这在平均情况下表现良好，但在极端情况下性能较差...`,
        datetime: dayjs('2024-09-08 18:11'),
        likes: 28,
        collects: 4,
        replies: 1,
        expandable: true,
        expanded: false
    },
    {
        author: '夹锌饼干',
        level: 'Lv1',
        avatar: avatarImg,
        content: '答得太好了，把握好几个疑惑的点都解开了',
        datetime: dayjs('2024-09-02 19:00'),
        likes: 10,
        collects: 0,
        replies: 0
    },
    {
        author: '面试斩00085',
        level: 'Lv1 特训营',
        avatar: avatarImg,
        content: '官方答案还是评论第一的答案啊',
        datetime: dayjs('2025-03-28 00:20'),
        likes: 0,
        collects: 0,
        replies: 0
    }
]);

const toggleExpand = (item: CommentItem) => {
    item.expanded = !item.expanded;
};

const handleLogin = () => {
    // 登录逻辑
    isLogin.valueOf()
};

const getUserLevelClass = (level: string): string => {
    if (level.includes('特训营')) return 'user-level camp';
    if (level === 'Lv2') return 'user-level lv2';
    return 'user-level lv1';
};

const formatTime = (datetime: Dayjs): string => {
    return datetime.format('YYYY-MM-DD HH:mm');
};// 新增评论内容响应式变量

</script>

<style scoped>
.blue-text {
    color: #2286ff;
    font-weight: 600;
    cursor: pointer;
}

.active {
    color: #2286ff;
    border-bottom: #2286ff solid 2px;
    font-weight: 500;
}

.discussion-container {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
}


.discussion-title {
    height: 40px;
    display: flex;
    width: 100%;
    font-size: 16px;
    border-bottom: #edeeef solid 1px;
    margin-bottom: 30px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-level {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
}

.user-level.lv1 {
    background: #e8f5e9;
    color: #4caf50;
}

.user-level.lv2 {
    background: #fff3e0;
    color: #ff9800;
}

.user-level.camp {
    background: #ffebee;
    color: #f44336;
}

.answer-content {
    color: #333;
}

.answer-content p {
    margin-bottom: 8px;
    line-height: 1.6;
}

.collapsed-text {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 24px;
}

.action-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #666;
    cursor: pointer;
}

.answer-time {
    color: #999;
    font-size: 12px;
}

.login-prompt {
    margin-top: 20px;
    cursor: pointer;
}

.add-comment-box {

    width: 100%;
    margin: 20px auto;
    /* margin-top: 20px; */
}

.login-add-comment {
    margin-top: 20px;
    display: flex;
    width: 90%;
    background: #ffffff;
    border-radius: 4px;
    margin-left: 24px;
}

.login-add-comment-box {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100px;
    border-radius: 5px;
    box-shadow: #e9e7e7 0px 0px 5px 0px;
    margin-left: 15px;

}

.login-add-comment-box .login-add-comment-input {
    display: flex;
    align-items: center;
    padding: 0 20px;
    width: 95%;
    height: 50%;
    background-color: #f6f6f6;
    border-radius: 10px;
}
</style>