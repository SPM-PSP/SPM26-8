// Plan API 服务

import { apiClient } from './client';
import { BackendPlan } from '../types/backend';

export const planApi = {
  /**
   * 从后端恢复计划列表
   * GET /api/plan/restore?userId=xxx
   */
  async restore(userId: string): Promise<BackendPlan[]> {
    return apiClient.get('/plan/restore', {
      params: { userId },
    });
  },

  /**
   * 批量备份计划到后端
   * POST /api/plan/backup?userId=xxx
   * Body: BackendPlan[]
   */
  async backup(userId: string, plans: BackendPlan[]): Promise<void> {
    return apiClient.post('/plan/backup', plans, {
      params: { userId },
    });
  },
};
