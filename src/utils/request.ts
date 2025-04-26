import axios from "axios";
import router from '@/router'
import { ElMessage } from 'element-plus'

const URL_API = 'http://localhost:8101';

const request = axios.create({
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
request.interceptors.request.use(config => {
  // 添加类型守卫，确保 url 存在
  if (!config.url) {
    return Promise.reject(new Error('Request URL is required'));
  }
  
  // 统一添加前缀
  if (!config.url.includes('http://')) {
    config.url = URL_API + config.url;
  }
  
  // 判断token是否过期
  // 不需要 token 的接口列表
  const noTokenUrls = [
    '/api/user/login',
    '/api/user/register',
    '/api/user/get/login'
  ];

  // 如果是不需要 token 的接口，直接跳过检查
  if (!noTokenUrls.some(url => config.url?.includes(url))) {
    const expireTime = localStorage.getItem('expireTime');
    if (expireTime && parseInt(expireTime) <= new Date().getTime()) {
      ElMessage.error('登录已过期，请重新登录');
      router.push('/login');
      return Promise.reject(new Error('Token expired'));
    }
    
    // 从 localStorage 中获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  config.withCredentials = true; // 允许携带 cookie
  return config;
}, error => {
  console.error('请求错误:', error);
  return Promise.reject(error);
});

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data;
    console.log('响应数据:', res); // 调试用
    
    // 直接返回完整响应，让组件自己处理 code
    return res;
  },
  error => {
    console.error('响应错误:', error);
    
    // 处理HTTP错误
    if (error.response) {
      switch (error.response.status) {
        case 400:
          ElMessage.error('请求参数错误');
          break;
        case 401:
          ElMessage.error('未登录或登录已过期');
          localStorage.removeItem('token');
          router.push('/login');
          break;
        case 403:
          ElMessage.error('没有权限访问');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error('网络错误');
      }
    } else {
      ElMessage.error('网络连接失败');
    }
    return Promise.reject(error);
  }
);

export default request;