import request from '@/utils/request';

export interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 题库查询请求参数类型
export interface QuestionBankQueryParams {
  current?: number;
  pageSize?: number;
  description?: string;
  id?: string;
  notId?: string;
  searchText?: string;
  sortField?: string;
  sortOrder?: string;
  title?: string;
  userId?: string;
}

// 题目 VO
export interface QuestionVO {
  id: string;
  title: string;
  content: string;
  difficulty: string;
  tags: string;
  tagList?: string[];
  submissionQuantity: number;
  passRate: string;
  updateTime: string;
  userId: string;
}

// 题库 VO
export interface QuestionBankVO {
  id: string;
  title: string;
  description: string;
  picture: string;
  createTime: string;
  updateTime: string;
  user: {
    id: string;
    userName: string;
    userAvatar: string;
  };
  userId: string;
  questions?: QuestionVO[];
}

// 分页结果接口
export interface Page<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 不分页获取题库列表（管理员端）
export const getQuestionBankList = (): Promise<BaseResponse<QuestionBankVO[]>> => {
  return request.get('/api/questionBank/list');
};

// 获取题库统计信息列表
export const getQuestionBankAnalyzeList = (): Promise<BaseResponse<any>> => {
  return request.get('/api/questionBank/list/analyze/vo');
};

// 分页获取题库列表（管理员端）
export const getQuestionBankPage = (
  params: QuestionBankQueryParams
): Promise<BaseResponse<Page<any>>> => {
  return request.post('/api/questionBank/list/page', params);
};

// 分页获取题库 VO 列表（用户端）
export const getQuestionBankVOPage = (
  params: QuestionBankQueryParams = {}
): Promise<BaseResponse<Page<QuestionBankVO>>> => {
  const defaultParams = {
    current: 1,
    pageSize: 20,
    ...params
  };
  return request.post('/api/questionBank/list/page/vo', defaultParams);
};

// 添加题库
export const addQuestionBank = (formData: FormData): Promise<BaseResponse<any>> => {
  return request.post('/api/questionBank/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 更新题库
export const updateQuestionBank = (formData: FormData): Promise<BaseResponse<any>> => {
  return request.post('/api/questionBank/update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 删除（软删除/启用题库）
export const deleteQuestionBank = (id: string): Promise<BaseResponse<any>> => {
  return request.post(`/api/questionBank/delete?id=${id}`);
};

// 获取题库详情（管理员端）
export const getQuestionBankById = (id: string): Promise<BaseResponse<any>> => {
  return request.get('/api/questionBank/get', {
    params: { id }
  });
};

// 获取题库 VO 详情（用户端）
export const getQuestionBankVOById = (
  id: string
): Promise<BaseResponse<QuestionBankVO>> => {
  return request.get('/api/questionBank/get/vo', {
    params: { id }
  });
};

// 分页获取“我的题库”列表（用户端）
export const getMyQuestionBanks = (
  params: QuestionBankQueryParams
): Promise<BaseResponse<Page<QuestionBankVO>>> => {
  return request.post('/api/questionBank/my/list/page/vo', params);
};