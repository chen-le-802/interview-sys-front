interface TempErrorStatus {
  [key: string]: { // errorId
    status: 'solved' | 'unsolved';
    userAnswer?: string;
    updateTime: number;
  };
}

const STORAGE_KEY = 'temp_error_status';

export const tempStorage = {
  // 保存错题状态
  saveErrorStatus(errorId: string, status: 'solved' | 'unsolved', userAnswer?: string) {
    const data: TempErrorStatus = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    data[errorId] = {
      status,
      userAnswer,
      updateTime: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // 获取错题状态
  getErrorStatus(errorId: string) {
    const data: TempErrorStatus = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data[errorId] || { status: 'unsolved' as const, updateTime: Date.now() };
  },

  // 批量获取错题状态
  getBatchErrorStatus(errorIds: string[]) {
    const data: TempErrorStatus = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return errorIds.map(id => ({
      id,
      ...this.getErrorStatus(id)
    }));
  },

  // 删除错题状态
  removeErrorStatus(errorId: string) {
    const data: TempErrorStatus = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete data[errorId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // 批量删除错题状态
  batchRemoveErrorStatus(errorIds: string[]) {
    const data: TempErrorStatus = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    errorIds.forEach(id => delete data[id]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // 清理过期数据
  cleanExpiredData(expireDays = 30) {
    const data: TempErrorStatus = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const expireTime = Date.now() - (expireDays * 24 * 60 * 60 * 1000);
    
    Object.keys(data).forEach(key => {
      if (data[key].updateTime < expireTime) {
        delete data[key];
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};