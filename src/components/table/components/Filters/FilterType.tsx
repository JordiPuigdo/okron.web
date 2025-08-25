import { useEffect, useState } from 'react';
import Select, { MultiValue } from 'react-select';

export interface FilterTypeProps<T> {
  filters: { [key: string]: any };
  setFilters: (filters: { [key: string]: any }) => void;
  validTypes: T[];
  filterKey: string;
  placeholder?: string;
  translateFn?: (value: T) => string;
}

export const FilterType = <T extends number | string>({
  filters,
  setFilters,
  validTypes,
  filterKey,
  placeholder = 'Selecciona',
  translateFn = (value: T) => String(value),
}: FilterTypeProps<T>) => {
  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<{ label: string; value: string }>
  >([]);

  const mapTypesToOptions = (types: T[]) =>
    types.map(type => ({ label: translateFn(type), value: String(type) }));

  const mapOptionsToTypes = (
    options: MultiValue<{ label: string; value: string }>
  ) =>
    options.map(option =>
      typeof validTypes[0] === 'number'
        ? (Number(option.value) as unknown as T)
        : (option.value as unknown as T)
    );

  // Maneja los cambios del select
  const handleChange = (
    selected: MultiValue<{ label: string; value: string }>
  ) => {
    setSelectedOptions(selected);
    setFilters({ ...filters, [filterKey]: mapOptionsToTypes(selected) });
  };

  // Sincroniza selectedOptions cuando filters cambian externamente
  useEffect(() => {
    const currentFilter = filters[filterKey] || [];

    if (currentFilter.length === 0 && selectedOptions.length === 0) return;

    const newSelectedOptions = mapTypesToOptions(currentFilter);
    const isEqual =
      JSON.stringify(selectedOptions.map(o => o.value)) ===
      JSON.stringify(newSelectedOptions.map(o => o.value));
    if (!isEqual) setSelectedOptions(newSelectedOptions);
  }, [filters[filterKey]]);

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
        placeholder={placeholder}
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
    overflowX: 'auto',
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
