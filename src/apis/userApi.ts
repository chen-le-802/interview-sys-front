import request from '@/utils/request';

// 分页获取用户列表
export const getUsers = (params: any) => {
  return request.post('/api/user/list/page/vo', params);
};

// 添加用户
export const addUser = (data: any) => {
  return request.post('/api/user/add', data);
};

// 更新用户
export const updateUser = (data: any) => {
  return request.post('/api/user/update', data);
};

// 删除用户
export const deleteUser = (id: number) => {
  return request.post('/api/user/delete', { id });
};

// 获取用户详情
export const getUserById = (id: number) => {
  return request.get('/api/user/get', {
    params: { id }
  });
};

// 封禁用户 (后端未实现)
export const blockUser = (id: number) => {
  return request.post('/api/user/block', { id });
};

// 解封用户 (后端未实现)
export const unblockUser = (id: number) => {
  return request.post('/api/user/unblock', { id });
};