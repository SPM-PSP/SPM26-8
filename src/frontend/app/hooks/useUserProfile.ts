import { useState, useCallback } from 'react';
import { userApi } from '../api/user';
import { reminderApi } from '../api/reminder';
import { ReminderSettingsDTO } from '../types/backend';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function useUserProfile() {
  const { user, userId, setUser, refreshUsers, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);

  const saveReminderSettings = async (settings: Partial<ReminderSettingsDTO>) => {
    setSaving(true);
    try {
      const payload: ReminderSettingsDTO = {
        openid: userId,
        email: settings.email ?? user?.email,
        isReminderOn: settings.isReminderOn ?? user?.isReminderOn ?? 1,
        remindBefore24h: settings.remindBefore24h ?? user?.remindBefore24h ?? 1,
        remindBefore2h: settings.remindBefore2h ?? user?.remindBefore2h ?? 1,
      };
      const updated = await userApi.saveReminderSettings(payload);
      setUser(updated);
      await refreshUsers();
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
    const msg = await reminderApi.sendTestMail(userId);
    toast.success(msg || '测试邮件已发送');
  };

  return {
    user,
    loading: authLoading,
    saving,
    saveReminderSettings,
    sendTestEmail,
  };
}
