<template>
    <!-- 未登录状态 -->
    <div v-if="!isLogin" class="login-add-comment">
        <a-avatar :size="32" :src="avatarImg" />
        <div class="login-add-comment-box">
            <div class="login-add-comment-input">
                <span class="blue-text" @click="handleLogin">点击登录</span>
                <span>，快来和大家讨论吧~</span>
            </div>
        </div>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="add-comment-box">
        <div style="height: 350px;width: 100%;">
            <Editor ref="editorRef" />
        </div>
        <a-button type="primary" style="width: 120px;margin-top: 20px;" :loading="isSubmitting" @click="submitComments">
            发布回答
        </a-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrapper">
        <a-spin size="large" />
    </div>

    <!-- 我的回答列表 -->
    <a-list v-else item-layout="vertical" :data-source="myCommentList" :locale="{ emptyText: '你还没有发表过评论' }">
        <template #renderItem="{ item }">
            <a-list-item :key="item.id">
                <a-comment :author="item.userName" :avatar="item.userAvatar">
                    <!-- 用户信息区域 -->
                    <template #author>
                        <div class="user-info">
                            <span class="nickname">{{ item.userName }}</span>
                            <a-tag color="blue" size="small">我的评论</a-tag>
                        </div>
                    </template>

                    <template #avatar>
                        <a-avatar :src="item.userAvatar || avatarImg" :alt="item.userName" />
                    </template>

                    <!-- 回答内容 -->
                    <template #content>
                        <div class="answer-content">
                            <div v-html="formatCommentContent(item.content)"
                                :class="{ 'collapsed-text': item.expandable && !item.expanded }" />
                            <a-button v-if="item.expandable" type="link" size="small" @click="toggleExpand(item.id)">
                                {{ item.expanded ? '收起' : '展开' }}
                            </a-button>
                        </div>
                    </template>

                    <!-- 互动操作 -->
                    <template #actions>
                        <div class="action-buttons">
                            <span class="action-item" :class="{ liked: item.like }" @click="handleLike(item)">
                                <like-outlined />
                                {{ item.likeCount || 0 }}
                            </span>
                            <span class="action-item" @click="toggleReply(item.id)">
                                <message-outlined />
                                回复
                            </span>
                            <span class="reply-count-text">{{ item.replies?.length || 0 }} 回复</span>
                            <span class="answer-time">{{ formatTime(item.createTime) }}</span>

                            <!-- 删除按钮（仅对自己的评论显示） -->
                            <a-popconfirm title="确定要删除这条评论吗？" ok-text="确定" cancel-text="取消"
                                @confirm="handleDelete(item.id)">
                                <span class="action-item delete-btn">
                                    <delete-outlined />
                                    删除
                                </span>
                            </a-popconfirm>
                        </div>
                    </template>
                </a-comment>

                <!-- 回复输入框 -->
                <div v-if="replyingTo === item.id" class="reply-input-section">
                    <div class="reply-input-wrapper">
                        <a-textarea v-model:value="replyContent" placeholder="写下你的回复..." :rows="3" :maxlength="500"
                            show-count class="reply-textarea" />
                    </div>
                    <div class="reply-actions">
                        <a-button size="small" @click="cancelReply">取消</a-button>
                        <a-button type="primary" size="small" style="margin-left: 8px;" :loading="isReplySubmitting"
                            @click="submitReply(item.id)">
                            回复
                        </a-button>
                    </div>
                </div>

                <!-- 回复列表 -->
                <div v-if="item.replies && item.replies.length > 0" class="replies-section">
                    <div v-for="reply in getDisplayReplies(item)" :key="reply.id" class="reply-item">
                        <a-comment :author="reply.userName" :avatar="reply.userAvatar">
                            <template #author>
                                <div class="user-info">
                                    <span class="nickname">{{ reply.userName }}</span>
                                    <a-tag v-if="reply.userId === currentUserId" color="blue" size="small">
                                        我的回复
                                    </a-tag>
                                </div>
                            </template>

                            <template #avatar>
                                <a-avatar :src="reply.userAvatar || avatarImg" :alt="reply.userName" />
                            </template>

                            <template #content>
                                <div class="answer-content">
                                    <div v-html="formatCommentContent(reply.content)"
                                        :class="{ 'collapsed-text': reply.expandable && !reply.expanded }" />
                                    <a-button v-if="reply.expandable" type="link" size="small"
                                        @click="toggleExpand(reply.id)">
                                        {{ reply.expanded ? '收起' : '展开' }}
                                    </a-button>
                                </div>
                            </template>

                            <template #actions>
                                <div class="action-buttons">
                                    <span class="action-item" :class="{ liked: reply.like }" @click="handleLike(reply)">
                                        <like-outlined />
                                        {{ reply.likeCount || 0 }}
                                    </span>
                                    <span class="action-item" @click="toggleReply(item.id, reply.userName)">
                                        <message-outlined />
                                        回复
                                    </span>
                                    <span class="answer-time">{{ formatTime(reply.createTime) }}</span>

                                    <!-- 删除回复按钮（仅对自己的回复显示） -->
                                    <a-popconfirm v-if="reply.userId === currentUserId" title="确定要删除这条回复吗？" ok-text="确定"
                                        cancel-text="取消" @confirm="handleDelete(reply.id)">
                                        <span class="action-item delete-btn">
                                            <delete-outlined />
                                            删除
                                        </span>
                                    </a-popconfirm>
                                </div>
                            </template>
                        </a-comment>
                    </div>

                    <!-- 展开所有回复按钮 -->
                    <div v-if="!item.showAllReplies && item.replies && item.replies.length > 2"
                        class="show-all-replies">
                        <a-button type="link" size="small" @click="toggleShowAllReplies(item.id)">
                            查看全部 {{ item.replies.length }} 条回复
                        </a-button>
                    </div>

                    <!-- 收起回复按钮 -->
                    <div v-if="item.showAllReplies && item.replies && item.replies.length > 2" class="show-all-replies">
                        <a-button type="link" size="small" @click="toggleShowAllReplies(item.id)">
                            收起回复
                        </a-button>
                    </div>
                </div>
            </a-list-item>
        </template>
    </a-list>
