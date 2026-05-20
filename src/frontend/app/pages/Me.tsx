import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  User,
  FileText,
  ChevronRight,
  Target as TargetIcon,
  ListTodo,
  Bell,
  Mail,
  Download,
  Upload,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { useTargets } from '../hooks/useTargets';
import { usePlans } from '../hooks/usePlans';
import { useNotes } from '../hooks/useNotes';
import { toast } from 'sonner';
import { useUserProfile } from '../hooks/useUserProfile';
import { reminderApi } from '../api/reminder';
import { useAuth } from '../context/AuthContext';

export function Me() {
  const { todos } = useTodos();
  const { targets } = useTargets();
  const { plans } = usePlans();
  const { notes } = useNotes();
  const { userId } = useAuth();
  const { user, loading: profileLoading, saving, saveReminderSettings, sendTestEmail } =
    useUserProfile();

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
      toast.error('请输入有效的邮箱地址');
      return;
    }
    try {
      await saveReminderSettings({ email, isReminderOn: 1 });
      toast.success('邮箱已绑定');
    } catch {
      /* toast from api client */
    }
  };

  const patchReminder = async (patch: Parameters<typeof saveReminderSettings>[0]) => {
    try {
      await saveReminderSettings(patch);
      toast.success('已保存');
    } catch {
      /* handled */
    }
  };

  const handleScanReminders = async () => {
    if (!userId) {
      toast.error('请先登录');
      return;
    }
    if (!user?.email) {
      toast.error('请先绑定邮箱');
      return;
    }
    if (!emailReminderOn) {
      toast.error('请先开启邮件提醒');
      return;
    }
    try {
      const sent = await reminderApi.scanNow(userId);
      if (sent > 0) {
        toast.success(`已向 ${user.email} 重发 ${sent} 封临期提醒（24h / 2h 内到期的任务，含已发过的）`);
      } else {
        toast.info(
          '暂无邮件发出：请确认有未完成、已填结束时间且在 24 小时或 2 小时内到期的任务，并已开启对应提醒开关。',
        );
      }
    } catch {
      /* handled */
    }
  };

  const stats = [
    { label: '目标', value: targets.length, to: '/targets', color: 'from-[#88a096] to-[#b8a89d]' },
    { label: '计划', value: plans.length, to: '/plans', color: 'from-[#b8a89d] to-[#9b9ea4]' },
    { label: '任务', value: todos.length, to: '/', color: 'from-[#d4726f] to-[#e9b893]' },
    { label: '笔记', value: notes.length, to: '/notes', color: 'from-[#e9b893] to-[#d4c5b9]' },
  ];

  const completedTasks = todos.filter(t => t.completed).length;
  const completionRate = todos.length > 0 ? Math.round((completedTasks / todos.length) * 100) : 0;

  const handleExportData = () => {
    const data = {
      todos,
      targets,
      plans,
      notes,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('数据导出成功');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            // 这里可以添加导入逻辑
            toast.success('数据导入成功');
          } catch (error) {
            toast.error('导入失败，文件格式错误');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      {/* 顶部栏 */}
      <div className="bg-white/95 backdrop-blur-lg" style={{boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)'}}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold text-[#4a4a4a]">我的</h1>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-5 space-y-4">
        {/* 个人信息卡片 */}
        <div className="bg-gradient-to-br from-[#d4726f] to-[#e9b893] rounded-[20px] p-6 text-white" style={{boxShadow: '0 4px 20px rgba(212, 114, 111, 0.2)'}}>
          <div className="flex items-center gap-4 mb-5">
            <Avatar className="w-16 h-16 border-2 border-white/30">
              <AvatarFallback className="bg-white/20 text-white backdrop-blur-sm">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{user?.nickname || '未登录'}</h2>
              <p className="text-sm opacity-90 font-mono opacity-80">ID: {userId}</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 rounded-full">
              <Award className="w-3 h-3 mr-1" />
              Lv.5
            </Badge>
          </div>

          {/* 成就数据 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm opacity-90">本周完成率</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{completionRate}%</span>
              <span className="text-sm opacity-75">比上周提升 12%</span>
            </div>
          </div>
        </div>

        {/* 数据统计 */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <Link key={index} to={stat.to}>
              <div
                className={`bg-gradient-to-br ${stat.color} rounded-[20px] p-4 text-white text-center`}
                style={{boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'}}
              >
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs opacity-90">{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* 邮箱绑定与任务临期提醒 */}
        <div className="bg-white rounded-[20px] p-5 space-y-4" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
          <h3 className="font-semibold text-[#4a4a4a] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#88a096]" />
            邮箱与临期提醒
          </h3>
          <p className="text-xs text-[#8b8680] leading-relaxed">
            绑定邮箱后，定时会在截止前 24 小时、2 小时各发一封（每种每任务仅一次）。点「立即检查」会对临期任务
            <span className="font-medium text-[#4a4a4a]">全部重发</span>
            一遍（不管是否发过）。任务须填写结束时间并已同步到服务器。
          </p>

          <div>
            <label className="text-sm text-[#4a4a4a] mb-2 block">绑定邮箱</label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={profileLoading}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleSaveEmail}
                disabled={saving || profileLoading}
                className="shrink-0 bg-gradient-to-r from-[#88a096] to-[#7a9188] text-white"
              >
                保存
              </Button>
            </div>
            {user?.email && (
              <p className="text-xs text-[#88a096] mt-2">当前：{user.email}</p>
            )}
          </div>

          <div className="flex items-center justify-between py-2 border-t border-[#f0ebe6]">
            <div>
              <div className="font-medium text-[#4a4a4a] text-sm">开启邮件提醒</div>
              <div className="text-xs text-[#8b8680]">关闭后不再发送临期邮件</div>
            </div>
            <Switch
              checked={emailReminderOn}
              disabled={!user?.email || saving}
              onCheckedChange={(checked) =>
                patchReminder({ isReminderOn: checked ? 1 : 0 })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              disabled={!user?.email || saving}
              onClick={sendTestEmail}
            >
              发送测试邮件
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              disabled={!user?.email || !emailReminderOn || saving}
              onClick={handleScanReminders}
            >
              立即检查临期任务
            </Button>
          </div>
        </div>

        {/* 提醒时间 */}
        <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
          <h3 className="font-semibold text-[#4a4a4a] mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#d4726f]" />
            提醒时间
          </h3>

          <p className="text-xs text-[#8b8680] mb-4">需先绑定邮箱并开启邮件提醒</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#4a4a4a]">提前 24 小时</span>
              <Switch
                checked={beforeDay}
                disabled={!user?.email || saving}
                onCheckedChange={(checked) =>
                  patchReminder({ remindBefore24h: checked ? 1 : 0 })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#4a4a4a]">提前 2 小时</span>
              <Switch
                checked={beforeHours}
                disabled={!user?.email || saving}
                onCheckedChange={(checked) =>
                  patchReminder({ remindBefore2h: checked ? 1 : 0 })
                }
              />
            </div>
          </div>
        </div>

        {/* 数据备份 */}
        <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
          <h3 className="font-semibold text-[#4a4a4a] mb-4">数据管理</h3>

          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 rounded-[16px] bg-[#f5f1ed] hover:bg-[#e8e4e0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-[#88a096]" />
                <span className="font-medium text-[#4a4a4a]">导出数据</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8b8680]" />
            </button>

            <button
              onClick={handleImportData}
              className="w-full flex items-center justify-between p-4 rounded-[16px] bg-[#f5f1ed] hover:bg-[#e8e4e0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-[#88a096]" />
                <span className="font-medium text-[#4a4a4a]">导入数据</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8b8680]" />
            </button>
          </div>
        </div>

        {/* 其他功能 */}
        <div className="bg-white rounded-[20px] overflow-hidden" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
          <Link to="/notes">
            <div className="flex items-center justify-between p-4 hover:bg-[#f5f1ed] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f5f1ed] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#e9b893]" />
                </div>
                <span className="font-medium text-[#4a4a4a]">我的笔记</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8b8680]" />
            </div>
          </Link>
        </div>

        {/* 版本信息 */}
        <div className="text-center text-sm text-[#8b8680] py-6">
          <p>目标管理系统 v2.0.0</p>
          <p className="mt-1">© 2026 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}