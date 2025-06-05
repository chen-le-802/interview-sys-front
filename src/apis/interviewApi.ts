import request from '@/utils/request'

// 基础响应类型
export interface BaseResponse<T = any> {
  code: number
  data: T
  message: string
}

// 面试相关类型定义
export interface InterviewVO {
  id: string
  name: string
  userId: string
  createTime: string
  userReplyList: string[]
  aireplyList: string[]
  jobPosition: string[]
}

export interface UserVO {
  id: string
  userAccount: string
  userAvatar: string
  userName: string
  userProfile: string
  jobPosition: string[]
}

export interface LoginUserVO {
  id: string
  userAccount: string
  userAvatar: string
  userName: string
  userProfile: string
  jobPosition: string[]
  status: string
  userRole: string
  createTime: string
  updateTime: string
}

// 面试相关API
export const interviewApi = {
  // 开始面试
  startInterview: (type?: string): Promise<BaseResponse<string>> => {
    return request({
      url: '/api/interview/start',
      method: 'POST',
      params: { type }
    })
  },

  // 用户回复
  userReply: (userReply: string): Promise<BaseResponse<string>> => {
    return request({
      url: '/api/interview/reply',
      method: 'POST',
      params: { userReply }
    })
  },

  // 结束面试
  endInterview: (): Promise<BaseResponse<string>> => {
    return request({
      url: '/api/interview/end',
      method: 'POST'
    })
  },

  // 获取用户面试记录
  getUserInterviewRecords: (): Promise<BaseResponse<InterviewVO[]>> => {
    return request({
      url: '/api/interview/records',
      method: 'GET'
    })
  }
}

export default request