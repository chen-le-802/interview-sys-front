import { getCurrentUser } from '@/apis/authApi'
import router from '@/router'

// 记录登出状态的变量
let recentlyLoggedOut = false;

// 设置登出状态
export const setLoggedOutState = () => {
  recentlyLoggedOut = true;
  
  // 3秒后重置状态，避免长时间影响
  setTimeout(() => {
    recentlyLoggedOut = false;
  }, 3000);
}

// 获取登出状态
export const wasRecentlyLoggedOut = () => {
  return recentlyLoggedOut;
}

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
  // 如果刚刚登出，直接返回false
  if (recentlyLoggedOut) {
    return false;
  }
  
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  
  if (!token || !userInfo) {
    return false
  }
  
  try {
    // 确保 userInfo 是有效的 JSON
    JSON.parse(userInfo)
    return true
  } catch {
    // 如果解析失败，清除无效数据
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    return false
  }
}

// 获取当前用户信息
export const getUserInfo = (): any => {
  const userInfo = localStorage.getItem('userInfo')
  return userInfo ? JSON.parse(userInfo) : null
}

// 清除登录状态
export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('expireTime')
  
  // 设置登出状态标记
  setLoggedOutState();
}

// 刷新用户信息
export const refreshUserInfo = async () => {
  try {
    const response = await getCurrentUser()
    if (response.code === 0) {
      localStorage.setItem('userInfo', JSON.stringify(response.data))
      return response.data
    } else {
      clearAuth()
      router.push('/login')
      return null
    }
  } catch (error) {
    clearAuth()
    router.push('/login')
    return null
  }
}

// 检查用户角色
export const hasRole = (role: string): boolean => {
  const userInfo = getUserInfo()
  return userInfo && userInfo.userRole === role
}

// 是否是管理员
export const isAdmin = (): boolean => {
  return hasRole('admin')
}