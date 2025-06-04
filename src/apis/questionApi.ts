import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 分页获取题目列表（管理员端）
export const getQuestionList = (params: any): Promise<BaseResponse> => {
  return request.post('/api/question/list/page', params);
};

// 分页获取题目列表（用户端）
export const getQuestionListVO = (params: any): Promise<BaseResponse> => {
  return request.post('/api/question/list/page/vo', params);
};

// 分页获取我的题目列表
export const getMyQuestionList = (params: any): Promise<BaseResponse> => {
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
export const deleteQuestion = (id: number): Promise<BaseResponse> => {
  return request.post('/api/question/delete', null, {
    params: { id }
  });
};

// 获取题目详情（管理员端）
export const getQuestionById = (id: number): Promise<BaseResponse> => {
  return request.get('/api/question/get', {
    params: { id }
  });
};

// 获取题目详情（用户端）
export const getQuestionVOById = (id: number): Promise<BaseResponse> => {
  return request.get('/api/question/get/vo', {
    params: { id }
  });
};

// 题目答题接口
export const answerQuestion = (data: { questionId: number; answer: string }): Promise<BaseResponse> => {
  return request.post('/api/question/answer', data);
};