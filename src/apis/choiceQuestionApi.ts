import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 选择题接口定义
export interface ChoiceQuestion {
  id?: string;
  topic: string;
  a: string;
  b: string;
  c: string;
  d: string;
  answer: 'a' | 'b' | 'c' | 'd';
  answerAnalysis?: string;
  knowledgeTags?: string[];
  questionId: string;
}

// 添加选择题请求参数
export interface AddChoiceQuestionParams {
  topic: string;
  a: string;
  b: string;
  c: string;
  d: string;
  answer: 'a' | 'b' | 'c' | 'd';
  answerAnalysis?: string;
  knowledgeTags?: string[];
  questionId: string;
}

// 更新选择题请求参数
export interface UpdateChoiceQuestionParams {
  id: string;
  topic: string;
  a: string;
  b: string;
  c: string;
  d: string;
  answer: 'a' | 'b' | 'c' | 'd';
  answerAnalysis?: string;
  knowledgeTags?: string[];
}

// 添加选择题
export const addChoiceQuestion = (data: AddChoiceQuestionParams): Promise<BaseResponse<number>> => {
  const requestData = {
    ...data,
    questionId: data.questionId,
    knowledgeTags: data.knowledgeTags || []
  };
  return request.post('/api/choiceQuestion/add', requestData);
};

// 获取选择题列表（根据题目ID）
export const getChoiceQuestionsByQuestionId = (questionId: string): Promise<BaseResponse<ChoiceQuestion[]>> => {
  return request.get('/api/choiceQuestion/get', {
    params: { questionId }
  });
};

// 删除选择题
export const deleteChoiceQuestion = (choiceQuestionId: string): Promise<BaseResponse<null>> => {
  return request.delete('/api/choiceQuestion/delete', {
    params: { choiceQuestionId }
  });
};

// 更新选择题
export const updateChoiceQuestion = (data: UpdateChoiceQuestionParams): Promise<BaseResponse<null>> => {
  const requestData = {
    ...data,
    id: data.id,
    knowledgeTags: data.knowledgeTags || []
  };
  return request.post('/api/choiceQuestion/update', requestData);
};