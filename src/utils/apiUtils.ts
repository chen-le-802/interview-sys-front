// 转换难度值
export const convertDifficulty = (difficulty: string): string => {
    const difficultyMap: Record<string, string> = {
      'easy': '简单',
      'medium': '中等',
      'hard': '困难',
      '简单': '简单',
      '中等': '中等',
      '困难': '困难'
    };
    
    return difficultyMap[difficulty] || difficulty;
  };
  
  // 转换用户角色
  export const convertUserRole = (role: string, toApi: boolean = true): string => {
    if (toApi) {
      switch (role) {
        case 'admin':
          return 'ADMIN';
        case 'user':
          return 'USER';
        case 'vip':
          return 'VIP';
        default:
          return role.toUpperCase();
      }
    } else {
      switch (role) {
        case 'ADMIN':
          return 'admin';
        case 'USER':
          return 'user';
        case 'VIP':
          return 'vip';
        default:
          return role.toLowerCase();
      }
    }
  };
  
  // 处理日期格式
  export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  // 处理分页参数
  export const buildPaginationParams = (
    page: number,
    pageSize: number,
    sortField?: string,
    sortOrder?: string
  ) => {
    return {
      current: page,
      pageSize,
      ...(sortField && { sortField }),
      ...(sortOrder && { sortOrder })
    };
  };