import { useState, useRef } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { streamEfficiencyDiagnosis, AiContext, isAiConfigured } from '../../services/ai';

interface AiEfficiencyCardProps {
  context: AiContext;
}

export function AiEfficiencyCard({ context }: AiEfficiencyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      abortRef.current?.abort();
      return;
    }
    setExpanded(true);
    setText('');
    setStreaming(true);
    abortRef.current = new AbortController();
    try {
      await streamEfficiencyDiagnosis(context, (chunk) => {
        setText((prev) => prev + chunk);
      }, abortRef.current.signal);
    } catch (e) {
      if (!abortRef.current?.signal.aborted) {
        const hint = !isAiConfigured()
          ? '未检测到 API Key：请配置 app/config/ai.config.ts 或 .env.local 中的 VITE_AI_API_KEY，并重启 npm run dev。'
          : e instanceof Error
            ? e.message
            : '诊断生成失败，请稍后重试。';
        setText((prev) => prev || hint);
      }
    } finally {
      setStreaming(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExpand}
      className="w-full text-left rounded-[20px] overflow-hidden transition-all"
      style={{ boxShadow: '0 4px 24px rgba(136, 160, 150, 0.25)' }}
    >
      <div
        className="relative p-5 bg-gradient-to-br from-[#667eea] via-[#88a096] to-[#d4726f] text-white"
        style={{
          backgroundSize: '200% 200%',
          animation: expanded ? 'none' : 'shimmer 8s ease infinite',
        }}
      >
        <style>{`
          @keyframes shimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-lg">AI 效率诊断</span>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 opacity-80" />
          ) : (
            <ChevronDown className="w-5 h-5 opacity-80" />
          )}
        </div>
        <p className="relative text-sm opacity-90 mt-1">
          {expanded ? '点击收起' : '点击展开，流式查看本周时间点评'}
        </p>

        {expanded && (
          <div className="relative mt-4 p-4 rounded-[16px] bg-black/15 backdrop-blur-sm min-h-[120px]">
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {text}
              {streaming && (
                <span className="inline-block w-2 h-4 ml-0.5 bg-white/80 animate-pulse align-middle" />
              )}
            </p>
            {streaming && !text && (
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在生成诊断书...
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