</template>

<script setup lang="ts">
import avatarImg from '@/assets/images/common/avatar.png';
import { ref, computed, onMounted, watch } from 'vue';
import {
    LikeOutlined,
    MessageOutlined,
    DeleteOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { getItem, getUserAvatar, getUserName, getUserID } from '@/utils/storage';
import router from '@/router';
import { message } from 'ant-design-vue';
import {
    getCommentList,
    addComment,
    deleteComment,
    likeComment,
    unlikeComment,
    type Comment,
    type CommentBase
} from '@/apis/commentApi';

// Props
interface Props {
    questionId: string;
}

const props = defineProps<Props>();

// 响应式数据
const isLogin = computed(() => getItem('token') !== null);
const currentUserId = computed(() => getUserID() || null);
const editorRef = ref();
const isSubmitting = ref(false);
const isReplySubmitting = ref(false);
const loading = ref(false);
const myCommentList = ref<Comment[]>([]);
const replyingTo = ref<string | null>(null);
const replyContent = ref('');
const replyToUser = ref<string>('');

// 格式化评论内容，高亮@用户名
const formatCommentContent = (content: string): string => {
    return content.replace(/@(\S+)/g, '<span class="mention-user">@$1</span>');
};

// 将HTML内容转换为纯文本（用于判断是否可展开）
const htmlToText = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};

// 转换API数据为组件需要的格式
const transformCommentData = (apiComments: CommentBase[]): Comment[] => {
    return apiComments.map(comment => {
        const plainText = htmlToText(comment.content);
        return {
            ...comment,
            expandable: plainText.length > 150,
            expanded: false,
            showAllReplies: false,
            replies: transformCommentData(comment.replies || [])
        };
    });
};

// 获取显示的回复列表（默认显示前2条）
const getDisplayReplies = (comment: Comment): Comment[] => {
    if (!comment.replies || comment.replies.length === 0) {
        return [];
    }

    if (comment.showAllReplies || comment.replies.length <= 2) {
        return comment.replies;
    }

    return comment.replies.slice(0, 2);
};

