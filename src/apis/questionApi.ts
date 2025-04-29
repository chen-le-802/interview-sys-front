import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 不分页获取题库列表（管理员端）
export const getQuestionBankList = (): Promise<BaseResponse> => {
  return request.post('/api/questionBank/list');
};

// 分页获取题目列表（管理员端）
export const getQuestionList = (params: any): Promise<BaseResponse> => {
  return request.post('/api/question/list/page', params);
};

// 分页获取题目列表（用户端）
export const getQuestionListVO = (params: any): Promise<BaseResponse> => {
  return request.post('/api/question/list/page/vo', params);
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
  return request.post('/api/question/delete', { id });
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