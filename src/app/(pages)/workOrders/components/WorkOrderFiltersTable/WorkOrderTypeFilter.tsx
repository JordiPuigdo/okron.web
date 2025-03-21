import { useEffect, useState } from 'react';
import Select, { MultiValue } from 'react-select';
import { WorkOrdersFilters, WorkOrderType } from 'app/interfaces/workOrder';
import { translateWorkOrderType } from 'app/utils/utils';

export interface WorkOrderTypeFilterProps {
  workOrdersFilters: WorkOrdersFilters;
  setWorkOrdersFilters: (workOrdersFilters: WorkOrdersFilters) => void;
}

export const WorkOrderTypeFilter = ({
  workOrdersFilters,
  setWorkOrdersFilters,
}: WorkOrderTypeFilterProps) => {
  const validTypes: WorkOrderType[] = [
    WorkOrderType.Corrective,
    WorkOrderType.Preventive,
    WorkOrderType.Ticket,
  ];
  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<{ label: string; value: string }>
  >([]);

  const mapTypesToOptions = (types: WorkOrderType[]) =>
    types.map(type => ({
      label: translateWorkOrderType(type),
      value: type.toString(),
    }));

  const mapOptionsToTypes = (
    options: MultiValue<{ label: string; value: string }>
  ) => options.map(option => Number(option.value) as unknown as WorkOrderType);

  const handleChange = (
    selected: MultiValue<{ label: string; value: string }>
  ) => {
    setSelectedOptions(selected);
    setWorkOrdersFilters({
      ...workOrdersFilters,
      workOrderType: mapOptionsToTypes(selected),
    });
  };

  useEffect(() => {
    if (workOrdersFilters.workOrderType.length > 0) return;
    setSelectedOptions(mapTypesToOptions(workOrdersFilters.workOrderType));
  }, [workOrdersFilters.workOrderType]);

  return (
    <div className="flex items-center w-full">
      <Select
        isMulti
        options={mapTypesToOptions(validTypes)}
        value={selectedOptions}
        onChange={handleChange}
        className="w-full"
        classNamePrefix="react-select"
        styles={customStyles}
        placeholder="Tipus"
      />
    </div>
  );
};

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    height: '36px',
    minHeight: '46px',
    borderRadius: '6px',
    borderColor: state.isFocused ? '#6366F1' : '#E5E7EB',
    boxShadow: state.isFocused ? '0 0 0 1px #6366F1' : 'none',
    '&:hover': { borderColor: '#6366F1' },
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '0 8px',
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto', // Allows scrolling if too many items
  }),
  multiValue: (base: any) => ({
    ...base,
    margin: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    height: '28px',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    fontSize: '14px',
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    cursor: 'pointer',
  }),
};
