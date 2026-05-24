import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Target as TargetIcon, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useTargets } from '../hooks/useTargets';
import { useTodos } from '../hooks/useTodos';
import { usePlans } from '../hooks/usePlans';
import { useTargetActions } from '../hooks/useTargetActions';
import { AiAssistantBubble } from '../components/ai/AiAssistantBubble';
import { TargetListItem } from '../components/TargetListItem';
import type { Target } from '../types';

type ViewMode = 'list' | 'matrix';

export function TargetList() {
  const { targets } = useTargets();
  const { todos } = useTodos();
  const { plans } = usePlans();
  const { removeTargetCascade, getTodosByTarget, getPlansByTarget } = useTargetActions();
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [pendingDelete, setPendingDelete] = useState<Target | null>(null);

  const getTargetProgress = (targetId: string) => {
    const targetPlans = plans.filter((p) => p.targetId === targetId);
    if (targetPlans.length === 0) return 0;
    const completed = targetPlans.filter((p) => p.completed).length;
    return (completed / targetPlans.length) * 100;
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await removeTargetCascade(pendingDelete.id);
    toast.success('目标已删除');
    setPendingDelete(null);
  };

  const quadrantTasks = {
    'urgent-important': todos.filter((t) => t.level === 'urgent-important' && !t.completed),
    'urgent-not-important': todos.filter((t) => t.level === 'urgent-not-important' && !t.completed),
    'not-urgent-important': todos.filter((t) => t.level === 'not-urgent-important' && !t.completed),
    'not-urgent-not-important': todos.filter(
      (t) => t.level === 'not-urgent-not-important' && !t.completed,
    ),
  };

  const quadrantConfig = [
    {
      key: 'urgent-important',
      title: '重要紧急',
      subtitle: '立即行动',
      color: 'bg-gradient-to-br from-[#d4726f] to-[#e9b893]',
      textColor: 'text-white',
    },
    {
      key: 'not-urgent-important',
      title: '重要不紧急',
      subtitle: '计划安排',
      color: 'bg-gradient-to-br from-[#88a096] to-[#b8a89d]',
      textColor: 'text-white',
    },
    {
      key: 'urgent-not-important',
      title: '紧急不重要',
      subtitle: '授权他人',
      color: 'bg-gradient-to-br from-[#e9b893] to-[#d4c5b9]',
      textColor: 'text-white',
    },
    {
      key: 'not-urgent-not-important',
      title: '不重要不紧急',
      subtitle: '减少投入',
      color: 'bg-gradient-to-br from-[#b8a89d] to-[#9b9ea4]',
      textColor: 'text-white',
    },
  ];

  const deleteDialog = (
    <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingDelete && (
              <>
                确定删除「{pendingDelete.title}」？删除后无法恢复。
                {(() => {
                  const planCount = getPlansByTarget(pendingDelete.id).length;
                  const todoCount = getTodosByTarget(pendingDelete.id).length;
                  if (planCount > 0 || todoCount > 0) {
                    return ` 将同时删除 ${planCount} 个计划、${todoCount} 条任务。`;
                  }
                  return null;
                })()}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-gradient-to-r from-[#d4726f] to-[#e9b893] hover:opacity-90"
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      <div className="bg-white/95 backdrop-blur-lg" style={{ boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)' }}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#4a4a4a]">目标</h1>
            <Link to="/targets/new">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#d4726f] to-[#e9b893] text-white"
              >
                <Plus className="h-5 w-5" />
              </button>
            </Link>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="matrix">四象限</TabsTrigger>
              <TabsTrigger value="list">列表</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto space-y-5 px-6 py-5">
        {viewMode === 'matrix' ? (
          <>
            {targets.length > 0 && (
              <div className="rounded-[20px] bg-white p-5" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}>
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#d4726f]" />
                  <h2 className="font-semibold text-[#4a4a4a]">目标总进度</h2>
                </div>
                <p className="mb-3 text-xs text-[#8b8680]">左滑目标可删除</p>
                <div className="space-y-3">
                  {targets.slice(0, 3).map((target) => (
                    <TargetListItem
                      key={target.id}
                      target={target}
                      variant="compact"
                      progress={getTargetProgress(target.id)}
                      plansCount={plans.filter((p) => p.targetId === target.id).length}
                      onDelete={() => setPendingDelete(target)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {quadrantConfig.map((quadrant) => {
                const tasks = quadrantTasks[quadrant.key as keyof typeof quadrantTasks];
                return (
                  <div
                    key={quadrant.key}
                    className={`${quadrant.color} ${quadrant.textColor} min-h-[180px] rounded-[20px] p-4`}
                    style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}
                  >
                    <div className="mb-3">
                      <h3 className="mb-1 font-semibold">{quadrant.title}</h3>
                      <p className="text-xs opacity-90">{quadrant.subtitle}</p>
                    </div>

                    <div className="space-y-2">
                      {tasks.length === 0 ? (
                        <p className="text-xs opacity-70">暂无任务</p>
                      ) : (
                        <>
                          {tasks.slice(0, 3).map((task) => (
                            <Link key={task.id} to={`/todos/${task.id}`}>
                              <div className="rounded-[12px] bg-white/20 px-3 py-2 backdrop-blur-sm">
                                <p className="line-clamp-1 text-xs">{task.title}</p>
                              </div>
                            </Link>
                          ))}
                          {tasks.length > 3 && (
                            <p className="text-center text-xs opacity-70">+{tasks.length - 3} 更多</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {targets.length === 0 ? (
              <EmptyState
                icon={TargetIcon}
                title="暂无目标"
                description="创建你的第一个目标，开始规划未来"
              />
            ) : (
              <>
                <p className="text-xs text-[#8b8680]">左滑目标可删除</p>
                <div className="space-y-3">
                  {targets.map((target) => (
                    <TargetListItem
                      key={target.id}
                      target={target}
                      variant="card"
                      progress={getTargetProgress(target.id)}
                      plansCount={plans.filter((p) => p.targetId === target.id).length}
                      onDelete={() => setPendingDelete(target)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <AiAssistantBubble todos={todos} />
      {deleteDialog}
    </div>
  );
}
