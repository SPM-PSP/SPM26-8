import { apiClient } from './client';
import { BackendTodoTask } from '../types/backend';

export const todoApi = {
  async list(userId: string): Promise<BackendTodoTask[]> {
    return apiClient.get('/todo/list', { params: { userId } });
  },

  async backup(userId: string, todos: BackendTodoTask[]): Promise<void> {
    return apiClient.post('/todo/backup', todos, { params: { userId } });
  },
};
