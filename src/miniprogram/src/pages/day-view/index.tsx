import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { STATUS_BAR_HEIGHT } from '../../utils/safeArea';
import { EmptyState } from '../../components/EmptyState';
import { useTodos } from '../../hooks/useTodos';
import {
  format,
  addDays,
  subDays,
  isSameDay,
  isToday,
  getHours,
  getMinutes,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function DayView() {
  const { todos, updateTodo } = useTodos();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getTodosForDate = () => {
    return todos.filter((todo) => {
      if (!todo.endTime) return false;
      return isSameDay(new Date(todo.endTime), currentDate);
    }).sort((a, b) => {
      if (!a.endTime || !b.endTime) return 0;
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    });
  };

  const dayTodos = getTodosForDate();
  const completedCount = dayTodos.filter(t => t.completed).length;
  const progress = dayTodos.length > 0 ? (completedCount / dayTodos.length) * 100 : 0;

  const getTimeSlot = (time: string) => {
    const date = new Date(time);
    const hours = getHours(date);
    const minutes = getMinutes(date);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getTimePeriodEmoji = (hour: number): string => {
    if (hour >= 5 && hour < 8) return '🌅';
    if (hour >= 8 && hour < 18) return '☀️';
    if (hour >= 18 && hour < 20) return '🌇';
    return '🌙';
  };

  const getTimePeriodColor = (hour: number): string => {
    if (hour >= 5 && hour < 8) return 'linear-gradient(135deg, #e9b893, #d4c5b9)';
    if (hour >= 8 && hour < 18) return 'linear-gradient(135deg, #88a096, #b8a89d)';
    if (hour >= 18 && hour < 20) return 'linear-gradient(135deg, #d4726f, #e9b893)';
    return 'linear-gradient(135deg, #b8a89d, #9b9ea4)';
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
      {/* 顶部栏 */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        padding: `${STATUS_BAR_HEIGHT + 12}px 36rpx 24rpx 36rpx`,
      }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20rpx' }}>
          <View
            onClick={() => setCurrentDate(subDays(currentDate, 1))}
            style={{
              width: '64rpx', height: '64rpx', borderRadius: '50%',
              backgroundColor: '#f5f1ed', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: '36rpx', color: '#4a4a4a' }}>‹</Text>
          </View>

          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '36rpx', fontWeight: 600, color: '#4a4a4a', display: 'block' }}>
              {format(currentDate, 'MM月dd日', { locale: zhCN })}
            </Text>
            <Text style={{ fontSize: '24rpx', color: '#8b8680' }}>
              {format(currentDate, 'EEEE', { locale: zhCN })}
              {isToday(currentDate) && ' · 今天'}
            </Text>
          </View>

          <View
            onClick={() => setCurrentDate(addDays(currentDate, 1))}
            style={{
              width: '64rpx', height: '64rpx', borderRadius: '50%',
              backgroundColor: '#f5f1ed', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: '36rpx', color: '#4a4a4a' }}>›</Text>
          </View>
        </View>

        {/* 进度指示器 */}
        <View style={{
          background: 'linear-gradient(135deg, #88a096, #b8a89d)',
          borderRadius: '20rpx', padding: '24rpx',
        }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' }}>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '26rpx' }}>今日进度</Text>
            <Text style={{ color: '#fff', fontWeight: 500, fontSize: '26rpx' }}>
              {completedCount} / {dayTodos.length} 项
            </Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8rpx', height: '10rpx', overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${progress}%`, backgroundColor: '#fff', borderRadius: '8rpx' }} />
          </View>
        </View>
      </View>

      {/* 时间轴 */}
      <View style={{ padding: '36rpx' }}>
        {dayTodos.length === 0 ? (
          <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '40rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <EmptyState title="当天无任务" description="这一天没有安排任务" />
          </View>
        ) : (
          <View>
            {Array.from({ length: 24 }, (_, hour) => {
              const hourTodos = dayTodos.filter((todo) => {
                if (!todo.endTime) return false;
                return getHours(new Date(todo.endTime)) === hour;
              });

              return (
                <View key={hour} style={{ display: 'flex', gap: '16rpx' }}>
                  <View style={{ width: '80rpx', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={{ fontSize: '22rpx', color: '#8b8680', marginBottom: '4rpx' }}>
                      {hour.toString().padStart(2, '0')}:00
                    </Text>
                    <Text style={{ fontSize: '24rpx' }}>{getTimePeriodEmoji(hour)}</Text>
                  </View>

                  <View style={{ flex: 1, borderLeft: '2px solid #e8e4e0', paddingLeft: '24rpx', paddingBottom: '24rpx', minHeight: '60rpx' }}>
                    {hourTodos.map((todo) => (
                      <View
                        key={todo.id}
                        onClick={() => Taro.navigateTo({ url: `/pages/todo-add/index?id=${todo.id}` })}
                        style={{
                          backgroundColor: '#fff', borderRadius: '20rpx', padding: '24rpx',
                          marginBottom: '16rpx', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                      >
                        <View style={{ display: 'flex', alignItems: 'flex-start', gap: '16rpx' }}>
                          <View
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTodo(todo.id, { completed: !todo.completed });
                            }}
                            style={{
                              width: '32rpx', height: '32rpx', borderRadius: '50%',
                              border: `2px solid ${todo.completed ? '#88a096' : '#ccc'}`,
                              backgroundColor: todo.completed ? '#88a096' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, marginTop: '4rpx',
                            }}
                          >
                            {todo.completed && <Text style={{ color: '#fff', fontSize: '18rpx' }}>✓</Text>}
                          </View>

                          <View style={{ flex: 1, minWidth: 0 }}>
                            <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx', marginBottom: '6rpx' }}>
                              <Text style={{ fontSize: '22rpx', fontFamily: 'monospace', color: '#d4726f' }}>
                                {getTimeSlot(todo.endTime!)}
                              </Text>
                              {todo.category && (
                                <View style={{ padding: '2rpx 12rpx', borderRadius: '20rpx', border: '1px solid #ccc' }}>
                                  <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>{todo.category}</Text>
                                </View>
                              )}
                            </View>
                            <Text style={{
                              fontSize: '28rpx', lineHeight: 1.5,
                              color: todo.completed ? '#8b8680' : '#4a4a4a',
                              textDecoration: todo.completed ? 'line-through' : 'none',
                            }}>
                              {todo.title}
                            </Text>
                            {todo.desc && (
                              <Text style={{ fontSize: '24rpx', color: '#8b8680', marginTop: '6rpx', lineHeight: 1.5,
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {todo.desc}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
