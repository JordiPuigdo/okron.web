import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  onPageChange,
}) => {
  return (
    <div className="flex justify-end gap-4 mr-4 items-center text-sm">
      <button
        onClick={() => {
          onPageChange(currentPage - 1);
        }}
        disabled={currentPage === 1}
        className={` p-2 text-white rounded-xl  ${
          currentPage === 1
            ? 'bg-okron-btnDisable text-gray-700'
            : 'bg-okron-btnPagination  hover:bg-okron-btnPaginationHover'
        } `}
      >
        Anterior
      </button>
      <span className="mr-2 text-center">
        Pàgina {currentPage}{' '}
        {currentPage === totalPages || totalPages === 0 ? (
          <></>
        ) : (
          <>de {totalPages}</>
        )}
      </span>
      <button
        onClick={() => {
          onPageChange(currentPage + 1);
        }}
        disabled={!hasNextPage}
        className={` p-2 text-white rounded-xl ${
          currentPage === totalPages || totalPages === 0
            ? 'bg-okron-btnDisable text-gray-700'
            : 'bg-okron-btnPagination  hover:bg-okron-btnPaginationHover'
        } `}
      >
        Següent
      </button>
    </div>
  );
};

export default Pagination;
