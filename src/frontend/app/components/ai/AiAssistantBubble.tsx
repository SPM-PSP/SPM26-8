import { useState } from 'react';
import { Bot, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import {
  analyzeProactiveContext,
  getProactiveAiReply,
  ProactiveInsight,
} from '../../services/ai';
import { Todo } from '../../types';

interface AiAssistantBubbleProps {
  todos: Todo[];
}

export function AiAssistantBubble({ todos }: AiAssistantBubbleProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState('');
  const insight: ProactiveInsight = analyzeProactiveContext(todos);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setReply('');
    try {
      const text = await getProactiveAiReply(insight, todos);
      setReply(text);
    } catch {
      setReply(insight.detail ? `${insight.message}。${insight.detail}` : insight.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`fixed right-5 bottom-24 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 bg-gradient-to-br from-[#88a096] to-[#d4726f] text-white ${
          insight.hasAlert ? 'ring-2 ring-[#d4726f] ring-offset-2' : ''
        }`}
        aria-label="AI 助手"
      >
        <Bot className="w-7 h-7" />
        {insight.hasAlert && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#d4726f] rounded-full border-2 border-white" />
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[20px] max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#4a4a4a]">
              <Bot className="w-5 h-5 text-[#88a096]" />
              AI 助手建议
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-medium text-[#d4726f] mb-2">{insight.message}</p>
            {loading ? (
              <div className="flex items-center gap-2 text-[#8b8680] text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在生成建议...
              </div>
            ) : (
              <p className="text-sm text-[#4a4a4a] leading-relaxed whitespace-pre-wrap">{reply}</p>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4 mr-1" />
            知道了
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
