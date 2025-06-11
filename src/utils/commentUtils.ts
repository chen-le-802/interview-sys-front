import type { Comment, CommentBase } from '@/apis/commentApi';

/**
 * 将HTML内容转换为纯文本
 */
export const htmlToText = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};

/**
 * 转换API数据为组件需要的格式
 */
export const transformCommentData = (apiComments: CommentBase[]): Comment[] => {
    return apiComments.map(comment => {
        const plainText = htmlToText(comment.content);
        return {
            ...comment,
            expandable: plainText.length > 100,
            expanded: false,
            replies: transformCommentData(comment.replies || [])
        };
    });
};

/**
 * 计算总评论数（包括回复）
 */
export const calculateTotalComments = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
        return total + 1 + (comment.replies ? calculateTotalComments(comment.replies) : 0);
    }, 0);
};

/**
 * 在评论树中查找并切换展开状态
 */
export const toggleCommentExpand = (comments: Comment[], targetId: string): boolean => {
    for (const comment of comments) {
        if (comment.id === targetId) {
            comment.expanded = !comment.expanded;
            return true;
        }
        if (comment.replies && toggleCommentExpand(comment.replies, targetId)) {
            return true;
        }
    }
    return false;
};

/**
 * 筛选用户的评论（包括作为回复的评论）
 */
export const filterUserComments = (comments: Comment[], userId: string): Comment[] => {
    const userComments: Comment[] = [];
    
    comments.forEach(comment => {
        // 如果是用户的主评论
        if (comment.userId === userId) {
            userComments.push({
                ...comment,
                replies: comment.replies || []
            });
        } else {
            // 如果主评论不是用户的，但回复中有用户的评论
            const userReplies = comment.replies?.filter(reply => reply.userId === userId) || [];
            if (userReplies.length > 0) {
                userComments.push({
                    ...comment,
                    replies: userReplies
                });
            }
        }
    });
    
    return userComments;
};

/**
 * 验证评论内容
 */
export const validateCommentContent = (content: string): { valid: boolean; message?: string } => {
    const plainText = htmlToText(content).trim();
    
    if (!plainText) {
        return { valid: false, message: '评论内容不能为空' };
    }
    
    if (plainText.length > 10000) {
        return { valid: false, message: '评论内容不能超过10000个字符' };
    }
    
    return { valid: true };
};