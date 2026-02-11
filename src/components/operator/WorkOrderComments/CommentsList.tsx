import React from 'react';
import { usePermissions } from 'app/hooks/usePermissions';
import { useTranslations } from 'app/hooks/useTranslations';
import { WorkOrderComment } from 'app/interfaces/workOrder';

import { CommentRow } from './CommentRow';

interface CommentsListProps {
  comments: WorkOrderComment[];
  onEdit: (comment: WorkOrderComment) => void;
  onDelete: (id: string) => void;
  isFinished: boolean;
  isLoading: boolean;
}

export const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  onEdit,
  onDelete,
  isFinished,
  isLoading,
}) => {
  const { t } = useTranslations();
  const { isCRM } = usePermissions();

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
            <th className="p-2 text-left">{t('operator')}</th>
            <th className="p-2 text-left">{t('comment')}</th>
            <th className="p-2 text-left">{t('date')}</th>
            {isCRM && <th className="p-2 text-left">{t('type')}</th>}
            <th className="p-2 text-left">{t('actions')}</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 text-sm">
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id || index}>
              <CommentRow
                comment={comment}
                onEdit={onEdit}
                onDelete={onDelete}
                isFinished={isFinished}
                isLoading={isLoading}
              />
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
