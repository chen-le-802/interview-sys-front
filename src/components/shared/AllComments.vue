<template>
    <!-- 评论输入区域 -->
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

    <!-- 回答列表 -->
    <a-list v-else item-layout="vertical" :data-source="commentList" :locale="{ emptyText: '暂无评论' }">
        <template #renderItem="{ item }">
            <a-list-item :key="item.id" :id="`comment-${item.id}`"
                :class="{ 'highlight-comment': highlightCommentId === item.id }">
                <a-comment :author="item.userName" :avatar="item.userAvatar">
                    <!-- 用户信息区域 -->
                    <template #author>
                        <div class="user-info">
                            <span class="nickname">{{ item.userName }}</span>
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
                        </div>
                    </template>
                </a-comment>

                <!-- 回复列表 -->
                <div v-if="item.replies && item.replies.length > 0" class="replies-section">
                    <div v-for="(reply, index) in getDisplayReplies(item)" :key="reply.id" :id="`reply-${reply.id}`"
                        :class="{ 'highlight-reply': highlightReplyId === reply.id }" class="reply-item">
                        <a-comment :author="reply.userName" :avatar="reply.userAvatar">
                            <template #author>
                                <div class="user-info">
                                    <span class="nickname">{{ reply.userName }}</span>
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

                <!-- 回复输入框 -->
                <div v-if="replyingTo === item.id" class="reply-input-section">
                    <div class="reply-input-wrapper">
                        <a-textarea ref="replyTextareaRef" v-model:value="replyContent" placeholder="写下你的回复..."
                            :rows="3" :maxlength="500" show-count class="reply-textarea"
                            @keydown.ctrl.enter="submitReply(item.id)" @keydown.meta.enter="submitReply(item.id)" />
                    </div>
                    <div class="reply-actions">
                        <span class="reply-hint">按 Ctrl + Enter 快速发布</span>
                        <div class="reply-buttons">
                            <a-button size="small" @click="cancelReply">取消</a-button>
                            <a-button type="primary" size="small" style="margin-left: 8px;" :loading="isReplySubmitting"
                                @click="submitReply(item.id)">
                                回复
                            </a-button>
                        </div>
                    </div>
                </div>
            </a-list-item>
        </template>
    </a-list>
</template>

<script setup lang="ts">
import avatarImg from '/avatar.png';
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import {
    LikeOutlined,
    MessageOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { isAuthenticated, getUserInfo, verifyAuthStatus } from '@/utils/auth';
import router from '@/router';
import { message } from 'ant-design-vue';
import { getCommentList, addComment, likeComment, unlikeComment, type Comment, type CommentBase } from '@/apis/commentApi';

// Props
interface Props {
    questionId: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
    'comment-count-change': [count: number];
}>();

// 响应式数据
const route = useRoute();
const isLogin = ref(false);
const editorRef = ref();
const replyTextareaRef = ref();
const isSubmitting = ref(false);
const isReplySubmitting = ref(false);
const loading = ref(false);
const commentList = ref<Comment[]>([]);
const replyingTo = ref<string | null>(null);
const replyContent = ref('');
const replyToUser = ref<string>('');

// 高亮相关状态
const highlightCommentId = ref<string>('');
const highlightReplyId = ref<string>('');

// 检查认证状态
const checkAuthStatus = async () => {
    const authStatus = await verifyAuthStatus();
    isLogin.value = authStatus;
};

// 获取当前用户信息
const getCurrentUserInfo = () => {
    return getUserInfo();
};

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

    findAndToggle(commentList.value);
};

// 获取滚动容器
const getScrollContainer = (): Element | null => {
    return document.querySelector('.question-box');
};

