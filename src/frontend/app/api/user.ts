// User API 服务

import { apiClient } from './client';
import { BackendUser, LoginDTO, ReminderSettingsDTO } from '../types/backend';
import { MOCK_USER_ID } from '../utils/typeMapper';

export const userApi = {
  /**
   * 模拟登录
   * POST /api/user/login/mock
   * Body: LoginDTO
   */
  async loginMock(mockId: string): Promise<BackendUser> {
    return apiClient.post('/user/login/mock', { mockId } as LoginDTO);
  },

  /**
   * 更新用户信息
   * POST /api/user/update
   * Body: BackendUser
   */
  async update(user: BackendUser): Promise<void> {
    return apiClient.post('/user/update', user);
  },

  async getProfile(openid: string = MOCK_USER_ID): Promise<BackendUser> {
    return apiClient.get('/user/profile', { params: { openid } });
  },

  async saveReminderSettings(settings: ReminderSettingsDTO): Promise<BackendUser> {
    return apiClient.post('/user/reminder-settings', settings);
  },
};
