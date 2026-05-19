import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { STATUS_BAR_HEIGHT } from '../../utils/safeArea';
import { useTodos } from '../../hooks/useTodos';
import { useTargets } from '../../hooks/useTargets';
import { usePlans } from '../../hooks/usePlans';
import { AiEfficiencyCard } from '../../components/ai/AiEfficiencyCard';

const COLORS = ['#d4726f', '#e9b893', '#88a096', '#b8a89d', '#9b9ea4'];

export default function Statistics() {
  const { todos } = useTodos();
  const { targets } = useTargets();
  const { plans } = usePlans();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const todoCompletionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const totalTargets = targets.length;
  const completedTargets = targets.filter(t => t.completed).length;
  const targetCompletionRate = totalTargets > 0 ? Math.round((completedTargets / totalTargets) * 100) : 0;

  const totalPlans = plans.length;
  const completedPlans = plans.filter(p => p.completed).length;
  const planCompletionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

  const activeTargets = totalTargets - completedTargets;

  // Category distribution
  const categoryStats = todos.reduce((acc, todo) => {
    const cat = todo.category || '未分类';
    if (!acc[cat]) acc[cat] = { total: 0, completed: 0 };
    acc[cat].total++;
    if (todo.completed) acc[cat].completed++;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  // Level distribution
  const levelLabels: Record<string, string> = {
    'urgent-important': '重要紧急',
    'urgent-not-important': '紧急不重要',
    'not-urgent-important': '重要不紧急',
    'not-urgent-not-important': '不重要不紧急',
  };
  const levelStats = todos.reduce((acc, todo) => {
    const name = levelLabels[todo.level];
    if (!acc[name]) acc[name] = { total: 0, completed: 0 };
    acc[name].total++;
    if (todo.completed) acc[name].completed++;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  // Simulated trend data
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      value: Math.floor(Math.random() * 10) + 1,
    };
  });
  const maxTrend = Math.max(...trendData.map(d => d.value), 1);

  const stats = [
    { label: '总完成率', value: `${todoCompletionRate}%`, icon: '📈', color1: '#d4726f', color2: '#e9b893' },
    { label: '活跃目标', value: String(activeTargets), icon: '🎯', color1: '#88a096', color2: '#b8a89d' },
    { label: '总任务数', value: String(totalTodos), icon: '✅', color1: '#e9b893', color2: '#d4c5b9' },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        padding: `${STATUS_BAR_HEIGHT + 12}px 36rpx 24rpx 36rpx`,
      }}>
        <Text style={{ fontSize: '36rpx', fontWeight: 600, color: '#4a4a4a', display: 'block', marginBottom: '20rpx' }}>统计</Text>

        <View style={{ display: 'flex', borderRadius: '16rpx', overflow: 'hidden' }}>
          <View
            onClick={() => setPeriod('week')}
            style={{
              flex: 1, textAlign: 'center', padding: '16rpx',
              background: period === 'week' ? '#d4726f' : '#f5f1ed',
              color: period === 'week' ? '#fff' : '#8b8680',
              fontSize: '26rpx',
            }}
          >
            <Text style={{ color: 'inherit', fontSize: '26rpx' }}>本周</Text>
          </View>
          <View
            onClick={() => setPeriod('month')}
            style={{
              flex: 1, textAlign: 'center', padding: '16rpx',
              background: period === 'month' ? '#d4726f' : '#f5f1ed',
              color: period === 'month' ? '#fff' : '#8b8680',
              fontSize: '26rpx',
            }}
          >
            <Text style={{ color: 'inherit', fontSize: '26rpx' }}>本月</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: '36rpx' }}>
        <AiEfficiencyCard context={{ todos, period }} />

        {/* Summary cards */}
        <View style={{ display: 'flex', gap: '16rpx', marginBottom: '24rpx' }}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1, borderRadius: '24rpx', padding: '24rpx 16rpx',
                background: `linear-gradient(135deg, ${stat.color1}, ${stat.color2})`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              <Text style={{ fontSize: '32rpx', display: 'block', marginBottom: '12rpx' }}>{stat.icon}</Text>
              <Text style={{ color: '#fff', fontSize: '36rpx', fontWeight: 700, display: 'block', marginBottom: '4rpx' }}>{stat.value}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '22rpx' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Trend chart (bar-based, no recharts dependency) */}
        <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <Text style={{ fontWeight: 600, fontSize: '28rpx', color: '#4a4a4a', marginBottom: '24rpx', display: 'block' }}>
            任务完成趋势
          </Text>
          <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '240rpx', gap: '8rpx' }}>
            {trendData.map((d) => {
              const height = (d.value / maxTrend) * 200;
              return (
                <View key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8rpx' }}>
                  <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>{d.value}</Text>
                  <View style={{
                    width: '48rpx', height: `${height}rpx`,
                    background: 'linear-gradient(0deg, #d4726f, #e9b893)',
                    borderRadius: '12rpx',
                  }} />
                  <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quadrant distribution */}
        <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <Text style={{ fontWeight: 600, fontSize: '28rpx', color: '#4a4a4a', marginBottom: '24rpx', display: 'block' }}>
            四象限分布
          </Text>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx' }}>
            {Object.entries(levelStats).map(([name, data]) => {
              const maxVal = Math.max(...Object.values(levelStats).map(d => d.total), 1);
              const barWidth = (data.total / maxVal) * 100;
              return (
                <View key={name} style={{ width: '100%', marginBottom: '16rpx' }}>
                  <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8rpx' }}>
                    <Text style={{ fontSize: '24rpx', color: '#4a4a4a' }}>{name}</Text>
                    <Text style={{ fontSize: '24rpx', color: '#8b8680' }}>
                      {data.completed}/{data.total}
                    </Text>
                  </View>
                  <View style={{ height: '16rpx', backgroundColor: '#f0f0f0', borderRadius: '8rpx', overflow: 'hidden' }}>
                    <View style={{
                      height: '100%', width: `${barWidth}%`,
                      background: 'linear-gradient(90deg, #88a096, #b8a89d)',
                      borderRadius: '8rpx',
                    }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Completion rates */}
        <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <Text style={{ fontWeight: 600, fontSize: '28rpx', color: '#4a4a4a', marginBottom: '24rpx', display: 'block' }}>
            完成率详情
          </Text>
          {[
            { label: '任务', rate: todoCompletionRate, color1: '#88a096', color2: '#b8a89d' },
            { label: '计划', rate: planCompletionRate, color1: '#88a096', color2: '#b8a89d' },
            { label: '目标', rate: targetCompletionRate, color1: '#e9b893', color2: '#d4c5b9' },
          ].map((item) => (
            <View key={item.label} style={{ marginBottom: '24rpx' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' }}>
                <Text style={{ fontSize: '26rpx', color: '#8b8680' }}>{item.label}</Text>
                <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#4a4a4a' }}>{item.rate}%</Text>
              </View>
              <View style={{ height: '10rpx', backgroundColor: '#f5f1ed', borderRadius: '5rpx', overflow: 'hidden' }}>
                <View style={{
                  height: '100%', width: `${item.rate}%`,
                  background: `linear-gradient(90deg, ${item.color1}, ${item.color2})`,
                  borderRadius: '5rpx',
                }} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
