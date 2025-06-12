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
  createTime: number;
}

// 错题接口
export interface WrongQuestion {
  id: string;
  topic: string;
  answer: string;
  questionId: string;
  a: string;
  b: string;
  c: string;
  d: string;
  answerAnalysis?: string;
  knowledgeTags?: string[];
}

// 添加错题本
export const addMistakeNotebook = (data: { name: string; color: string }): Promise<BaseResponse<string>> => {
  return request.post('/api/mistakeNotebook/add', data);
};

// 获取错题本列表
export const getMistakeNotebooks = (): Promise<BaseResponse<MistakeNotebook[]>> => {
  return request.get('/api/mistakeNotebook/get');
};

// 删除错题本
export const deleteMistakeNotebook = (mistakeNoteBookId: string): Promise<BaseResponse<null>> => {
  return request.delete('/api/mistakeNotebook/delete', {
    params: { mistakeNoteBookId }
  });
};

// 添加错题到错题本
export const addWrongQuestionToNotebook = (data: {
  choiceQuestionId: string;
  mistakeNoteBookId: string;
}): Promise<BaseResponse<null>> => {
  return request.post('/api/mistakeNotebook/wrongQuestion/add', data);
};

// 从错题本移除错题
export const removeWrongQuestionFromNotebook = (data: {
  choiceQuestionId: string;
  mistakeNoteBookId: string;
}): Promise<BaseResponse<null>> => {
  return request.delete('/api/mistakeNotebook/wrongQuestion/remove', { data });
};

// 获取错题本的错题列表
export const getWrongQuestionsByNotebookId = (mistakeNotebookId: string): Promise<BaseResponse<WrongQuestion[]>> => {
  return request.get('/api/mistakeNotebook/wrongQuestion/get', {
    params: { mistakeNotebookId }
  });
};