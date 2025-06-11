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
export interface ResumeVO{
  id: string
  name: string
  fileUrl: string
}
export interface ReportVO {
  id: number
  interviewId: number
  score: number
  candidate: {
    name: string
    position: string
    time: string
    duration: string
  }
  summary: string
  strengths: {
    title: string
    description: string
  }[]
  improvements: {
    title: string
    description: string
  }[]
  recommendation: string
  recommendationTag: string
  createTime: number
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
  },

  //删除面试记录
  deleteInterview: (interviewId: string): Promise<BaseResponse<string>> => {
    return request({
      url: `/api/interview/delete`,
      method: 'DELETE',
      params: { interviewId }
    })
  },

// 上传简历
uploadResume: async (file: File): Promise<BaseResponse<string>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    return request({
      url: '/api/resume/upload',
      method: 'POST',
      data: formData,
       headers: {
      'Content-Type': 'multipart/form-data' // 设置正确的 Content-Type
    }
    });
    
    
  } catch (error) {
    console.error('上传简历失败:', error);
    throw error;
  }
},

  getResumes:(): Promise<BaseResponse<ResumeVO>> => {
    return request({
      url: '/api/resume/list',
      method: 'GET'
    })
  },

  deleteResume: (id: string): Promise<BaseResponse<string>> => {
    return request({
      url: `/api/resume/${id}`,
      method: 'DELETE'
    })
  },
  startResumeInterviewOnResume:(resumeId?: string,type?:string): Promise<BaseResponse<string>> => {
    return request({
      url: `/api/resume/${resumeId}/interview/start`,
      method: 'POST',
      params: { type}
    })
  },
  getInterviewReport: (interviewId: string): Promise<BaseResponse<ReportVO>> => {
    return request({
      url: `/api/interview/assessment/${interviewId}`,
      method: 'GET'
    })
  },
  
  
}

export default request