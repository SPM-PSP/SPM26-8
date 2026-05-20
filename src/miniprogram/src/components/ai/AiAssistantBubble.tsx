import { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import { analyzeProactiveContext } from '../../services/ai';
import { Todo } from '../../types';

interface AiAssistantBubbleProps {
  todos: Todo[];
}

export function AiAssistantBubble({ todos }: AiAssistantBubbleProps) {
  const [open, setOpen] = useState(false);
  const insight = useMemo(() => analyzeProactiveContext(todos), [todos]);

  const tips = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const overdue = todos.filter(t => !t.completed && t.endTime && new Date(t.endTime) < new Date()).length;
    const active = total - completed;
    if (total === 0) return '';
    const rate = Math.round((completed / total) * 100);
    let extra = '';
    if (overdue > 0) {
      extra = `其中 ${overdue} 个已逾期，建议优先处理或调整截止时间。`;
    } else if (active > 0 && completed > 0) {
      extra = `继续保持，还剩 ${active} 个待完成任务。`;
    } else if (active > 0 && completed === 0) {
      extra = '试着从「重要紧急」的任务开始，完成第一个吧！';
    } else {
      extra = '太棒了，所有任务都已完成！';
    }
    return `共 ${total} 个任务，完成率 ${rate}%。${extra}`;
  }, [todos]);

  return (
    <>
      <View
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', right: '36rpx', bottom: '320rpx', zIndex: 40,
          width: '80rpx', height: '80rpx', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #88a096, #d4726f)',
          boxShadow: `0 4px 20px rgba(136,160,150,0.3)${insight.hasAlert ? ', 0 0 0 6rpx rgba(212,114,111,0.3)' : ''}`,
        }}
      >
        <Text style={{ fontSize: '36rpx' }}>🤖</Text>
        {insight.hasAlert && (
          <View style={{
            position: 'absolute', top: '-4rpx', right: '-4rpx',
            width: '24rpx', height: '24rpx', borderRadius: '50%',
            backgroundColor: '#d4726f', border: '2px solid #fff',
          }} />
        )}
      </View>

      {open && (
        <View
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <View
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '85%', boxSizing: 'border-box', maxHeight: '80vh',
              backgroundColor: '#fff', borderRadius: '24rpx',
              padding: '36rpx', overflow: 'auto',
            }}
          >
            <Text style={{ fontSize: '32rpx', fontWeight: 600, color: '#4a4a4a', marginBottom: '24rpx', display: 'block' }}>
              任务概览
            </Text>

            <View style={{
              background: 'linear-gradient(135deg, #f8f8f6, #fff)', borderRadius: '16rpx',
              padding: '20rpx', marginBottom: '16rpx',
            }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx', marginBottom: '12rpx' }}>
                <Text style={{ fontSize: '24rpx' }}>{insight.hasAlert ? '⚠️' : '✅'}</Text>
                <Text style={{ fontSize: '26rpx', fontWeight: 600, color: insight.hasAlert ? '#d4726f' : '#88a096' }}>
                  {insight.message}
                </Text>
              </View>
              {insight.detail && (
                <Text style={{ fontSize: '24rpx', color: '#8b8680', lineHeight: 1.5 }}>{insight.detail}</Text>
              )}
            </View>

            {todos.length > 0 && (
              <View style={{ backgroundColor: '#f8f8f6', borderRadius: '16rpx', padding: '20rpx', marginBottom: '24rpx' }}>
                <Text style={{ fontSize: '24rpx', color: '#4a4a4a', lineHeight: 1.8 }}>{tips}</Text>
              </View>
            )}
            {todos.length === 0 && (
              <Text style={{ fontSize: '24rpx', color: '#8b8680', textAlign: 'center', padding: '20rpx 0', marginBottom: '24rpx' }}>
                还没有任务，去创建一个吧 ✨
              </Text>
            )}

            <View
              onClick={() => setOpen(false)}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '24rpx', borderRadius: '16rpx',
                background: 'linear-gradient(135deg, #88a096, #b8a89d)', textAlign: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: '28rpx' }}>知道了</Text>
            </View>
          </View>
        </View>
      )}
    </>
  );
}
