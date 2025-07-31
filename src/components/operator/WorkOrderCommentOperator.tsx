import React, { useState } from 'react';
import { usePermissions } from 'app/hooks/usePermissions';
import { SvgDelete, SvgSpinner } from 'app/icons/icons';
import {
  AddCommentToWorkOrderRequest,
  WorkOrderComment,
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
  const [isLoading, setIsLoading] = useState(false);
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const { operatorLogged } = useSessionStore(state => state);

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = workOrderComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
      };

      const wo = await workOrderService.addCommentToWorkOrder(commentToAdd);

      setWorkOrderComments(prevComments => [...prevComments, wo]);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setNewComment('');
    setIsLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const x = await workOrderService.deleteCommentToWorkOrder(
        workOrderId,
        commentId
      );
      if (x) {
        setWorkOrderComments(prevComments =>
          prevComments.filter(comment => comment.id !== commentId)
        );
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="py-2 flex flex-row gap-2">
        <textarea
          disabled={isFinished}
          placeholder="Afegir comentari aquí..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={handleAddComment}
          className={`p-2 flex text-white text-sm rounded-md items-center ${
            isFinished
              ? 'bg-gray-500'
              : 'bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600'
          }`}
          disabled={isFinished}
        >
          Afegir Comentari
          {isLoading && <SvgSpinner />}
        </button>
      </div>
      <div className="overflow-x-auto">
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
                <React.Fragment key={index}>
                  {/* Row 1: Info principal */}
                  <tr className="bg-white border rounded shadow-sm">
                    <td className="p-3 align-top">{comment.operator.name}</td>
                    <td className="p-3 align-top">{comment.comment}</td>
                    <td className="p-3 align-top">
                      {formatDate(comment.creationDate)}
                    </td>
                    {isCRM && (
                      <td className="p-3 align-top">
                        {translateWorkOrderCommentType(comment.type)}
                      </td>
                    )}
                    <td className="p-3 align-top">
                      <button
                        onClick={() =>
                          !isFinished && handleDeleteComment(comment.id!)
                        }
                        disabled={isLoading || isFinished}
                        className={`${
                          isFinished
                            ? 'bg-gray-400'
                            : 'bg-red-500 hover:bg-red-600 focus:bg-red-600'
                        } p-2 text-white rounded-md focus:outline-none flex items-center`}
                      >
                        <SvgDelete className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>

                  {/* Row 2: Archivos */}
                  {comment.urls?.length > 0 && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-4 py-3">
                        <RenderFileComment comment={comment} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
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
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center my-4">
      <ul className="flex">
        {pageNumbers.map(number => (
          <li
            key={number}
            className={`${
              currentPage === number ? 'border-teal-500 text-teal-500' : ''
            } hover:bg-teal-500 hover:text-white border border-gray-300 ${
              number === 1 ? 'rounded-l' : ''
            } ${number === pageNumbers.length ? 'rounded-r' : ''} px-3 py-2`}
          >
            <button type="button" onClick={() => paginate(number)}>
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default WorkOrderOperatorComments;
