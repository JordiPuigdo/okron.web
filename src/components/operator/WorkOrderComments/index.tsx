import React, { useCallback, useState } from 'react';
import { WorkOrderComment } from 'app/interfaces/workOrder';

import { CommentEditModal } from './CommentEditModal';
import { CommentForm } from './CommentForm';
import { CommentsList } from './CommentsList';
import {
  EditCommentState,
  useWorkOrderComments,
} from './hooks/useWorkOrderComments';
import { Pagination } from './Pagination';

interface WorkOrderCommentsProps {
  workOrderComments: WorkOrderComment[];
  setWorkOrderComments: React.Dispatch<
    React.SetStateAction<WorkOrderComment[]>
  >;
  workOrderId: string;
  isFinished: boolean;
}

const WorkOrderComments: React.FC<WorkOrderCommentsProps> = ({
  workOrderComments,
  setWorkOrderComments,
  workOrderId,
  isFinished,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editComment, setEditComment] = useState<EditCommentState | null>(null);

  const { isLoading, addComment, updateComment, deleteComment } =
    useWorkOrderComments(workOrderId, setWorkOrderComments);

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = workOrderComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  const handleEditComment = useCallback((comment: WorkOrderComment) => {
    setEditComment({
      id: comment.id!,
      comment: comment.comment,
      type: comment.type,
      urls: comment.urls,
    });
    setShowEditModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowEditModal(false);
    setEditComment(null);
  }, []);

  return (
    <div>
      <CommentEditModal
        isOpen={showEditModal}
        comment={editComment}
        onClose={handleCloseModal}
        onSave={updateComment}
        isLoading={isLoading}
      />

      <CommentForm
        onSubmit={addComment}
        isFinished={isFinished}
        isLoading={isLoading}
      />

      <CommentsList
        comments={currentComments}
        onEdit={handleEditComment}
        onDelete={deleteComment}
        isFinished={isFinished}
        isLoading={isLoading}
      />

      <Pagination
        itemsPerPage={commentsPerPage}
        totalItems={workOrderComments.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
};

export default WorkOrderComments;
