'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import {
  SparePartDetailRequest,
  SparePartPerAssetResponse,
} from 'app/interfaces/SparePart';
import SparePartService from 'app/services/sparePartService';
import { formatDateQuery } from 'app/utils/utils';
import ca from 'date-fns/locale/ca';

export default function SimpleDataTable({
  title,
  sparePartId,
  assetId,
  sparePartsPerAsset,
  searchPlaceHolder,
}: {
  title: string;
  sparePartId?: string;
  assetId?: string;
  sparePartsPerAsset?: SparePartPerAssetResponse[];
  searchPlaceHolder: string;
}) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 15);

  const [startDate, setStartDate] = useState<Date | null>(currentDate);
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const [sparePerMachine, setSparePartPerMachine] = useState<
    SparePartPerAssetResponse[] | null
  >(sparePartsPerAsset != null ? sparePartsPerAsset : []);

  const sparePartService = new SparePartService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sparePerMachine?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(sparePerMachine!.length / itemsPerPage);

  async function filterSpareParts() {
    const x: SparePartDetailRequest = {
      id: sparePartId,
      assetId: assetId,
      startDate: formatDateQuery(startDate!, true),
      endDate: formatDateQuery(endDate!, false),
    };
    const sparePartDetailResponse =
      await sparePartService.getSparePartHistoryByDates(x);
    setSparePartPerMachine(sparePartDetailResponse);
  }

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const filteredSpareParts = sparePerMachine;

  const handlePaginationClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white rounded-lg p-2 my-4">
      <div className="mb-4 text-white text-lg font-semibold">{title}</div>
      <div className="flex items-center space-x-4 pb-4">
        <span className="text-white pr-3">Data Inici:</span>
        <DatePicker
          id="startDate"
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
          locale={ca}
          className="p-3 border border-gray-300 rounded-md text-lg bg-white text-gray-900"
        />
        <span className="text-white pr-3">Data Fi:</span>
        <DatePicker
          id="endDate"
          selected={endDate}
          onChange={(date: Date) => setEndDate(date)}
          dateFormat="dd/MM/yyyy"
          locale={ca}
          className="p-3 border border-gray-300 rounded-md text-lg bg-white text-gray-900"
        />
        <button
          type="button"
          onClick={filterSpareParts}
          className="bg-blue-500 text-white ml-4 px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 "
        >
          Filtrar per dates
        </button>
        <input
          type="text"
          placeholder={searchPlaceHolder}
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-3 border border-gray-300 rounded-md text-lg bg-white text-gray-900"
        />
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Equip
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Unitats
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Dia
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Operari
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Detall Ordre
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr className="bg-gray-100">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900 font-semibold">
                Total Unitats Consumides
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePaginationClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="mr-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50"
        >
          Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePaginationClick(page)}
            className={`mr-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 ${
              currentPage === page ? 'bg-blue-600' : ''
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next page button */}
        <button
          onClick={() => handlePaginationClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50"
        >
          Següent
        </button>
      </div>
    </div>
  );
}
