import { useState, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { STATUS_BAR_HEIGHT } from '../../utils/safeArea';
import { useTodos } from '../../hooks/useTodos';
import { useTargets } from '../../hooks/useTargets';
import { usePlans } from '../../hooks/usePlans';
import { useNotes } from '../../hooks/useNotes';
import { useUserProfile } from '../../hooks/useUserProfile';

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <View
      onClick={() => { if (!disabled) onChange(!checked); }}
      style={{
        width: '80rpx', height: '44rpx', borderRadius: '22rpx',
        backgroundColor: checked ? '#88a096' : '#d0d0d0',
        display: 'flex', alignItems: 'center',
        padding: '4rpx', flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <View style={{
        width: '36rpx', height: '36rpx', borderRadius: '50%',
        backgroundColor: '#fff',
        marginLeft: checked ? '36rpx' : '0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </View>
  );
}

export default function Me() {
  const { todos } = useTodos();
  const { targets } = useTargets();
  const { plans } = usePlans();
  const { notes } = useNotes();
  const { user, loading: profileLoading, saving, saveReminderSettings, sendTestEmail } = useUserProfile();

  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (user?.email) setEmailInput(user.email);
  }, [user?.email]);

  const emailReminderOn = user?.isReminderOn === 1;
  const beforeDay = user?.remindBefore24h !== 0;
  const beforeHours = user?.remindBefore2h !== 0;

  const handleSaveEmail = async () => {
    const email = emailInput.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Taro.showToast({ title: '请输入有效的邮箱地址', icon: 'none' });
      return;
    }
    try {
      await saveReminderSettings({ email, isReminderOn: 1 });
      Taro.showToast({ title: '邮箱已绑定', icon: 'success' });
    } catch { /* toast from api client */ }
  };

  const patchReminder = async (patch: Parameters<typeof saveReminderSettings>[0]) => {
    try {
      await saveReminderSettings(patch);
      Taro.showToast({ title: '已保存', icon: 'success' });
    } catch { /* handled */ }
  };

  const isTabPage = (url: string) => {
    return ['/pages/todo-list/index', '/pages/target-list/index', '/pages/calendar/index', '/pages/statistics/index', '/pages/me/index'].includes(url);
  };

  const stats = [
    { label: '目标', value: targets.length, url: '/pages/target-list/index', color1: '#88a096', color2: '#b8a89d' },
    { label: '计划', value: plans.length, url: '/pages/plan-list/index', color1: '#b8a89d', color2: '#9b9ea4' },
    { label: '任务', value: todos.length, url: '/pages/todo-list/index', color1: '#d4726f', color2: '#e9b893' },
    { label: '笔记', value: notes.length, url: '/pages/note-list/index', color1: '#e9b893', color2: '#d4c5b9' },
  ];

  const completedTasks = todos.filter(t => t.completed).length;
  const completionRate = todos.length > 0 ? Math.round((completedTasks / todos.length) * 100) : 0;

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)', padding: `${STATUS_BAR_HEIGHT + 12}px 36rpx 24rpx 36rpx`,
      }}>
        <Text style={{ fontSize: '36rpx', fontWeight: 600, color: '#4a4a4a' }}>我的</Text>
      </View>

      <View style={{ padding: '36rpx' }}>
        {/* 个人信息卡片 */}
        <View style={{
          background: 'linear-gradient(135deg, #d4726f, #e9b893)', borderRadius: '24rpx',
          padding: '36rpx', marginBottom: '24rpx', color: '#fff',
          boxShadow: '0 4px 20px rgba(212,114,111,0.2)',
        }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '20rpx', marginBottom: '28rpx' }}>
            <View style={{
              width: '96rpx', height: '96rpx', borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: '48rpx' }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: '32rpx', fontWeight: 600, display: 'block' }}>效率达人</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '24rpx' }}>已坚持使用 30 天</Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '40rpx',
              padding: '8rpx 24rpx',
            }}>
              <Text style={{ color: '#fff', fontSize: '24rpx' }}>🏆 Lv.5</Text>
            </View>
          </View>

          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20rpx', padding: '24rpx' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx', marginBottom: '8rpx' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '24rpx' }}>📈 本周完成率</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'baseline', gap: '12rpx' }}>
              <Text style={{ color: '#fff', fontSize: '48rpx', fontWeight: 700 }}>{completionRate}%</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '22rpx' }}>比上周提升 12%</Text>
            </View>
          </View>
        </View>

        {/* 数据统计 */}
        <View style={{ display: 'flex', gap: '16rpx', marginBottom: '24rpx' }}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              onClick={() => isTabPage(stat.url) ? Taro.switchTab({ url: stat.url }) : Taro.navigateTo({ url: stat.url })}
              style={{
                flex: 1, borderRadius: '20rpx', padding: '24rpx 16rpx', textAlign: 'center',
                background: `linear-gradient(135deg, ${stat.color1}, ${stat.color2})`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              <Text style={{ color: '#fff', fontSize: '40rpx', fontWeight: 700, display: 'block' }}>{stat.value}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '22rpx' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* 邮箱绑定与提醒 */}
        <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <Text style={{ fontWeight: 600, fontSize: '28rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>
            📧 邮箱与临期提醒
          </Text>
          <Text style={{ fontSize: '22rpx', color: '#8b8680', marginBottom: '20rpx', lineHeight: 1.5, display: 'block' }}>
            绑定邮箱后，后端每分钟扫描未完成任务；在截止前 24 小时、2 小时各发送一封邮件。
          </Text>

          <View style={{ marginBottom: '20rpx' }}>
            <Text style={{ fontSize: '26rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>绑定邮箱</Text>
            <View style={{ display: 'flex', gap: '12rpx' }}>
              <View style={{ flex: 1, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '16rpx 20rpx', backgroundColor: '#f5f1ed' }}>
                <Input style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a' }}
                  value={emailInput} onInput={(e) => setEmailInput(e.detail.value)}
                  placeholder="your@email.com" placeholderStyle="color: #ccc" disabled={profileLoading} />
              </View>
              <View onClick={handleSaveEmail} style={{
                padding: '16rpx 28rpx', borderRadius: '16rpx',
                background: 'linear-gradient(135deg, #88a096, #7a9188)',
                display: 'flex', alignItems: 'center',
                opacity: saving || profileLoading ? 0.5 : 1,
              }}>
                <Text style={{ color: '#fff', fontSize: '26rpx' }}>保存</Text>
              </View>
            </View>
            {user?.email && (
              <Text style={{ fontSize: '22rpx', color: '#88a096', marginTop: '8rpx' }}>当前：{user.email}</Text>
            )}
          </View>

          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingVertical: '16rpx', borderTop: '1px solid #f0ebe6' }}>
            <View>
              <Text style={{ fontSize: '26rpx', color: '#4a4a4a', fontWeight: 500 }}>开启邮件提醒</Text>
            </View>
            <Toggle
              checked={emailReminderOn}
              disabled={!user?.email || saving}
              onChange={(checked) => patchReminder({ isReminderOn: checked ? 1 : 0 })}
            />
          </View>

          <View onClick={sendTestEmail} style={{
            padding: '20rpx', borderRadius: '40rpx', border: '1px solid #ccc',
            textAlign: 'center', marginTop: '16rpx',
            opacity: !user?.email || saving ? 0.5 : 1,
          }}>
            <Text style={{ color: '#4a4a4a', fontSize: '26rpx' }}>发送测试邮件</Text>
          </View>
        </View>

        {/* 提醒时间 */}
        <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <Text style={{ fontWeight: 600, fontSize: '28rpx', color: '#4a4a4a', marginBottom: '20rpx', display: 'block' }}>
            🔔 提醒时间
          </Text>
          <Text style={{ fontSize: '22rpx', color: '#8b8680', marginBottom: '20rpx', display: 'block' }}>
            需先绑定邮箱并开启邮件提醒
          </Text>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingVertical: '12rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a' }}>提前 24 小时</Text>
            <Toggle checked={beforeDay} disabled={!user?.email || saving}
              onChange={(checked) => patchReminder({ remindBefore24h: checked ? 1 : 0 })} />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingVertical: '12rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a' }}>提前 2 小时</Text>
            <Toggle checked={beforeHours} disabled={!user?.email || saving}
              onChange={(checked) => patchReminder({ remindBefore2h: checked ? 1 : 0 })} />
          </View>
        </View>

        {/* 版本信息 */}
        <View style={{ textAlign: 'center', padding: '40rpx' }}>
          <Text style={{ fontSize: '24rpx', color: '#8b8680', display: 'block' }}>目标管理系统 v2.0.0</Text>
          <Text style={{ fontSize: '24rpx', color: '#8b8680', marginTop: '8rpx', display: 'block' }}>© 2026 All rights reserved</Text>
        </View>
      </View>
    </View>
  );
}
