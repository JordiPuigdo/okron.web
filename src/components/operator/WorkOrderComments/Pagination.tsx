import React, { useMemo } from 'react';

interface PaginationProps {
  itemsPerPage: number;
  totalItems: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

export const Pagination: React.FC<PaginationProps> = ({
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