// 通用的滚动到元素的方法
const scrollToElement = (elementId: string, retryOnFail = true) => {
    const element = document.getElementById(elementId);
    const scrollContainer = getScrollContainer();

    if (element && scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const currentScrollTop = scrollContainer.scrollTop;
        const elementTopRelativeToContainer = elementRect.top - containerRect.top;
        const targetScrollTop = currentScrollTop + elementTopRelativeToContainer - 80;

        scrollContainer.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
        });

        return true;
    } else if (retryOnFail) {
        // 重试机制：元素可能还在渲染中
        let retryCount = 0;
        const maxRetries = 5;
        const retryDelay = 200;

        const retryScroll = () => {
            retryCount++;
            const retryElement = document.getElementById(elementId);
            const retryContainer = getScrollContainer();

            if (retryElement && retryContainer) {
                const containerRect = retryContainer.getBoundingClientRect();
                const elementRect = retryElement.getBoundingClientRect();
                const currentScrollTop = retryContainer.scrollTop;
                const elementTopRelativeToContainer = elementRect.top - containerRect.top;
                const targetScrollTop = currentScrollTop + elementTopRelativeToContainer - 80;

                retryContainer.scrollTo({
                    top: Math.max(0, targetScrollTop),
                    behavior: 'smooth'
                });
            } else if (retryCount < maxRetries) {
                setTimeout(retryScroll, retryDelay * retryCount);
            }
        };

        setTimeout(retryScroll, retryDelay);
    }

    return false;
};

// 滚动到指定评论
const scrollToComment = (commentId: string) => {
    return scrollToElement(`comment-${commentId}`);
};

// 滚动到指定回复
const scrollToReply = (replyId: string) => {
    return scrollToElement(`reply-${replyId}`);
};

// 展开包含特定回复的评论的方法
const expandReplyParent = async (replyId: string): Promise<boolean> => {
    const findAndExpand = (comments: Comment[]): boolean => {
        for (const comment of comments) {
            if (comment.replies) {
                const hasTargetReply = comment.replies.some(reply => reply.id === replyId);
                if (hasTargetReply) {
                    comment.showAllReplies = true;
                    return true;
                }
                if (findAndExpand(comment.replies)) {
                    return true;
                }
            }
        }
        return false;
    };

    const expanded = findAndExpand(commentList.value);

    if (expanded) {
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return expanded;
};

// 处理来自通知的跳转参数的方法
const handleNotificationParams = async () => {
    const { commentId, highlightReply, fromNotification } = route.query;

    if (fromNotification && (commentId || highlightReply)) {
        await nextTick();

        if (highlightReply) {
            // 展开包含目标回复的评论
            const expanded = await expandReplyParent(highlightReply as string);

            if (expanded) {
                highlightReplyId.value = highlightReply as string;

                // 等待渲染完成后滚动
                await new Promise(resolve => setTimeout(resolve, 500));
                scrollToReply(highlightReply as string);

                // 3秒后移除高亮
                setTimeout(() => {
                    highlightReplyId.value = '';
                }, 3000);
            } else if (commentId) {
                // 回复未找到，尝试滚动到评论
                scrollToComment(commentId as string);
                highlightCommentId.value = commentId as string;
                setTimeout(() => {
                    highlightCommentId.value = '';
                }, 3000);
            }
        } else if (commentId) {
            // 只需要高亮评论
            await new Promise(resolve => setTimeout(resolve, 200));

            scrollToComment(commentId as string);
            highlightCommentId.value = commentId as string;

            setTimeout(() => {
                highlightCommentId.value = '';
            }, 3000);
        }

        // 延迟清理URL参数
        setTimeout(() => {
            router.replace({
                path: route.path,
                query: {
                    ...route.query,
                    commentId: undefined,
                    highlightReply: undefined,
                    fromNotification: undefined
                }
            });
        }, 1000);
    }
};

// 获取评论列表
const fetchComments = async () => {
    if (!props.questionId) return;

    loading.value = true;
    try {
        const response = await getCommentList(props.questionId);
        if (response.code === 0) {
            commentList.value = transformCommentData(response.data || []);
            // 计算总评论数（包括回复）
            const totalCount = calculateTotalComments(commentList.value);
            emit('comment-count-change', totalCount);

            // 处理来自通知的跳转参数
            await handleNotificationParams();
        } else {
            message.error(response.message || '获取评论失败');
        }
    } catch (error) {
        message.error('获取评论失败');
    } finally {
        loading.value = false;
    }
};

// 计算总评论数（包括回复）
const calculateTotalComments = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
        return total + 1 + (comment.replies ? calculateTotalComments(comment.replies) : 0);
    }, 0);
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
            // 重新获取评论列表
            await fetchComments();
        } else {
            message.error(response.message || '评论发布失败');
        }
    } catch (error) {
        message.error('评论发布失败，请重试');
    } finally {
        isSubmitting.value = false;
    }
};

