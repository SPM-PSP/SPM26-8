import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
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
import { useTargetActions } from '../hooks/useTargetActions';
import { format } from 'date-fns';
import { Sparkles, Info } from 'lucide-react';
import { isAiConfigured } from '../services/ai';
import {
  AiTargetWizardDialog,
  TargetWizardResult,
} from '../components/ai/AiTargetWizardDialog';

export function AddTarget() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTarget, updateTarget, getTarget } = useTargets();
  const { addTodos } = useTodos();
  const { removeTargetCascade, getTodosByTarget, getPlansByTarget } = useTargetActions();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [beginTime, setBeginTime] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState(3);
  const [completed, setCompleted] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardApplying, setWizardApplying] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const target = getTarget(id);
      if (target) {
        setTitle(target.title);
        setDesc(target.desc);
        setBeginTime(target.beginTime);
        setEndTime(target.endTime);
        setWeight(target.weight);
        setCompleted(target.completed);
      }
    }
  }, [id, isEdit, getTarget]);

  const handleWizardApply = async (result: TargetWizardResult) => {
    setWizardApplying(true);
    try {
      const created = await addTarget({
        title: result.target.title,
        desc: result.target.desc,
        beginTime: result.target.beginTime,
        endTime: result.target.endTime,
        weight: result.target.weight,
        completed: false,
      });

      if (result.todos.length > 0) {
        await addTodos(
          result.todos.map((todo) => ({
            title: todo.title,
            desc: todo.desc || '',
            level: todo.level,
            category: todo.category,
            completed: false,
            targetId: created.id,
            isContinuous: false,
            beginTime: todo.beginTime,
            endTime: todo.endTime,
          })),
        );
        toast.success(`已创建目标，并添加 ${result.todos.length} 条任务到任务栏`);
      } else {
        toast.success('目标已创建');
      }
      navigate('/targets');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '创建失败');
      throw e;
    } finally {
      setWizardApplying(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('请输入目标标题');
      return;
    }

    if (new Date(endTime) < new Date(beginTime)) {
      toast.error('结束时间不能早于开始时间');
      return;
    }

    const payload = {
      title,
      desc,
      beginTime,
      endTime,
      weight,
      completed,
    };

    if (isEdit && id) {
      updateTarget(id, payload);
      toast.success('保存成功');
      navigate('/targets');
      return;
    }

    await addTarget(payload);
    toast.success('目标创建成功');
    navigate('/targets');
  };

  const handleDelete = async () => {
    if (!id) return;
    await removeTargetCascade(id);
    toast.success('目标已删除');
    navigate('/targets');
  };

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      <PageHeader
        title={isEdit ? '编辑目标' : '新增目标'}
        showBack
        rightElement={
          isEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-[#d4726f]"
            >
              删除
            </Button>
          )
        }
      />

      <div className="max-w-screen-xl mx-auto p-4 space-y-4">
        {!isEdit && (
          <div
            className="bg-[#f0f5f3] rounded-[16px] p-4 flex gap-3 text-sm text-[#4a4a4a]"
            style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}
          >
            <Info className="w-5 h-5 text-[#88a096] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">目标、计划、任务的关系</p>
              <p className="text-[#8b8680] text-xs leading-relaxed">
                <strong>目标</strong>是长期方向（如一周塑形）；
                <strong>任务</strong>是每次具体训练。使用 AI 规划助手可在确认后一次性创建目标与多条任务。
              </p>
            </div>
          </div>
        )}

        {!isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setWizardOpen(true)}
            className="w-full rounded-[16px] border-[#d4726f]/30 text-[#d4726f] hover:bg-[#fef0ef] h-12"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI 目标规划助手
            <span className="ml-2 text-xs text-[#8b8680]">
              {isAiConfigured() ? '' : '（演示）'}
            </span>
          </Button>
        )}

        <div
          className="bg-white rounded-[20px] p-5 space-y-6"
          style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}
        >
          <div>
            <Label htmlFor="title">目标标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入目标标题"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="desc">目标描述</Label>
            <Textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="描述你的目标..."
              className="mt-2 min-h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="beginTime">开始时间</Label>
              <Input
                id="beginTime"
                type="date"
                value={beginTime}
                onChange={(e) => setBeginTime(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="endTime">结束时间</Label>
              <Input
                id="endTime"
                type="date"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>权重</Label>
              <span className="text-sm text-gray-600">{weight}</span>
            </div>
            <Slider
              value={[weight]}
              onValueChange={([value]) => setWeight(value)}
              min={1}
              max={5}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>低</span>
              <span>高</span>
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between py-3 border-t">
              <Label htmlFor="completed">标记为已完成</Label>
              <Switch
                id="completed"
                checked={completed}
                onCheckedChange={setCompleted}
              />
            </div>
          )}

          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-[#d4726f] to-[#e9b893] hover:opacity-90 text-white"
          >
            保存
          </Button>
        </div>
      </div>

      <AiTargetWizardDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onApply={handleWizardApply}
        applying={wizardApplying}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后将无法恢复。
              {id &&
              (getPlansByTarget(id).length > 0 || getTodosByTarget(id).length > 0)
                ? ` 将同时删除 ${getPlansByTarget(id).length} 个关联计划、${getTodosByTarget(id).length} 条关联任务。`
                : ' 确定要删除这个目标吗？'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-[#d4726f] to-[#e9b893] hover:opacity-90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
