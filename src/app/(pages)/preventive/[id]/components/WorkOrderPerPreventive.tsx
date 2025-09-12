'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { SvgDetail, SvgSpinner } from 'app/icons/icons';
import { GetWOByPreventiveIdRequest } from 'app/interfaces/Preventive';
import { WorkOrder } from 'app/interfaces/workOrder';
import PreventiveService from 'app/services/preventiveService';
import useRoutes from 'app/utils/useRoutes';
import { formatDate, translateStateWorkOrder } from 'app/utils/utils';
import ca from 'date-fns/locale/ca';
import dayjs from 'dayjs';
import { Button } from 'designSystem/Button/Buttons';

import { useTranslations } from '../../../../hooks/useTranslations';

interface WorkOrderPerPreventiveProps {
  id: string;
  title?: string;
  className?: string;
}

export const WorkOrderPerPreventive = ({
  id,
  title,
  className,
}: WorkOrderPerPreventiveProps) => {
  const preventiveService = new PreventiveService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const { t } = useTranslations();
  const Routes = useRoutes();

  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const currentDate = new Date();
  const fifteenDaysAgo = new Date(currentDate);
  fifteenDaysAgo.setDate(currentDate.getDate() - 15);
  const [startDate, setStartDate] = useState<Date | null>(fifteenDaysAgo);
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const fetchWOByPreventiveId = async (id: string) => {
    const request: GetWOByPreventiveIdRequest = {
      preventiveId: id,
      startTime: startDate!,
      endTime: endDate!,
    };

    await preventiveService
      .getWOByPreventiveId(request)
      .then(workOrders => {
        if (workOrders) {
          setWorkOrders(workOrders);
        }
      })
      .catch(error => {
        console.error(t('error.fetching.workorders'), error);
      });
  };
  const toggleLoading = (id: string) => {
    setIsLoading(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = async () => {
    toggleLoading(id + '_Search');
    await fetchWOByPreventiveId(id);
    toggleLoading(id + '_Search');
  };
  useEffect(() => {
    fetchWOByPreventiveId(id);
  }, [id]);

  const itemsPerPage = 10; // Number of items to display per page
  const [currentPage, setCurrentPage] = useState(1);
  const now = new Date();

  // Calculate pagination range
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWorkOrders = workOrders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="w-full flex flex-col bg-white p-4 rounded-lg shadow-md">
      {title && <p className="text-lg font-semibold mb-2">{title}</p>}
      <div className="flex gap-2">
        <div className="flex gap-2 items-center justify-center">
          <p>{t('start')}:</p>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            locale={ca}
            className="p-3 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="flex gap-2 items-center">
          <p>{t('end')}:</p>
          <DatePicker
            id="endDate"
            selected={endDate}
            onChange={(date: Date) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            locale={ca}
            className="p-3 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="flex ">
          <Button
            type="create"
            onClick={() => handleSearch()}
            customStyles="flex"
          >
            {isLoading[id + '_Search'] ? <SvgSpinner /> : t('search')}
          </Button>
        </div>
      </div>
      <div className="flex flex-col w-full py-2 border-b">
        <div className="flex bg-gray-100 w-full rounded">
          <div className="p-2 w-full font-semibold">{t('code')}</div>
          <div className="p-2 w-full font-semibold">{t('description')}</div>
          <div className="p-2 w-full font-semibold">{t('date')}</div>
          <div className="p-2 w-full font-semibold">{t('state')}</div>
          <div className="p-2 flex w-full font-semibold justify-center">
            {t('detail')}
          </div>
        </div>
        <div>
          <div className={className}>
            {currentWorkOrders.map((workOrder, index) => (
              <div
                key={index}
                className={`flex flex-row items-center border-b border-gray-200 ${
                  dayjs(workOrder.creationTime).isAfter(now)
                    ? 'bg-yellow-500'
                    : ''
                }`}
              >
                <div className="p-2 w-full">{workOrder.code}</div>
                <div className="p-2 w-full">{workOrder.description}</div>
                <div className="p-2 w-full">
                  {formatDate(workOrder.creationTime)}
                </div>
                <div className="p-2 w-full">
                  {translateStateWorkOrder(workOrder.stateWorkOrder, t)}
                </div>
                {dayjs(workOrder.startTime).isBefore(now) && (
                  <Button
                    type="none"
                    onClick={() => {
                      toggleLoading(workOrder.id + '_Detail');
                    }}
                    href={`${Routes.workOrders}/${workOrder.id}`}
                    className="bg-okron-btDetail hover:bg-okron-btnDetailHover rounded flex text-center p-2 w-full justify-center align-middle text-white"
                  >
                    {isLoading[workOrder.id + '_Detail'] ? (
                      <SvgSpinner />
                    ) : (
                      <SvgDetail />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          className={`px-4 py-2 rounded-md ${
            currentPage === 1
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {t('previous')}
        </button>
        <span className="text-gray-600">
          {t('page')} {currentPage} {t('of')} {Math.ceil(workOrders.length / itemsPerPage)}
        </span>
        <button
          className={`px-4 py-2 rounded-md ${
            indexOfLastItem >= workOrders.length
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastItem >= workOrders.length}
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
};
