<template>
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
                    <Editor ref="editorRef"></Editor>
                </div>
                <a-button type="primary" style="width: 120px;margin-top: 20px;" @click="submitComments">发布回答</a-button>
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
import { getItem, getUserAvatar, getUserName,getUserID } from '@/utils/storage';
import router from '@/router';
import {message} from 'ant-design-vue';

const isLogin = (getItem('token') !== null); // 登录状态
const editorRef = ref(); // 编辑器引用
const isSubmitting = ref(false); // 提交状态，防止重复提交

interface CommentItem {
    id?: string | number; // 新增id属性，类型可根据实际情况调整
    author: string;
    avatar: string;
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
        avatar: avatarImg,
        content: '答得太好了，把握好几个疑惑的点都解开了',
        datetime: dayjs('2024-09-02 19:00'),
        likes: 10,
        collects: 0,
        replies: 0
    },
    {
        author: '面试斩00085',
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
   router.push('/login');
};

// 将HTML内容转换为纯文本
const htmlToText = (html: string): string => {
    // 创建一个临时div来处理HTML内容
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};
// 提交评论逻辑
const submitComments = async () => {
    if (isSubmitting.value) return; // 防止重复提交
    isSubmitting.value = true;
    
    try {
        // 获取编辑器内容（包含HTML标签）
        const htmlContent = editorRef.value?.getContent?.() || '';
        
        // 转换为纯文本并去除首尾空格
        const plainText = htmlToText(htmlContent).trim();
        
        // 验证内容是否为空
        if (!plainText) {
            message.warning('评论内容不能为空');
            return;
        }
        
        // 获取用户信息
        const userAvatar = getUserAvatar() || avatarImg;
        const username = getUserName() || '新用户';
        
        // 添加新评论
        data.value.unshift({
            id: getUserID(),
            author: username,
            avatar: userAvatar,
            content: htmlContent, // 使用带格式的HTML内容
            datetime: dayjs(),
            expandable: plainText.length > 100, // 基于纯文本长度判断是否可展开
            expanded: false
        });
        
        // 清空编辑器
        editorRef.value?.setContent?.('');
        message.success('评论发布成功！');
    } catch (error) {
        console.error('提交评论失败:', error);
        message.error('评论发布失败，请重试');
    } finally {
        isSubmitting.value = false;
    }
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