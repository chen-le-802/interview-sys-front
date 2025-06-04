import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 题库查询请求参数类型
interface QuestionBankQueryParams {
  current?: number;
  pageSize?: number;
  description?: string;
  id?: number;
  notId?: number;
  searchText?: string;
  sortField?: string;
  sortOrder?: string;
  title?: string;
  userId?: number;
}

// 题库VO接口
export interface QuestionBankVO {
  id: number | string;
  title: string;
  description: string;
  picture: string;
  createTime: string;
  updateTime: string;
  user: {
    id: number;
    userName: string;
    userAvatar: string;
  };
  userId: number;
}

// 分页结果接口
interface Page<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
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
export const getQuestionBankPage = (params: QuestionBankQueryParams): Promise<BaseResponse> => {
  return request.post('/api/questionBank/list/page', params);
};

// 分页获取题库VO列表（用户端）
export const getQuestionBankVOPage = (params: QuestionBankQueryParams): Promise<BaseResponse<Page<QuestionBankVO>>> => {
  return request.post('/api/questionBank/list/page/vo', params);
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
  return request.post(`/api/questionBank/delete?id=${id}`);
};

// 获取题库详情（管理员端）
export const getQuestionBankById = (id: number): Promise<BaseResponse> => {
  return request.get('/api/questionBank/get', {
    params: { id }
  });
};

// 获取题库VO详情
export const getQuestionBankVOById = (id: string | number): Promise<BaseResponse<QuestionBankVO>> => {
  return request.get('/api/questionBank/get/vo', {
    params: { id }
  });
};

// 分页获取我的题库列表（用户端）
export const getMyQuestionBanks = (params: QuestionBankQueryParams): Promise<BaseResponse> => {
  return request.post('/api/questionBank/my/list/page/vo', params);
};