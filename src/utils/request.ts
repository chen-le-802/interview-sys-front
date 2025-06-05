import axios from 'axios';
import router from '@/router';
import { ElMessage } from 'element-plus';
import JSONBig from 'json-bigint';

const URL_API = 'http://localhost:8101';

// 创建 Axios 实例
const request = axios.create({
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  },
  transformResponse: [
    function (data: any) {
      // data 可能是空（例如 DELETE 返回 204 No Content），直接返回空
      if (!data) return data;
      try {
        // JSONBig({ storeAsString: true }) 会把超大整数当字符串存储
        return JSONBig({ storeAsString: true }).parse(data);
      } catch (err) {
        // 如果不是 JSON 或解析失败，退回到正常的 JSON.parse
        try {
          return JSON.parse(data);
        } catch (e) {
          return data;
        }
      }
    }
  ]
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    if (!config.url) {
      return Promise.reject(new Error('Request URL is required'));
    }

    // 如果 URL 中不包含 'http://'，就给它加上基础前缀
    if (!config.url.includes('http://')) {
      config.url = URL_API + config.url;
    }

    // 哪些接口不需要 token，可以跳过
    const noTokenUrls = [
      '/api/user/login',
      '/api/user/register',
      '/api/user/get/login'
    ];
    if (!noTokenUrls.some(url => config.url?.includes(url))) {
      const expireTime = localStorage.getItem('expireTime');
      if (expireTime && parseInt(expireTime) <= new Date().getTime()) {
        ElMessage.error('登录已过期，请重新登录');
        router.push('/login');
        return Promise.reject(new Error('Token expired'));
      }

      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 允许携带 cookie
    config.withCredentials = true;
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 由于 transformResponse 已经把 data 用 JSONBig.parse 处理过了，
    // 这里 response.data 就已经是 JS 对象（并且超大整数字段都是 string）
    const res = response.data;
    console.log('响应数据:', res); // （开发环境调试用，正式环境请删除）

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