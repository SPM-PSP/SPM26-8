import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import {
  isAiConfigured,
  nextTargetWizardTurn,
  TargetDraft,
  TargetWizardChatMessage,
  TargetWizardQuestion,
  SuggestedTargetTodo,
} from '../../services/ai';
import { expandSuggestedTodos } from '../../utils/targetTodoScheduler';

export interface TargetWizardResult {
  target: TargetDraft;
  todos: SuggestedTargetTodo[];
}

interface AiTargetWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (result: TargetWizardResult) => void | Promise<void>;
  applying?: boolean;
}

export function AiTargetWizardDialog({
  open,
  onOpenChange,
  onApply,
  applying = false,
}: AiTargetWizardDialogProps) {
  const [messages, setMessages] = useState<TargetWizardChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<TargetWizardQuestion | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [reviewDraft, setReviewDraft] = useState<TargetDraft | null>(null);
  const [suggestedTodos, setSuggestedTodos] = useState<SuggestedTargetTodo[]>([]);
  const [todoTemplates, setTodoTemplates] = useState<SuggestedTargetTodo[]>([]);
  const [selectedTodoIds, setSelectedTodoIds] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'chat' | 'review'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setMessages([]);
    setInput('');
    setLoading(false);
    setCurrentQuestion(null);
    setSelectedOptions([]);
    setReviewDraft(null);
    setSuggestedTodos([]);
    setTodoTemplates([]);
    setSelectedTodoIds(new Set());
    setPhase('chat');
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, phase]);

  useEffect(() => {
    if (phase !== 'review' || !reviewDraft || todoTemplates.length === 0) return;
    const expanded = expandSuggestedTodos(reviewDraft, todoTemplates, reviewDraft.desc);
    setSuggestedTodos(expanded);
    setSelectedTodoIds(new Set(expanded.map((t) => t.id)));
  }, [reviewDraft?.beginTime, reviewDraft?.endTime, phase, todoTemplates, reviewDraft?.desc]);

  const runTurn = async (
    userText: string,
    optionLabels: string[],
    nextMessages: TargetWizardChatMessage[]
  ) => {
    setLoading(true);
    setCurrentQuestion(null);
    setSelectedOptions([]);
    try {
      const turn = await nextTargetWizardTurn(
        nextMessages.filter((m) => m.role === 'user' || m.role === 'assistant'),
        userText,
        optionLabels
      );

      const assistantMsg: TargetWizardChatMessage = {
        role: 'assistant',
        content: turn.message,
      };
      setMessages([...nextMessages, assistantMsg]);

      if (turn.status === 'ready' && turn.draft) {
        setReviewDraft(turn.draft);
        const templates = turn.todoTemplates || turn.suggestedTodos || [];
        setTodoTemplates(templates);
        const todos = turn.suggestedTodos || [];
        setSuggestedTodos(todos);
        setSelectedTodoIds(new Set(todos.map((t) => t.id)));
        setPhase('review');
      } else if (turn.question) {
        setCurrentQuestion(turn.question);
        setPhase('chat');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '对话失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSendText = async () => {
    const text = input.trim();
    if (!text && selectedOptions.length === 0) return;
    if (loading) return;

    const display =
      text + (selectedOptions.length ? `（已选：${selectedOptions.join('、')}）` : '');
    const userMsg: TargetWizardChatMessage = { role: 'user', content: display || text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    const labels = [...selectedOptions];
    await runTurn(text, labels, nextMessages);
  };

  const handleSubmitOptions = async () => {
    if (!currentQuestion) return;
    if (currentQuestion.type === 'multi' && selectedOptions.length === 0) {
      toast.error('请至少选择一项');
      return;
    }
    if (currentQuestion.type === 'single' && selectedOptions.length === 0) {
      toast.error('请选择一项');
      return;
    }
    const label =
      currentQuestion.type === 'single'
        ? selectedOptions[0]
        : selectedOptions.join('、');
    const userMsg: TargetWizardChatMessage = {
      role: 'user',
      content: label,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    await runTurn('', selectedOptions, nextMessages);
  };

  const toggleOption = (label: string, type: TargetWizardQuestion['type']) => {
    if (type === 'single') {
      setSelectedOptions([label]);
      return;
    }
    setSelectedOptions((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleApply = async () => {
    if (!reviewDraft?.title.trim()) {
      toast.error('请填写目标标题');
      return;
    }
    const todos = suggestedTodos.filter((t) => selectedTodoIds.has(t.id));
    await onApply({
      target: { ...reviewDraft, title: reviewDraft.title.trim() },
      todos,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[24px] border-0 p-0 gap-0 overflow-hidden max-w-lg max-h-[92vh] flex flex-col bg-[#f8f8f6]">
        <DialogHeader className="p-5 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-[#4a4a4a]">
            <Sparkles className="w-5 h-5 text-[#d4726f]" />
            AI 目标规划助手
          </DialogTitle>
          <DialogDescription className="text-[#8b8680] text-xs leading-relaxed">
            多轮对话补全目标细节 · {isAiConfigured() ? 'AI 已连接' : '演示模式'}
            <br />
            目标 → 计划 → 任务：长期方向可拆成计划与每日任务，可选同步到任务栏
          </DialogDescription>
        </DialogHeader>

        {phase === 'chat' && (
          <>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-2 space-y-3 min-h-[200px] max-h-[40vh]"
            >
              {messages.length === 0 && (
                <p className="text-sm text-[#8b8680] bg-white/80 rounded-[12px] p-3">
                  例如：我想计划一个月的健身目标，从 140 瘦到 125…
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-sm rounded-[14px] px-3 py-2 max-w-[90%] whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'ml-auto bg-gradient-to-r from-[#d4726f] to-[#e9b893] text-white'
                      : 'bg-white text-[#4a4a4a] shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-[#8b8680]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  思考中…
                </div>
              )}
            </div>

            {currentQuestion?.type === 'text' && !loading && (
              <div className="px-5 pb-2">
                <p className="text-xs text-[#8b8680] mb-1">{currentQuestion.label}</p>
              </div>
            )}

            {currentQuestion &&
              (currentQuestion.type === 'single' || currentQuestion.type === 'multi') &&
              !loading && (
                <div className="px-5 pb-2 flex flex-wrap gap-2">
                  {currentQuestion.options?.map((opt) => {
                    const active = selectedOptions.includes(opt.label);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleOption(opt.label, currentQuestion.type)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                          active
                            ? 'bg-[#88a096] text-white border-[#88a096]'
                            : 'bg-white text-[#4a4a4a] border-[#e8e4e0]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSubmitOptions}
                    className="rounded-full bg-[#d4726f] text-white"
                  >
                    确认选择
                  </Button>
                </div>
              )}

            <div className="p-5 pt-2 shrink-0 flex gap-2 border-t border-[#e8e4e0]/80">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText();
                  }
                }}
                placeholder={
                  currentQuestion?.placeholder || '描述你的目标或回答问题…'
                }
                disabled={loading}
                className="flex-1 bg-white"
              />
              <Button
                type="button"
                onClick={handleSendText}
                disabled={loading || (!input.trim() && selectedOptions.length === 0)}
                className="shrink-0 bg-gradient-to-r from-[#d4726f] to-[#e9b893] text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {phase === 'review' && reviewDraft && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
            <div className="bg-white rounded-[16px] p-4 space-y-3 shadow-sm">
              <div>
                <Label htmlFor="wiz-title">目标标题 *</Label>
                <Input
                  id="wiz-title"
                  value={reviewDraft.title}
                  onChange={(e) =>
                    setReviewDraft((d) => d && { ...d, title: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="wiz-desc">目标描述</Label>
                <Textarea
                  id="wiz-desc"
                  value={reviewDraft.desc}
                  onChange={(e) =>
                    setReviewDraft((d) => d && { ...d, desc: e.target.value })
                  }
                  className="mt-1 min-h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="wiz-begin">开始</Label>
                  <Input
                    id="wiz-begin"
                    type="date"
                    value={reviewDraft.beginTime}
                    onChange={(e) =>
                      setReviewDraft((d) => d && { ...d, beginTime: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="wiz-end">结束</Label>
                  <Input
                    id="wiz-end"
                    type="date"
                    value={reviewDraft.endTime}
                    onChange={(e) =>
                      setReviewDraft((d) => d && { ...d, endTime: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <Label>权重</Label>
                  <span className="text-[#8b8680]">{reviewDraft.weight}</span>
                </div>
                <Slider
                  value={[reviewDraft.weight]}
                  onValueChange={([v]) =>
                    setReviewDraft((d) => d && { ...d, weight: v })
                  }
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>

            {suggestedTodos.length > 0 && (
              <div className="bg-white rounded-[16px] p-4 shadow-sm space-y-3">
                <p className="text-sm font-medium text-[#4a4a4a]">建议同步到任务栏</p>
                <p className="text-xs text-[#8b8680]">
                  已按目标周期与每周频次展开为 {suggestedTodos.length} 条任务（修改起止日期会自动重排）
                </p>
                {suggestedTodos.map((todo) => (
                  <label
                    key={todo.id}
                    className="flex items-start gap-3 p-2 rounded-[12px] hover:bg-[#f5f1ed] cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedTodoIds.has(todo.id)}
                      onCheckedChange={(checked) => {
                        setSelectedTodoIds((prev) => {
                          const next = new Set(prev);
                          if (checked) next.add(todo.id);
                          else next.delete(todo.id);
                          return next;
                        });
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#4a4a4a]">{todo.title}</p>
                      {todo.desc && (
                        <p className="text-xs text-[#8b8680] mt-0.5">{todo.desc}</p>
                      )}
                      {todo.endTime && (
                        <p className="text-xs text-[#88a096] mt-0.5">
                          截止：{todo.endTime.replace('T', ' ')}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                onClick={handleApply}
                disabled={applying}
                className="w-full rounded-full bg-gradient-to-r from-[#88a096] to-[#7a9188] text-white"
              >
                {applying ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                确认并创建目标与任务
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-[#8b8680]"
                onClick={() => setPhase('chat')}
              >
                返回继续对话
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
