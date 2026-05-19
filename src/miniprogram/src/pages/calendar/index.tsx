import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { STATUS_BAR_HEIGHT } from '../../utils/safeArea';
import { EmptyState } from '../../components/EmptyState';
import { useTodos } from '../../hooks/useTodos';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  differenceInYears,
  getYear,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

type ViewMode = 'month' | 'year' | 'life';

export default function Calendar() {
  const { todos, updateTodo } = useTodos();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getTodosForDate = (date: Date) => {
    return todos.filter((todo) => {
      if (!todo.endTime) return false;
      return isSameDay(new Date(todo.endTime), date);
    });
  };

  const selectedDateTodos = getTodosForDate(selectedDate);

  const MonthView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const weeks: Date[][] = [];
    let day = startDate;
    while (day <= endDate) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      weeks.push(week);
    }

    return (
      <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24rpx' }}>
          <View
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            style={{ width: '56rpx', height: '56rpx', borderRadius: '50%', backgroundColor: '#f5f1ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: '32rpx', color: '#4a4a4a' }}>‹</Text>
          </View>
          <Text style={{ fontWeight: 600, fontSize: '30rpx', color: '#4a4a4a' }}>
            {format(currentMonth, 'yyyy年 MM月', { locale: zhCN })}
          </Text>
          <View
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            style={{ width: '56rpx', height: '56rpx', borderRadius: '50%', backgroundColor: '#f5f1ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: '32rpx', color: '#4a4a4a' }}>›</Text>
          </View>
        </View>

        <View style={{ display: 'flex', marginBottom: '12rpx' }}>
          {days.map((d) => (
            <View key={d} style={{ flex: 1, textAlign: 'center', padding: '8rpx' }}>
              <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>{d}</Text>
            </View>
          ))}
        </View>

        {weeks.map((week, wi) => (
          <View key={wi} style={{ display: 'flex', marginBottom: '8rpx' }}>
            {week.map((d) => {
              const dayTodos = getTodosForDate(d);
              const completedCount = dayTodos.filter(t => t.completed).length;
              const hasActiveTodos = dayTodos.some(t => !t.completed);
              const selected = isSameDay(d, selectedDate);
              const today = isToday(d);
              const inMonth = isSameMonth(d, monthStart);

              return (
                <View
                  key={d.toString()}
                  onClick={() => setSelectedDate(d)}
                  style={{
                    flex: 1, minHeight: '100rpx', borderRadius: '16rpx', padding: '8rpx',
                    opacity: inMonth ? 1 : 0.3,
                    background: selected ? 'linear-gradient(135deg, #d4726f, #e9b893)' : '#fff',
                    border: today && !selected ? '2px solid #d4726f' : 'none',
                    boxShadow: selected ? '0 4px 12px rgba(212,114,111,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rpx' }}>
                    <Text style={{
                      fontSize: '24rpx', color: selected ? '#fff' : '#4a4a4a',
                      fontWeight: selected ? 600 : 400,
                    }}>
                      {format(d, 'd')}
                    </Text>
                    {hasActiveTodos && !selected && (
                      <View style={{ width: '10rpx', height: '10rpx', borderRadius: '50%', backgroundColor: '#d4726f' }} />
                    )}
                  </View>
                  {dayTodos.length > 0 && (
                    <Text style={{ fontSize: '18rpx', color: selected ? 'rgba(255,255,255,0.9)' : '#8b8680' }}>
                      {completedCount}/{dayTodos.length}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const YearView = () => {
    const months: { monthDate: Date; monthTodos: typeof todos; completedCount: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(getYear(currentYear), i, 1);
      const monthTodos = todos.filter((todo) => {
        if (!todo.endTime) return false;
        return isSameMonth(new Date(todo.endTime), monthDate);
      });
      months.push({ monthDate, monthTodos, completedCount: monthTodos.filter(t => t.completed).length });
    }

    return (
      <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28rpx' }}>
          <View
            onClick={() => setCurrentYear(subYears(currentYear, 1))}
            style={{ width: '56rpx', height: '56rpx', borderRadius: '50%', backgroundColor: '#f5f1ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: '32rpx', color: '#4a4a4a' }}>‹</Text>
          </View>
          <Text style={{ fontWeight: 600, fontSize: '30rpx', color: '#4a4a4a' }}>
            {format(currentYear, 'yyyy年', { locale: zhCN })}
          </Text>
          <View
            onClick={() => setCurrentYear(addYears(currentYear, 1))}
            style={{ width: '56rpx', height: '56rpx', borderRadius: '50%', backgroundColor: '#f5f1ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: '32rpx', color: '#4a4a4a' }}>›</Text>
          </View>
        </View>

        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx', justifyContent: 'center' }}>
          {months.map((m) => (
            <View
              key={m.monthDate.toString()}
              onClick={() => { setCurrentMonth(m.monthDate); setViewMode('month'); }}
              style={{
                width: 'calc(50% - 8rpx)', borderRadius: '20rpx', padding: '28rpx 20rpx',
                backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                textAlign: 'center',
              }}
            >
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#4a4a4a', display: 'block', marginBottom: '8rpx' }}>
                {format(m.monthDate, 'M月', { locale: zhCN })}
              </Text>
              {m.monthTodos.length > 0 ? (
                <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>
                  {m.completedCount}/{m.monthTodos.length} 完成
                </Text>
              ) : (
                <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>无任务</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const LifeView = () => {
    const birthYear = 1990;
    const currentAge = differenceInYears(new Date(), new Date(birthYear, 0, 1));
    const lifeExpectancy = 90;

    const years: number[] = [];
    for (let i = 0; i < lifeExpectancy; i++) years.push(i);

    return (
      <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <Text style={{ fontWeight: 600, fontSize: '30rpx', color: '#4a4a4a', marginBottom: '8rpx', display: 'block' }}>
          生命格子
        </Text>
        <Text style={{ fontSize: '22rpx', color: '#8b8680', marginBottom: '24rpx', display: 'block' }}>
          每一个格子代表一年，已度过的时光用深色标记
        </Text>

        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '6rpx', marginBottom: '24rpx' }}>
          {years.map((i) => {
            const isPast = i < currentAge;
            const isCurrent = i === currentAge;
            return (
              <View
                key={i}
                style={{
                  width: 'calc(10% - 6rpx)', aspectRatio: '1',
                  borderRadius: '6rpx',
                  backgroundColor: isPast ? '#88a096' : isCurrent ? '#d4726f' : '#e8e4e0',
                  background: isCurrent ? 'linear-gradient(135deg, #d4726f, #e9b893)' : undefined,
                }}
              />
            );
          })}
        </View>

        <View style={{ display: 'flex', alignItems: 'center', gap: '24rpx' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
            <View style={{ width: '20rpx', height: '20rpx', borderRadius: '4rpx', backgroundColor: '#88a096' }} />
            <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>已度过</Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
            <View style={{ width: '20rpx', height: '20rpx', borderRadius: '4rpx', background: 'linear-gradient(135deg, #d4726f, #e9b893)' }} />
            <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>当前</Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
            <View style={{ width: '20rpx', height: '20rpx', borderRadius: '4rpx', backgroundColor: '#e8e4e0' }} />
            <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>未来</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        padding: `${STATUS_BAR_HEIGHT + 12}px 36rpx 24rpx 36rpx`,
      }}>
        <Text style={{ fontSize: '36rpx', fontWeight: 600, color: '#4a4a4a', display: 'block', marginBottom: '20rpx' }}>日历</Text>

        <View style={{ display: 'flex', borderRadius: '16rpx', overflow: 'hidden' }}>
          {(['month', 'year', 'life'] as ViewMode[]).map((mode) => {
            const labels: Record<ViewMode, string> = { month: '月', year: '年', life: '一生' };
            return (
              <View
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  flex: 1, textAlign: 'center', padding: '16rpx',
                  background: viewMode === mode ? '#88a096' : '#f5f1ed',
                  color: viewMode === mode ? '#fff' : '#8b8680',
                  fontSize: '26rpx',
                }}
              >
                <Text style={{ color: 'inherit', fontSize: '26rpx' }}>{labels[mode]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ padding: '36rpx' }}>
        {viewMode === 'month' && <MonthView />}
        {viewMode === 'year' && <YearView />}
        {viewMode === 'life' && <LifeView />}

        {/* 选中日期的任务 */}
        {viewMode === 'month' && (
          <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginTop: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <Text style={{ fontWeight: 600, fontSize: '28rpx', color: '#4a4a4a', marginBottom: '20rpx', display: 'block' }}>
              {format(selectedDate, 'MM月dd日', { locale: zhCN })} 的任务
            </Text>

            {selectedDateTodos.length === 0 ? (
              <EmptyState title="当天无任务" description="这一天没有安排任务" />
            ) : (
              selectedDateTodos.map((todo) => (
                <View
                  key={todo.id}
                  onClick={() => Taro.navigateTo({ url: `/pages/todo-add/index?id=${todo.id}` })}
                  style={{
                    backgroundColor: '#f5f1ed', borderRadius: '20rpx', padding: '24rpx',
                    marginBottom: '16rpx',
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
                      <Text style={{
                        fontWeight: 500, fontSize: '28rpx', marginBottom: '4rpx',
                        color: todo.completed ? '#8b8680' : '#4a4a4a',
                        textDecoration: todo.completed ? 'line-through' : 'none',
                      }}>
                        {todo.title}
                      </Text>
                      {todo.endTime && (
                        <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>
                          {format(new Date(todo.endTime), 'HH:mm', { locale: zhCN })}
                        </Text>
                      )}
                      {todo.category && (
                        <View style={{ padding: '2rpx 12rpx', borderRadius: '20rpx', border: '1px solid #ccc', marginTop: '8rpx', display: 'inline-block' }}>
                          <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>{todo.category}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
}
