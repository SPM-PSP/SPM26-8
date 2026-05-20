// API 客户端 — Taro.request 封装

import Taro from '@tarojs/taro';
import { Result } from '../types/backend';

// 真机调试时改为 PC 局域网 IP（如 http://10.135.50.18:8080/api）
// 模拟器调试时用 http://127.0.0.1:8080/api
const BASE_URL = 'http://10.135.50.18:8080/api';
const TIMEOUT = 10000;

interface RequestOptions {
  params?: Record<string, string>;
}

function buildQuery(params: Record<string, string>): string {
  const parts: string[] = [];
  for (const key of Object.keys(params)) {
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
  }
  return parts.join('&');
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const body = data != null ? JSON.stringify(data) : undefined;

  console.log(`[API] ${method} ${url}`, body ? `body=${body.slice(0, 200)}` : '');

  try {
    const res = await Taro.request({
      url,
      method,
      data: body,
      header: { 'Content-Type': 'application/json' },
      timeout: TIMEOUT,
    });

    console.log(`[API] 响应 ${res.statusCode}`, JSON.stringify(res.data).slice(0, 200));

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
      console.error('[API] 网络错误:', e.message);
      Taro.showToast({ title: '网络错误，请检查后端服务是否启动', icon: 'none' });
    }
    throw e;
  }
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = options?.params
      ? `${path}?${buildQuery(options.params)}`
      : path;
    return request<T>('GET', url);
  },

  post<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = options?.params
      ? `${path}?${buildQuery(options.params)}`
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
