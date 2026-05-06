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
import { Keyboard, Clipboard, Mic, Sparkles } from 'lucide-react';

const CATEGORIES = ['工作', '学习', '生活', '健康', '娱乐', '其他'];

type InputMethod = 'form' | 'clipboard' | 'voice';

export function AddTodo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTodo, updateTodo, deleteTodo, getTodo } = useTodos();
  const { targets } = useTargets();
  const { plans } = usePlans();
  const isEdit = !!id;

  const [inputMethod, setInputMethod] = useState<InputMethod>('form');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [level, setLevel] = useState<Todo['level']>('not-urgent-important');
  const [category, setCategory] = useState('');
  const [beginTime, setBeginTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [targetId, setTargetId] = useState<string>('none'); // 修复默认值
  const [planId, setPlanId] = useState<string>('none'); // 修复默认值
  const [isContinuous, setIsContinuous] = useState(false);
  const [summury, setSummury] = useState('');
  const [completed, setCompleted] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 语音识别相关
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // 剪贴板内容
  const [clipboardText, setClipboardText] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      const todo = getTodo(id);
      if (todo) {
        setTitle(todo.title);
        setDesc(todo.desc);
        setLevel(todo.level);
        setCategory(todo.category);
        setBeginTime(todo.beginTime || '');
        setEndTime(todo.endTime || '');
        setTargetId(todo.targetId || 'none'); // 修复
        setPlanId(todo.planId || 'none'); // 修复
        setIsContinuous(todo.isContinuous);
        setSummury(todo.summury || '');
        setCompleted(todo.completed);
      }
    }
  }, [id, isEdit, getTodo]);

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
      targetId: targetId === 'none' ? undefined : targetId, // 修复
      planId: planId === 'none' ? undefined : planId, // 修复
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

  // 读取剪贴板
  const handleReadClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardText(text);
      // 智能解析剪贴板内容
      parseClipboardContent(text);
      toast.success('已读取剪贴板内容');
    } catch (err) {
      toast.error('无法读取剪贴板，请检查权限');
    }
  };

  // 智能解析剪贴板内容
  const parseClipboardContent = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      setTitle(lines[0].trim());
      if (lines.length > 1) {
        setDesc(lines.slice(1).join('\n').trim());
      }
    }
  };

  // 语音识别
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('您的浏览器不支持语音识别');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('请说话...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      setTitle(transcript);
      setIsListening(false);
      toast.success('语音识别成功');
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      toast.error('语音识别失败: ' + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // 渲染输入方式选择
  const renderInputMethodSelector = () => {
    if (isEdit) return null;

    const methods = [
      {
        id: 'form' as InputMethod,
        icon: Keyboard,
        label: '表单填写',
        gradient: 'from-[#d4726f] to-[#e9b893]',
      },
      {
        id: 'clipboard' as InputMethod,
        icon: Clipboard,
        label: '剪贴板',
        gradient: 'from-[#88a096] to-[#b8a89d]',
      },
      {
        id: 'voice' as InputMethod,
        icon: Mic,
        label: '语音输入',
        gradient: 'from-[#e9b893] to-[#d4c5b9]',
      },
    ];

    return (
      <div className="bg-white rounded-[20px] p-4" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#d4726f]" />
          <span className="text-sm font-medium text-[#4a4a4a]">智能输入</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {methods.map((method) => {
            const Icon = method.icon;
            const isActive = inputMethod === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setInputMethod(method.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-[16px] transition-all ${
                  isActive
                    ? `bg-gradient-to-br ${method.gradient} text-white shadow-lg`
                    : 'bg-[#f5f1ed] text-[#8b8680]'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{method.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染剪贴板输入界面
  const renderClipboardInput = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-[20px] p-5" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}>
        <Button
          onClick={handleReadClipboard}
          className="w-full bg-gradient-to-r from-[#88a096] to-[#b8a89d] hover:opacity-90 text-white"
        >
          <Clipboard className="w-4 h-4 mr-2" />
          读取剪贴板
        </Button>
        
        {clipboardText && (
          <div className="mt-4 p-4 bg-[#f5f1ed] rounded-[12px]">
            <p className="text-xs text-[#8b8680] mb-2">已读取内容：</p>
            <p className="text-sm text-[#4a4a4a] whitespace-pre-wrap">{clipboardText}</p>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染语音输入界面
  const renderVoiceInput = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-[20px] p-5" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}>
        <Button
          onClick={handleVoiceInput}
          disabled={isListening}
          className={`w-full ${
            isListening
              ? 'bg-gradient-to-r from-[#d4726f] to-[#e9b893] animate-pulse'
              : 'bg-gradient-to-r from-[#e9b893] to-[#d4c5b9]'
          } hover:opacity-90 text-white`}
        >
          <Mic className="w-4 h-4 mr-2" />
          {isListening ? '正在监听...' : '开始语音输入'}
        </Button>

        {voiceTranscript && (
          <div className="mt-4 p-4 bg-[#f5f1ed] rounded-[12px]">
            <p className="text-xs text-[#8b8680] mb-2">识别结果：</p>
            <p className="text-sm text-[#4a4a4a]">{voiceTranscript}</p>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染表单输入界面
  const renderFormInput = () => (
    <>
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
              {/* 👇 这里修复了！不再是空字符串 */}
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
              {/* 👇 这里修复了！不再是空字符串 */}
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
    </>
  );

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
        {/* 智能输入方式选择 */}
        {renderInputMethodSelector()}

        {/* 根据输入方式渲染不同界面 */}
        {!isEdit && inputMethod === 'clipboard' && renderClipboardInput()}
        {!isEdit && inputMethod === 'voice' && renderVoiceInput()}
        
        {/* 表单输入 - 在所有模式下都显示，用于完善信息 */}
        {(isEdit || inputMethod === 'form' || title) && renderFormInput()}

        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-[#d4726f] to-[#e9b893] hover:opacity-90 text-white"
        >
          保存
        </Button>
      </div>

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