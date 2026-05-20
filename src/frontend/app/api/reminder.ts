import { apiClient } from './client';
import { getStoredOpenid } from '../utils/authStorage';

export const reminderApi = {
  async scanNow(openid: string = getStoredOpenid()): Promise<number> {
    return apiClient.post('/reminder/scan', null, { params: { openid } });
  },

  async sendTestMail(openid: string = getStoredOpenid()): Promise<string> {
    return apiClient.post('/reminder/test', null, { params: { openid } });
  },
};
