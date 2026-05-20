// Target API 服务

import { apiClient } from './client';
import { BackendTarget } from '../types/backend';

export const targetApi = {
  /**
   * 从后端恢复目标列表
   * GET /api/target/restore?userId=xxx
   */
  async restore(userId: string): Promise<BackendTarget[]> {
    return apiClient.get('/target/restore', {
      params: { userId },
    });
  },

  /**
   * 批量备份目标到后端
   * POST /api/target/backup?userId=xxx
   * Body: BackendTarget[]
   */
  async backup(userId: string, targets: BackendTarget[]): Promise<void> {
    return apiClient.post('/target/backup', targets, {
      params: { userId },
    });
  },
};
