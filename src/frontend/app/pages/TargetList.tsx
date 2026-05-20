import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Target as TargetIcon, TrendingUp } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTargets } from '../hooks/useTargets';
import { useTodos } from '../hooks/useTodos';
import { usePlans } from '../hooks/usePlans';
import { AiAssistantBubble } from '../components/ai/AiAssistantBubble';

type ViewMode = 'list' | 'matrix';

export function TargetList() {
  const { targets } = useTargets();
  const { todos } = useTodos();
  const { plans } = usePlans();
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');

  const getTargetProgress = (targetId: string) => {
    const targetPlans = plans.filter(p => p.targetId === targetId);
    if (targetPlans.length === 0) return 0;
    const completed = targetPlans.filter(p => p.completed).length;
    return (completed / targetPlans.length) * 100;
  };

  // 四象限分类任务
  const quadrantTasks = {
    'urgent-important': todos.filter(t => t.level === 'urgent-important' && !t.completed),
    'urgent-not-important': todos.filter(t => t.level === 'urgent-not-important' && !t.completed),
    'not-urgent-important': todos.filter(t => t.level === 'not-urgent-important' && !t.completed),
    'not-urgent-not-important': todos.filter(t => t.level === 'not-urgent-not-important' && !t.completed),
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

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      {/* 顶部栏 */}
      <div className="bg-white/95 backdrop-blur-lg" style={{boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)'}}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-[#4a4a4a]">目标</h1>
            <Link to="/targets/new">
              <button className="w-8 h-8 bg-gradient-to-br from-[#d4726f] to-[#e9b893] rounded-full flex items-center justify-center text-white">
                <Plus className="w-5 h-5" />
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

      <div className="max-w-screen-xl mx-auto px-6 py-5 space-y-5">
        {viewMode === 'matrix' ? (
          <>
            {/* 目标进度条 */}
            {targets.length > 0 && (
              <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[#d4726f]" />
                  <h2 className="font-semibold text-[#4a4a4a]">目标总进度</h2>
                </div>
                <div className="space-y-3">
                  {targets.slice(0, 3).map((target) => {
                    const progress = getTargetProgress(target.id);
                    return (
                      <Link key={target.id} to={`/targets/${target.id}`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#4a4a4a]">{target.title}</span>
                            <span className="text-sm font-medium text-[#d4726f]">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 四象限矩阵 */}
            <div className="grid grid-cols-2 gap-3">
              {quadrantConfig.map((quadrant, index) => {
                const tasks = quadrantTasks[quadrant.key as keyof typeof quadrantTasks];
                return (
                  <div
                    key={quadrant.key}
                    className={`${quadrant.color} ${quadrant.textColor} rounded-[20px] p-4 min-h-[180px]`}
                    style={{boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'}}
                  >
                    <div className="mb-3">
                      <h3 className="font-semibold mb-1">{quadrant.title}</h3>
                      <p className="text-xs opacity-90">{quadrant.subtitle}</p>
                    </div>

                    <div className="space-y-2">
                      {tasks.length === 0 ? (
                        <p className="text-xs opacity-70">暂无任务</p>
                      ) : (
                        <>
                          {tasks.slice(0, 3).map((task) => (
                            <Link key={task.id} to={`/todos/${task.id}`}>
                              <div className="bg-white/20 backdrop-blur-sm rounded-[12px] px-3 py-2">
                                <p className="text-xs line-clamp-1">{task.title}</p>
                              </div>
                            </Link>
                          ))}
                          {tasks.length > 3 && (
                            <p className="text-xs opacity-70 text-center">+{tasks.length - 3} 更多</p>
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
              <div className="space-y-3">
                {targets.map((target) => {
                  const progress = getTargetProgress(target.id);
                  const targetPlansCount = plans.filter(p => p.targetId === target.id).length;

                  return (
                    <Link key={target.id} to={`/targets/${target.id}`}>
                      <div className="bg-white rounded-[20px] p-5" style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-medium flex-1 text-[#4a4a4a]">{target.title}</h3>
                          <Badge variant={target.completed ? 'default' : 'outline'} className="rounded-full">
                            {target.completed ? '已完成' : '进行中'}
                          </Badge>
                        </div>

                        {target.desc && (
                          <p className="text-sm text-[#8b8680] mb-3 line-clamp-2 leading-relaxed">{target.desc}</p>
                        )}

                        <div className="text-xs text-[#8b8680] mb-3">
                          <span>{targetPlansCount} 个计划</span>
                        </div>

                        {targetPlansCount > 0 && (
                          <div>
                            <div className="flex items-center justify-between text-xs text-[#8b8680] mb-2">
                              <span>进度</span>
                              <span className="text-[#d4726f] font-medium">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <AiAssistantBubble todos={todos} />
    </div>
  );
}