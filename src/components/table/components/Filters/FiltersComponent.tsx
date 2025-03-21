import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useSessionStore } from 'app/stores/globalStore';
import { EntityTable } from 'components/table/interface/tableEntitys';
import ca from 'date-fns/locale/ca';

import { Filters, FiltersFormat } from '../../interface/interfaceTable';

interface FiltersComponentProps {
  filters?: Filters[];
  onFilterChange?: (key: string, value: string | boolean | Date) => void;
  onFilterDateChange?: (date: Date) => void;
  entity: EntityTable;
}

const FiltersComponent: React.FC<FiltersComponentProps> = ({
  filters,
  onFilterChange,
  onFilterDateChange,
  entity,
}) => {
  const { filterSpareParts, setFilterSpareParts } = useSessionStore();
  const currentDate = new Date();
  const [date, setDate] = useState<Date | null>(currentDate);

  const [filterValues, setFilterValues] = useState<{
    [key: string]: string | boolean | Date;
  }>({});

  const handleInputChange = (key: string, value: string | boolean | Date) => {
    setFilterValues({ ...filterValues, [key]: value });
    if (onFilterChange) {
      onFilterChange(key, value);
    }
    /*   if (entity === EntityTable.SPAREPART && typeof value === "string") {
      handleFilterSpareParts(key, value as string);
    }*/
  };

  const handleDateChange = (date: Date) => {
    setDate(date);
    if (onFilterDateChange) {
      onFilterDateChange(date);
    }
  };

  /* if (filterSpareParts !== undefined) {
    handleInputChange("code", filterSpareParts.code as string);
    handleInputChange("description", filterSpareParts.description as string);
    handleInputChange("family", filterSpareParts.family as string);
    handleInputChange("refProvider", filterSpareParts.refSupplier as string);
    handleInputChange("ubication", filterSpareParts.ubication as string);
  }*/

  return (
    <>
      {filters && filters.length > 0 && (
        <div className="flex flex-row gap-2 p-1 justify-between">
          <div className="flex flex-row sm:flex-col md:flex-row items-center gap-2">
            {filters.map((filter, index) => (
              <div key={filter.key} className="flex items-center">
                {filter.format === FiltersFormat.TEXT && (
                  <input
                    id={`filter-${filter.key}`}
                    type="text"
                    placeholder={filter.label}
                    className="text-sm bg-blue-gray-100 rounded-lg border border-gray-500"
                    value={
                      filterValues[filter.key]
                        ? filterValues[filter.key].toString()
                        : ''
                    }
                    onChange={e =>
                      handleInputChange(filter.key, e.target.value)
                    }
                  />
                )}
                {filter.format === FiltersFormat.BOOLEAN && (
                  <input
                    type="checkbox"
                    id={filter.key}
                    checked={!!filterValues[filter.key]}
                    onChange={e =>
                      handleInputChange(filter.key, e.target.checked)
                    }
                  />
                )}
                {filter.format === FiltersFormat.DATE && (
                  <DatePicker
                    selected={date}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    locale={ca}
                    className="p-3 border border-gray-300 rounded-md text-lg bg-white text-gray-900"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default FiltersComponent;
