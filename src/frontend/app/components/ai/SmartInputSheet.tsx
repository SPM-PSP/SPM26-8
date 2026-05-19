import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Loader2, Calendar, Flame, Tag, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { parseTodoFromText, ParsedTodoDraft, isAiConfigured } from '../../services/ai';
import { Todo } from '../../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const LEVEL_LABELS: Record<Todo['level'], string> = {
  'urgent-important': '重要紧急',
  'urgent-not-important': '紧急不重要',
  'not-urgent-important': '重要不紧急',
  'not-urgent-not-important': '不重要不紧急',
};

interface SmartInputSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (draft: ParsedTodoDraft) => void;
}

export function SmartInputSheet({ open, onOpenChange, onConfirm }: SmartInputSheetProps) {
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [draft, setDraft] = useState<ParsedTodoDraft | null>(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setText('');
      setDraft(null);
      setParsing(false);
    }
  }, [open]);

  const handleParse = async () => {
    if (!text.trim()) {
      toast.error('请输入或说出任务内容');
      return;
    }
    setParsing(true);
    setDraft(null);
    try {
      const result = await parseTodoFromText(text.trim());
      setDraft(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '解析失败');
    } finally {
      setParsing(false);
    }
  };

  const handleVoice = () => {
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
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('语音识别失败');
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleConfirm = () => {
    if (!draft) return;
    onConfirm(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[24px] border-0 p-0 gap-0 overflow-hidden max-w-md bg-[#f8f8f6]/95 backdrop-blur-xl shadow-2xl">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#8b8680] text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#d4726f]" />
            <span>灵动输入 · {isAiConfigured() ? 'AI 已连接' : '演示模式（配置 API Key 启用完整 AI）'}</span>
          </div>

          <div className="relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setDraft(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleParse();
                }
              }}
              placeholder="像 Spotlight 一样输入：明天下午三点交软件工程报告..."
              rows={3}
              className="w-full resize-none rounded-[16px] border-0 bg-white px-4 py-3.5 text-[#4a4a4a] placeholder:text-[#b8a89d] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#d4726f]/30 text-base leading-relaxed"
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <button
                type="button"
                onClick={handleVoice}
                disabled={isListening}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-[#d4726f] text-white animate-pulse'
                    : 'bg-[#f5f1ed] text-[#8b8680] hover:bg-[#e8e4e0]'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleParse}
            disabled={parsing || !text.trim()}
            className="w-full rounded-full bg-gradient-to-r from-[#d4726f] to-[#e9b893] text-white hover:opacity-90"
          >
            {parsing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI 解析中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                智能解析
              </>
            )}
          </Button>

          {draft && (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-3">
              <div className="bg-white rounded-[16px] p-4 shadow-sm border border-[#e8e4e0]/60">
                <p className="font-medium text-[#4a4a4a] mb-3">{draft.title}</p>
                {draft.desc && (
                  <p className="text-sm text-[#8b8680] mb-3 line-clamp-2">{draft.desc}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {draft.endTime && (
                    <span className="inline-flex items-center gap-1 text-xs bg-[#f5f1ed] text-[#4a4a4a] px-2.5 py-1 rounded-full">
                      <Calendar className="w-3 h-3 text-[#88a096]" />
                      截止：{format(new Date(draft.endTime), 'M月d日 HH:mm', { locale: zhCN })}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs bg-[#fef0ef] text-[#d4726f] px-2.5 py-1 rounded-full">
                    <Flame className="w-3 h-3" />
                    优先级：{draft.priorityLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-[#f0f5f3] text-[#88a096] px-2.5 py-1 rounded-full">
                    <Tag className="w-3 h-3" />
                    {draft.category} · {LEVEL_LABELS[draft.level]}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleConfirm}
                className="w-full rounded-full bg-[#88a096] hover:bg-[#7a9188] text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                确认并加入任务列表
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