// 切换显示所有回复
const toggleShowAllReplies = (commentId: string) => {
    const findAndToggle = (comments: Comment[]): boolean => {
        for (const comment of comments) {
            if (comment.id === commentId) {
                comment.showAllReplies = !comment.showAllReplies;
                return true;
            }
            if (comment.replies && findAndToggle(comment.replies)) {
                return true;
            }
        }
        return false;
    };

    findAndToggle(myCommentList.value);
};

// 筛选用户的评论（包括作为回复的评论）
const filterUserComments = (comments: Comment[], userId: string | null): Comment[] => {
    if (!userId) {
        return [];
    }

    const userComments: Comment[] = [];

    comments.forEach(comment => {
        // 如果是用户的主评论
        if (comment.userId === userId) {
            userComments.push({
                ...comment,
                replies: comment.replies || [] // 保留所有回复，不管是谁的
            });
        } else {
            // 如果主评论不是用户的，但回复中有用户的评论
            const userReplies = comment.replies?.filter(reply => reply.userId === userId) || [];

            if (userReplies.length > 0) {
                userComments.push({
                    ...comment,
                    replies: userReplies,
                    isReplyToOthers: true
                });
            }
        }
    });

    return userComments;
};

// 获取我的评论列表
const fetchMyComments = async () => {
    if (!props.questionId || !isLogin.value || !currentUserId.value) {
        return;
    }

    loading.value = true;
    try {
        const response = await getCommentList(props.questionId);

        if (response.code === 0) {
            const allComments = transformCommentData(response.data || []);
            // 筛选出当前用户的评论
            myCommentList.value = filterUserComments(allComments, currentUserId.value);
        } else {
            message.error(response.message || '获取评论失败');
        }
    } catch (error) {
        message.error('获取评论失败');
    } finally {
        loading.value = false;
    }
};

// 提交评论
const submitComments = async () => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;

    try {
        const htmlContent = editorRef.value?.getContent?.() || '';
        const plainText = htmlToText(htmlContent).trim();

        if (!plainText) {
            message.warning('评论内容不能为空');
            return;
        }

        const response = await addComment({
            content: htmlContent,
            questionId: props.questionId
        });

        if (response.code === 0) {
            message.success('评论发布成功！');
            editorRef.value?.setContent?.('');
            // 重新获取我的评论列表
            await fetchMyComments();
        } else {
            message.error(response.message || '评论发布失败');
        }
    } catch (error) {
        message.error('评论发布失败，请重试');
    } finally {
        isSubmitting.value = false;
    }
};

// 开始回复
const toggleReply = (commentId: string, replyToUserName?: string) => {
    if (!isLogin.value) {
        message.warning('请先登录');
        return;
    }

    if (replyingTo.value === commentId) {
        replyingTo.value = null;
        replyContent.value = '';
        replyToUser.value = '';
    } else {
        replyingTo.value = commentId;
        replyToUser.value = replyToUserName || '';
        // 如果是回复某个用户，自动添加@用户名
        replyContent.value = replyToUserName ? `@${replyToUserName} ` : '';
    }
};

// 取消回复
const cancelReply = () => {
    replyingTo.value = null;
    replyContent.value = '';
    replyToUser.value = '';
};

// 提交回复
const submitReply = async (parentId: string) => {
    if (isReplySubmitting.value) return;
    isReplySubmitting.value = true;

    try {
        const content = replyContent.value.trim();

        if (!content) {
            message.warning('回复内容不能为空');
            return;
        }

        // 如果只有@用户名没有其他内容，提示用户
        if (replyToUser.value && content === `@${replyToUser.value}`) {
            message.warning('请输入回复内容');
            return;
        }

        const response = await addComment({
            content: content,
            questionId: props.questionId,
            parentId: parentId
        });

        if (response.code === 0) {
            message.success('回复发布成功！');
            replyContent.value = '';
            replyingTo.value = null;
            replyToUser.value = '';
            // 重新获取评论列表
            await fetchMyComments();
        } else {
            message.error(response.message || '回复发布失败');
        }
    } catch (error) {
        message.error('回复发布失败，请重试');
    } finally {
        isReplySubmitting.value = false;
    }
};

