import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, ListTodo, Calendar, Target as TargetIcon, Repeat } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { usePlans } from '../hooks/usePlans';
import { useTargets } from '../hooks/useTargets';
import { FilterStatus } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

export function PlanList() {
  const { user } = useAuth();
  const { plans, userId } = usePlans();
  const { targets } = useTargets();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filteredPlans = plans.filter(plan => {
    if (filter === 'active') return !plan.completed;
    if (filter === 'completed') return plan.completed;
    return true;
  });

  const getTargetName = (targetId?: string) => {
    if (!targetId) return null;
    const target = targets.find(t => t.id === targetId);
    return target?.title;
  };

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      {/* 顶部栏 */}
      <div className="bg-white/95 backdrop-blur-lg" style={{boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)'}}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-semibold text-[#4a4a4a]">计划</h1>
            <Link to="/plans/new">
              <button className="w-8 h-8 bg-gradient-to-br from-[#88a096] to-[#b8a89d] rounded-full flex items-center justify-center text-white">
                <Plus className="w-5 h-5" />
              </button>
            </Link>
          </div>
          <p className="text-xs text-[#8b8680] mb-4">
            {user?.nickname || userId} · 共 {plans.length} 条（user_id={userId}）
          </p>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="active">进行中</TabsTrigger>
              <TabsTrigger value="completed">已完成</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-5">
        {filteredPlans.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title={filter === 'all' ? '暂无计划' : filter === 'active' ? '暂无进行中的计划' : '暂无已完成的计划'}
            description="创建计划，分解你的目标"
          />
        ) : (
          <div className="space-y-3">
            {filteredPlans.map((plan) => {
              const targetName = getTargetName(plan.targetId);

              return (
                <Link key={plan.id} to={`/plans/${plan.id}`}>
                  <div
                    className="bg-white rounded-[20px] p-5"
                    style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium flex-1 text-[#4a4a4a]">{plan.title}</h3>
                      <Badge variant={plan.completed ? 'default' : 'outline'} className="rounded-full">
                        {plan.completed ? '已完成' : '进行中'}
                      </Badge>
                    </div>

                    {plan.desc && (
                      <p className="text-sm text-[#8b8680] mb-3 line-clamp-2 leading-relaxed">{plan.desc}</p>
                    )}

                    {targetName && (
                      <div className="flex items-center gap-1 text-xs text-[#88a096] mb-2">
                        <TargetIcon className="w-3 h-3" />
                        <span>{targetName}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-[#8b8680]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(plan.beginTime), 'MM/dd', { locale: zhCN })}</span>
                        <span>-</span>
                        <span>{format(new Date(plan.endTime), 'MM/dd', { locale: zhCN })}</span>
                      </div>
                      {plan.isRepeat && (
                        <div className="flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          <span>重复</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}