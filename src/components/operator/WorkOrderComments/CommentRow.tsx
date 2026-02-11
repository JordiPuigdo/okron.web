import React from 'react';
import { usePermissions } from 'app/hooks/usePermissions';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgDelete, SvgDetail } from 'app/icons/icons';
import { WorkOrderComment } from 'app/interfaces/workOrder';
import { formatDate, translateWorkOrderCommentType } from 'app/utils/utils';
import { RenderFileComment } from 'components/Comments/RenderFileComment';

interface CommentRowProps {
  comment: WorkOrderComment;
  onEdit: (comment: WorkOrderComment) => void;
  onDelete: (id: string) => void;
  isFinished: boolean;
  isLoading: boolean;
}

export const CommentRow: React.FC<CommentRowProps> = ({
  comment,
  onEdit,
  onDelete,
  isFinished,
  isLoading,
}) => {
  const { t } = useTranslations();
  const { isCRM } = usePermissions();

  return (
    <>
      <tr className="bg-white border rounded shadow-sm">
        <td className="p-3 align-top">{comment.operator.name}</td>
        <td className="p-3 align-top whitespace-pre-wrap">
          {comment.comment}
        </td>
        <td className="p-3 align-top">{formatDate(comment.creationDate)}</td>
        {isCRM && (
          <td className="p-3 align-top">
            {translateWorkOrderCommentType(comment.type, t)}
          </td>
        )}
        <td className="p-3 align-top space-x-2 flex gap-2">
          <button
            onClick={() => !isFinished && onEdit(comment)}
            disabled={isLoading || isFinished}
            className={`${
              isFinished
                ? 'bg-gray-400'
                : 'bg-green-500 hover:bg-green-600 focus:bg-green-600'
            } p-2 text-white rounded-md focus:outline-none w-full justify-center flex`}
            title={t('edit.comment')}
          >
            <SvgDetail className="w-4 h-4" />
          </button>
          <button
            onClick={() => !isFinished && onDelete(comment.id!)}
            disabled={isLoading || isFinished}
            className={`${
              isFinished
                ? 'bg-gray-400'
                : 'bg-red-500 hover:bg-red-600 focus:bg-red-600'
            } p-2 text-white rounded-md focus:outline-none w-full justify-center flex`}
            title={t('delete.comment')}
          >
            <SvgDelete className="w-4 h-4" />
          </button>
        </td>
      </tr>

      {/* Row para archivos */}
      {comment.urls?.length > 0 && (
        <tr>
          <td colSpan={isCRM ? 5 : 4} className="bg-gray-50 px-4 py-3">
            <RenderFileComment comment={comment} />
          </td>
        </tr>
      )}
    </>
  );
};
