import { WorkOrdersFilters } from 'app/interfaces/workOrder';

interface CRMStatusFilterProps {
  setWorkOrdersFilters: (workOrdersFilters: WorkOrdersFilters) => void;
  workOrdersFilters: WorkOrdersFilters;
}

export const CRMStatusFilter = ({
  setWorkOrdersFilters,
  workOrdersFilters,
}: CRMStatusFilterProps) => {
  const toggle = (key: keyof WorkOrdersFilters) => {
    setWorkOrdersFilters({
      ...workOrdersFilters,
      [key]: !workOrdersFilters[key],
    });
  };

  return (
    <div className="flex flex-col gap-2 mx-4">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => toggle('hasDeliveryNote')}
      >
        <input
          type="checkbox"
          checked={workOrdersFilters.hasDeliveryNote}
          className="cursor-pointer"
        />
        📦
      </div>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => toggle('isInvoiced')}
      >
        <input
          type="checkbox"
          checked={workOrdersFilters.isInvoiced}
          className="cursor-pointer"
        />
        💰
      </div>
    </div>
  );
};
