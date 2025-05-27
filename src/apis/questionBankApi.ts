import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 不分页获取题库列表（管理员端）
export const getQuestionBankList = (): Promise<BaseResponse> => {
  return request.get('/api/questionBank/list');
};

// 获取题库统计信息列表
export const getQuestionBankAnalyzeList = (): Promise<BaseResponse> => {
  return request.get('/api/questionBank/list/analyze/vo');
};

// 分页获取题库列表（管理员端）
export const getQuestionBankPage = (params: any): Promise<BaseResponse> => {
  return request.post('/api/questionBank/list/page', params);
};

// 添加题库
export const addQuestionBank = (formData: FormData): Promise<BaseResponse> => {
  return request.post('/api/questionBank/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 更新题库
export const updateQuestionBank = (formData: FormData): Promise<BaseResponse> => {
  return request.post('/api/questionBank/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 删除题库
export const deleteQuestionBank = (id: number): Promise<BaseResponse> => {
  return request.post('/api/questionBank/delete', null, {
    params: { id }
  });
};

// 获取题库详情（管理员端）
export const getQuestionBankById = (id: number): Promise<BaseResponse> => {
  return request.get('/api/questionBank/get', {
    params: { id }
  });
};

// 获取题库VO详情
export const getQuestionBankVOById = (id: number): Promise<BaseResponse> => {
  return request.get('/api/questionBank/get/vo', {
    params: { id }
  });
};

// 分页获取我的题库列表（用户端）
export const getMyQuestionBanks = (params: any): Promise<BaseResponse> => {
  return request.get('/api/questionBank/my/list/page/vo', { params });
};