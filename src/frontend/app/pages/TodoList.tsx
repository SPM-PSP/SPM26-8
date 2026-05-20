import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, ListTodo, AlertCircle, Clock, Target as TargetIcon } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { useTodos } from '../hooks/useTodos';
import { useTargets } from '../hooks/useTargets';
import { usePlans } from '../hooks/usePlans';
import { FilterStatus } from '../types';
import { format, differenceInHours, differenceInSeconds } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TodoBreakdownPanel } from '../components/ai/TodoBreakdownPanel';

const LEVEL_CONFIG = {
  'urgent-important': { label: '重要紧急', color: 'bg-[#d4726f]', icon: AlertCircle },
  'urgent-not-important': { label: '紧急不重要', color: 'bg-[#e9b893]', icon: Clock },
  'not-urgent-important': { label: '重要不紧急', color: 'bg-[#88a096]', icon: TargetIcon },
  'not-urgent-not-important': { label: '不重要不紧急', color: 'bg-[#b8a89d]', icon: ListTodo },
};

export function TodoList() {
  const { todos, updateTodo } = useTodos();
  const { targets } = useTargets();
  const { plans } = usePlans();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [breakdownId, setBreakdownId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isWithin24Hours = (endTime: string) => {
    const hoursLeft = differenceInHours(new Date(endTime), now);
    return hoursLeft >= 0 && hoursLeft < 24;
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

  const getTargetName = (targetId?: string) => {
    if (!targetId) return null;
    return targets.find(t => t.id === targetId)?.title;
  };

  const getPlanName = (planId?: string) => {
    if (!planId) return null;
    return plans.find(p => p.id === planId)?.title;
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateTodo(id, { completed: !completed });
  };

  const handleAdoptSubtasks = (todoId: string, subtasks: string[]) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    const block = subtasks.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const newDesc = todo.desc
      ? `${todo.desc}\n\n【AI 子任务】\n${block}`
      : `【AI 子任务】\n${block}`;
    updateTodo(todoId, { desc: newDesc });
  };

  const getCountdown = (endTime: string) => {
    const end = new Date(endTime);
    const totalSeconds = differenceInSeconds(end, now);
    if (totalSeconds < 0) return '已逾期';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isOverdue = (endTime: string) => new Date(endTime) < now;

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      <div className="bg-white/95 backdrop-blur-lg" style={{boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)'}}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold text-[#4a4a4a] mb-4">任务</h1>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { value: 'all', label: '全部' },
              { value: 'active', label: '待办' },
              { value: 'urgent', label: '临期' },
              { value: 'completed', label: '已完成' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value as FilterStatus)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  filter === item.value
                    ? 'bg-gradient-to-r from-[#d4726f] to-[#e9b893] text-white shadow-md'
                    : 'bg-[#f5f1ed] text-[#8b8680]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-5 space-y-5">
        {urgentTodos.length > 0 && filter !== 'completed' && (
          <div className="bg-gradient-to-br from-[#d4726f] to-[#e9b893] rounded-[20px] p-5 text-white" style={{boxShadow: '0 4px 20px rgba(212, 114, 111, 0.2)'}}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5" />
              <h2 className="font-semibold">24小时内到期</h2>
            </div>
            <div className="space-y-2">
              {urgentTodos.slice(0, 3).map((todo) => (
                <Link key={todo.id} to={`/todos/${todo.id}`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-[16px] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{todo.title}</span>
                      <span className="text-xs font-mono bg-white/30 px-2 py-1 rounded-lg">
                        {getCountdown(todo.endTime!)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredTodos.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title={filter === 'all' ? '暂无任务' : filter === 'active' ? '暂无待办任务' : filter === 'urgent' ? '暂无临期任务' : '暂无已完成的任务'}
            description="点击右下角 + 使用灵动输入创建任务"
          />
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo) => {
              const levelConfig = LEVEL_CONFIG[todo.level];
              const targetName = getTargetName(todo.targetId);
              const planName = getPlanName(todo.planId);
              const overdueTask = todo.endTime && isOverdue(todo.endTime) && !todo.completed;
              const urgentTask =
                todo.endTime && !todo.completed && isWithin24Hours(todo.endTime);
              const isBreakdownOpen = breakdownId === todo.id;

              return (
                <div
                  key={todo.id}
                  className={`bg-white rounded-[20px] p-4 transition-all ${todo.completed ? 'opacity-50' : ''}`}
                  style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="mt-1">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleComplete(todo.id, todo.completed)}
                        className="rounded-full w-5 h-5"
                      />
                    </div>

                    <Link to={`/todos/${todo.id}`} className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className={`flex-1 leading-relaxed ${todo.completed ? 'line-through text-[#8b8680]' : 'text-[#4a4a4a]'}`}>
                          {todo.title}
                        </h3>
                        <div className={`w-2 h-2 rounded-full ${levelConfig.color} mt-2 flex-shrink-0`} />
                      </div>
                      {todo.desc && (
                        <p className="text-sm text-[#8b8680] mb-2 line-clamp-2 leading-relaxed">{todo.desc}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {overdueTask && <span className="text-xs text-[#d4726f] font-medium">已逾期</span>}
                        {todo.endTime && (
                          <div className={`flex items-center gap-2 text-xs flex-wrap ${overdueTask ? 'text-[#d4726f]' : 'text-[#8b8680]'}`}>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{format(new Date(todo.endTime), 'MM/dd HH:mm', { locale: zhCN })}</span>
                            </div>
                            {urgentTask && (
                              <span className="font-mono bg-[#fef0ef] text-[#d4726f] px-2 py-0.5 rounded-md tabular-nums">
                                {getCountdown(todo.endTime)}
                              </span>
                            )}
                          </div>
                        )}
                        {targetName && (
                          <Badge variant="outline" className="text-xs text-[#88a096] border-[#88a096] rounded-full">
                            {targetName}
                          </Badge>
                        )}
                        {planName && (
                          <Badge variant="outline" className="text-xs rounded-full">{planName}</Badge>
                        )}
                      </div>
                    </Link>

                    {!todo.completed && (
                      <TodoBreakdownPanel
                        todo={todo}
                        expanded={isBreakdownOpen}
                        onToggle={() => setBreakdownId(isBreakdownOpen ? null : todo.id)}
                        onAdopt={(subtasks) => handleAdoptSubtasks(todo.id, subtasks)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Link
        to="/todos/new"
        className="fixed right-6 bottom-24 w-14 h-14 bg-gradient-to-br from-[#d4726f] to-[#e9b893] rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 z-30"
        style={{boxShadow: '0 4px 20px rgba(212, 114, 111, 0.3)'}}
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
