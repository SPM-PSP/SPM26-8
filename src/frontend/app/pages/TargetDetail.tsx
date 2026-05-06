import { Link, useParams, useNavigate } from 'react-router';
import { Edit, Plus, Target as TargetIcon, Calendar, Weight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useTargets } from '../hooks/useTargets';
import { usePlans } from '../hooks/usePlans';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function TargetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTarget } = useTargets();
  const { plans } = usePlans();

  const target = id ? getTarget(id) : null;

  if (!target) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <PageHeader title="目标详情" showBack />
        <div className="max-w-screen-xl mx-auto p-4">
          <EmptyState
            icon={TargetIcon}
            title="目标不存在"
            description="该目标可能已被删除"
          />
        </div>
      </div>
    );
  }

  const targetPlans = plans.filter(p => p.targetId === id);
  const completedPlans = targetPlans.filter(p => p.completed).length;
  const progress = targetPlans.length > 0 ? (completedPlans / targetPlans.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="目标详情"
        showBack
        rightElement={
          <Link to={`/targets/${id}/edit`}>
            <Button size="sm" variant="ghost">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
        }
      />

      <div className="max-w-screen-xl mx-auto p-4 space-y-4">
        {/* 目标信息 */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-xl font-bold flex-1">{target.title}</h1>
            <Badge variant={target.completed ? 'default' : 'outline'}>
              {target.completed ? '已完成' : '进行中'}
            </Badge>
          </div>

          {target.desc && (
            <p className="text-gray-600 mb-4">{target.desc}</p>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(target.beginTime), 'yyyy年MM月dd日', { locale: zhCN })}
                {' 至 '}
                {format(new Date(target.endTime), 'yyyy年MM月dd日', { locale: zhCN })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Weight className="w-4 h-4" />
              <span>权重：{target.weight}</span>
            </div>
          </div>

          {targetPlans.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>完成进度</span>
                <span>{completedPlans} / {targetPlans.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </Card>

        {/* 关联计划 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">关联计划</h2>
            <Link to="/plans/new">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                新建计划
              </Button>
            </Link>
          </div>

          {targetPlans.length === 0 ? (
            <EmptyState
              icon={TargetIcon}
              title="暂无关联计划"
              description="为这个目标创建计划来分解任务"
            />
          ) : (
            <div className="space-y-3">
              {targetPlans.map((plan) => (
                <Link key={plan.id} to={`/plans/${plan.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium flex-1">{plan.title}</h3>
                      <Badge variant={plan.completed ? 'default' : 'outline'}>
                        {plan.completed ? '已完成' : '进行中'}
                      </Badge>
                    </div>

                    {plan.desc && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{plan.desc}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(plan.beginTime), 'MM/dd', { locale: zhCN })}</span>
                        <span>-</span>
                        <span>{format(new Date(plan.endTime), 'MM/dd', { locale: zhCN })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Weight className="w-3 h-3" />
                        <span>权重 {plan.weight}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}