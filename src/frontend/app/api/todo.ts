// Todo API 服务

import { apiClient } from './client';
import { BackendTodoTask } from '../types/backend';

export const todoApi = {
  /**
   * 获取待办列表
   * GET /api/todo/list?userId=xxx
   */
  async list(userId: string): Promise<BackendTodoTask[]> {
    return apiClient.get('/todo/list', {
      params: { userId },
    });
  },

  /**
   * 批量备份待办到后端
   * POST /api/todo/backup?userId=xxx
   * Body: BackendTodoTask[]
   */
  async backup(userId: string, todos: BackendTodoTask[]): Promise<void> {
    return apiClient.post('/todo/backup', todos, {
      params: { userId, mode: 'replace' },
    });
  },

  /** 增量添加（走已有 backup 接口，mode=append） */
  async append(userId: string, todos: BackendTodoTask[]): Promise<void> {
    return apiClient.post('/todo/backup', todos, {
      params: { userId, mode: 'append' },
    });
  },
};
