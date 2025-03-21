import { useEffect, useState } from 'react';
import Select, { MultiValue } from 'react-select';
import { StateWorkOrder, WorkOrdersFilters } from 'app/interfaces/workOrder';
import { translateStateWorkOrder } from 'app/utils/utils';

export interface WorkOrdersFiltersStateProps {
  workOrdersFilters: WorkOrdersFilters;
  setWorkOrdersFilters: (workOrdersFilters: WorkOrdersFilters) => void;
  validStates: StateWorkOrder[];
}

export const WorkOrderStateFilter = ({
  workOrdersFilters,
  setWorkOrdersFilters,
  validStates,
}: WorkOrdersFiltersStateProps) => {
  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<{ label: string; value: string }>
  >([]);

  const mapStatesToOptions = (states: StateWorkOrder[]) =>
    states.map(state => ({
      label: translateStateWorkOrder(state),
      value: state.toString(),
    }));
  const mapOptionsToStates = (
    options: MultiValue<{ label: string; value: string }>
  ) => options.map(option => Number(option.value) as unknown as StateWorkOrder);

  const handleChange = (
    selected: MultiValue<{ label: string; value: string }>
  ) => {
    setSelectedOptions(selected);
    setWorkOrdersFilters({
      ...workOrdersFilters,
      workOrderState: mapOptionsToStates(selected),
    });
  };

  useEffect(() => {
    if (workOrdersFilters.workOrderState.length > 0) return;
    setSelectedOptions(mapStatesToOptions(workOrdersFilters.workOrderState));
  }, [workOrdersFilters.workOrderState]);

  return (
    <div className="flex items-center w-full">
      <Select
        isMulti
        options={mapStatesToOptions(validStates)}
        value={selectedOptions}
        onChange={handleChange}
        className="w-full"
        classNamePrefix="react-select"
        styles={customStyles}
        placeholder="Estat"
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
