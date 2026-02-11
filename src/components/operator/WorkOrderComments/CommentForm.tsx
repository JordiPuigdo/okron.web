import React, { useState } from 'react';
import { usePermissions } from 'app/hooks/usePermissions';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { WorkOrderCommentType } from 'app/interfaces/workOrder';

import { CommentTypeSelector } from './CommentTypeSelector';

interface CommentFormProps {
  onSubmit: (
    comment: string,
    type: WorkOrderCommentType
  ) => Promise<unknown>;
  isFinished: boolean;
  isLoading: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  isFinished,
  isLoading,
}) => {
  const { t } = useTranslations();
  const { isCRM } = usePermissions();
  const [newComment, setNewComment] = useState('');
  const [newCommentType, setNewCommentType] = useState<WorkOrderCommentType>(
    WorkOrderCommentType.External
  );

  const handleSubmit = async () => {
    const result = await onSubmit(newComment, newCommentType);
    if (result) {
      setNewComment('');
      setNewCommentType(WorkOrderCommentType.External);
    }
  };

  return (
    <div className="py-2 flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <textarea
          disabled={isFinished}
          placeholder={t('comment.placeholder')}
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-indigo-500"
          rows={3}
        />
        <div className="flex flex-col gap-2">
          {isCRM && (
            <CommentTypeSelector
              value={newCommentType}
              onChange={setNewCommentType}
              disabled={isFinished}
            />
          )}
          <button
            type="button"
            onClick={handleSubmit}
            className={`p-2 flex text-white text-sm rounded-md items-center justify-center ${
              isFinished
                ? 'bg-gray-500'
                : 'bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600'
            }`}
            disabled={isFinished || isLoading}
          >
            {t('add.comment')}
            {isLoading && <SvgSpinner className="ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
};
