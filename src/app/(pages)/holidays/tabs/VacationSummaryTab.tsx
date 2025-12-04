'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { useTranslations } from 'app/hooks/useTranslations';
import {
  VacationRequestSummary,
  VacationStatus,
} from 'app/interfaces/Vacation';
import { VacationService } from 'app/services/vacationService';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { ElementList } from 'components/selector/ElementList';
import { ca } from 'date-fns/locale';
import dayjs from 'dayjs';

export const VacationSummaryTab = () => {
  const { t } = useTranslations();
  const { operators } = useOperatorHook();
  const vacationService = new VacationService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), 0, 1)
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().getFullYear(), 11, 31)
  );
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<VacationStatus | ''>('');
  const [summary, setSummary] = useState<VacationRequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [operatorElements, setOperatorElements] = useState<ElementList[]>([]);

  useEffect(() => {
    if (operators && operators.length > 0) {
      setOperatorElements(
        operators.map(op => ({
          id: op.id,
          description: op.name,
        }))
      );
    }
  }, [operators]);

  useEffect(() => {
    loadSummary();
  }, [startDate, endDate, selectedOperatorId, selectedStatus]);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await vacationService.getVacationSummary(
        startDate,
        endDate,
        selectedOperatorId || undefined
      );
      setSummary(data);
    } catch (error) {
      console.error('Error loading vacation summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: VacationStatus): string => {
    switch (status) {
      case VacationStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case VacationStatus.Approved:
        return 'bg-green-100 text-green-800';
      case VacationStatus.Rejected:
        return 'bg-red-100 text-red-800';
      case VacationStatus.Cancelled:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: VacationStatus): string => {
    switch (status) {
      case VacationStatus.Pending:
        return t('vacation.status.pending');
      case VacationStatus.Approved:
        return t('vacation.status.approved');
      case VacationStatus.Rejected:
        return t('vacation.status.rejected');
      case VacationStatus.Cancelled:
        return t('vacation.status.cancelled');
      default:
        return '';
    }
  };

  const groupedByOperator = summary
    .filter(item => selectedStatus === '' || item.status === selectedStatus)
    .reduce((acc, item) => {
    if (!acc[item.operatorId]) {
      acc[item.operatorId] = {
        operatorName: item.operatorName,
        requests: [],
        totalDays: 0,
      };
    }
    acc[item.operatorId].requests.push(item);
    if (item.status === VacationStatus.Approved) {
      acc[item.operatorId].totalDays += item.workingDays;
    }
    return acc;
  }, {} as Record<string, { operatorName: string; requests: VacationRequestSummary[]; totalDays: number }>);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('vacation.summaryFilters')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('start')}
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('final')}
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('state')} ({t('optional')})
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value === '' ? '' : Number(e.target.value) as VacationStatus)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">{t('all')}</option>
              <option value={VacationStatus.Pending}>{t('vacation.status.pending')}</option>
              <option value={VacationStatus.Approved}>{t('vacation.status.approved')}</option>
              <option value={VacationStatus.Rejected}>{t('vacation.status.rejected')}</option>
              <option value={VacationStatus.Cancelled}>{t('vacation.status.cancelled')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('operator')} ({t('optional')})
            </label>
            <AutocompleteSearchBar
              elements={operatorElements}
              setCurrentId={setSelectedOperatorId}
              placeholder={t('search.operators')}
              selectedId={selectedOperatorId || null}
            />
            {selectedOperatorId && (
              <button
                onClick={() => setSelectedOperatorId('')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {t('clear.filter')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : Object.keys(groupedByOperator).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">{t('vacation.noSummaryData')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByOperator).map(
            ([operatorId, { operatorName, requests, totalDays }]) => (
              <div
                key={operatorId}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-semibold text-gray-900">
                    {operatorName}
                  </h4>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {t('vacation.totalApprovedDays')}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {totalDays} {t('days')}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {t('vacation.dates')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {t('days')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {t('state')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {t('vacation.reason')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {requests.map((request, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {dayjs(request.startDate).format('DD/MM/YYYY')} -{' '}
                              {dayjs(request.endDate).format('DD/MM/YYYY')}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {request.workingDays}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                request.status
                              )}`}
                            >
                              {getStatusText(request.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900 max-w-md truncate">
                              {request.reason || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
