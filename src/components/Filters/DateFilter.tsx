import 'react-datepicker/dist/react-datepicker.css';

import { useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import ca from 'date-fns/locale/ca';
import dayjs from 'dayjs';

export interface DateFilterProps {
  dateFilters: DateFilters;
  setDateFilters: (dateFilters: DateFilters) => void;
  startTimeClassName?: string;
  endTimeClassName?: string;
  className?: string;
}

export interface DateFilters {
  startDate: Date | null;
  endDate: Date | null;
}

export const DateFilter = ({
  dateFilters,
  setDateFilters,
  startTimeClassName = '',
  endTimeClassName = '',
  className = '',
}: DateFilterProps) => {
  const { startDate, endDate } = dateFilters;

  const handleStartDateChange = useCallback(
    (date: Date | null) => {
      const normalizedDate = date ? dayjs(date).startOf('day').toDate() : null;
      setDateFilters({
        ...dateFilters,
        startDate: normalizedDate,
      });
    },
    [dateFilters, setDateFilters]
  );

  const handleEndDateChange = useCallback(
    (date: Date | null) => {
      const normalizedDate = date ? dayjs(date).startOf('day').toDate() : null;
      setDateFilters({
        ...dateFilters,
        endDate: normalizedDate,
      });
    },
    [dateFilters, setDateFilters]
  );

  const commonDatePickerProps = useMemo(
    () => ({
      dateFormat: 'dd/MM/yyyy',
      locale: ca,
      className: 'border border-gray-300 p-2 rounded-md',
    }),
    []
  );

  const defaultSelectedDate = useMemo(() => new Date(), []);

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <div className="flex items-center flex-1">
        <label
          htmlFor="startDate"
          className={`mr-2 min-w-[40px] ${startTimeClassName}`}
        >
          Inici
        </label>
        <DatePicker
          {...commonDatePickerProps}
          id="startDate"
          selected={startDate ?? defaultSelectedDate}
          onChange={handleStartDateChange}
          startDate={startDate}
        />
      </div>

      <div className="flex items-center flex-1">
        <label
          htmlFor="endDate"
          className={`mr-2 min-w-[40px] ${endTimeClassName}`}
        >
          Final
        </label>
        <DatePicker
          {...commonDatePickerProps}
          id="endDate"
          selected={endDate ?? defaultSelectedDate}
          onChange={handleEndDateChange}
          startDate={startDate}
        />
      </div>
    </div>
  );
};
