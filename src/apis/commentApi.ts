import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 题目信息接口
export interface QuestionVO {
  id: string;
  title: string;
  content: string;
  tagList: string[];
  difficulty: string;
  answer: string;
  passRate: string;
  userId: string;
  user: any;
}

// 评论接口
export interface CommentBase {
  id: string;
  content: string;
  questionId: string;
  userId: string;
  parentId: string | null;
  likeCount: number;
  createTime: number;
  userName: string;
  userAvatar: string;
  replies: CommentBase[];
  like: boolean; // 当前用户是否已点赞
}

// 扩展的评论接口(包含前端状态)
export interface Comment extends CommentBase {
  expandable?: boolean;     // 是否可展开
  expanded?: boolean;       // 是否已展开
  showAllReplies?: boolean; // 是否显示所有回复
  isReplyToOthers?: boolean; // 是否是对别人评论的回复
  replies: Comment[];       // 回复也使用扩展类型
}

// 添加评论参数
export interface AddCommentParams {
  content: string;
  parentId?: string;
  questionId: string;
}

// 评论通知接口
export interface CommentNotification {
  id: string;
  commentId: string;
  replyId: string;
  receiverId: string;
  senderId: string;
  isRead: number;
  createTime: number;
  commentContent: string;
  replyContent: string;
  senderName: string;
}

// 添加评论
export const addComment = (data: AddCommentParams): Promise<BaseResponse> => {
  return request.post('/api/comment/add', data);
};

// 获取评论列表
export const getCommentList = (questionId: string): Promise<BaseResponse<CommentBase[]>> => {
  return request.get('/api/comment/list', {
    params: { questionId }
  });
};

// 删除评论
export const deleteComment = (commentId: string): Promise<BaseResponse> => {
  return request.delete('/api/comment/delete', {
    params: { commentId }
  });
};

// 点赞评论
export const likeComment = (commentId: string): Promise<BaseResponse> => {
  return request.post('/api/comment/addLike', null, {
    params: { commentId }
  });
};

// 取消点赞
export const unlikeComment = (commentId: string): Promise<BaseResponse> => {
  return request.post('/api/comment/cancelLike', null, {
    params: { commentId }
  });
};

// 获取回复通知
export const getNotifications = (): Promise<BaseResponse<CommentNotification[]>> => {
  return request.get('/api/comment/listNotification');
};

// 获取未读通知数量
export const getUnreadCount = (): Promise<BaseResponse<number>> => {
  return request.get('/api/comment/getUnreadNotificationCount');
};

// 标记已读
export const markAsRead = (commentNotificationId: string): Promise<BaseResponse> => {
  return request.post('/api/comment/markAsRead', null, {
    params: { commentNotificationId }
  });
};

// 根据评论ID获取题目信息
export const getQuestionByCommentId = (commentId: string): Promise<BaseResponse<QuestionVO>> => {
  return request.get('/api/comment/getQuestionVo', {
    params: { commentId }
  });
};

// 删除评论回复通知
export const deleteNotification = (commentNotificationId: string): Promise<BaseResponse> => {
  return request.delete('/api/comment/deleteNotification', {
    params: { commentNotificationId }
  });
};