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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
import { usePlans } from '../hooks/usePlans';
import { useTargets } from '../hooks/useTargets';
import { format } from 'date-fns';

export function AddPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addPlan, updatePlan, deletePlan, getPlan } = usePlans();
  const { targets } = useTargets();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [targetId, setTargetId] = useState<string>('');
  const [beginTime, setBeginTime] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState(3);
  const [isRepeat, setIsRepeat] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const plan = getPlan(id);
      if (plan) {
        setTitle(plan.title);
        setDesc(plan.desc);
        setTargetId(plan.targetId || '');
        setBeginTime(plan.beginTime);
        setEndTime(plan.endTime);
        setWeight(plan.weight);
        setIsRepeat(plan.isRepeat);
        setCompleted(plan.completed);
      }
    }
  }, [id, isEdit, getPlan]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('请输入计划标题');
      return;
    }

    if (new Date(endTime) < new Date(beginTime)) {
      toast.error('结束时间不能早于开始时间');
      return;
    }

    const planData = {
      title,
      desc,
      targetId: targetId || undefined,
      beginTime,
      endTime,
      weight,
      isRepeat,
      completed,
    };

    if (isEdit && id) {
      updatePlan(id, planData);
      toast.success('保存成功');
    } else {
      addPlan(planData);
      toast.success('计划创建成功');
    }
    navigate('/plans');
  };

  const handleDelete = () => {
    if (id) {
      deletePlan(id);
      toast.success('计划已删除');
      navigate('/plans');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title={isEdit ? '编辑计划' : '新增计划'}
        showBack
        rightElement={
          isEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              删除
            </Button>
          )
        }
      />

      <div className="max-w-screen-xl mx-auto p-4">
        <div className="bg-white rounded-lg p-4 space-y-6">
          <div>
            <Label htmlFor="title">计划标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入计划标题"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="desc">计划描述</Label>
            <Textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="描述你的计划..."
              className="mt-2 min-h-24"
            />
          </div>

          <div>
            <Label htmlFor="target">所属目标</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="选择目标（可选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">无</SelectItem>
                {targets.map((target) => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="flex items-center justify-between py-3 border-t">
            <Label htmlFor="isRepeat">重复计划</Label>
            <Switch
              id="isRepeat"
              checked={isRepeat}
              onCheckedChange={setIsRepeat}
            />
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
            className="w-full bg-gradient-to-r from-[#88a096] to-[#b8a89d] hover:opacity-90 text-white"
          >
            保存
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后将无法恢复，确定要删除这个计划吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-gradient-to-r from-[#d4726f] to-[#e9b893] hover:opacity-90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}