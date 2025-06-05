import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 题目查询参数接口
export interface QuestionQueryParams {
  answer?: string;
  content?: string;
  current?: number;
  difficulty?: string;
  id?: string;
  notId?: string;
  pageSize?: number;
  questionBankId?: string;
  searchText?: string;
  sortField?: string;
  sortOrder?: string;
  tags?: string[];
  title?: string;
  userId?: string;
}

// 分页获取题目列表（管理员端）
export const getQuestionList = (params: QuestionQueryParams): Promise<BaseResponse> => {
  return request.post('/api/question/list/page', params);
};

// 分页获取题目列表（用户端）
export const getQuestionListVO = (params: QuestionQueryParams): 
Promise<BaseResponse<{ records: any[]; total: number; size: number; current: number; pages: number }>> => {
  return request.post('/api/question/list/page/vo', params);
};

// 分页获取我的题目列表
export const getMyQuestionList = (params: QuestionQueryParams): Promise<BaseResponse> => {
  return request.post('/api/question/my/list/page', params);
};

// 添加题目
export const addQuestion = (data: any): Promise<BaseResponse> => {
  return request.post('/api/question/add', data);
};

// 更新题目
export const updateQuestion = (data: any): Promise<BaseResponse> => {
  return request.post('/api/question/update', data);
};

// 删除题目
export const deleteQuestion = (id: string): Promise<BaseResponse> => {
  return request.post('/api/question/delete', null, {
    params: { id }
  });
};

// 获取题目详情（管理员端）
export const getQuestionById = (id: string): Promise<BaseResponse> => {
  return request.get('/api/question/get', {
    params: { id }
  });
};

// 获取题目详情（用户端）
export const getQuestionVOById = (id: string): Promise<BaseResponse> => {
  return request.get('/api/question/get/vo', {
    params: { id }
  });
};

// 题目答题接口
export const answerQuestion = (data: { questionId: string; answer: string }): Promise<BaseResponse> => {
  return request.post('/api/question/answer', data);
};