import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { breakdownTodo } from '../../services/ai';
import { Todo } from '../../types';

interface TodoBreakdownPanelProps {
  todo: Todo;
  expanded: boolean;
  onToggle: () => void;
  onAdopt: (subtasks: string[]) => void;
}

export function TodoBreakdownPanel({ todo, expanded, onToggle, onAdopt }: TodoBreakdownPanelProps) {
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const handleToggle = async (e: any) => {
    e.stopPropagation?.();
    if (!expanded && !loaded) {
      onToggle();
      setLoading(true);
      try {
        const items = await breakdownTodo(todo.title, todo.desc);
        setSubtasks(items);
        setSelected(new Set(items.map((_, i) => i)));
        setLoaded(true);
      } catch (err) {
        Taro.showToast({ title: err instanceof Error ? err.message : '拆解失败', icon: 'none' });
        onToggle();
      } finally {
        setLoading(false);
      }
    } else {
      onToggle();
    }
  };

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAdopt = () => {
    const picked = subtasks.filter((_, i) => selected.has(i));
    if (picked.length === 0) {
      Taro.showToast({ title: '请至少选择一个子任务', icon: 'none' });
      return;
    }
    onAdopt(picked);
    Taro.showToast({ title: `已采纳 ${picked.length} 个子任务`, icon: 'success' });
    onToggle();
  };

  return (
    <>
      <View
        onClick={handleToggle}
        style={{
          width: '56rpx', height: '56rpx', borderRadius: '50%',
          background: 'linear-gradient(135deg, #e9b893, #d4726f)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: '28rpx' }}>{loading ? '⏳' : '✨'}</Text>
      </View>

      {expanded && (
        <View style={{
          width: '100%', marginTop: '16rpx', paddingTop: '16rpx',
          borderTop: '1px solid #f0f0f0',
        }}>
          {loading ? (
            <Text style={{ fontSize: '24rpx', color: '#8b8680', display: 'block' }}>
              AI 正在拆解任务...
            </Text>
          ) : subtasks.length > 0 ? (
            <View>
              <Text style={{ fontSize: '24rpx', color: '#8b8680', marginBottom: '16rpx', display: 'block' }}>
                AI 建议的子步骤（可勾选后一键采纳）
              </Text>
              {subtasks.map((task, i) => (
                <View
                  key={i}
                  onClick={() => toggleSelect(i)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12rpx',
                    padding: '16rpx', marginBottom: '8rpx', borderRadius: '16rpx',
                    backgroundColor: '#f8f8f6',
                  }}
                >
                  <View style={{
                    width: '32rpx', height: '32rpx', borderRadius: '50%',
                    border: `2px solid ${selected.has(i) ? '#88a096' : '#ccc'}`,
                    backgroundColor: selected.has(i) ? '#88a096' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: '2rpx',
                  }}>
                    {selected.has(i) && <Text style={{ color: '#fff', fontSize: '18rpx' }}>✓</Text>}
                  </View>
                  <Text style={{ fontSize: '26rpx', color: '#4a4a4a', lineHeight: 1.5, flex: 1 }}>{task}</Text>
                </View>
              ))}
              <View
                onClick={handleAdopt}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '20rpx', borderRadius: '40rpx',
                  backgroundColor: '#88a096', textAlign: 'center', marginTop: '12rpx',
                }}
              >
                <Text style={{ color: '#fff', fontSize: '26rpx' }}>采纳为子任务备注</Text>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </>
  );
}
