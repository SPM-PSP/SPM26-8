import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { STATUS_BAR_HEIGHT } from '../../utils/safeArea';
import { EmptyState } from '../../components/EmptyState';
import { usePlans } from '../../hooks/usePlans';
import { useTargets } from '../../hooks/useTargets';
import { FilterStatus } from '../../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function PlanList() {
  const { plans } = usePlans();
  const { targets } = useTargets();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filteredPlans = plans.filter(plan => {
    if (filter === 'active') return !plan.completed;
    if (filter === 'completed') return plan.completed;
    return true;
  });

  const getTargetName = (targetId?: string) => {
    if (!targetId) return null;
    return targets.find(t => t.id === targetId)?.title;
  };

  const filterTabs = [
    { value: 'all', label: '全部' },
    { value: 'active', label: '进行中' },
    { value: 'completed', label: '已完成' },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        padding: `${STATUS_BAR_HEIGHT + 12}px 36rpx 24rpx 36rpx`,
      }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20rpx' }}>
          <Text style={{ fontSize: '36rpx', fontWeight: 600, color: '#4a4a4a' }}>计划</Text>
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/plan-add/index' })}
            style={{
              width: '64rpx', height: '64rpx', borderRadius: '50%',
              background: 'linear-gradient(135deg, #88a096, #b8a89d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: '36rpx', lineHeight: 1 }}>+</Text>
          </View>
        </View>

        <View style={{ display: 'flex', gap: '16rpx' }}>
          {filterTabs.map((item) => (
            <View
              key={item.value}
              onClick={() => setFilter(item.value as FilterStatus)}
              style={{
                padding: '12rpx 32rpx', borderRadius: '40rpx', fontSize: '26rpx',
                background: filter === item.value
                  ? 'linear-gradient(135deg, #88a096, #b8a89d)' : '#f5f1ed',
                color: filter === item.value ? '#fff' : '#8b8680',
              }}
            >
              <Text style={{ color: 'inherit', fontSize: '26rpx' }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ padding: '36rpx' }}>
        {filteredPlans.length === 0 ? (
          <EmptyState
            title={filter === 'all' ? '暂无计划' : filter === 'active' ? '暂无进行中的计划' : '暂无已完成的计划'}
            description="创建计划，分解你的目标"
          />
        ) : (
          filteredPlans.map((plan) => {
            const targetName = getTargetName(plan.targetId);
            return (
              <View
                key={plan.id}
                onClick={() => Taro.navigateTo({ url: `/pages/plan-detail/index?id=${plan.id}` })}
                style={{
                  backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx',
                  marginBottom: '20rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8rpx' }}>
                  <Text style={{ fontWeight: 500, fontSize: '28rpx', color: '#4a4a4a', flex: 1 }}>{plan.title}</Text>
                  <View style={{ padding: '4rpx 16rpx', borderRadius: '20rpx', border: '1px solid #ccc' }}>
                    <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>
                      {plan.completed ? '已完成' : '进行中'}
                    </Text>
                  </View>
                </View>
                {plan.desc && (
                  <Text style={{ fontSize: '24rpx', color: '#8b8680', marginBottom: '8rpx',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                    {plan.desc}
                  </Text>
                )}
                {targetName && (
                  <Text style={{ fontSize: '22rpx', color: '#88a096', marginBottom: '8rpx', display: 'block' }}>
                    🎯 {targetName}
                  </Text>
                )}
                <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                  <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>
                    {format(new Date(plan.beginTime), 'MM/dd', { locale: zhCN })} - {format(new Date(plan.endTime), 'MM/dd', { locale: zhCN })}
                  </Text>
                  {plan.isRepeat && (
                    <View style={{ padding: '2rpx 12rpx', borderRadius: '20rpx', backgroundColor: '#f5f1ed' }}>
                      <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>重复</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
