import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import ca from 'date-fns/locale/ca';

export interface DateFilterProps {
  dateFilters: DateFilters;
  setDateFilters: (dateFilters: DateFilters) => void;
}

export interface DateFilters {
  startDate: Date | null;
  endDate: Date | null;
}

export const DateFilter = ({
  dateFilters,
  setDateFilters,
}: DateFilterProps) => {
  const [startDate, setStartDate] = useState<Date | null>(
    dateFilters.startDate
  );
  const [endDate, setEndDate] = useState<Date | null>(dateFilters.endDate);

  useEffect(() => {
    setDateFilters({
      ...dateFilters,
      startDate: startDate,
      endDate: endDate,
    });
  }, [startDate, endDate]);

  return (
    <>
      <div className="flex items-center">
        <label htmlFor="startDate" className="mr-2">
          Inici
        </label>
        <DatePicker
          id="startDate"
          selected={startDate ?? new Date()}
          onChange={(date: Date) => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
          locale={ca}
          className="border border-gray-300 p-2 rounded-md mr-4"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="endDate" className="mr-2">
          Final
        </label>
        <DatePicker
          id="endDate"
          selected={endDate ?? new Date()}
          onChange={(date: Date) => setEndDate(date)}
          dateFormat="dd/MM/yyyy"
          locale={ca}
          className="border border-gray-300 p-2 rounded-md mr-4"
        />
      </div>
    </>
  );
};
