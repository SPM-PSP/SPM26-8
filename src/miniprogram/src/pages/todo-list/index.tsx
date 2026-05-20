import { useState, useEffect, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { STATUS_BAR_HEIGHT } from '../../utils/safeArea';
import { EmptyState } from '../../components/EmptyState';
import { useTodos } from '../../hooks/useTodos';
import { useTargets } from '../../hooks/useTargets';
import { usePlans } from '../../hooks/usePlans';
import { AiAssistantBubble } from '../../components/ai/AiAssistantBubble';
import { SmartInputSheet } from '../../components/ai/SmartInputSheet';
import { TodoBreakdownPanel } from '../../components/ai/TodoBreakdownPanel';
import { ParsedTodoDraft } from '../../services/ai';
import { FilterStatus, Todo } from '../../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const LEVEL_COLORS: Record<string, string> = {
  'urgent-important': '#d4726f',
  'urgent-not-important': '#e9b893',
  'not-urgent-important': '#88a096',
  'not-urgent-not-important': '#b8a89d',
};

export default function TodoList() {
  const { todos, updateTodo } = useTodos();
  const { targets } = useTargets();
  const { plans } = usePlans();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [now, setNow] = useState(() => new Date());
  const [smartInputOpen, setSmartInputOpen] = useState(false);
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isWithin24Hours = (endTime: string) => {
    const diff = new Date(endTime).getTime() - now.getTime();
    return diff >= 0 && diff < 24 * 3600 * 1000;
  };

  const urgentTodos = todos
    .filter((todo) => {
      if (todo.completed || !todo.endTime) return false;
      return isWithin24Hours(todo.endTime);
    })
    .sort((a, b) => new Date(a.endTime!).getTime() - new Date(b.endTime!).getTime());

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    if (filter === 'urgent') {
      if (todo.completed || !todo.endTime) return false;
      return isWithin24Hours(todo.endTime);
    }
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.endTime && b.endTime) {
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    }
    return 0;
  });

  const getTargetName = (targetId?: string) =>
    targetId ? targets.find(t => t.id === targetId)?.title : null;
  const getPlanName = (planId?: string) =>
    planId ? plans.find(p => p.id === planId)?.title : null;

  const getCountdown = useCallback((endTime: string) => {
    const totalSeconds = Math.floor((new Date(endTime).getTime() - now.getTime()) / 1000);
    if (totalSeconds < 0) return '已逾期';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [now]);

  const isOverdue = (endTime: string) => new Date(endTime) < now;

  const handleSmartInputConfirm = (draft: ParsedTodoDraft) => {
    Taro.navigateTo({ url: '/pages/todo-add/index' });
    // Store draft in storage so AddTodo can pick it up
    Taro.setStorageSync('smartInputDraft', JSON.stringify(draft));
  };

  const handleAdoptSubtasks = (todo: Todo, subtasks: string[]) => {
    updateTodo(todo.id, {
      summury: (todo.summury ? todo.summury + '\n' : '') + subtasks.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    });
  };

  const filterTabs = [
    { value: 'all', label: '全部' },
    { value: 'active', label: '待办' },
    { value: 'urgent', label: '临期' },
    { value: 'completed', label: '已完成' },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '120rpx' }}>
      {/* 顶部栏 */}
      <View style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        padding: `${STATUS_BAR_HEIGHT + 12}px 36rpx 24rpx 36rpx`,
      }}>
        <Text style={{ fontSize: '36rpx', fontWeight: 600, color: '#4a4a4a', display: 'block', marginBottom: '24rpx' }}>
          任务
        </Text>
        <View style={{ display: 'flex', gap: '16rpx' }}>
          {filterTabs.map((item) => (
            <View
              key={item.value}
              onClick={() => setFilter(item.value as FilterStatus)}
              style={{
                padding: '12rpx 32rpx',
                borderRadius: '40rpx',
                fontSize: '26rpx',
                whiteSpace: 'nowrap',
                background: filter === item.value
                  ? 'linear-gradient(135deg, #d4726f, #e9b893)'
                  : '#f5f1ed',
                color: filter === item.value ? '#fff' : '#8b8680',
                boxShadow: filter === item.value ? '0 2px 8px rgba(212,114,111,0.3)' : 'none',
              }}
            >
              <Text style={{ color: 'inherit', fontSize: '26rpx' }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ padding: '36rpx' }}>
        {/* 24小时到期横幅 */}
        {urgentTodos.length > 0 && filter !== 'completed' && (
          <View style={{
            background: 'linear-gradient(135deg, #d4726f, #e9b893)',
            borderRadius: '30rpx',
            padding: '30rpx',
            marginBottom: '32rpx',
            boxShadow: '0 4px 20px rgba(212,114,111,0.2)',
          }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', marginBottom: '20rpx' }}>
              <Text style={{ color: '#fff', fontSize: '28rpx' }}>⏰</Text>
              <Text style={{ color: '#fff', fontWeight: 600, fontSize: '28rpx' }}>24小时内到期</Text>
            </View>
            {urgentTodos.slice(0, 3).map((todo) => (
              <View
                key={todo.id}
                onClick={() => Taro.navigateTo({ url: `/pages/todo-add/index?id=${todo.id}` })}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '20rpx',
                  padding: '20rpx',
                  marginBottom: '12rpx',
                }}
              >
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 500, fontSize: '26rpx', flex: 1 }}>
                    {todo.title}
                  </Text>
                  <Text style={{
                    color: '#fff', fontSize: '22rpx', fontFamily: 'monospace',
                    backgroundColor: 'rgba(255,255,255,0.3)', padding: '6rpx 16rpx', borderRadius: '12rpx',
                  }}>
                    {getCountdown(todo.endTime!)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 任务列表 */}
        {filteredTodos.length === 0 ? (
          <EmptyState
            title={
              filter === 'all' ? '暂无任务' :
              filter === 'active' ? '暂无待办任务' :
              filter === 'urgent' ? '暂无临期任务' : '暂无已完成的任务'
            }
            description="点击右下角 + 创建任务"
          />
        ) : (
          <View>
            {filteredTodos.map((todo) => {
              const targetName = getTargetName(todo.targetId);
              const planName = getPlanName(todo.planId);
              const overdueTask = todo.endTime && isOverdue(todo.endTime) && !todo.completed;
              const urgentTask = todo.endTime && !todo.completed && isWithin24Hours(todo.endTime);

              return (
                <View
                  key={todo.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '24rpx',
                    padding: '28rpx',
                    marginBottom: '20rpx',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    opacity: todo.completed ? 0.5 : 1,
                  }}
                >
                  <View style={{ display: 'flex', alignItems: 'flex-start', gap: '16rpx' }}>
                    {/* Checkbox */}
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

                    {/* 内容 */}
                    <View
                      onClick={() => Taro.navigateTo({ url: `/pages/todo-add/index?id=${todo.id}` })}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12rpx' }}>
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

                      {todo.desc ? (
                        <Text style={{
                          fontSize: '24rpx', color: '#8b8680', marginBottom: '12rpx',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden', lineHeight: 1.5,
                        }}>
                          {todo.desc}
                        </Text>
                      ) : null}

                      {/* 已逾期 — 单独一行 */}
                      {overdueTask && (
                        <Text style={{ fontSize: '24rpx', color: '#d4726f', fontWeight: 600, marginBottom: '6rpx', display: 'block' }}>
                          ⚠ 已逾期
                        </Text>
                      )}

                      {/* 日期 — 单独一行 */}
                      {todo.endTime && (
                        <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx', marginBottom: '6rpx' }}>
                          <Text style={{ fontSize: '22rpx', color: overdueTask ? '#d4726f' : '#8b8680' }}>
                            {format(new Date(todo.endTime), 'MM/dd HH:mm', { locale: zhCN })}
                          </Text>
                          {urgentTask && (
                            <Text style={{
                              fontSize: '20rpx', fontFamily: 'monospace',
                              backgroundColor: '#fef0ef', color: '#d4726f',
                              padding: '4rpx 12rpx', borderRadius: '8rpx',
                            }}>
                              {getCountdown(todo.endTime)}
                            </Text>
                          )}
                        </View>
                      )}

                      {/* 标签 — 单独一行 */}
                      {(targetName || planName) && (
                        <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx', flexWrap: 'wrap' }}>
                          {targetName && (
                            <View style={{ padding: '4rpx 16rpx', borderRadius: '20rpx', border: '1px solid #88a096' }}>
                              <Text style={{ fontSize: '20rpx', color: '#88a096' }}>{targetName}</Text>
                            </View>
                          )}
                          {planName && (
                            <View style={{ padding: '4rpx 16rpx', borderRadius: '20rpx', border: '1px solid #ccc' }}>
                              <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>{planName}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {expandedBreakdownId === todo.id && (
                        <View style={{ marginTop: '16rpx' }}>
                          <TodoBreakdownPanel
                            todo={todo}
                            expanded={expandedBreakdownId === todo.id}
                            onToggle={() => setExpandedBreakdownId('')}
                            onAdopt={(subtasks) => handleAdoptSubtasks(todo, subtasks)}
                          />
                        </View>
                      )}
                    </View>

                    {expandedBreakdownId !== todo.id && (
                      <TodoBreakdownPanel
                        todo={todo}
                        expanded={false}
                        onToggle={() => setExpandedBreakdownId(expandedBreakdownId === todo.id ? '' : todo.id)}
                        onAdopt={(subtasks) => handleAdoptSubtasks(todo, subtasks)}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* + 添加任务按钮 */}
      <View
        onClick={() => Taro.navigateTo({ url: '/pages/todo-add/index' })}
        style={{
          position: 'fixed', right: '36rpx', bottom: '180rpx',
          width: '100rpx', height: '100rpx', borderRadius: '50%',
          background: 'linear-gradient(135deg, #d4726f, #e9b893)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(212,114,111,0.3)',
          zIndex: 30,
        }}
      >
        <Text style={{ color: '#fff', fontSize: '48rpx', lineHeight: 1 }}>+</Text>
      </View>

      {/* 灵动输入按钮 */}
      <View
        onClick={() => setSmartInputOpen(true)}
        style={{
          position: 'fixed', right: '36rpx', bottom: '440rpx',
          width: '80rpx', height: '80rpx', borderRadius: '50%',
          backgroundColor: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex: 30,
        }}
      >
        <Text style={{ fontSize: '36rpx' }}>✨</Text>
      </View>

      <AiAssistantBubble todos={todos} />

      <SmartInputSheet
        open={smartInputOpen}
        onOpenChange={setSmartInputOpen}
        onConfirm={handleSmartInputConfirm}
      />
    </View>
  );
}
