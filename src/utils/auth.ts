import { getCurrentUser } from '@/apis/authApi'
import router from '@/router'

// 记录登出状态的变量
let recentlyLoggedOut = false;

// 用于存储上次验证时间
let lastVerificationTime = 0;

// 防止重复验证的标志
let isVerifying = false;

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
  
  const userInfo = localStorage.getItem('userInfo')
  
  if (!userInfo) {
    return false
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
  localStorage.removeItem('userInfo')
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
      return null
    }
  } catch (error) {
    clearAuth()
    return null
  }
}

// 验证登录状态
export const verifyAuthStatus = async (force = false): Promise<boolean> => {
  // 如果正在验证中，避免重复验证
  if (isVerifying && !force) {
    return isAuthenticated();
  }
  
  const now = Date.now();
  
  // 如果强制验证或者上次验证时间超过2分钟，则向服务器验证
  if (force || now - lastVerificationTime > 2 * 60 * 1000) {
    isVerifying = true;
    
    try {
      const response = await getCurrentUser();
      if (response.code === 0) {
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
    } finally {
      isVerifying = false;
    }
  }
  
  return isAuthenticated();
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

// 初始验证
export const initialAuthCheck = async () => {
  // 检查当前路径，避免在登录/注册页面进行验证
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath === '/register') {
    return;
  }
  
  // 只有本地有用户信息时才进行服务器验证
  if (isAuthenticated()) {
    await verifyAuthStatus(true);
  }
}