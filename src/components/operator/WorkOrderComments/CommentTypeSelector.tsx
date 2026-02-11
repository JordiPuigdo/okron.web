import React from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { WorkOrderCommentType } from 'app/interfaces/workOrder';
import { translateWorkOrderCommentType } from 'app/utils/utils';

interface CommentTypeSelectorProps {
  value: WorkOrderCommentType;
  onChange: (type: WorkOrderCommentType) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'modal';
}

export const CommentTypeSelector: React.FC<CommentTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  variant = 'default',
}) => {
  const { t } = useTranslations();

  const baseStyles =
    variant === 'modal'
      ? 'w-full border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer'
      : 'border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-indigo-500';

  return (
    <select
      value={value}
      onChange={e =>
        onChange(e.target.value as unknown as WorkOrderCommentType)
      }
      className={`${baseStyles} ${className}`}
      disabled={disabled}
    >
      <option value={WorkOrderCommentType.External}>
        {translateWorkOrderCommentType(WorkOrderCommentType.External, t)}
      </option>
      <option value={WorkOrderCommentType.Internal}>
        {translateWorkOrderCommentType(WorkOrderCommentType.Internal, t)}
      </option>
      <option value={WorkOrderCommentType.NoFinished}>
        {translateWorkOrderCommentType(WorkOrderCommentType.NoFinished, t)}
      </option>
    </select>
  );
};
