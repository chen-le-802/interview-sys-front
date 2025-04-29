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

// 分页获取题库列表（管理员端）
export const getQuestionBankPage = (params: any): Promise<BaseResponse> => {
  return request.post('/api/questionBank/list/page', params);
};

// 添加题库
export const addQuestionBank = (data: any): Promise<BaseResponse> => {
  return request.post('/api/questionBank/add', data);
};

// 更新题库
export const updateQuestionBank = (data: any): Promise<BaseResponse> => {
  return request.post('/api/questionBank/edit', data);
};

// 删除题库
export const deleteQuestionBank = (id: number): Promise<BaseResponse> => {
  return request.post('/api/questionBank/delete', { id });
};

// 获取题库详情（管理员端）
export const getQuestionBankById = (id: number): Promise<BaseResponse> => {
  return request.get('/api/questionBank/get', {
    params: { id }
  });
};

// 分页获取我的题库列表（用户端）
export const getMyQuestionBanks = (params: any): Promise<BaseResponse> => {
  return request.post('/api/questionBank/my/list/page/vo', params);
};