import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 获取题库列表（不分页）
export const fetchQuestionBanks = (): Promise<BaseResponse> => {
  return request.post('/api/questionBank/list/vo');
};

// 分页获取题库列表（管理员使用）
export const getQuestionBankList = (params: any): Promise<BaseResponse> => {
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

// 获取题库详情（管理员使用）
export const getQuestionBankById = (id: number): Promise<BaseResponse> => {
  return request.get('/api/questionBank/get', {
    params: { id }
  });
};