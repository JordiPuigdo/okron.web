import React from 'react';
import { useTranslations } from 'app/hooks/useTranslations';

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
  const { t } = useTranslations();
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
        {t('pagination.previous')}
      </button>
      <span className="mr-2 text-center">
        {t('pagination.page')} {currentPage}{' '}
        {currentPage === totalPages || totalPages === 0 ? (
          <></>
        ) : (
          <>{t('pagination.of')} {totalPages}</>
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
        {t('pagination.next')}
      </button>
    </div>
  );
};

export default Pagination;
