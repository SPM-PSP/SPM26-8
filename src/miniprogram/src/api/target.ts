import { apiClient } from './client';
import { BackendTarget } from '../types/backend';

export const targetApi = {
  async restore(userId: string): Promise<BackendTarget[]> {
    return apiClient.get('/target/restore', { params: { userId } });
  },

  async backup(userId: string, targets: BackendTarget[]): Promise<void> {
    return apiClient.post('/target/backup', targets, { params: { userId } });
  },
};
