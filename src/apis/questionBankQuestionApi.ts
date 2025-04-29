import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 添加题目到题库
export const addQuestionToBank = (questionId: number, questionBankId: number): Promise<BaseResponse> => {
  return request.post('/api/questionBankQuestion/add', {
    questionId,
    questionBankId
  });
};

// 从题库中移除题目
export const removeQuestionFromBank = (id: number): Promise<BaseResponse> => {
  return request.post('/api/questionBankQuestion/delete', { id });
};

// 获取题目关联的题库
export const getQuestionBanksByQuestionId = (questionId: number): Promise<BaseResponse> => {
  return request.post('/api/questionBankQuestion/list/page', {
    questionId,
    pageSize: 100
  });
};

// 获取题库中的所有题目（分页）- 修复后的版本
export const getQuestionsByBankId = (questionBankId: number, params: any = {}): Promise<BaseResponse> => {
  // 确保正确构建参数对象
  const requestParams = {
    current: 1,
    pageSize: 100,
    questionBankId,
    ...params
  };
  
  return request.post('/api/questionBankQuestion/list/page/vo', requestParams);
};

// 建议后端添加的新接口 - 获取题库统计信息
export const getQuestionBankStats = (questionBankId: number): Promise<BaseResponse> => {
  return request.get('/api/questionBank/stats', {
    params: { 
      id: questionBankId 
    }
  });
};

// 更新题目的题库关联
export const updateQuestionBankRelation = async (questionId: number, questionBankId: number): Promise<boolean> => {
  try {
    // 1. 查询题目当前关联的题库
    const response = await getQuestionBanksByQuestionId(questionId);
    if (response.code !== 0 && response.code !== 200) {
      return false;
    }
    
    const records = response.data.records || [];
    
    // 2. 如果已有关联，先删除旧关联
    for (const record of records) {
      await removeQuestionFromBank(record.id);
    }
    
    // 3. 添加新关联
    const addResponse = await addQuestionToBank(questionId, questionBankId);
    return addResponse.code === 0 || addResponse.code === 200;
  } catch (error) {
    console.error('更新题目题库关联失败:', error);
    return false;
  }
};