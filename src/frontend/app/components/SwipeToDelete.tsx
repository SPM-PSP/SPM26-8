import { useRef, useState, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

const DELETE_WIDTH = 72;

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  className?: string;
}

export function SwipeToDelete({ children, onDelete, className = '' }: SwipeToDeleteProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const moved = useRef(false);

  const snap = (x: number) => (x < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    moved.current = false;
    startX.current = e.clientX - offset;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const x = e.clientX - startX.current;
    if (Math.abs(x - offset) > 4) moved.current = true;
    setOffset(Math.max(-DELETE_WIDTH, Math.min(0, x)));
  };

  const onPointerUp = () => {
    setOffset((prev) => snap(prev));
  };

  return (
    <div className={`relative overflow-hidden rounded-[20px] ${className}`}>
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-[#d4726f] text-white"
        style={{ width: DELETE_WIDTH }}
      >
        <button
          type="button"
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            setOffset(0);
          }}
        >
          <Trash2 className="h-4 w-4" />
          删除
        </button>
      </div>
      <div
        className="relative touch-pan-y bg-white"
        style={{
          transform: `translateX(${offset}px)`,
          transition: offset === 0 || offset === -DELETE_WIDTH ? 'transform 0.2s ease' : 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          if (moved.current) {
            e.preventDefault();
            e.stopPropagation();
            moved.current = false;
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