// 聚焦回复输入框的方法
const focusReplyTextarea = async () => {
    await nextTick();
    // 等待DOM更新完成
    setTimeout(() => {
        if (replyTextareaRef.value) {
            // 如果是数组，取第一个元素
            const textarea = Array.isArray(replyTextareaRef.value)
                ? replyTextareaRef.value[0]
                : replyTextareaRef.value;

            // 获取实际的 textarea 元素
            const textareaElement = textarea?.$el?.querySelector('textarea') || textarea?.focus;

            if (textareaElement && typeof textareaElement.focus === 'function') {
                textareaElement.focus();
                // 将光标移到内容末尾
                const length = replyContent.value.length;
                textareaElement.setSelectionRange(length, length);
            } else if (textarea?.focus) {
                textarea.focus();
            }
        }
    }, 100);
};

// 开始回复
const toggleReply = async (commentId: string, replyToUserName?: string) => {
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

        // 自动聚焦到回复输入框
        await focusReplyTextarea();
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
            await fetchComments();
        } else {
            message.error(response.message || '回复发布失败');
        }
    } catch (error) {
        message.error('回复发布失败，请重试');
    } finally {
        isReplySubmitting.value = false;
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

    findAndToggle(commentList.value);
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
watch(() => props.questionId, async (newId) => {
    if (newId) {
        await checkAuthStatus();
        fetchComments();
    }
}, { immediate: true });

// 监听路由参数变化
watch(() => route.query, async (newQuery) => {
    if (newQuery.fromNotification && commentList.value.length > 0) {
        await handleNotificationParams();
    }
}, { deep: true });

// 监听登录状态变化
watch(isLogin, (newLoginStatus) => {
    if (!newLoginStatus) {
        // 登出时清理状态
        replyingTo.value = null;
        replyContent.value = '';
        replyToUser.value = '';
    }
});

// 组件挂载时获取数据
onMounted(async () => {
    await checkAuthStatus();
    if (props.questionId) {
        fetchComments();
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
    margin-bottom: 10px;
    /* 为回复框预留空间 */
}

.reply-item {
    margin-bottom: 10px;
}

.reply-input-section {
    margin-left: 40px;
    margin-top: 15px;
    padding: 20px;
    background: linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%);
    border-radius: 12px;
    border: 1px solid #e6f2ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
    transition: all 0.3s ease;
    animation: slideIn 0.3s ease-out;
}

.reply-input-section:hover {
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.12);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.reply-input-wrapper {
    margin-bottom: 15px;
}

.reply-textarea {
    resize: vertical;
    min-height: 90px;
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    transition: all 0.3s;
}

.reply-textarea:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.12);
}

.reply-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.reply-hint {
    color: #999;
    font-size: 12px;
    font-style: italic;
}

.reply-buttons {
    display: flex;
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

/* @用户名高亮样式 */
:deep(.mention-user) {
    color: #1890ff;
    font-weight: 500;
    background-color: rgba(24, 144, 255, 0.1);
    padding: 1px 4px;
    border-radius: 3px;
}

/* 高亮评论样式 */
.highlight-comment {
    background: linear-gradient(90deg, #fff7e6 0%, #ffffff 100%) !important;
    border: 2px solid #ffa940 !important;
    border-radius: 8px !important;
    transition: all 0.5s ease !important;
    box-shadow: 0 4px 12px rgba(255, 169, 64, 0.3) !important;
    animation: highlight-fade 3s ease-in-out;
}

/* 高亮回复样式 */
.highlight-reply {
    background: linear-gradient(90deg, #f6ffed 0%, #ffffff 100%) !important;
    border: 2px solid #52c41a !important;
    border-radius: 6px !important;
    transition: all 0.5s ease !important;
    box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3) !important;
    animation: highlight-fade 3s ease-in-out;
}

/* 高亮动画 */
@keyframes highlight-fade {
    0% {
        transform: scale(1.02);
        opacity: 0.8;
    }

    50% {
        transform: scale(1.01);
        opacity: 1;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* 响应式优化 */
@media (max-width: 768px) {
    .replies-section {
        margin-left: 20px;
        padding-left: 15px;
    }

    .reply-input-section {
        margin-left: 20px;
        padding: 15px;
    }

    .reply-actions {
        flex-direction: column;
        gap: 10px;
        align-items: flex-end;
    }

    .reply-hint {
        align-self: flex-start;
    }
}
</style>