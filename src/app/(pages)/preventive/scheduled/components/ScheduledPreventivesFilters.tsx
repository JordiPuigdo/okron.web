'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import {
  LaunchStatus,
  ScheduledPreventivesFilters,
} from 'app/hooks/useScheduledPreventives';
import { useTranslations } from 'app/hooks/useTranslations';
import Operator from 'app/interfaces/Operator';
import { ca } from 'date-fns/locale';
import dayjs from 'dayjs';
import { Calendar, CheckCircle, Clock, Filter, Search, X } from 'lucide-react';

interface AssetOption {
  id: string;
  description: string;
}

interface MachineOption {
  id: string;
  description: string;
}

interface ScheduledPreventivesFiltersProps {
  filters: ScheduledPreventivesFilters;
  setFilters: React.Dispatch<React.SetStateAction<ScheduledPreventivesFilters>>;
  availableAssets?: AssetOption[];
  availableOperators?: Pick<Operator, 'id' | 'name'>[];
  availableMachines?: MachineOption[];
}

export const ScheduledPreventivesFiltersComponent: React.FC<
  ScheduledPreventivesFiltersProps
> = ({
  filters,
  setFilters,
  availableAssets = [],
  availableOperators = [],
  availableMachines = [],
}) => {
  const { t } = useTranslations();

  const handleStartDateChange = useCallback(
    (date: Date | null) => {
      if (!date) return;
      const normalizedDate = dayjs(date).startOf('day').toDate();
      setFilters(prev => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          startDate: normalizedDate,
        },
      }));
    },
    [setFilters]
  );

  const handleEndDateChange = useCallback(
    (date: Date | null) => {
      if (!date) return;
      const normalizedDate = dayjs(date).endOf('day').toDate();
      setFilters(prev => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          endDate: normalizedDate,
        },
      }));
    },
    [setFilters]
  );

  const handleAssetChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters(prev => ({
        ...prev,
        assetId: e.target.value,
      }));
    },
    [setFilters]
  );

  const handleOperatorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters(prev => ({
        ...prev,
        operatorId: e.target.value,
      }));
    },
    [setFilters]
  );

  const handleMachineChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters(prev => ({
        ...prev,
        machineId: e.target.value,
      }));
    },
    [setFilters]
  );

  const handleLaunchStatusChange = useCallback(
    (status: LaunchStatus) => {
      setFilters(prev => ({
        ...prev,
        launchStatus: status,
      }));
    },
    [setFilters]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters(prev => ({
        ...prev,
        searchTerm: e.target.value,
      }));
    },
    [setFilters]
  );

  const handleClearFilters = useCallback(() => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    endDate.setHours(23, 59, 59, 999);

    setFilters({
      dateRange: { startDate, endDate },
      assetId: '',
      operatorId: '',
      machineId: '',
      launchStatus: 'all',
      searchTerm: '',
    });
  }, [setFilters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.assetId !== '' ||
      filters.operatorId !== '' ||
      filters.machineId !== '' ||
      filters.searchTerm !== '' ||
      filters.launchStatus !== 'all'
    );
  }, [filters]);

  const commonDatePickerProps = useMemo(
    () => ({
      dateFormat: 'dd/MM/yyyy',
      locale: ca,
      className:
        'border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    }),
    []
  );

  const launchStatusOptions: {
    value: LaunchStatus;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: 'all',
      label: t('preventive.scheduled.statusAll') || 'Todos',
      icon: <Filter className="w-4 h-4" />,
    },
    {
      value: 'pending',
      label: t('preventive.scheduled.statusPending') || 'Pendientes',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      value: 'launched',
      label: t('preventive.scheduled.statusLaunched') || 'Lanzados',
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range - compact */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <DatePicker
            {...commonDatePickerProps}
            id="startDate"
            selected={filters.dateRange.startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={filters.dateRange.startDate}
            endDate={filters.dateRange.endDate}
            className="border border-gray-300 px-2 py-1.5 rounded-md w-28 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-gray-400">→</span>
          <DatePicker
            {...commonDatePickerProps}
            id="endDate"
            selected={filters.dateRange.endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={filters.dateRange.startDate}
            endDate={filters.dateRange.endDate}
            minDate={filters.dateRange.startDate}
            className="border border-gray-300 px-2 py-1.5 rounded-md w-28 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Launch Status Buttons - compact */}
        <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-md">
          {launchStatusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleLaunchStatusChange(option.value)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all ${
                filters.launchStatus === option.value
                  ? option.value === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : option.value === 'launched'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Asset Selector - compact */}
        <select
          value={filters.assetId}
          onChange={handleAssetChange}
          className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[160px]"
        >
          <option value="">
            {t('preventive.scheduled.allAssets') || 'Todos equipos'}
          </option>
          {availableAssets.map(asset => (
            <option key={asset.id} value={asset.id}>
              {asset.description}
            </option>
          ))}
        </select>

        {/* Machine Selector - compact */}
        {availableMachines.length > 0 && (
          <select
            value={filters.machineId}
            onChange={handleMachineChange}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[160px]"
          >
            <option value="">
              {t('preventive.scheduled.allMachines') || 'Todas máquinas'}
            </option>
            {availableMachines.map(machine => (
              <option key={machine.id} value={machine.id}>
                {machine.description}
              </option>
            ))}
          </select>
        )}

        {/* Operator Selector - compact */}
        {availableOperators.length > 0 && (
          <select
            value={filters.operatorId}
            onChange={handleOperatorChange}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[160px]"
          >
            <option value="">
              {t('preventive.scheduled.allOperators') || 'Todos operarios'}
            </option>
            {availableOperators.map(operator => (
              <option key={operator.id} value={operator.id}>
                {operator.name}
              </option>
            ))}
          </select>
        )}

        {/* Search - grows to fill */}
        <div className="flex-1 min-w-[180px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search') || 'Buscar...'}
              value={filters.searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title={t('common.clearFilters') || 'Limpiar filtros'}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ScheduledPreventivesFiltersComponent;
