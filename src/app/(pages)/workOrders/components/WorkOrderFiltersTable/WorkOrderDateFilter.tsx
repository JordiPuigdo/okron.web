import { useEffect, useState } from 'react';
import { WorkOrdersFilters } from 'app/interfaces/workOrder';
import { DateFilter, DateFilters } from 'components/Filters/DateFilter';
import dayjs from 'dayjs';

export interface WorkOrdersFiltersTableProps {
  workOrdersFilters: WorkOrdersFilters;
  setWorkOrdersFilters: (workOrdersFilters: WorkOrdersFilters) => void;
}

export const WorkOrderDateFilter = ({
  workOrdersFilters,
  setWorkOrdersFilters,
}: WorkOrdersFiltersTableProps) => {
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: workOrdersFilters.dateRange.startDate,
    endDate: workOrdersFilters.dateRange.endDate,
  });

  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    1
  );

  useEffect(() => {
    setWorkOrdersFilters({
      ...workOrdersFilters,
      dateRange: {
        startDate: dateFilters.startDate,
        endDate: dateFilters.endDate,
      },
    });

    if (dateFilters.startDate == null) {
      setWorkOrdersFilters({
        ...workOrdersFilters,
        dateRange: {
          startDate: firstDayOfMonth,
          endDate: dateFilters.endDate,
        },
      });
      setDateFilters({
        startDate: firstDayOfMonth,
        endDate: dateFilters.endDate,
      });
    }
    if (dateFilters.endDate == null && dateFilters.startDate != null) {
      setWorkOrdersFilters({
        ...workOrdersFilters,
        dateRange: {
          startDate: dateFilters.startDate,
          endDate: dayjs().endOf('day').toDate(),
        },
      });
    }
  }, [dateFilters]);

  return (
    <DateFilter dateFilters={dateFilters} setDateFilters={setDateFilters} />
  );
};
