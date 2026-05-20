import { Link, useParams } from 'react-router';
import { Edit, Plus, ListTodo, Calendar, Weight, Target as TargetIcon } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Checkbox } from '../components/ui/checkbox';
import { usePlans } from '../hooks/usePlans';
import { useTargets } from '../hooks/useTargets';
import { useTodos } from '../hooks/useTodos';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function PlanDetail() {
  const { id } = useParams();
  const { getPlan } = usePlans();
  const { targets } = useTargets();
  const { todos, updateTodo } = useTodos();

  const plan = id ? getPlan(id) : null;

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <PageHeader title="计划详情" showBack />
        <div className="max-w-screen-xl mx-auto p-4">
          <EmptyState
            icon={ListTodo}
            title="计划不存在"
            description="该计划可能已被删除"
          />
        </div>
      </div>
    );
  }

  const target = plan.targetId ? targets.find(t => t.id === plan.targetId) : null;
  const planTodos = todos.filter(t => t.planId === id);
  const completedTodos = planTodos.filter(t => t.completed).length;
  const progress = planTodos.length > 0 ? (completedTodos / planTodos.length) * 100 : 0;

  const handleToggleComplete = (todoId: string, completed: boolean) => {
    updateTodo(todoId, { completed: !completed });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="计划详情"
        showBack
        rightElement={
          <Link to={`/plans/${id}/edit`}>
            <Button size="sm" variant="ghost">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
        }
      />

      <div className="max-w-screen-xl mx-auto p-4 space-y-4">
        {/* 计划信息 */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-xl font-bold flex-1">{plan.title}</h1>
            <Badge variant={plan.completed ? 'default' : 'outline'}>
              {plan.completed ? '已完成' : '进行中'}
            </Badge>
          </div>

          {plan.desc && (
            <p className="text-gray-600 mb-4">{plan.desc}</p>
          )}

          <div className="space-y-3">
            {target && (
              <div className="flex items-center gap-2 text-sm">
                <TargetIcon className="w-4 h-4 text-[#88a096]" />
                <span className="text-[#88a096]">{target.title}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(plan.beginTime), 'yyyy年MM月dd日', { locale: zhCN })}
                {' 至 '}
                {format(new Date(plan.endTime), 'yyyy年MM月dd日', { locale: zhCN })}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Weight className="w-4 h-4" />
                <span>权重：{plan.weight}</span>
              </div>
              {plan.isRepeat && (
                <Badge variant="secondary">重复计划</Badge>
              )}
            </div>
          </div>

          {planTodos.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>完成进度</span>
                <span>{completedTodos} / {planTodos.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </Card>

        {/* 关联任务 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">关联任务</h2>
            <Link to="/todos/new">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                新建任务
              </Button>
            </Link>
          </div>

          {planTodos.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="暂无关联任务"
              description="为这个计划创建任务来具体执行"
            />
          ) : (
            <div className="space-y-3">
              {planTodos.map((todo) => (
                <Card key={todo.id} className={`p-4 ${todo.completed ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo.id, todo.completed)}
                      className="mt-1"
                    />
                    
                    <Link to={`/todos/${todo.id}`} className="flex-1">
                      <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                        {todo.title}
                      </h3>
                      
                      {todo.desc && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{todo.desc}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {todo.category && (
                          <Badge variant="secondary" className="text-xs">
                            {todo.category}
                          </Badge>
                        )}
                        {todo.endTime && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(todo.endTime), 'MM/dd HH:mm', { locale: zhCN })}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}