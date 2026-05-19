import { apiClient } from './client';
import { BackendNote } from '../types/backend';

export const noteApi = {
  async restore(userId: string): Promise<BackendNote[]> {
    return apiClient.get('/note/restore', { params: { userId } });
  },

  async backup(userId: string, notes: BackendNote[]): Promise<void> {
    return apiClient.post('/note/backup', notes, { params: { userId } });
  },

  async save(note: BackendNote): Promise<BackendNote> {
    return apiClient.post('/note/save', note);
  },
};
