import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 错题本接口
export interface MistakeNotebook {
  id: string;
  name: string;
  userId: string;
  color: string;
  count: number;
  createTime: number;
}

// 错题接口
export interface WrongQuestion {
  id: string;
  topic: string;
  answer: string;
  wrongAnswer: string;
  questionId: string;
  a: string;
  b: string;
  c: string;
  d: string;
  answerAnalysis?: string;
  knowledgeTags?: string[] | string;
  state?: string;
}

// 用户错题分析统计
export interface UserWrongQuestionAnalyze {
  totalCount: number;
  solvedCount: number;
  solvedRate: string;
}

// 添加错题本
export const addMistakeNotebook = (data: { name: string; color: string }): Promise<BaseResponse<string>> => {
  return request.post('/api/mistakeNotebook/add', data);
};

// 更新错题本
export const updateMistakeNotebook = (data: { id: string; name: string; color: string }): Promise<BaseResponse<string>> => {
  return request.post('/api/mistakeNotebook/update', data);
};

// 获取错题本列表
export const getMistakeNotebooks = (): Promise<BaseResponse<MistakeNotebook[]>> => {
  return request.get('/api/mistakeNotebook/get');
};

// 删除错题本
export const deleteMistakeNotebook = (mistakeNoteBookId: string): Promise<BaseResponse<string>> => {
  return request.delete('/api/mistakeNotebook/delete', {
    params: { mistakeNoteBookId }
  });
};

// 添加错题到错题本
export const addWrongQuestionToNotebook = (data: {
  choiceQuestionId: string;
  mistakeNoteBookId: string;
  wrongAnswer: string;
}): Promise<BaseResponse<string>> => {
  return request.post('/api/mistakeNotebook/wrongQuestion/add', data);
};

// 从错题本移除错题
export const removeWrongQuestionFromNotebook = (data: {
  choiceQuestionId: string;
  mistakeNoteBookId: string;
}): Promise<BaseResponse<string>> => {
  return request.delete('/api/mistakeNotebook/wrongQuestion/remove', { data });
};

// 获取错题本的错题列表
export const getWrongQuestionsByNotebookId = (mistakeNotebookId: string): Promise<BaseResponse<WrongQuestion[]>> => {
  return request.get('/api/mistakeNotebook/wrongQuestion/get', {
    params: { mistakeNotebookId }
  });
};

// 动态条件查询错题
export const getWrongQuestionsByCondition = (data: {
  knowledgeTags: string[];
  mistakeNotebookId: string;
  topic: string;
}): Promise<BaseResponse<WrongQuestion[]>> => {
  return request.post('/api/mistakeNotebook/wrongQuestion/getByDynamicCondition', data);
};

// 设置错题状态
export const setWrongQuestionState = (data: {
  choiceQuestionId: string;
  mistakeNoteBookId: string;
  state: string;
}): Promise<BaseResponse<string>> => {
  return request.post('/api/mistakeNotebook/wrongQuestion/setState', data);
};

// 批量删除错题
export const batchDeleteWrongQuestions = (data: {
  choiceQuestionIds: string[];
  mistakeNoteBookId: string;
}): Promise<BaseResponse<string>> => {
  return request.post('/api/mistakeNotebook/wrongQuestion/deleteByBatch', data);
};

// 批量移动错题
export const batchMoveWrongQuestions = (data: {
  choiceQuestionIds: string[];
  oldMistakeNoteBookId: string;
  newMistakeNoteBookId: string;
}): Promise<BaseResponse<string>> => {
  return request.post('/api/mistakeNotebook/wrongQuestion/moveByBatch', data);
};

// 获取用户错题分析
export const getUserWrongQuestionAnalyze = (): Promise<BaseResponse<UserWrongQuestionAnalyze>> => {
  return request.get('/api/mistakeNotebook/getUserWrongQuestionAnalyze');
};