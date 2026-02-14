'use client';

import { ArticleType } from 'app/interfaces/Article';
import { Layers, Package } from 'lucide-react';

interface ArticleTypeIndicatorProps {
  type: ArticleType;
  t: (key: string) => string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ArticleTypeIndicator({
  type,
  t,
  showLabel = true,
  size = 'md',
}: ArticleTypeIndicatorProps) {
  const isComponent = type === ArticleType.Component;
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const paddingClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-medium ${paddingClasses[size]} ${
        isComponent
          ? 'bg-blue-100 text-blue-700'
          : 'bg-purple-100 text-purple-700'
      }`}
    >
      {isComponent ? (
        <Package className={sizeClasses[size]} />
      ) : (
        <Layers className={sizeClasses[size]} />
      )}
      {showLabel && (
        <span className={textSizeClasses[size]}>
          {isComponent ? t('article') : t('bill.of.materials')}
        </span>
      )}
    </div>
  );
}
