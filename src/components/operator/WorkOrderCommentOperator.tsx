import React, { useState } from "react";
import { SvgDelete, SvgSpinner } from "app/icons/icons";
import {
  AddCommentToWorkOrderRequest,
  WorkOrderComment,
} from "app/interfaces/workOrder";
import WorkOrderService from "app/services/workOrderService";
import { useSessionStore } from "app/stores/globalStore";
import { formatDate } from "app/utils/utils";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ""
  );
  const { operatorLogged } = useSessionStore((state) => state);

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
        alert("Has de fitxar un operari per fer aquesta acció");
        return;
      }
      if (newComment.trim().length === 0) {
        alert("No hi ha cap comentari per afegir");
        return;
      }
      setIsLoading(true);
      const commentToAdd: AddCommentToWorkOrderRequest = {
        comment: newComment,
        operatorId: operatorLogged.idOperatorLogged,
        workOrderId: workOrderId,
      };

      const wo = await workOrderService.addCommentToWorkOrder(commentToAdd);

      setWorkOrderComments((prevComments) => [...prevComments, wo]);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
    setNewComment("");
    setIsLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const x = await workOrderService.deleteCommentToWorkOrder(
        workOrderId,
        commentId
      );
      if (x) {
        setWorkOrderComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId)
        );
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
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
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={handleAddComment}
          className={`p-2 flex text-white text-sm rounded-md items-center ${
            isFinished
              ? "bg-gray-500"
              : "bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
          }`}
          disabled={isFinished}
        >
          Afegir Comentari
          {isLoading && <SvgSpinner />}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Operari
              </th>
              <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase w-full tracking-wider">
                Comentari
              </th>
              <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase w-full tracking-wider">
                Data
              </th>
              <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {currentComments.slice(0).map((comment, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-2 text-left whitespace-nowrap">
                  {comment.operator.name}
                </td>
                <td className="p-2  text-left">{comment.comment}</td>
                <td className="p-2  text-left">
                  {formatDate(comment.creationDate)}
                </td>
                <td className="p-2 text-left">
                  <button
                    onClick={() =>
                      !isFinished && handleDeleteComment(comment.id!)
                    }
                    type="button"
                    className={`${
                      isFinished
                        ? "bg-gray-500"
                        : "bg-red-500 hover:bg-red-600 focus:bg-red-600"
                    } p-2 text-white rounded-md focus:outline-none  flex items-center`}
                    disabled={isLoading || isFinished}
                  >
                    <SvgDelete className="w-6 h-6" />
                  </button>
                </td>
              </tr>
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
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center my-4">
      <ul className="flex">
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`${
              currentPage === number ? "border-teal-500 text-teal-500" : ""
            } hover:bg-teal-500 hover:text-white border border-gray-300 ${
              number === 1 ? "rounded-l" : ""
            } ${number === pageNumbers.length ? "rounded-r" : ""} px-3 py-2`}
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
