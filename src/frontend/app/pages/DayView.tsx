import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';
import { useTodos } from '../hooks/useTodos';
import {
  format,
  addDays,
  subDays,
  isSameDay,
  isToday,
  parseISO,
  getHours,
  getMinutes,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function DayView() {
  const { todos, updateTodo } = useTodos();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getTodosForDate = () => {
    return todos.filter((todo) => {
      if (!todo.endTime) return false;
      const todoDate = parseISO(todo.endTime);
      return isSameDay(todoDate, currentDate);
    }).sort((a, b) => {
      if (!a.endTime || !b.endTime) return 0;
      return parseISO(a.endTime).getTime() - parseISO(b.endTime).getTime();
    });
  };

  const dayTodos = getTodosForDate();
  const completedCount = dayTodos.filter(t => t.completed).length;
  const progress = dayTodos.length > 0 ? (completedCount / dayTodos.length) * 100 : 0;

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateTodo(id, { completed: !completed });
  };

  const getTimeSlot = (time: string) => {
    const date = parseISO(time);
    const hours = getHours(date);
    const minutes = getMinutes(date);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getTimePeriodIcon = (hour: number) => {
    if (hour >= 5 && hour < 8) return Sunrise;
    if (hour >= 8 && hour < 18) return Sun;
    if (hour >= 18 && hour < 20) return Sunset;
    return Moon;
  };

  const getTimePeriodColor = (hour: number) => {
    if (hour >= 5 && hour < 8) return 'bg-gradient-to-r from-[#e9b893] to-[#d4c5b9]';
    if (hour >= 8 && hour < 18) return 'bg-gradient-to-r from-[#88a096] to-[#b8a89d]';
    if (hour >= 18 && hour < 20) return 'bg-gradient-to-r from-[#d4726f] to-[#e9b893]';
    return 'bg-gradient-to-r from-[#b8a89d] to-[#9b9ea4]';
  };

  const renderTimeline = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-3">
        {hours.map((hour) => {
          const hourTodos = dayTodos.filter((todo) => {
            if (!todo.endTime) return false;
            return getHours(parseISO(todo.endTime)) === hour;
          });

          const TimeIcon = getTimePeriodIcon(hour);

          return (
            <div key={hour} className="flex gap-3">
              <div className="flex flex-col items-center w-14">
                <div className="text-xs text-[#8b8680] mb-1">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <TimeIcon className="w-4 h-4 text-[#b8a89d]" />
              </div>

              <div className="flex-1 border-l-2 border-[#e8e4e0] pl-4 pb-4 min-h-12">
                {hourTodos.length > 0 && (
                  <div className="space-y-2">
                    {hourTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="bg-white rounded-[16px] p-4"
                        style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'}}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => handleToggleComplete(todo.id, todo.completed)}
                            className="mt-1 rounded-full"
                          />

                          <Link to={`/todos/${todo.id}`} className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-[#d4726f]">
                                {getTimeSlot(todo.endTime!)}
                              </span>
                              {todo.category && (
                                <Badge variant="secondary" className="text-xs rounded-full">
                                  {todo.category}
                                </Badge>
                              )}
                            </div>
                            <h4 className={`leading-relaxed ${todo.completed ? 'line-through text-[#8b8680]' : 'text-[#4a4a4a]'}`}>
                              {todo.title}
                            </h4>
                            {todo.desc && (
                              <p className="text-sm text-[#8b8680] mt-1 line-clamp-2 leading-relaxed">
                                {todo.desc}
                              </p>
                            )}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      {/* 顶部栏 */}
      <div className="bg-white/95 backdrop-blur-lg" style={{boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)'}}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
              className="w-8 h-8 rounded-full bg-[#f5f1ed] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4 text-[#4a4a4a]" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-semibold text-[#4a4a4a]">
                {format(currentDate, 'MM月dd日', { locale: zhCN })}
              </h2>
              <p className="text-sm text-[#8b8680]">
                {format(currentDate, 'EEEE', { locale: zhCN })}
                {isToday(currentDate) && ' · 今天'}
              </p>
            </div>

            <button
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
              className="w-8 h-8 rounded-full bg-[#f5f1ed] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4 text-[#4a4a4a]" />
            </button>
          </div>

          {/* 进度指示器 */}
          <div className="bg-gradient-to-r from-[#88a096] to-[#b8a89d] rounded-[16px] p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">今日进度</span>
              <span className="font-medium">
                {completedCount} / {dayTodos.length} 项
              </span>
            </div>
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 时间轴 */}
      <div className="max-w-screen-xl mx-auto px-6 py-5">
        {dayTodos.length === 0 ? (
          <div className="bg-white rounded-[20px] p-8" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
            <EmptyState
              icon={Clock}
              title="当天无任务"
              description="这一天没有安排任务"
            />
          </div>
        ) : (
          renderTimeline()
        )}
      </div>
    </div>
  );
}