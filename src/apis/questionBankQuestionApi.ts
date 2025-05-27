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

// 获取题目关联的题库列表（分页）
export const getQuestionBanksByQuestionId = (questionId: number, params: any = {}): Promise<BaseResponse> => {
  const requestParams = {
    current: 1,
    pageSize: 100,
    questionId,
    ...params
  };
  
  return request.post('/api/questionBankQuestion/list/page', requestParams);
};

// 获取题库中的题目数量
export const getQuestionCountByBankId = (questionBankId: number): Promise<BaseResponse> => {
  return request.get('/api/questionBankQuestion/get/count', {
    params: { 
      questionBankId 
    }
  });
};

// 获取题库题目关联详情
export const getQuestionBankQuestionVO = (id: number): Promise<BaseResponse> => {
  return request.get('/api/questionBankQuestion/get/vo', {
    params: { id }
  });
};

// 更新题库题目关联
export const updateQuestionBankQuestion = (data: {
  id: number;
  questionBankId?: number;
  questionId?: number;
}): Promise<BaseResponse> => {
  return request.post('/api/questionBankQuestion/update', data);
};

// 更新题目的题库关联（业务逻辑封装）
export const updateQuestionBankRelation = async (questionId: number, newQuestionBankId: number): Promise<boolean> => {
  try {
    // 1. 查询题目当前关联的题库
    const response = await getQuestionBanksByQuestionId(questionId);
    if (response.code !== 0) {
      console.error('查询题目关联的题库失败:', response.message);
      return false;
    }
    
    const records = response.data?.records || [];
    
    // 2. 如果已有关联且与新题库不同，先删除旧关联
    const existingRelation = records.find((record: any) => record.questionBankId !== newQuestionBankId);
    if (existingRelation) {
      const deleteResponse = await removeQuestionFromBank(existingRelation.id);
      if (deleteResponse.code !== 0) {
        console.error('删除旧关联失败:', deleteResponse.message);
        return false;
      }
    }
    
    // 3. 检查是否已存在目标关联
    const targetRelationExists = records.some((record: any) => record.questionBankId === newQuestionBankId);
    if (targetRelationExists) {
      return true; // 已存在目标关联，无需重复添加
    }
    
    // 4. 添加新关联
    const addResponse = await addQuestionToBank(questionId, newQuestionBankId);
    if (addResponse.code !== 0) {
      console.error('添加新关联失败:', addResponse.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('更新题目题库关联失败:', error);
    return false;
  }
};

// 批量添加题目到题库
export const batchAddQuestionsToBank = async (questionIds: number[], questionBankId: number): Promise<boolean> => {
  try {
    const promises = questionIds.map(questionId => 
      addQuestionToBank(questionId, questionBankId)
    );
    
    const results = await Promise.all(promises);
    return results.every(result => result.code === 0);
  } catch (error) {
    console.error('批量添加题目到题库失败:', error);
    return false;
  }
};

// 批量从题库移除题目
export const batchRemoveQuestionsFromBank = async (relationIds: number[]): Promise<boolean> => {
  try {
    const promises = relationIds.map(id => removeQuestionFromBank(id));
    const results = await Promise.all(promises);
    return results.every(result => result.code === 0);
  } catch (error) {
    console.error('批量从题库移除题目失败:', error);
    return false;
  }
};