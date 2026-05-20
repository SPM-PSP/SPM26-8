import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { STATUS_BAR_HEIGHT } from '../../utils/safeArea';
import { EmptyState } from '../../components/EmptyState';
import { useTargets } from '../../hooks/useTargets';
import { useTodos } from '../../hooks/useTodos';
import { usePlans } from '../../hooks/usePlans';

export default function TargetList() {
  const { targets } = useTargets();
  const { todos } = useTodos();
  const { plans } = usePlans();
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  const getTargetProgress = (targetId: string) => {
    const targetPlans = plans.filter(p => p.targetId === targetId);
    if (targetPlans.length === 0) return 0;
    const completed = targetPlans.filter(p => p.completed).length;
    return (completed / targetPlans.length) * 100;
  };

  const quadrantTasks = {
    'urgent-important': todos.filter(t => t.level === 'urgent-important' && !t.completed),
    'urgent-not-important': todos.filter(t => t.level === 'urgent-not-important' && !t.completed),
    'not-urgent-important': todos.filter(t => t.level === 'not-urgent-important' && !t.completed),
    'not-urgent-not-important': todos.filter(t => t.level === 'not-urgent-not-important' && !t.completed),
  };

  const quadrantConfig = [
    { key: 'urgent-important', title: '重要紧急', subtitle: '立即行动', color1: '#d4726f', color2: '#e9b893' },
    { key: 'not-urgent-important', title: '重要不紧急', subtitle: '计划安排', color1: '#88a096', color2: '#b8a89d' },
    { key: 'urgent-not-important', title: '紧急不重要', subtitle: '授权他人', color1: '#e9b893', color2: '#d4c5b9' },
    { key: 'not-urgent-not-important', title: '不重要不紧急', subtitle: '减少投入', color1: '#b8a89d', color2: '#9b9ea4' },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        padding: `${STATUS_BAR_HEIGHT + 12}px 36rpx 24rpx 36rpx`,
      }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20rpx' }}>
          <Text style={{ fontSize: '36rpx', fontWeight: 600, color: '#4a4a4a' }}>目标</Text>
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/target-add/index' })}
            style={{
              width: '64rpx', height: '64rpx', borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4726f, #e9b893)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: '36rpx', lineHeight: 1 }}>+</Text>
          </View>
        </View>

        <View style={{ display: 'flex', borderRadius: '16rpx', overflow: 'hidden' }}>
          <View
            onClick={() => setViewMode('matrix')}
            style={{
              flex: 1, textAlign: 'center', padding: '16rpx',
              background: viewMode === 'matrix' ? '#d4726f' : '#f5f1ed',
              color: viewMode === 'matrix' ? '#fff' : '#8b8680',
              fontSize: '26rpx',
            }}
          >
            <Text style={{ color: 'inherit', fontSize: '26rpx' }}>四象限</Text>
          </View>
          <View
            onClick={() => setViewMode('list')}
            style={{
              flex: 1, textAlign: 'center', padding: '16rpx',
              background: viewMode === 'list' ? '#d4726f' : '#f5f1ed',
              color: viewMode === 'list' ? '#fff' : '#8b8680',
              fontSize: '26rpx',
            }}
          >
            <Text style={{ color: 'inherit', fontSize: '26rpx' }}>列表</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: '24rpx' }}>
        {viewMode === 'matrix' ? (
          <>
            {targets.length > 0 && (
              <View style={{
                backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '24rpx',
              }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx', marginBottom: '20rpx' }}>
                  <Text style={{ fontSize: '24rpx', color: '#d4726f' }}>📈</Text>
                  <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#4a4a4a' }}>目标总进度</Text>
                </View>
                {targets.slice(0, 3).map((target) => {
                  const progress = getTargetProgress(target.id);
                  return (
                    <View
                      key={target.id}
                      onClick={() => Taro.navigateTo({ url: `/pages/target-detail/index?id=${target.id}` })}
                      style={{ marginBottom: '20rpx' }}
                    >
                      <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8rpx' }}>
                        <Text style={{ fontSize: '26rpx', color: '#4a4a4a' }}>{target.title}</Text>
                        <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#d4726f' }}>{Math.round(progress)}%</Text>
                      </View>
                      <View style={{ height: '8rpx', backgroundColor: '#f0f0f0', borderRadius: '4rpx', overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #d4726f, #e9b893)', borderRadius: '4rpx' }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {quadrantConfig.map((quadrant) => {
                const tasks = quadrantTasks[quadrant.key as keyof typeof quadrantTasks];
                return (
                  <View
                    key={quadrant.key}
                    style={{
                      width: '49%', borderRadius: '16rpx', padding: '16rpx', marginBottom: '12rpx',
                      background: `linear-gradient(135deg, ${quadrant.color1}, ${quadrant.color2})`,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 600, fontSize: '28rpx', display: 'block', marginBottom: '2px' }}>
                      {quadrant.title}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '22rpx', display: 'block', marginBottom: '6px' }}>
                      {quadrant.subtitle}
                    </Text>
                    {tasks.length === 0 ? (
                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '22rpx' }}>暂无任务</Text>
                    ) : (
                      <>
                        {tasks.slice(0, 3).map((task) => (
                          <View
                            key={task.id}
                            onClick={() => Taro.navigateTo({ url: `/pages/todo-add/index?id=${task.id}` })}
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8rpx',
                              padding: '8rpx 12rpx', marginBottom: '6rpx',
                              overflow: 'hidden',
                            }}
                          >
                            <Text style={{
                              color: '#fff', fontSize: '22rpx',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              display: 'block',
                            }}>
                              {task.title}
                            </Text>
                          </View>
                        ))}
                        {tasks.length > 3 && (
                          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '20rpx', textAlign: 'center' }}>
                            +{tasks.length - 3} 更多
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <>
            {targets.length === 0 ? (
              <EmptyState title="暂无目标" description="创建你的第一个目标，开始规划未来" />
            ) : (
              targets.map((target) => {
                const progress = getTargetProgress(target.id);
                const targetPlansCount = plans.filter(p => p.targetId === target.id).length;
                return (
                  <View
                    key={target.id}
                    onClick={() => Taro.navigateTo({ url: `/pages/target-detail/index?id=${target.id}` })}
                    style={{
                      backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx',
                      marginBottom: '20rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}
                  >
                    <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' }}>
                      <Text style={{ fontWeight: 500, fontSize: '28rpx', color: '#4a4a4a', flex: 1 }}>{target.title}</Text>
                      <View style={{ padding: '4rpx 16rpx', borderRadius: '20rpx', border: '1px solid #ccc' }}>
                        <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>{target.completed ? '已完成' : '进行中'}</Text>
                      </View>
                    </View>
                    {target.desc && (
                      <Text style={{ fontSize: '24rpx', color: '#8b8680', marginBottom: '12rpx', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {target.desc}
                      </Text>
                    )}
                    <Text style={{ fontSize: '22rpx', color: '#8b8680', marginBottom: '12rpx' }}>
                      {targetPlansCount} 个计划
                    </Text>
                    {targetPlansCount > 0 && (
                      <View>
                        <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8rpx' }}>
                          <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>进度</Text>
                          <Text style={{ fontSize: '22rpx', color: '#d4726f', fontWeight: 500 }}>{Math.round(progress)}%</Text>
                        </View>
                        <View style={{ height: '8rpx', backgroundColor: '#f0f0f0', borderRadius: '4rpx', overflow: 'hidden' }}>
                          <View style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #d4726f, #e9b893)', borderRadius: '4rpx' }} />
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}
      </View>
    </View>
  );
}
