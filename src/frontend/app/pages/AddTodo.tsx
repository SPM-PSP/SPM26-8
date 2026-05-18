import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
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
import { useTodos } from '../hooks/useTodos';
import { useTargets } from '../hooks/useTargets';
import { usePlans } from '../hooks/usePlans';
import { Todo } from '../types';
import { Loader2, Mic, Sparkles } from 'lucide-react';
import { isAiConfigured, parseTodoFromText, ParsedTodoDraft } from '../services/ai';
import { todoTimeForInput } from '../utils/typeMapper';
import {
  AiParseResultDialog,
  EditableParseDraft,
} from '../components/ai/AiParseResultDialog';

const CATEGORIES = ['工作', '学习', '生活', '健康', '娱乐', '其他'];

export function AddTodo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTodo, updateTodo, deleteTodo, getTodo } = useTodos();
  const { targets } = useTargets();
  const { plans } = usePlans();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [level, setLevel] = useState<Todo['level']>('not-urgent-important');
  const [category, setCategory] = useState('');
  const [beginTime, setBeginTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [targetId, setTargetId] = useState<string>('none');
  const [planId, setPlanId] = useState<string>('none');
  const [isContinuous, setIsContinuous] = useState(false);
  const [summury, setSummury] = useState('');
  const [completed, setCompleted] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [aiText, setAiText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [parseDialogOpen, setParseDialogOpen] = useState(false);
  const [parseDraft, setParseDraft] = useState<ParsedTodoDraft | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      const todo = getTodo(id);
      if (todo) {
        setTitle(todo.title);
        setDesc(todo.desc);
        setLevel(todo.level);
        setCategory(todo.category);
        setBeginTime(todoTimeForInput(todo.beginTime) || '');
        setEndTime(todoTimeForInput(todo.endTime) || '');
        setTargetId(todo.targetId || 'none');
        setPlanId(todo.planId || 'none');
        setIsContinuous(todo.isContinuous);
        setSummury(todo.summury || '');
        setCompleted(todo.completed);
      }
    }
  }, [id, isEdit, getTodo]);

  const applyParsedDraft = (values: EditableParseDraft) => {
    setTitle(values.title);
    setDesc(values.desc);
    setLevel(values.level);
    if (values.category) setCategory(values.category);
    setEndTime(values.endTime);
    toast.success('已填入表单，可继续编辑后保存');
  };

  const handleAiParse = async () => {
    if (!aiText.trim()) {
      toast.error('请输入要解析的任务描述');
      return;
    }
    setAiParsing(true);
    try {
      const draft = await parseTodoFromText(aiText.trim());
      setParseDraft(draft);
      setParseDialogOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '解析失败');
    } finally {
      setAiParsing(false);
    }
  };

  const handleAiVoice = () => {
    const w = window as Window & {
      webkitSpeechRecognition?: new () => SpeechRecognition;
      SpeechRecognition?: new () => SpeechRecognition;
    };
    const SpeechRecognitionCtor = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!SpeechRecognitionCtor) {
      toast.error('当前浏览器不支持语音输入');
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setAiText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('语音识别失败');
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('请输入任务标题');
      return;
    }

    if (beginTime && endTime && new Date(endTime) < new Date(beginTime)) {
      toast.error('结束时间不能早于开始时间');
      return;
    }

    const todoData = {
      title,
      desc,
      level,
      category,
      beginTime: beginTime || undefined,
      endTime: endTime || undefined,
      targetId: targetId === 'none' ? undefined : targetId,
      planId: planId === 'none' ? undefined : planId,
      isContinuous,
      summury: summury || undefined,
      completed,
    };

    if (isEdit && id) {
      updateTodo(id, todoData);
      toast.success('保存成功');
    } else {
      addTodo(todoData);
      toast.success('任务创建成功');
    }
    navigate('/');
  };

  const handleDelete = () => {
    if (id) {
      deleteTodo(id);
      toast.success('任务已删除');
      navigate('/');
    }
  };

  const renderAiParseSection = () => {
    if (isEdit) return null;

    return (
      <div className="bg-white rounded-[20px] p-5 space-y-4" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4726f]" />
          <span className="text-sm font-medium text-[#4a4a4a]">AI 智能解析（可选）</span>
          <span className="text-xs text-[#8b8680]">
            {isAiConfigured() ? '已连接' : '演示模式'}
          </span>
        </div>
        <div className="relative">
          <Textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="例如：明天下午三点前完成软件工程报告，比较重要..."
            className="min-h-20 pr-12"
          />
          <button
            type="button"
            onClick={handleAiVoice}
            disabled={isListening}
            className={`absolute right-2 bottom-2 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-[#d4726f] text-white animate-pulse'
                : 'bg-[#f5f1ed] text-[#8b8680] hover:bg-[#e8e4e0]'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
        <Button
          type="button"
          onClick={handleAiParse}
          disabled={aiParsing || !aiText.trim()}
          variant="outline"
          className="w-full border-[#d4726f]/30 text-[#d4726f] hover:bg-[#fef0ef]"
        >
          {aiParsing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              解析中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              智能解析
            </>
          )}
        </Button>
        <p className="text-xs text-[#8b8680]">解析后在弹窗中确认修改，再填入下方表单。</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      <PageHeader
        title={isEdit ? '编辑任务' : '新增任务'}
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
        {renderAiParseSection()}

        <div className="bg-white rounded-[20px] p-5 space-y-6" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}>
          <div>
            <Label htmlFor="title">任务标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="desc">任务说明</Label>
            <Textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="描述任务详情..."
              className="mt-2 min-h-20"
            />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 space-y-6" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}>
          <div>
            <Label>优先级（四象限）</Label>
            <RadioGroup value={level} onValueChange={(v) => setLevel(v as Todo['level'])} className="mt-3 space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent-important" id="urgent-important" />
                <Label htmlFor="urgent-important" className="cursor-pointer">
                  重要且紧急
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent-not-important" id="urgent-not-important" />
                <Label htmlFor="urgent-not-important" className="cursor-pointer">
                  紧急但不重要
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-urgent-important" id="not-urgent-important" />
                <Label htmlFor="not-urgent-important" className="cursor-pointer">
                  重要但不紧急
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-urgent-not-important" id="not-urgent-not-important" />
                <Label htmlFor="not-urgent-not-important" className="cursor-pointer">
                  不重要不紧急
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="category">分类</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 space-y-6" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="beginTime">开始时间</Label>
              <Input
                id="beginTime"
                type="datetime-local"
                value={beginTime}
                onChange={(e) => setBeginTime(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="endTime">结束时间</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="target">所属目标</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="选择目标（可选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无</SelectItem>
                {targets.map((target) => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="plan">所属计划</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="选择计划（可选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-3 border-t">
            <Label htmlFor="isContinuous">持续任务</Label>
            <Switch
              id="isContinuous"
              checked={isContinuous}
              onCheckedChange={setIsContinuous}
            />
          </div>
        </div>

        {isEdit && (
          <div className="bg-white rounded-[20px] p-5 space-y-6" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}>
            <div>
              <Label htmlFor="summury">任务总结</Label>
              <Textarea
                id="summury"
                value={summury}
                onChange={(e) => setSummury(e.target.value)}
                placeholder="总结任务完成情况..."
                className="mt-2 min-h-20"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t">
              <Label htmlFor="completed">标记为已完成</Label>
              <Switch
                id="completed"
                checked={completed}
                onCheckedChange={setCompleted}
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-[#d4726f] to-[#e9b893] hover:opacity-90 text-white"
        >
          保存
        </Button>
      </div>

      <AiParseResultDialog
        open={parseDialogOpen}
        onOpenChange={setParseDialogOpen}
        draft={parseDraft}
        onApply={applyParsedDraft}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后将无法恢复，确定要删除这个任务吗？
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
