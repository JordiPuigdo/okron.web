import { useCallback,useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import {
  AddCommentToWorkOrderRequest,
  WorkOrderComment,
  WorkOrderCommentType,
} from 'app/interfaces/workOrder';
import { workOrderService } from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';

export interface EditCommentState {
  id: string | null;
  comment: string;
  type: WorkOrderCommentType;
  urls: string[];
}

interface UseWorkOrderCommentsReturn {
  isLoading: boolean;
  addComment: (
    comment: string,
    type: WorkOrderCommentType
  ) => Promise<WorkOrderComment | null>;
  updateComment: (editComment: EditCommentState) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
}

export const useWorkOrderComments = (
  workOrderId: string,
  setWorkOrderComments: React.Dispatch<
    React.SetStateAction<WorkOrderComment[]>
  >
): UseWorkOrderCommentsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { operatorLogged } = useSessionStore(state => state);
  const { t } = useTranslations();

  const addComment = useCallback(
    async (
      comment: string,
      type: WorkOrderCommentType
    ): Promise<WorkOrderComment | null> => {
      try {
        if (operatorLogged?.idOperatorLogged == undefined) {
          alert(t('error.operator.required.action'));
          return null;
        }
        if (comment.trim().length === 0) {
          alert(t('error.no.comment.to.add'));
          return null;
        }

        setIsLoading(true);
        const commentToAdd: AddCommentToWorkOrderRequest = {
          comment,
          operatorId: operatorLogged.idOperatorLogged,
          workOrderId,
          type,
        };

        const newComment = await workOrderService.addCommentToWorkOrder(
          commentToAdd
        );
        setWorkOrderComments(prevComments => [...prevComments, newComment]);
        return newComment;
      } catch (error) {
        console.error('Error adding comment:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [workOrderId, operatorLogged, setWorkOrderComments, t]
  );

  const updateComment = useCallback(
    async (editComment: EditCommentState): Promise<boolean> => {
      try {
        if (!editComment.id || editComment.comment.trim().length === 0) {
          return false;
        }
        if (operatorLogged?.idOperatorLogged == undefined) {
          alert(t('error.operator.required.action'));
          return false;
        }

        setIsLoading(true);

        // Primero eliminamos el comentario actual
        await workOrderService.deleteCommentToWorkOrder(
          workOrderId,
          editComment.id
        );

        const commentToAdd: AddCommentToWorkOrderRequest = {
          comment: editComment.comment,
          operatorId: operatorLogged.idOperatorLogged,
          workOrderId,
          type: editComment.type,
          urls: editComment.urls,
        };

        const updatedComment = await workOrderService.addCommentToWorkOrder(
          commentToAdd
        );

        // Actualizamos la lista de comentarios
        setWorkOrderComments(prevComments =>
          prevComments.map(comment =>
            comment.id === editComment.id ? updatedComment : comment
          )
        );

        return true;
      } catch (error) {
        console.error('Error updating comment:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [workOrderId, operatorLogged, setWorkOrderComments, t]
  );

  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const success = await workOrderService.deleteCommentToWorkOrder(
          workOrderId,
          commentId
        );
        if (success) {
          setWorkOrderComments(prevComments =>
            prevComments.filter(comment => comment.id !== commentId)
          );
        }
        return success;
      } catch (error) {
        console.error('Error deleting comment:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [workOrderId, setWorkOrderComments]
  );

  return {
    isLoading,
    addComment,
    updateComment,
    deleteComment,
  };
};
