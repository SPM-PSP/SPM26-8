// User API 服务

import { apiClient } from './client';
import { BackendUser, LoginDTO, ReminderSettingsDTO } from '../types/backend';
import { DEFAULT_USER_ID } from '../utils/authStorage';

export const userApi = {
  /**
   * 模拟登录
   * POST /api/user/login/mock
   * Body: LoginDTO
   */
  async loginMock(mockId: string, nickname?: string): Promise<BackendUser> {
    return apiClient.post('/user/login/mock', { mockId, nickname } as LoginDTO);
  },

  async listUsers(): Promise<BackendUser[]> {
    return apiClient.get('/user/list');
  },

  /**
   * 更新用户信息
   * POST /api/user/update
   * Body: BackendUser
   */
  async update(user: BackendUser): Promise<void> {
    return apiClient.post('/user/update', user);
  },

  async getProfile(openid: string = DEFAULT_USER_ID): Promise<BackendUser> {
    return apiClient.get('/user/profile', { params: { openid } });
  },

  async saveReminderSettings(settings: ReminderSettingsDTO): Promise<BackendUser> {
    return apiClient.post('/user/reminder-settings', settings);
  },
};
