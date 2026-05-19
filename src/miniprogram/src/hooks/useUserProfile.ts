import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { userApi } from '../api/user';
import { reminderApi } from '../api/reminder';
import { BackendUser, ReminderSettingsDTO } from '../types/backend';
import { MOCK_USER_ID } from '../utils/typeMapper';

export function useUserProfile() {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await userApi.loginMock(MOCK_USER_ID);
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveReminderSettings = async (settings: Partial<ReminderSettingsDTO>) => {
    setSaving(true);
    try {
      const payload: ReminderSettingsDTO = {
        openid: MOCK_USER_ID,
        email: settings.email ?? user?.email,
        isReminderOn: settings.isReminderOn ?? user?.isReminderOn ?? 1,
        remindBefore24h: settings.remindBefore24h ?? user?.remindBefore24h ?? 1,
        remindBefore2h: settings.remindBefore2h ?? user?.remindBefore2h ?? 1,
      };
      const updated = await userApi.saveReminderSettings(payload);
      setUser(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!user?.email?.trim()) {
      Taro.showToast({ title: '请先填写并保存邮箱', icon: 'none' });
      return;
    }
    const msg = await reminderApi.sendTestMail();
    Taro.showToast({ title: msg || '测试邮件已发送', icon: 'success' });
  };

  return {
    user,
    loading,
    saving,
    loadProfile,
    saveReminderSettings,
    sendTestEmail,
  };
}
