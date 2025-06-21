import { getCurrentUser } from '@/apis/authApi'
import router from '@/router'

// 记录登出状态的变量
let recentlyLoggedOut = false;

// 用于存储上次验证时间
let lastVerificationTime = 0;

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
  const expireTime = localStorage.getItem('expireTime')
  
  if (!token || !userInfo) {
    return false
  }
  
  // 检查会话是否过期（设置为24小时）
  if (expireTime) {
    const expireTimestamp = parseInt(expireTime);
    if (Date.now() > expireTimestamp) {
      // 会话已过期，清除认证信息
      clearAuth();
      return false;
    }
  }
  
  try {
    // 确保 userInfo 是有效的 JSON
    JSON.parse(userInfo)
    return true
  } catch {
    // 如果解析失败，清除无效数据
    clearAuth();
    return false
  }
}

// 设置用户信息
export const setUserInfo = (userData: any) => {
  localStorage.setItem('userInfo', JSON.stringify(userData));
  // 设置会话过期时间（24小时后）
  const expireTime = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem('expireTime', expireTime.toString());
  // 更新验证时间
  lastVerificationTime = Date.now();
}

// 获取当前用户信息
export const getUserInfo = (): any => {
  const userInfo = localStorage.getItem('userInfo')
  return userInfo ? JSON.parse(userInfo) : null
}

// 获取带时间戳的头像URL（避免缓存）
export const getUserAvatarWithTimestamp = (): string => {
  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.userAvatar) {
    return '/avatar.png';
  }
  
  // 使用上次验证时间作为时间戳
  const timestamp = lastVerificationTime || Date.now();
  const avatarUrl = userInfo.userAvatar;
  
  // 添加时间戳参数以防止缓存
  return avatarUrl.includes('?') 
    ? `${avatarUrl}&t=${timestamp}` 
    : `${avatarUrl}?t=${timestamp}`;
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
      // 使用新的setUserInfo保存用户信息并设置过期时间
      setUserInfo(response.data);
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

// 验证登录状态 - 添加新函数
export const verifyAuthStatus = async (force = false): Promise<boolean> => {
  // 如果未登录，直接返回false
  if (!isAuthenticated()) {
    return false;
  }
  
  // 如果强制验证或者上次验证时间超过5分钟，则向服务器验证
  const now = Date.now();
  if (force || now - lastVerificationTime > 5 * 60 * 1000) {
    try {
      const response = await getCurrentUser();
      if (response.code === 0) {
        // 更新用户信息和验证时间
        setUserInfo(response.data);
        lastVerificationTime = now;
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error) {
      console.error('验证登录状态失败', error);
      clearAuth();
      return false;
    }
  }
  
  return true;
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

// 初始验证 - 应在应用启动时调用
export const initialAuthCheck = async () => {
  if (isAuthenticated()) {
    await verifyAuthStatus(true);
  }
}