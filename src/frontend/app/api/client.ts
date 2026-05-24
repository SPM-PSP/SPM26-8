// API 客户端配置

import axios, { AxiosError } from 'axios';
import { Result } from '../types/backend';
import { toast } from 'sonner';

// 创建 axios 实例
export const apiClient = axios.create({
  // 默认 /api 走 Vite 代理（局域网访问友好）；直连后端可设 VITE_API_BASE_URL=http://本机IP:8080/api
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,  // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== 请求拦截器 ====================
apiClient.interceptors.request.use(
  (config) => {
    // 这里可以添加 token 等认证信息
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== 响应拦截器 ====================
apiClient.interceptors.response.use(
  (response) => {
    const result: Result = response.data;

    // 后端统一返回格式 { code, msg, data }
    if (result.code === 200) {
      // 成功：直接返回 data 部分
      return result.data;
    } else {
      // 业务错误
      const errorMsg = result.msg || '请求失败';
      toast.error(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
  },
  (error: AxiosError) => {
    // 网络错误或其他错误
    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status;
      switch (status) {
        case 400:
          toast.error('请求参数错误');
          break;
        case 401:
          toast.error('未授权，请登录');
          break;
        case 403:
          toast.error('拒绝访问');
          break;
        case 404:
          toast.error('请求的资源不存在');
          break;
        case 500:
          toast.error('服务器内部错误');
          break;
        default:
          toast.error(`请求失败 (${status})`);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      toast.error('网络错误，请检查后端服务是否启动');
    } else {
      // 其他错误
      toast.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);
