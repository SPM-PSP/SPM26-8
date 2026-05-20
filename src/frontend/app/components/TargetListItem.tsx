import { useNavigate } from 'react-router';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { SwipeToDelete } from './SwipeToDelete';
import type { Target } from '../types';

interface TargetListItemProps {
  target: Target;
  variant: 'compact' | 'card';
  progress: number;
  plansCount: number;
  onDelete: () => void;
}

export function TargetListItem({
  target,
  variant,
  progress,
  plansCount,
  onDelete,
}: TargetListItemProps) {
  const navigate = useNavigate();

  const openDetail = () => {
    navigate(`/targets/${target.id}`);
  };

  const cardShadow = { boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' };

  if (variant === 'compact') {
    return (
      <SwipeToDelete onDelete={onDelete}>
        <button
          type="button"
          className="w-full space-y-2 p-1 text-left"
          onClick={openDetail}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#4a4a4a]">{target.title}</span>
            <span className="text-sm font-medium text-[#d4726f]">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </button>
      </SwipeToDelete>
    );
  }

  return (
    <SwipeToDelete onDelete={onDelete}>
      <button
        type="button"
        className="w-full rounded-[20px] p-5 text-left"
        style={cardShadow}
        onClick={openDetail}
      >
        <div className="mb-3 flex items-start justify-between">
          <h3 className="flex-1 font-medium text-[#4a4a4a]">{target.title}</h3>
          <Badge variant={target.completed ? 'default' : 'outline'} className="rounded-full">
            {target.completed ? '已完成' : '进行中'}
          </Badge>
        </div>

        {target.desc && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[#8b8680]">{target.desc}</p>
        )}

        <div className="mb-3 text-xs text-[#8b8680]">
          <span>{plansCount} 个计划</span>
        </div>

        {plansCount > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-[#8b8680]">
              <span>进度</span>
              <span className="font-medium text-[#d4726f]">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </button>
    </SwipeToDelete>
  );
}
