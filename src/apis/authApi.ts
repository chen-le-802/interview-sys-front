import request from '@/utils/request'

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

export interface UserVO {
  id: number;
  jobPosition: string[];
  userAccount: string;
  userAvatar: string;
  userName: string;
  userProfile: string;
}

// 用户登录
export const userLogin = (params: LoginParams): Promise<BaseResponse<LoginResponse>> => {
  return request({
    url: '/api/user/login',
    method: 'POST',
    data: params
  })
}

// 用户注册
export const userRegister = (params: RegisterParams): Promise<BaseResponse<number>> => {
  return request({
    url: '/api/user/register',
    method: 'POST',
    data: params
  })
}

// 获取当前登录用户
export const getCurrentUser = (): Promise<BaseResponse<LoginResponse>> => {
  return request({
    url: '/api/user/get/login',
    method: 'GET'
  })
}

// 用户登出
export const userLogout = (): Promise<BaseResponse<boolean>> => {
  return request({
    url: '/api/user/logout',
    method: 'POST'
  })
}

export default request