import request from '@/utils/request';

export interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 用户VO
export interface UserVO {
  id: number;
  jobPosition: string[];
  userAccount: string;
  userAvatar: string;
  userName: string;
  userProfile: string;
}

// 用户签到
export const userSignIn = (): Promise<BaseResponse<boolean>> => {
  return request.post('/api/user/signIn');
};

// 获取用户签到记录
export const getUserSignInRecord = (year?: number): Promise<BaseResponse<number[]>> => {
  return request.get('/api/user/get/signInRecord', {
    params: { year }
  });
};

// 分页获取用户列表（后台）
export const getUsers = (params: any): Promise<BaseResponse> => {
  return request.post('/api/user/list/page', params);
};

// 分页获取用户VO列表
export const getUsersVO = (params: any): Promise<BaseResponse> => {
  return request.post('/api/user/list/page/vo', params);
};

// 添加用户
export const addUser = (data: any): Promise<BaseResponse<number>> => {
  return request.post('/api/user/add', data);
};

// 更新用户
export const updateUser = (data: any): Promise<BaseResponse<string>> => {
  return request.post('/api/user/update', data);
};

// 更新当前用户信息
export const updateMyInfo = (formData: FormData): Promise<BaseResponse<string>> => {
  return request.post('/api/user/update/myInfo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 更新当前用户密码
export const updateMyPassword = (data: {
  oldPassword: string;
  newPassword: string;
  checkPassword: string;
}): Promise<BaseResponse<string>> => {
  return request.post('/api/user/update/myPassword', data);
};

// 删除用户
export const deleteUser = (userId: number): Promise<BaseResponse<string>> => {
  return request.post(`/api/user/delete?userId=${userId}`);
};

// 获取用户详情（后台）
export const getUserById = (id: number): Promise<BaseResponse> => {
  return request.get('/api/user/get', {
    params: { id }
  });
};

// 获取用户VO
export const getUserVOById = (id: number): Promise<BaseResponse<UserVO>> => {
  return request.get('/api/user/get/vo', {
    params: { id }
  });
};

// 封禁用户
export const blockUser = (userId: number): Promise<BaseResponse<string>> => {
  return request.post(`/api/user/block?userId=${userId}`);
};

// 解封用户
export const unblockUser = (userId: number): Promise<BaseResponse<string>> => {
  return request.post(`/api/user/unblock?userId=${userId}`);
};