import { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ParsedTodoDraft } from '../../services/ai';
import { Todo } from '../../types';

const CATEGORIES = ['工作', '学习', '生活', '健康', '娱乐', '其他'];

export interface EditableParseDraft {
  title: string;
  desc: string;
  level: Todo['level'];
  category: string;
  endTime: string;
}

function isoToDatetimeLocal(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toEditable(draft: ParsedTodoDraft): EditableParseDraft {
  return {
    title: draft.title,
    desc: draft.desc || '',
    level: draft.level,
    category: draft.category || '',
    endTime: isoToDatetimeLocal(draft.endTime),
  };
}

interface AiParseResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ParsedTodoDraft | null;
  onApply: (values: EditableParseDraft) => void;
}

export function AiParseResultDialog({
  open,
  onOpenChange,
  draft,
  onApply,
}: AiParseResultDialogProps) {
  const [form, setForm] = useState<EditableParseDraft>({
    title: '',
    desc: '',
    level: 'not-urgent-important',
    category: '',
    endTime: '',
  });

  useEffect(() => {
    if (draft && open) {
      setForm(toEditable(draft));
    }
  }, [draft, open]);

  const handleApply = () => {
    if (!form.title.trim()) {
      toast.error('请填写任务标题');
      return;
    }
    onApply({
      ...form,
      title: form.title.trim(),
      desc: form.desc.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[24px] border-0 p-0 gap-0 overflow-hidden max-w-md max-h-[90vh] flex flex-col bg-[#f8f8f6]">
        <DialogHeader className="p-5 pb-0 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-[#4a4a4a]">
            <Sparkles className="w-5 h-5 text-[#d4726f]" />
            解析结果
          </DialogTitle>
          <DialogDescription className="text-[#8b8680]">
            请确认或修改以下内容，再填入下方表单
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <Label htmlFor="ai-parse-title">任务标题 *</Label>
            <Input
              id="ai-parse-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-2 bg-white"
            />
          </div>

          <div>
            <Label htmlFor="ai-parse-desc">任务说明</Label>
            <Textarea
              id="ai-parse-desc"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              className="mt-2 min-h-16 bg-white"
            />
          </div>

          <div>
            <Label>优先级（四象限）</Label>
            <RadioGroup
              value={form.level}
              onValueChange={(v) => setForm((f) => ({ ...f, level: v as Todo['level'] }))}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent-important" id="ai-urgent-important" />
                <Label htmlFor="ai-urgent-important" className="cursor-pointer font-normal">
                  重要且紧急
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent-not-important" id="ai-urgent-not-important" />
                <Label htmlFor="ai-urgent-not-important" className="cursor-pointer font-normal">
                  紧急但不重要
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-urgent-important" id="ai-not-urgent-important" />
                <Label htmlFor="ai-not-urgent-important" className="cursor-pointer font-normal">
                  重要但不紧急
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-urgent-not-important" id="ai-not-urgent-not-important" />
                <Label htmlFor="ai-not-urgent-not-important" className="cursor-pointer font-normal">
                  不重要不紧急
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="ai-parse-category">分类</Label>
            <Select
              value={form.category || undefined}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger id="ai-parse-category" className="mt-2 bg-white">
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

          <div>
            <Label htmlFor="ai-parse-end">截止时间</Label>
            <Input
              id="ai-parse-end"
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              className="mt-2 bg-white"
            />
          </div>
        </div>

        <DialogFooter className="p-5 pt-2 shrink-0 flex-col sm:flex-col gap-2">
          <Button
            type="button"
            onClick={handleApply}
            className="w-full rounded-full bg-gradient-to-r from-[#88a096] to-[#7a9188] hover:opacity-90 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            填入表单
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-[#8b8680]"
          >
            取消
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
