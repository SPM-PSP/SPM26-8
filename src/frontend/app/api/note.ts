// Note API 服务

import { apiClient } from './client';
import { BackendNote } from '../types/backend';

export const noteApi = {
  /**
   * 从后端恢复笔记列表
   * GET /api/note/restore?userId=xxx
   */
  async restore(userId: string): Promise<BackendNote[]> {
    return apiClient.get('/note/restore', {
      params: { userId },
    });
  },

  /**
   * 批量备份笔记到后端
   * POST /api/note/backup?userId=xxx
   * Body: BackendNote[]
   */
  async backup(userId: string, notes: BackendNote[]): Promise<void> {
    return apiClient.post('/note/backup', notes, {
      params: { userId },
    });
  },

  /**
   * 保存单个笔记（upsert）
   * POST /api/note/save
   * Body: BackendNote
   */
  async save(note: BackendNote): Promise<BackendNote> {
    return apiClient.post('/note/save', note);
  },
};
