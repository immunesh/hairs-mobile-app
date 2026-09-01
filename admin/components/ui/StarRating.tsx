'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export default function StarRating({
  rating, count, size = 'md', interactive = false, onRate, className,
}: StarRatingProps) {
  const sizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const textMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  const starSize = sizeMap[size];
  const textSize = textMap[size];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={() => interactive && onRate && onRate(star)}
            className={cn('transition-transform', interactive && 'hover:scale-125 cursor-pointer')}
            disabled={!interactive}
          >
            <Star
              className={cn(
                starSize,
                'transition-colors',
                star <= Math.round(rating) ? 'star-filled' : 'star-empty'
              )}
            />
          </button>
        ))}
      </div>
      {count !== undefined && (
        <span className={cn(textSize, 'text-gray-500')}>
          {rating.toFixed(1)} ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
