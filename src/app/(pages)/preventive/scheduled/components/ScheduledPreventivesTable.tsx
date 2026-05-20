'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { ScheduledPreventiveItem } from 'app/interfaces/Preventive';
import { formatDate } from 'app/utils/utils';
import dayjs from 'dayjs';
import { cn } from 'lib/utils';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Eye,
} from 'lucide-react';

const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100, 200];

interface ScheduledPreventivesTableProps {
  data: ScheduledPreventiveItem[];
  selectedIds: Set<string>;
  onSelectionChange: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onPreview: (item: ScheduledPreventiveItem) => void;
  isLoading?: boolean;
}

type SortField = 'scheduledDate' | 'code' | 'asset' | 'status';
type SortOrder = 'asc' | 'desc';

// Helper to determine date urgency
const getDateUrgency = (
  date: Date
): 'overdue' | 'today' | 'tomorrow' | 'thisWeek' | 'future' => {
  const now = dayjs().startOf('day');
  const scheduled = dayjs(date).startOf('day');
  const diffDays = scheduled.diff(now, 'day');

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays <= 7) return 'thisWeek';
  return 'future';
};

export const ScheduledPreventivesTable: React.FC<
  ScheduledPreventivesTableProps
> = ({
  data,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  onClearSelection,
  onPreview,
  isLoading = false,
}) => {
  const { t } = useTranslations();
  const [sortField, setSortField] = useState<SortField>('scheduledDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[1]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortOrder('asc');
      }
    },
    [sortField]
  );

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'scheduledDate':
          comparison =
            new Date(a.scheduledDate).getTime() -
            new Date(b.scheduledDate).getTime();
          break;
        case 'code':
          comparison = (a.preventive.code || '').localeCompare(
            b.preventive.code || ''
          );
          break;
        case 'asset':
          comparison = (a.preventive.asset?.description || '').localeCompare(
            b.preventive.asset?.description || ''
          );
          break;
        case 'status':
          comparison = Number(a.isLaunched) - Number(b.isLaunched);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortField, sortOrder]);

  // Paginación
  const totalPages = useMemo(
    () => Math.ceil(sortedData.length / itemsPerPage),
    [sortedData.length, itemsPerPage]
  );

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Reset page when data changes significantly
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const pendingCount = useMemo(
    () => data.filter(item => !item.isLaunched).length,
    [data]
  );

  const allPendingSelected = useMemo(() => {
    const pendingItems = data.filter(item => !item.isLaunched);
    if (pendingItems.length === 0) return false;
    return pendingItems.every(item => selectedIds.has(item.id));
  }, [data, selectedIds]);

  const handleSelectAllToggle = useCallback(() => {
    if (allPendingSelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  }, [allPendingSelected, onSelectAll, onClearSelection]);

  const getUrgencyBadge = (date: Date, isLaunched: boolean) => {
    if (isLaunched) return null;

    const urgency = getDateUrgency(date);

    const urgencyStyles = {
      overdue: 'bg-red-100 text-red-700 border-red-200',
      today: 'bg-orange-100 text-orange-700 border-orange-200',
      tomorrow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      thisWeek: 'bg-blue-100 text-blue-700 border-blue-200',
      future: '',
    };

    const urgencyLabels = {
      overdue: t('preventive.scheduled.overdue') || 'Vencido',
      today: t('preventive.scheduled.today') || 'Hoy',
      tomorrow: t('preventive.scheduled.tomorrow') || 'Mañana',
      thisWeek: t('preventive.scheduled.thisWeek') || 'Esta semana',
      future: '',
    };

    if (urgency === 'future') return null;

    return (
      <span
        className={cn(
          'ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase rounded border',
          urgencyStyles[urgency]
        )}
      >
        {urgency === 'overdue' && (
          <AlertTriangle className="w-3 h-3 inline mr-1" />
        )}
        {urgencyLabels[urgency]}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="text-gray-500">
            {t('common.loading') || 'Cargando...'}
          </span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Calendar className="w-12 h-12 text-gray-300" />
          <span>
            {t('preventive.scheduled.noData') ||
              'No hay preventivos programados en este período'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* Checkbox header */}
              <th className="px-3 py-2.5 w-10">
                <input
                  type="checkbox"
                  checked={allPendingSelected && pendingCount > 0}
                  onChange={handleSelectAllToggle}
                  disabled={pendingCount === 0}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  title={
                    t('preventive.scheduled.selectAllPending') ||
                    'Seleccionar todos los pendientes'
                  }
                />
              </th>

              {/* Date */}
              <th
                className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-36"
                onClick={() => handleSort('scheduledDate')}
              >
                <div className="flex items-center">
                  {t('preventive.scheduled.date') || 'Fecha'}
                  <SortIcon field="scheduledDate" />
                </div>
              </th>

              {/* Preventive (Code + Description) */}
              <th
                className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center">
                  {t('preventive.preventive') || 'Preventivo'}
                  <SortIcon field="code" />
                </div>
              </th>

              {/* Asset */}
              <th
                className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-48"
                onClick={() => handleSort('asset')}
              >
                <div className="flex items-center">
                  {t('preventive.asset') || 'Equipo'}
                  <SortIcon field="asset" />
                </div>
              </th>

              {/* Status */}
              <th
                className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-28"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  {t('preventive.scheduled.status') || 'Estado'}
                  <SortIcon field="status" />
                </div>
              </th>

              {/* Work Order */}
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                {t('preventive.scheduled.workOrder') || 'OT'}
              </th>

              {/* Actions */}
              <th className="px-3 py-2.5 w-12 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {''}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map(item => {
              const urgency = getDateUrgency(item.scheduledDate);
              const rowBorderColor =
                !item.isLaunched && urgency === 'overdue'
                  ? 'border-l-4 border-l-red-500'
                  : !item.isLaunched && urgency === 'today'
                    ? 'border-l-4 border-l-orange-500'
                    : !item.isLaunched && urgency === 'tomorrow'
                      ? 'border-l-4 border-l-yellow-500'
                      : '';

              return (
                <tr
                  key={item.id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors cursor-pointer group',
                    rowBorderColor,
                    selectedIds.has(item.id) && 'bg-blue-50 hover:bg-blue-100',
                    item.isLaunched && 'bg-green-50/30'
                  )}
                  onClick={() => onPreview(item)}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => onSelectionChange(item.id)}
                      disabled={item.isLaunched}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>

                  {/* Date with urgency badge */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        className={cn(
                          'w-3.5 h-3.5 flex-shrink-0',
                          urgency === 'overdue' && !item.isLaunched
                            ? 'text-red-500'
                            : urgency === 'today' && !item.isLaunched
                              ? 'text-orange-500'
                              : 'text-gray-400'
                        )}
                      />
                      <span className="font-medium text-gray-900">
                        {formatDate(item.scheduledDate, false)}
                      </span>
                      {getUrgencyBadge(item.scheduledDate, item.isLaunched)}
                    </div>
                  </td>

                  {/* Preventive: Code + Description */}
                  <td className="px-3 py-2">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-gray-900 truncate">
                        {item.preventive.code}
                      </span>
                      <span className="text-gray-500 truncate text-xs">
                        {item.preventive.description}
                      </span>
                    </div>
                  </td>

                  {/* Asset */}
                  <td className="px-3 py-2">
                    <span className="text-gray-900 truncate block">
                      {item.preventive.asset?.description || '-'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2">
                    {item.isLaunched ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('preventive.scheduled.launched') || 'Lanzado'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                        <Clock className="w-3 h-3" />
                        {t('preventive.scheduled.pending') || 'Pendiente'}
                      </span>
                    )}
                  </td>

                  {/* Work Order */}
                  <td className="px-3 py-2">
                    {item.workOrder ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded">
                        {item.workOrder.code}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td
                    className="px-3 py-2 text-center"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onPreview(item)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title={t('common.preview') || 'Ver detalle'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination - compact */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between gap-4 text-xs">
          {/* Stats - compact */}
          <div className="flex items-center gap-3 text-gray-600">
            <span>
              {data.length} {t('common.total')}
            </span>
            <span className="text-amber-600">
              {pendingCount} {t('preventive.scheduled.pending')}
            </span>
            <span className="text-green-600">
              {data.length - pendingCount} {t('preventive.scheduled.launched')}
            </span>
            {selectedIds.size > 0 && (
              <span className="text-blue-600 font-medium">
                {selectedIds.size} {t('preventive.scheduled.selected') || 'seleccionados'}
              </span>
            )}
          </div>

          {/* Pagination controls - compact */}
          <div className="flex items-center gap-3">
            <select
              value={itemsPerPage}
              onChange={e => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    'p-1 rounded transition-colors',
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-gray-600 min-w-[70px] text-center">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'p-1 rounded transition-colors',
                    currentPage >= totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledPreventivesTable;
