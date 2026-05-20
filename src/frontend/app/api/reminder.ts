import { apiClient } from './client';
import { MOCK_USER_ID } from '../utils/typeMapper';

export const reminderApi = {
  async scanNow(): Promise<number> {
    return apiClient.post('/reminder/scan');
  },

  async sendTestMail(openid: string = MOCK_USER_ID): Promise<string> {
    return apiClient.post('/reminder/test', null, { params: { openid } });
  },
};
