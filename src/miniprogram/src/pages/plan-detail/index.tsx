import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { usePlans } from '../../hooks/usePlans';
import { useTargets } from '../../hooks/useTargets';
import { useTodos } from '../../hooks/useTodos';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const LEVEL_COLORS: Record<string, string> = {
  'urgent-important': '#d4726f',
  'urgent-not-important': '#e9b893',
  'not-urgent-important': '#88a096',
  'not-urgent-not-important': '#b8a89d',
};

export default function PlanDetail() {
  const router = useRouter();
  const { id } = router.params;
  const { getPlan } = usePlans();
  const { targets } = useTargets();
  const { todos, updateTodo } = useTodos();

  const plan = id ? getPlan(id) : null;

  if (!plan) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
        <PageHeader title="计划详情" showBack />
        <View style={{ padding: '36rpx' }}>
          <EmptyState title="计划不存在" description="该计划可能已被删除" />
        </View>
      </View>
    );
  }

  const target = plan.targetId ? targets.find(t => t.id === plan.targetId) : null;
  const planTodos = todos.filter(t => t.planId === id);
  const completedTodos = planTodos.filter(t => t.completed).length;
  const progress = planTodos.length > 0 ? (completedTodos / planTodos.length) * 100 : 0;

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
      <PageHeader
        title="计划详情"
        showBack
        rightElement={
          <Text style={{ color: '#88a096', fontSize: '28rpx' }}
            onClick={() => Taro.navigateTo({ url: `/pages/plan-add/index?id=${id}` })}>编辑</Text>
        }
      />

      <View style={{ padding: '36rpx' }}>
        <View style={{
          backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx',
          marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' }}>
            <Text style={{ fontWeight: 600, fontSize: '32rpx', color: '#4a4a4a', flex: 1 }}>{plan.title}</Text>
            <View style={{ padding: '4rpx 16rpx', borderRadius: '20rpx', border: '1px solid #ccc' }}>
              <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>{plan.completed ? '已完成' : '进行中'}</Text>
            </View>
          </View>

          {plan.desc && (
            <Text style={{ fontSize: '26rpx', color: '#8b8680', marginBottom: '16rpx', lineHeight: 1.5, display: 'block' }}>
              {plan.desc}
            </Text>
          )}

          <View style={{ display: 'flex', flexDirection: 'column', gap: '12rpx' }}>
            {target && (
              <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
                <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>目标:</Text>
                <Text style={{ fontSize: '24rpx', color: '#88a096' }}>{target.title}</Text>
              </View>
            )}
            <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
              <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>日期:</Text>
              <Text style={{ fontSize: '24rpx', color: '#4a4a4a' }}>
                {format(new Date(plan.beginTime), 'yyyy年MM月dd日', { locale: zhCN })} 至 {format(new Date(plan.endTime), 'yyyy年MM月dd日', { locale: zhCN })}
              </Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4rpx' }}>
                <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>权重:</Text>
                <Text style={{ fontSize: '24rpx', color: '#4a4a4a' }}>{plan.weight}</Text>
              </View>
              {plan.isRepeat && (
                <View style={{ padding: '2rpx 12rpx', borderRadius: '20rpx', backgroundColor: '#f5f1ed' }}>
                  <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>重复</Text>
                </View>
              )}
            </View>
          </View>

          {planTodos.length > 0 && (
            <View style={{ marginTop: '24rpx', paddingTop: '24rpx', borderTop: '1px solid #f0f0f0' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' }}>
                <Text style={{ fontSize: '24rpx', color: '#8b8680' }}>完成进度</Text>
                <Text style={{ fontSize: '24rpx', color: '#88a096', fontWeight: 500 }}>
                  {completedTodos} / {planTodos.length}
                </Text>
              </View>
              <View style={{ height: '8rpx', backgroundColor: '#f0f0f0', borderRadius: '4rpx', overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #88a096, #b8a89d)', borderRadius: '4rpx' }} />
              </View>
            </View>
          )}
        </View>

        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20rpx' }}>
          <Text style={{ fontWeight: 600, fontSize: '28rpx', color: '#4a4a4a' }}>关联任务</Text>
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/todo-add/index' })}
            style={{
              padding: '8rpx 24rpx', borderRadius: '40rpx',
              border: '1px solid #d4726f',
            }}
          >
            <Text style={{ color: '#d4726f', fontSize: '24rpx' }}>+ 新建任务</Text>
          </View>
        </View>

        {planTodos.length === 0 ? (
          <EmptyState title="暂无关联任务" description="为这个计划创建任务来具体执行" />
        ) : (
          planTodos.map((todo) => (
            <View
              key={todo.id}
              style={{
                backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx',
                marginBottom: '20rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                opacity: todo.completed ? 0.6 : 1,
              }}
            >
              <View style={{ display: 'flex', alignItems: 'flex-start', gap: '16rpx' }}>
                <View
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTodo(todo.id, { completed: !todo.completed });
                  }}
                  style={{
                    width: '36rpx', height: '36rpx', borderRadius: '50%',
                    border: `2px solid ${todo.completed ? '#88a096' : '#ccc'}`,
                    backgroundColor: todo.completed ? '#88a096' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: '4rpx',
                  }}
                >
                  {todo.completed && <Text style={{ color: '#fff', fontSize: '20rpx' }}>✓</Text>}
                </View>

                <View
                  onClick={() => Taro.navigateTo({ url: `/pages/todo-add/index?id=${todo.id}` })}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8rpx' }}>
                    <Text style={{
                      flex: 1, lineHeight: 1.5, fontSize: '28rpx',
                      color: todo.completed ? '#8b8680' : '#4a4a4a',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                    }}>
                      {todo.title}
                    </Text>
                    <View style={{
                      width: '16rpx', height: '16rpx', borderRadius: '50%',
                      backgroundColor: LEVEL_COLORS[todo.level], marginTop: '6rpx', flexShrink: 0,
                    }} />
                  </View>

                  {todo.desc && (
                    <Text style={{ fontSize: '24rpx', color: '#8b8680', marginBottom: '8rpx', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {todo.desc}
                    </Text>
                  )}

                  <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', flexWrap: 'wrap' }}>
                    {todo.category && (
                      <View style={{ padding: '4rpx 16rpx', borderRadius: '20rpx', border: '1px solid #ccc' }}>
                        <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>{todo.category}</Text>
                      </View>
                    )}
                    {todo.endTime && (
                      <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>
                        {format(new Date(todo.endTime), 'MM/dd HH:mm', { locale: zhCN })}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
