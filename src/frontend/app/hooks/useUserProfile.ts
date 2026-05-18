import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api/user';
import { reminderApi } from '../api/reminder';
import { BackendUser, ReminderSettingsDTO } from '../types/backend';
import { MOCK_USER_ID } from '../utils/typeMapper';
import { toast } from 'sonner';

export function useUserProfile() {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      await userApi.loginMock(MOCK_USER_ID);
      const profile = await userApi.getProfile(MOCK_USER_ID);
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
      toast.error('请先填写并保存邮箱');
      return;
    }
    const msg = await reminderApi.sendTestMail();
    toast.success(msg || '测试邮件已发送');
  };

  return {
    user,
    loading,
    saving,
    loadProfile,
    saveReminderSettings,
    sendTestEmail,
  };
};
