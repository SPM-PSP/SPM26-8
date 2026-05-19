// API 客户端 — Taro.request 封装

import Taro from '@tarojs/taro';
import { Result } from '../types/backend';

const BASE_URL = 'http://localhost:8080/api';
const TIMEOUT = 10000;

interface RequestOptions {
  params?: Record<string, string>;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  try {
    const res = await Taro.request({
      url,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      timeout: TIMEOUT,
    });

    if (res.statusCode === 200) {
      const result: Result<T> = res.data as Result<T>;
      if (result.code === 200) {
        return result.data;
      }
      Taro.showToast({ title: result.msg || '请求失败', icon: 'none' });
      throw new Error(result.msg || '请求失败');
    }

    let msg = '请求失败';
    switch (res.statusCode) {
      case 400: msg = '请求参数错误'; break;
      case 401: msg = '未授权，请登录'; break;
      case 403: msg = '拒绝访问'; break;
      case 404: msg = '请求的资源不存在'; break;
      case 500: msg = '服务器内部错误'; break;
      default: msg = `请求失败 (${res.statusCode})`;
    }
    Taro.showToast({ title: msg, icon: 'none' });
    throw new Error(msg);
  } catch (e: unknown) {
    if (e instanceof Error && e.message && !e.message.startsWith('请求')) {
      // Network error from Taro.request itself
      Taro.showToast({ title: '网络错误，请检查后端服务是否启动', icon: 'none' });
    }
    throw e;
  }
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = options?.params
      ? `${path}?${new URLSearchParams(options.params).toString()}`
      : path;
    return request<T>('GET', url);
  },

  post<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = options?.params
      ? `${path}?${new URLSearchParams(options.params).toString()}`
      : path;
    return request<T>('POST', url, data);
  },

  put<T>(path: string, data?: unknown): Promise<T> {
    return request<T>('PUT', path, data);
  },

  del<T>(path: string): Promise<T> {
    return request<T>('DELETE', path);
  },
};
