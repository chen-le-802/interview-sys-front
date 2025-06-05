// storage.ts

// 用户信息接口定义
export interface UserInfo {
  id: string; // 用户ID
    userName: string;
    userAvatar?: string;
    uerAccount?: string; // 用户账号
    // 可添加其他用户信息字段
}

/**
 * 安全获取 localStorage 值
 * @param key 存储键名
 * @returns 存储值或null
 */
export function getItem(key: string): string | null {
    if (typeof key !== 'string') {
        console.error('[storage] Key must be a string');
        return null;
    }
    
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`[storage] Failed to get item "${key}":`, error);
        return null;
    }
}

/**
 * 安全设置 localStorage 值
 * @param key 存储键名
 * @param value 存储值
 */
export function setItem(key: string, value: string): void {
    if (typeof key !== 'string' || typeof value !== 'string') {
        console.error('[storage] Key and value must be strings');
        return;
    }
    
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`[storage] Failed to set item "${key}":`, error);
    }
}

/**
 * 安全移除 localStorage 项
 * @param key 存储键名
 */
export function removeItem(key: string): void {
    if (typeof key !== 'string') {
        console.error('[storage] Key must be a string');
        return;
    }
    
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`[storage] Failed to remove item "${key}":`, error);
    }
}

/**
 * 清空 localStorage
 */
export function clearStorage(): void {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('[storage] Failed to clear storage:', error);
    }
}

/**
 * 获取用户信息对象
 * @returns UserInfo 对象或null
 */
export function getUserInfo(): UserInfo | null {
    const userData = getItem('userInfo');
    
    if (!userData) return null;
    
    try {
        return JSON.parse(userData) as UserInfo;
    } catch (error) {
        console.error('[storage] Failed to parse userInfo:', error);
        return null;
    }
}

/**
 * 设置用户信息
 * @param userInfo 用户信息对象
 */
export function setUserInfo(userInfo: UserInfo): void {
    try {
        const jsonData = JSON.stringify(userInfo);
        setItem('userInfo', jsonData);
    } catch (error) {
        console.error('[storage] Failed to set userInfo:', error);
    }
}

/**
 * 获取用户名
 * @returns 用户名或null
 */
export function getUserName(): string | null {
    const userInfo = getUserInfo();
    return userInfo?.userName || null;
}

/**
 * 获取用户头像
 * @param defaultAvatar 默认头像URL
 * @returns 头像URL
 */
export function getUserAvatar(defaultAvatar: string = ''): string {
    const userInfo = getUserInfo();
    return userInfo?.userAvatar || defaultAvatar;
}

/**
 * 获取用户ID

 * @returns 头像URL
 */
export function getUserID(): string | undefined {
    const userInfo = getUserInfo();
    return userInfo?.id ;
}


/**
 * 清除用户相关存储
 */
export function clearUserData(): void {
    removeItem('userInfo');
    removeItem('token'); // 通常同时清除token
}