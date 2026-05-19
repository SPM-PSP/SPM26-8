import { apiClient } from './client';
import { BackendPlan } from '../types/backend';

export const planApi = {
  async restore(userId: string): Promise<BackendPlan[]> {
    return apiClient.get('/plan/restore', { params: { userId } });
  },

  async backup(userId: string, plans: BackendPlan[]): Promise<void> {
    return apiClient.post('/plan/backup', plans, { params: { userId } });
  },
};
