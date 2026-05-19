import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { useTargets } from '../../hooks/useTargets';
import { usePlans } from '../../hooks/usePlans';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function TargetDetail() {
  const router = useRouter();
  const { id } = router.params;
  const { getTarget } = useTargets();
  const { plans } = usePlans();

  const target = id ? getTarget(id) : null;

  if (!target) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
        <PageHeader title="目标详情" showBack />
        <View style={{ padding: '36rpx' }}>
          <EmptyState title="目标不存在" description="该目标可能已被删除" />
        </View>
      </View>
    );
  }

  const targetPlans = plans.filter(p => p.targetId === id);
  const completedPlans = targetPlans.filter(p => p.completed).length;
  const progress = targetPlans.length > 0 ? (completedPlans / targetPlans.length) * 100 : 0;

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
      <PageHeader
        title="目标详情"
        showBack
        rightElement={
          <Text style={{ color: '#d4726f', fontSize: '28rpx' }}
            onClick={() => Taro.navigateTo({ url: `/pages/target-add/index?id=${id}` })}>编辑</Text>
        }
      />

      <View style={{ padding: '36rpx' }}>
        <View style={{
          backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx',
          marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' }}>
            <Text style={{ fontWeight: 600, fontSize: '32rpx', color: '#4a4a4a', flex: 1 }}>{target.title}</Text>
            <View style={{ padding: '4rpx 16rpx', borderRadius: '20rpx', border: '1px solid #ccc' }}>
              <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>{target.completed ? '已完成' : '进行中'}</Text>
            </View>
          </View>

          {target.desc && (
            <Text style={{ fontSize: '26rpx', color: '#8b8680', marginBottom: '16rpx', lineHeight: 1.5, display: 'block' }}>
              {target.desc}
            </Text>
          )}

          <View style={{ display: 'flex', flexDirection: 'column', gap: '12rpx' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
              <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>日期:</Text>
              <Text style={{ fontSize: '24rpx', color: '#4a4a4a' }}>
                {format(new Date(target.beginTime), 'yyyy年MM月dd日', { locale: zhCN })} 至 {format(new Date(target.endTime), 'yyyy年MM月dd日', { locale: zhCN })}
              </Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
              <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>权重:</Text>
              <Text style={{ fontSize: '24rpx', color: '#4a4a4a' }}>{target.weight}</Text>
            </View>
          </View>

          {targetPlans.length > 0 && (
            <View style={{ marginTop: '24rpx', paddingTop: '24rpx', borderTop: '1px solid #f0f0f0' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' }}>
                <Text style={{ fontSize: '24rpx', color: '#8b8680' }}>完成进度</Text>
                <Text style={{ fontSize: '24rpx', color: '#d4726f', fontWeight: 500 }}>
                  {completedPlans} / {targetPlans.length}
                </Text>
              </View>
              <View style={{ height: '8rpx', backgroundColor: '#f0f0f0', borderRadius: '4rpx', overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #d4726f, #e9b893)', borderRadius: '4rpx' }} />
              </View>
            </View>
          )}
        </View>

        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20rpx' }}>
          <Text style={{ fontWeight: 600, fontSize: '28rpx', color: '#4a4a4a' }}>关联计划</Text>
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/plan-add/index' })}
            style={{
              padding: '8rpx 24rpx', borderRadius: '40rpx',
              border: '1px solid #88a096',
            }}
          >
            <Text style={{ color: '#88a096', fontSize: '24rpx' }}>+ 新建计划</Text>
          </View>
        </View>

        {targetPlans.length === 0 ? (
          <EmptyState title="暂无关联计划" description="为这个目标创建计划来分解任务" />
        ) : (
          targetPlans.map((plan) => (
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
                  <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>{plan.completed ? '已完成' : '进行中'}</Text>
                </View>
              </View>
              {plan.desc && (
                <Text style={{ fontSize: '24rpx', color: '#8b8680', marginBottom: '8rpx',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                  {plan.desc}
                </Text>
              )}
              <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>
                  {format(new Date(plan.beginTime), 'MM/dd', { locale: zhCN })} - {format(new Date(plan.endTime), 'MM/dd', { locale: zhCN })}
                </Text>
                <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>权重 {plan.weight}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
