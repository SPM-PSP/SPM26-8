import { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { breakdownTodo } from '../../services/ai';
import { Todo } from '../../types';

interface TodoBreakdownPanelProps {
  todo: Todo;
  expanded: boolean;
  onToggle: () => void;
  onAdopt: (subtasks: string[]) => void;
}

export function TodoBreakdownPanel({ todo, expanded, onToggle, onAdopt }: TodoBreakdownPanelProps) {
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const handleWandClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!expanded && !loaded) {
      onToggle();
      setLoading(true);
      try {
        const items = await breakdownTodo(todo.title, todo.desc);
        setSubtasks(items);
        setSelected(new Set(items.map((_, i) => i)));
        setLoaded(true);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '拆解失败');
        onToggle();
      } finally {
        setLoading(false);
      }
    } else {
      onToggle();
    }
  };

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAdopt = () => {
    const picked = subtasks.filter((_, i) => selected.has(i));
    if (picked.length === 0) {
      toast.error('请至少选择一个子任务');
      return;
    }
    onAdopt(picked);
    toast.success(`已采纳 ${picked.length} 个子任务`);
    onToggle();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleWandClick}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#e9b893]/30 to-[#d4726f]/20 flex items-center justify-center text-[#d4726f] hover:scale-110 transition-transform"
        aria-label="AI 拆解"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="w-full basis-full mt-2 pt-3 border-t border-[#f5f1ed] animate-in slide-in-from-top-2 duration-200">
          {loading ? (
            <p className="text-xs text-[#8b8680] flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              AI 正在拆解任务...
            </p>
          ) : subtasks.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-[#8b8680] mb-2">AI 建议的子步骤（可勾选后一键采纳）</p>
              {subtasks.map((task, i) => (
                <label
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-[12px] bg-[#f8f8f6] cursor-pointer hover:bg-[#f5f1ed]"
                >
                  <Checkbox
                    checked={selected.has(i)}
                    onCheckedChange={() => toggleSelect(i)}
                    className="mt-0.5 rounded"
                  />
                  <span className="text-sm text-[#4a4a4a] leading-relaxed">{task}</span>
                </label>
              ))}
              <Button
                size="sm"
                onClick={handleAdopt}
                className="w-full mt-2 rounded-full bg-[#88a096] hover:bg-[#7a9188] text-white"
              >
                <Check className="w-3 h-3 mr-1" />
                采纳为子任务备注
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
