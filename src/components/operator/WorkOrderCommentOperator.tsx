import React, { useCallback, useMemo, useState } from 'react';
import { usePermissions } from 'app/hooks/usePermissions';
import { SvgSave } from 'app/icons/designSystem/SvgSave';
import { SvgClose, SvgDelete, SvgDetail, SvgSpinner } from 'app/icons/icons';
import {
  AddCommentToWorkOrderRequest,
  WorkOrderComment,
  WorkOrderCommentType,
} from 'app/interfaces/workOrder';
import WorkOrderService from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import { formatDate, translateWorkOrderCommentType } from 'app/utils/utils';
import { RenderFileComment } from 'components/Comments/RenderFileComment';

interface IWorkOrderCommentOperator {
  workOrderComments: WorkOrderComment[];
  setWorkOrderComments: React.Dispatch<
    React.SetStateAction<WorkOrderComment[]>
  >;
  workOrderId: string;
  isFinished: boolean;
}

interface EditCommentState {
  id: string | null;
  comment: string;
  type: WorkOrderCommentType;
}

const WorkOrderOperatorComments: React.FC<IWorkOrderCommentOperator> = ({
  workOrderComments,
  setWorkOrderComments,
  workOrderId,
  isFinished,
}) => {
  const { isCRM } = usePermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newCommentType, setNewCommentType] = useState<WorkOrderCommentType>(
    WorkOrderCommentType.External
  );
  const [isLoading, setIsLoading] = useState(false);
  const [editComment, setEditComment] = useState<EditCommentState>({
    id: null,
    comment: '',
    type: WorkOrderCommentType.External,
  });
  const [isEditing, setIsEditing] = useState(false);

  const workOrderService = useMemo(
    () => new WorkOrderService(process.env.NEXT_PUBLIC_API_BASE_URL || ''),
    []
  );

  const { operatorLogged } = useSessionStore(state => state);

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = workOrderComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  const paginate = useCallback(
    (pageNumber: number) => setCurrentPage(pageNumber),
    []
  );

  const handleAddComment = async () => {
    try {
      if (operatorLogged?.idOperatorLogged == undefined) {
        alert('Has de fitxar un operari per fer aquesta acció');
        return;
      }
      if (newComment.trim().length === 0) {
        alert('No hi ha cap comentari per afegir');
        return;
      }
      setIsLoading(true);
      const commentToAdd: AddCommentToWorkOrderRequest = {
        comment: newComment,
        operatorId: operatorLogged.idOperatorLogged,
        workOrderId: workOrderId,
        type: newCommentType,
      };

      const wo = await workOrderService.addCommentToWorkOrder(commentToAdd);
      setWorkOrderComments(prevComments => [...prevComments, wo]);
      setNewComment('');
      setNewCommentType(WorkOrderCommentType.External);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = (comment: WorkOrderComment) => {
    setEditComment({
      id: comment.id!,
      comment: comment.comment,
      type: comment.type,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditComment({
      id: null,
      comment: '',
      type: WorkOrderCommentType.External,
    });
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editComment.id || editComment.comment.trim().length === 0) {
        return;
      }

      setIsLoading(true);

      // Primero eliminamos el comentario actual
      await workOrderService.deleteCommentToWorkOrder(
        workOrderId,
        editComment.id
      );

      // Luego creamos el nuevo comentario
      if (operatorLogged?.idOperatorLogged == undefined) {
        alert('Has de fitxar un operari per fer aquesta acció');
        return;
      }

      const commentToAdd: AddCommentToWorkOrderRequest = {
        comment: editComment.comment,
        operatorId: operatorLogged.idOperatorLogged,
        workOrderId: workOrderId,
        type: editComment.type,
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

      handleCancelEdit();
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const success = await workOrderService.deleteCommentToWorkOrder(
        workOrderId,
        commentId
      );
      if (success) {
        setWorkOrderComments(prevComments =>
          prevComments.filter(comment => comment.id !== commentId)
        );
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const renderCommentTypeSelector = (
    value: WorkOrderCommentType,
    onChange: (type: WorkOrderCommentType) => void
  ) => (
    <select
      value={value}
      onChange={e =>
        onChange(e.target.value as unknown as WorkOrderCommentType)
      }
      className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-indigo-500"
      disabled={isFinished}
    >
      <option value={WorkOrderCommentType.External}>
        {translateWorkOrderCommentType(WorkOrderCommentType.External)}
      </option>
      <option value={WorkOrderCommentType.Internal}>
        {translateWorkOrderCommentType(WorkOrderCommentType.Internal)}
      </option>
      <option value={WorkOrderCommentType.NoFinished}>
        {translateWorkOrderCommentType(WorkOrderCommentType.NoFinished)}
      </option>
    </select>
  );

  return (
    <div>
      <div className="py-2 flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <textarea
            disabled={isFinished}
            placeholder="Afegir comentari aquí..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-indigo-500"
            rows={3}
          />
          <div className="flex flex-col gap-2">
            {isCRM &&
              renderCommentTypeSelector(newCommentType, setNewCommentType)}
            <button
              type="button"
              onClick={handleAddComment}
              className={`p-2 flex text-white text-sm rounded-md items-center justify-center ${
                isFinished
                  ? 'bg-gray-500'
                  : 'bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600'
              }`}
              disabled={isFinished || isLoading}
            >
              Afegir Comentari
              {isLoading && <SvgSpinner className="ml-2" />}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="p-2 text-left">Operari</th>
              <th className="p-2 text-left">Comentari</th>
              <th className="p-2 text-left">Data</th>
              {isCRM && <th className="p-2 text-left">Tipus</th>}
              <th className="p-2 text-left">Accions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {currentComments.map((comment, index) => (
              <React.Fragment key={comment.id || index}>
                {editComment.id === comment.id && isEditing ? (
                  // Modo edición
                  <tr className="bg-blue-50 border rounded shadow-sm">
                    <td className="p-3 align-top">{comment.operator.name}</td>
                    <td className="p-3 align-top">
                      <textarea
                        value={editComment.comment}
                        onChange={e =>
                          setEditComment(prev => ({
                            ...prev,
                            comment: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-indigo-500"
                        rows={3}
                      />
                    </td>
                    <td className="p-3 align-top">
                      {formatDate(comment.creationDate)}
                    </td>
                    {isCRM && (
                      <td className="p-3 align-top">
                        {renderCommentTypeSelector(editComment.type, type =>
                          setEditComment(prev => ({ ...prev, type }))
                        )}
                      </td>
                    )}
                    <td className="p-3 align-top space-x-2 flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isLoading}
                        className="bg-green-500 hover:bg-green-600 p-2 text-white rounded-md focus:outline-none"
                      >
                        <SvgSave className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className="bg-gray-500 hover:bg-gray-600 p-2 text-white rounded-md focus:outline-none"
                      >
                        <SvgClose className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  // Modo visualización
                  <>
                    <tr className="bg-white border rounded shadow-sm">
                      <td className="p-3 align-top">{comment.operator.name}</td>
                      <td className="p-3 align-top whitespace-pre-wrap">
                        {comment.comment}
                      </td>
                      <td className="p-3 align-top">
                        {formatDate(comment.creationDate)}
                      </td>
                      {isCRM && (
                        <td className="p-3 align-top">
                          {translateWorkOrderCommentType(comment.type)}
                        </td>
                      )}
                      <td className="p-3 align-top space-x-2 flex gap-2">
                        <button
                          onClick={() =>
                            !isFinished && handleEditComment(comment)
                          }
                          disabled={isLoading || isFinished}
                          className={`${
                            isFinished
                              ? 'bg-gray-400'
                              : 'bg-green-500 hover:bg-green-600 focus:bg-green-600'
                          } p-2 text-white rounded-md focus:outline-none w-full justify-center flex`}
                          title="Editar comentari"
                        >
                          <SvgDetail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            !isFinished && handleDeleteComment(comment.id!)
                          }
                          disabled={isLoading || isFinished}
                          className={`${
                            isFinished
                              ? 'bg-gray-400'
                              : 'bg-red-500 hover:bg-red-600 focus:bg-red-600'
                          } p-2 text-white rounded-md focus:outline-none w-full justify-center flex`}
                          title="Eliminar comentari"
                        >
                          <SvgDelete className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Row para archivos */}
                    {comment.urls?.length > 0 && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50 px-4 py-3">
                          <RenderFileComment comment={comment} />
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        itemsPerPage={commentsPerPage}
        totalItems={workOrderComments.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
};

interface PaginationProps {
  itemsPerPage: number;
  totalItems: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
  itemsPerPage,
  totalItems,
  paginate,
  currentPage,
}) => {
  const pageNumbers = useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalItems, itemsPerPage]);

  if (pageNumbers.length <= 1) return null;

  return (
    <nav className="flex justify-center my-4">
      <ul className="flex">
        {pageNumbers.map(number => (
          <li
            key={number}
            className={`${
              currentPage === number
                ? 'border-teal-500 text-teal-500 bg-teal-50'
                : 'border-gray-300 text-gray-600 hover:bg-teal-500 hover:text-white'
            } border ${number === 1 ? 'rounded-l' : ''} ${
              number === pageNumbers.length ? 'rounded-r' : ''
            } px-3 py-2 cursor-pointer`}
          >
            <button
              type="button"
              onClick={() => paginate(number)}
              className="focus:outline-none"
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default WorkOrderOperatorComments;
