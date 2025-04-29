import request from '@/utils/request';

interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

interface LoginParams {
  userAccount: string;
  userPassword: string;
}

interface RegisterParams {
  userAccount: string;
  userPassword: string;
  checkPassword: string;
  userName?: string;
}

interface LoginResponse {
  id: number;
  userName: string;
  userAvatar: string;
  userRole: string;
  createTime: string;
  userAccount: string;  
  userProfile?: string;
  jobPosition?: string[] | string;
  status?: string;
}

// 用户登录
export const userLogin = (params: LoginParams): Promise<BaseResponse<LoginResponse>> => {
  return request.post('/api/user/login', params);
};

// 用户注册
export const userRegister = (params: RegisterParams): Promise<BaseResponse<number>> => {
  return request.post('/api/user/register', params);
};

// 获取当前登录用户
export const getCurrentUser = (): Promise<BaseResponse<LoginResponse>> => {
  return request.get('/api/user/get/login');
};

// 用户登出
export const userLogout = (): Promise<BaseResponse<boolean>> => {
  return request.post('/api/user/logout');
};