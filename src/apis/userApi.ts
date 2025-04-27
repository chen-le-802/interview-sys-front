import request from '@/utils/request';

// 分页获取用户列表（后台）
export const getUsers = (params: any) => {
  return request.post('/api/user/list/page', params);
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

// 获取用户详情（后台）
export const getUserById = (id: number) => {
  return request.get('/api/user/get', {
    params: { id }
  });
};

// 封禁用户
export const blockUser = (userId: number) => {
  return request.post(`/api/user/block?userId=${userId}`);
};

// 解封用户
export const unblockUser = (userId: number) => {
  return request.post(`/api/user/unblock?userId=${userId}`);
};