// 删除评论
const handleDelete = async (commentId: string) => {
    try {
        const response = await deleteComment(commentId);
        if (response.code === 0) {
            message.success('删除成功');
            // 重新获取评论列表
            await fetchMyComments();
        } else {
            message.error(response.message || '删除失败');
        }
    } catch (error) {
        message.error('删除失败，请重试');
    }
};

// 处理点赞
const handleLike = async (comment: Comment) => {
    if (!isLogin.value) {
        message.warning('请先登录');
        return;
    }

    try {
        const response = comment.like
            ? await unlikeComment(comment.id)
            : await likeComment(comment.id);

        if (response.code === 0) {
            // 更新本地状态
            comment.like = !comment.like;
            comment.likeCount = comment.like
                ? (comment.likeCount || 0) + 1
                : Math.max(0, (comment.likeCount || 0) - 1);
        } else {
            message.error(response.message || '操作失败');
        }
    } catch (error) {
        message.error('操作失败，请重试');
    }
};

// 展开/收起切换
const toggleExpand = (commentId: string) => {
    const findAndToggle = (comments: Comment[]): boolean => {
        for (const comment of comments) {
            if (comment.id === commentId) {
                comment.expanded = !comment.expanded;
                return true;
            }
            if (comment.replies && findAndToggle(comment.replies)) {
                return true;
            }
        }
        return false;
    };

    findAndToggle(myCommentList.value);
};

// 登录方法
const handleLogin = () => {
    router.push('/login');
};

// 格式化时间
const formatTime = (timestamp: number): string => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
};

// 监听questionId变化
watch(() => props.questionId, (newId) => {
    if (newId && isLogin.value) {
        fetchMyComments();
    }
}, { immediate: true });

// 监听登录状态变化
watch(isLogin, (newLoginStatus) => {
    if (newLoginStatus && props.questionId) {
        fetchMyComments();
    } else if (!newLoginStatus) {
        myCommentList.value = [];
    }
}, { immediate: true });

// 监听用户ID变化
watch(currentUserId, (newUserId) => {
    if (newUserId && props.questionId && isLogin.value) {
        fetchMyComments();
    }
}, { immediate: true });

// 组件挂载时获取数据
onMounted(() => {
    if (props.questionId && isLogin.value && currentUserId.value) {
        fetchMyComments();
    }
});
</script>

<style scoped>
.blue-text {
    color: #2286ff;
    font-weight: 600;
    cursor: pointer;
}

.loading-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 50px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.answer-content {
    color: #333;
}

.answer-content>div {
    margin-bottom: 8px;
    line-height: 1.6;
}

.collapsed-text {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
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
    transition: color 0.3s;
}

.action-item:hover {
    color: #1890ff;
}

.action-item.liked {
    color: #1890ff;
}

.delete-btn {
    color: #ff4d4f;
}

.delete-btn:hover {
    color: #ff7875;
}

.reply-count-text {
    color: #999;
    font-size: 14px;
}

.answer-time {
    color: #999;
    font-size: 12px;
}

.add-comment-box {
    width: 100%;
    margin: 20px auto;
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

.replies-section {
    margin-left: 40px;
    margin-top: 10px;
    border-left: 2px solid #f0f0f0;
    padding-left: 20px;
}

.reply-item {
    margin-bottom: 10px;
}

.reply-input-section {
    margin-left: 40px;
    margin-top: 15px;
    padding: 15px;
    background-color: #fafafa;
    border-radius: 8px;
    border-left: 3px solid #1890ff;
}

.reply-input-wrapper {
    margin-bottom: 10px;
}

.reply-textarea {
    resize: vertical;
    min-height: 80px;
}

.reply-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.show-all-replies {
    margin-top: 10px;
    text-align: center;
}

.show-all-replies .ant-btn-link {
    color: #1890ff;
    font-size: 13px;
}

/* @用户名样式 */
.reply-textarea {
    resize: vertical;
    min-height: 80px;
}

.reply-textarea:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* @用户名高亮样式 */
:deep(.mention-user) {
    color: #1890ff;
    font-weight: 500;
    background-color: rgba(24, 144, 255, 0.1);
    padding: 1px 4px;
    border-radius: 3px;
}
</style>