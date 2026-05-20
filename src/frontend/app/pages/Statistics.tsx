import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTodos } from '../hooks/useTodos';
import { useTargets } from '../hooks/useTargets';
import { usePlans } from '../hooks/usePlans';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Target as TargetIcon, Zap } from 'lucide-react';
import { AiEfficiencyCard } from '../components/ai/AiEfficiencyCard';

const COLORS = ['#d4726f', '#e9b893', '#88a096', '#b8a89d', '#9b9ea4'];

export function Statistics() {
  const { todos } = useTodos();
  const { targets } = useTargets();
  const { plans } = usePlans();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  // 总体统计
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const todoCompletionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const totalTargets = targets.length;
  const completedTargets = targets.filter(t => t.completed).length;
  const targetCompletionRate = totalTargets > 0 ? Math.round((completedTargets / totalTargets) * 100) : 0;

  const totalPlans = plans.length;
  const completedPlans = plans.filter(p => p.completed).length;
  const planCompletionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

  // 按优先级统计（雷达图数据）
  const levelStats = todos.reduce((acc, todo) => {
    const levelLabels: Record<string, string> = {
      'urgent-important': '重要紧急',
      'urgent-not-important': '紧急不重要',
      'not-urgent-important': '重要不紧急',
      'not-urgent-not-important': '不重要不紧急',
    };
    const level = levelLabels[todo.level];
    if (!acc[level]) {
      acc[level] = { total: 0, completed: 0 };
    }
    acc[level].total++;
    if (todo.completed) {
      acc[level].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const radarData = Object.entries(levelStats).map(([name, stats]) => ({
    dimension: name,
    总数: stats.total,
    已完成: stats.completed,
  }));

  // 趋势数据（模拟7天数据）
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      完成任务: Math.floor(Math.random() * 10) + 1,
    };
  });

  // 圆环图数据
  const ringData = [
    { name: '已完成', value: completedTodos, color: '#88a096' },
    { name: '未完成', value: totalTodos - completedTodos, color: '#e8e4e0' },
  ];

  const stats = [
    {
      label: '总完成率',
      value: `${todoCompletionRate}%`,
      icon: TrendingUp,
      color: 'from-[#d4726f] to-[#e9b893]',
      change: '+12%',
    },
    {
      label: '活跃目标',
      value: totalTargets - completedTargets,
      icon: TargetIcon,
      color: 'from-[#88a096] to-[#b8a89d]',
      change: `${totalTargets}个`,
    },
    {
      label: '平均效率',
      value: '85%',
      icon: Zap,
      color: 'from-[#e9b893] to-[#d4c5b9]',
      change: '+5%',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      {/* 顶部栏 */}
      <div className="bg-white/95 backdrop-blur-lg" style={{boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)'}}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold text-[#4a4a4a] mb-4">统计</h1>

          <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="week">本周</TabsTrigger>
              <TabsTrigger value="month">本月</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-5 space-y-4">
        <AiEfficiencyCard context={{ todos, period }} />

        {/* 总览卡片 */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${stat.color} rounded-[20px] p-4 text-white`}
                style={{boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'}}
              >
                <Icon className="w-6 h-6 mb-2 opacity-90" />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs opacity-90 mb-1">{stat.label}</div>
                <div className="text-xs opacity-80">{stat.change}</div>
              </div>
            );
          })}
        </div>

        {/* 趋势图 */}
        <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
          <h3 className="font-semibold text-[#4a4a4a] mb-4">任务完成趋势</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e4e0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8b8680' }} />
              <YAxis tick={{ fontSize: 12, fill: '#8b8680' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="完成任务"
                stroke="#88a096"
                strokeWidth={3}
                dot={{ fill: '#88a096', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 雷达图和圆环图 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 雷达图 */}
          {radarData.length > 0 && (
            <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
              <h3 className="font-semibold text-[#4a4a4a] mb-4">四象限分布</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e8e4e0" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: '#8b8680' }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: '#8b8680' }} />
                  <Radar name="总数" dataKey="总数" stroke="#b8a89d" fill="#b8a89d" fillOpacity={0.3} />
                  <Radar name="已完成" dataKey="已完成" stroke="#88a096" fill="#88a096" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 圆环图 */}
          <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
            <h3 className="font-semibold text-[#4a4a4a] mb-4">任务完成比例</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={ringData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ringData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#88a096]" />
                <span className="text-xs text-[#8b8680]">已完成</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#e8e4e0]" />
                <span className="text-xs text-[#8b8680]">未完成</span>
              </div>
            </div>
          </div>
        </div>

        {/* 完成率详情 */}
        <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
          <h3 className="font-semibold text-[#4a4a4a] mb-4">完成率详情</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#8b8680]">任务</span>
                <span className="font-medium text-[#4a4a4a]">{todoCompletionRate}%</span>
              </div>
              <div className="w-full h-2 bg-[#f5f1ed] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#88a096] to-[#b8a89d] transition-all rounded-full"
                  style={{ width: `${todoCompletionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#8b8680]">计划</span>
                <span className="font-medium text-[#4a4a4a]">{planCompletionRate}%</span>
              </div>
              <div className="w-full h-2 bg-[#f5f1ed] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#88a096] transition-all rounded-full"
                  style={{ width: `${planCompletionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#8b8680]">目标</span>
                <span className="font-medium text-[#4a4a4a]">{targetCompletionRate}%</span>
              </div>
              <div className="w-full h-2 bg-[#f5f1ed] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e9b893] transition-all rounded-full"
                  style={{ width: `${targetCompletionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}