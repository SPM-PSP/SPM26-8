import { useState } from 'react';
import { Link } from 'react-router';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import {
  User,
  FileText,
  ChevronRight,
  Target as TargetIcon,
  ListTodo,
  Bell,
  Mail,
  Smartphone,
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

export function Me() {
  const { todos } = useTodos();
  const { targets } = useTargets();
  const { plans } = usePlans();
  const { notes } = useNotes();

  const [notifications, setNotifications] = useState({
    wechat: true,
    email: false,
    inApp: true,
  });

  const [reminderPrefs, setReminderPrefs] = useState({
    beforeDay: true,
    beforeHours: true,
  });

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
              <h2 className="text-xl font-semibold mb-1">效率达人</h2>
              <p className="text-sm opacity-90">已坚持使用 30 天</p>
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

        {/* 提醒配置 */}
        <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
          <h3 className="font-semibold text-[#4a4a4a] mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#d4726f]" />
            提醒渠道
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f5f1ed] flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#d4726f]" />
                </div>
                <div>
                  <div className="font-medium text-[#4a4a4a]">微信订阅</div>
                  <div className="text-xs text-[#8b8680]">通过微信接收提醒</div>
                </div>
              </div>
              <Switch
                checked={notifications.wechat}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, wechat: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f5f1ed] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#88a096]" />
                </div>
                <div>
                  <div className="font-medium text-[#4a4a4a]">邮件提醒</div>
                  <div className="text-xs text-[#8b8680]">通过邮件接收提醒</div>
                </div>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f5f1ed] flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#e9b893]" />
                </div>
                <div>
                  <div className="font-medium text-[#4a4a4a]">应用内弹窗</div>
                  <div className="text-xs text-[#8b8680]">在应用内接收提醒</div>
                </div>
              </div>
              <Switch
                checked={notifications.inApp}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, inApp: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* 提醒偏好 */}
        <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
          <h3 className="font-semibold text-[#4a4a4a] mb-4">提醒时间</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#4a4a4a]">提前 24 小时</span>
              <Switch
                checked={reminderPrefs.beforeDay}
                onCheckedChange={(checked) =>
                  setReminderPrefs({ ...reminderPrefs, beforeDay: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#4a4a4a]">提前 2 小时</span>
              <Switch
                checked={reminderPrefs.beforeHours}
                onCheckedChange={(checked) =>
                  setReminderPrefs({ ...reminderPrefs, beforeHours: checked })
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