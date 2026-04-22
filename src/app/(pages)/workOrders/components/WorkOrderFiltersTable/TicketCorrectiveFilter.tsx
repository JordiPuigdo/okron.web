import { useTranslations } from 'app/hooks/useTranslations';
import { WorkOrdersFilters, WorkOrderType } from 'app/interfaces/workOrder';

interface TicketCorrectiveFilterProps {
  workOrdersFilters: WorkOrdersFilters;
  setWorkOrdersFilters: (workOrdersFilters: WorkOrdersFilters) => void;
}

export const TicketCorrectiveFilter = ({
  workOrdersFilters,
  setWorkOrdersFilters,
}: TicketCorrectiveFilterProps) => {
  const { t } = useTranslations();

  const hasTicketTypeSelected =
    workOrdersFilters.workOrderType.length === 0 ||
    workOrdersFilters.workOrderType.includes(WorkOrderType.Ticket);

  if (!hasTicketTypeSelected) return null;

  const value =
    workOrdersFilters.hasCorrectiveCreated === null
      ? 'all'
      : workOrdersFilters.hasCorrectiveCreated
      ? 'with'
      : 'without';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;

    const currentTypes = workOrdersFilters.workOrderType;
    const hasTicket = currentTypes.includes(WorkOrderType.Ticket);

    // When filtering by corrective, ensure Ticket is in the type list
    // without removing other selected types. When resetting, keep types as-is.
    const workOrderType =
      val === 'all'
        ? currentTypes
        : hasTicket || currentTypes.length === 0
          ? currentTypes
          : [...currentTypes, WorkOrderType.Ticket];

    setWorkOrdersFilters({
      ...workOrdersFilters,
      workOrderType,
      hasCorrectiveCreated:
        val === 'all' ? null : val === 'with' ? true : false,
    });
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className="p-2 text-sm border border-gray-300 rounded-md cursor-pointer"
    >
      <option value="all">
        {t('workorder.filters.corrective.all') || 'Tickets: Tots'}
      </option>
      <option value="with">
        {t('workorder.filters.corrective.with') || 'Tickets: Amb OT'}
      </option>
      <option value="without">
        {t('workorder.filters.corrective.without') || 'Tickets: Sense OT'}
      </option>
    </select>
  );
};
