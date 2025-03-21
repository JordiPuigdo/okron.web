import { useEffect, useState } from 'react';
import { WorkOrdersFilters } from 'app/interfaces/workOrder';
import { DateFilter, DateFilters } from 'components/Filters/DateFilter';

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

  useEffect(() => {
    setWorkOrdersFilters({
      ...workOrdersFilters,
      dateRange: {
        startDate: dateFilters.startDate,
        endDate: dateFilters.endDate,
      },
    });
  }, [dateFilters]);

  return (
    <DateFilter dateFilters={dateFilters} setDateFilters={setDateFilters} />
  );
};
