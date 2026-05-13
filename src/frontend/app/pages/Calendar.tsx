import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTodos } from '../hooks/useTodos';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  addDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  differenceInYears,
  getYear,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

type ViewMode = 'day' | 'week' | 'month' | 'year' | 'life';

export function Calendar() {
  const { todos, updateTodo } = useTodos();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getTodosForDate = (date: Date) => {
    return todos.filter((todo) => {
      if (!todo.endTime) return false;
      const todoDate = parseISO(todo.endTime);
      return isSameDay(todoDate, date);
    });
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateTodo(id, { completed: !completed });
  };

  // 月视图
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const rows = [];
    let dayCells = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayTodos = getTodosForDate(day);
        const completedCount = dayTodos.filter(t => t.completed).length;
        const hasActiveTodos = dayTodos.some(t => !t.completed);

        dayCells.push(
          <div
            key={day.toString()}
            onClick={() => setSelectedDate(cloneDay)}
            className={`
              min-h-16 p-2 rounded-[12px] cursor-pointer transition-all
              ${!isSameMonth(day, monthStart) ? 'opacity-30' : ''}
              ${isSameDay(day, selectedDate) ? 'bg-gradient-to-br from-[#d4726f] to-[#e9b893] text-white' : 'bg-white'}
              ${isToday(day) && !isSameDay(day, selectedDate) ? 'border-2 border-[#d4726f]' : ''}
            `}
            style={{boxShadow: isSameDay(day, selectedDate) ? '0 4px 12px rgba(212, 114, 111, 0.2)' : '0 1px 4px rgba(0, 0, 0, 0.04)'}}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm ${isSameDay(day, selectedDate) ? 'font-semibold' : ''}`}>
                {format(day, 'd')}
              </span>
              {hasActiveTodos && !isSameDay(day, selectedDate) && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4726f]" />
              )}
            </div>
            {dayTodos.length > 0 && (
              <div className={`text-[10px] ${isSameDay(day, selectedDate) ? 'text-white/90' : 'text-[#8b8680]'}`}>
                {completedCount}/{dayTodos.length}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-2">
          {dayCells}
        </div>
      );
      dayCells = [];
    }

    return (
      <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-full bg-[#f5f1ed] flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-[#4a4a4a]" />
          </button>
          <h2 className="font-semibold text-[#4a4a4a]">
            {format(currentMonth, 'yyyy年 MM月', { locale: zhCN })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-full bg-[#f5f1ed] flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-[#4a4a4a]" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-3">
          {days.map((d) => (
            <div key={d} className="text-center text-xs text-[#8b8680] py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="space-y-2">{rows}</div>
      </div>
    );
  };

  // 年视图
  const renderYearView = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(getYear(currentYear), i, 1);
      const monthTodos = todos.filter((todo) => {
        if (!todo.endTime) return false;
        const todoDate = parseISO(todo.endTime);
        return isSameMonth(todoDate, monthDate);
      });
      const completedCount = monthTodos.filter(t => t.completed).length;

      months.push(
        <div
          key={i}
          onClick={() => {
            setCurrentMonth(monthDate);
            setViewMode('month');
          }}
          className="bg-white rounded-[16px] p-4 cursor-pointer transition-all hover:scale-105"
          style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}
        >
          <div className="text-sm font-medium text-[#4a4a4a] mb-2">
            {format(monthDate, 'M月', { locale: zhCN })}
          </div>
          {monthTodos.length > 0 ? (
            <div className="text-xs text-[#8b8680]">
              {completedCount}/{monthTodos.length} 完成
            </div>
          ) : (
            <div className="text-xs text-[#8b8680]">无任务</div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentYear(subYears(currentYear, 1))}
            className="w-8 h-8 rounded-full bg-[#f5f1ed] flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-[#4a4a4a]" />
          </button>
          <h2 className="font-semibold text-[#4a4a4a]">
            {format(currentYear, 'yyyy年', { locale: zhCN })}
          </h2>
          <button
            onClick={() => setCurrentYear(addYears(currentYear, 1))}
            className="w-8 h-8 rounded-full bg-[#f5f1ed] flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-[#4a4a4a]" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">{months}</div>
      </div>
    );
  };

  // 一生视图（生命格子）
  const renderLifeView = () => {
    const birthYear = 1990; // 可以从用户设置中获取
    const currentAge = differenceInYears(new Date(), new Date(birthYear, 0, 1));
    const lifeExpectancy = 90; // 预期寿命

    const years = [];
    for (let i = 0; i < lifeExpectancy; i++) {
      const isPast = i < currentAge;
      const isCurrent = i === currentAge;

      years.push(
        <div
          key={i}
          className={`aspect-square rounded-[4px] ${
            isPast ? 'bg-[#88a096]' : isCurrent ? 'bg-gradient-to-br from-[#d4726f] to-[#e9b893]' : 'bg-[#e8e4e0]'
          }`}
          title={`${birthYear + i}年`}
        />
      );
    }

    return (
      <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
        <div className="mb-5">
          <h2 className="font-semibold text-[#4a4a4a] mb-2">生命格子</h2>
          <p className="text-xs text-[#8b8680]">每一个格子代表一年，已度过的时光用深色标记</p>
        </div>

        <div className="grid grid-cols-10 gap-1.5 mb-4">{years}</div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-[4px] bg-[#88a096]" />
            <span className="text-[#8b8680]">已度过</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-[4px] bg-gradient-to-br from-[#d4726f] to-[#e9b893]" />
            <span className="text-[#8b8680]">当前年份</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-[4px] bg-[#e8e4e0]" />
            <span className="text-[#8b8680]">未来</span>
          </div>
        </div>
      </div>
    );
  };

  const selectedDateTodos = getTodosForDate(selectedDate);

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      {/* 顶部栏 */}
      <div className="bg-white/95 backdrop-blur-lg" style={{boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)'}}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold text-[#4a4a4a] mb-4">日历</h1>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="day" className="text-xs">日</TabsTrigger>
              <TabsTrigger value="week" className="text-xs">周</TabsTrigger>
              <TabsTrigger value="month" className="text-xs">月</TabsTrigger>
              <TabsTrigger value="year" className="text-xs">年</TabsTrigger>
              <TabsTrigger value="life" className="text-xs">一生</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-5 space-y-5">
        {/* 视图内容 */}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'year' && renderYearView()}
        {viewMode === 'life' && renderLifeView()}
        {viewMode === 'day' && <Link to="/day"><div className="text-center text-[#8b8680] py-8">点击查看日视图详情</div></Link>}
        {viewMode === 'week' && <div className="text-center text-[#8b8680] py-8">周视图开发中...</div>}

        {/* 选中日期的任务 */}
        {(viewMode === 'month' || viewMode === 'day') && (
          <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
            <h3 className="font-semibold text-[#4a4a4a] mb-4">
              {format(selectedDate, 'MM月dd日', { locale: zhCN })} 的任务
            </h3>

            {selectedDateTodos.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="当天无任务"
                description="这一天没有安排任务"
              />
            ) : (
              <div className="space-y-3">
                {selectedDateTodos.map((todo) => (
                  <div key={todo.id} className="flex items-start gap-3 p-3 rounded-[16px] bg-[#f5f1ed]">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo.id, todo.completed)}
                      className="mt-1 rounded-full"
                    />

                    <Link to={`/todos/${todo.id}`} className="flex-1">
                      <h4 className={`font-medium mb-1 ${todo.completed ? 'line-through text-[#8b8680]' : 'text-[#4a4a4a]'}`}>
                        {todo.title}
                      </h4>
                      {todo.endTime && (
                        <p className="text-xs text-[#8b8680]">
                          {format(parseISO(todo.endTime), 'HH:mm', { locale: zhCN })}
                        </p>
                      )}
                      {todo.category && (
                        <Badge variant="secondary" className="text-xs mt-2 rounded-full">
                          {todo.category}
                        </Badge>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}