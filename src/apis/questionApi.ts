import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 获取题库列表（用于下拉选择）
export const getQuestionBankList = (): Promise<BaseResponse> => {
  return request.post('/api/questionBank/list/vo');
};

// 获取题目列表
export const getQuestionList = (params: any): Promise<BaseResponse> => {
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

// 获取题目详情
export const getQuestionById = (id: number) => {
  return request.get('/api/question/get/vo', {
    params: { id }
  });
};