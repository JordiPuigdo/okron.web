import { useState } from "react";

import { Filters } from "../../interface/interfaceTable";
import { EntityTable } from "../../interface/tableEntitys";
import FiltersComponent from "./FiltersComponent";

interface RenderFiltersProps {
  filters?: Filters[];
  onFilterChange?: (key: string, value: string | boolean | Date) => void;
  onFilterActive?: (active: boolean) => void;
  onFilterSparePartsUnderStock?: (active: boolean) => void;
  enableFilterActive?: boolean;
  entity: EntityTable;
  isReport?: boolean;
}

export const RenderFilters = ({
  filters,
  onFilterChange,
  onFilterActive,
  onFilterSparePartsUnderStock,
  enableFilterActive = true,
  entity,
  isReport = false,
}: RenderFiltersProps) => {
  const [filterActive, setFilterActive] = useState(true);
  const [filterSparePartsUnderStock, setFilterSparePartsUnderStock] =
    useState(false);

  const handleFilterActiveToggle = () => {
    const newActiveState = !filterActive;
    setFilterActive(newActiveState);
    onFilterActive && onFilterActive(newActiveState);
  };

  const handleFilterSparePartsUnderStockToggle = () => {
    const newActiveState = !filterSparePartsUnderStock;
    setFilterSparePartsUnderStock(newActiveState);
    onFilterSparePartsUnderStock &&
      onFilterSparePartsUnderStock(newActiveState);
  };

  return (
    <>
      <div className="flex gap-4 p-1 justify-between">
        <div>
          {(!filters || filters.length === 0) && (
            <input
              type="text"
              placeholder="Filtrar"
              className="text-sm bg-blue-gray-100 rounded-lg border border-gray-500"
            />
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <FiltersComponent
          filters={filters}
          onFilterChange={onFilterChange}
          entity={entity}
        />
        {entity == EntityTable.SPAREPART && !isReport && (
          <div
            className="flex items-center hover:cursor-pointer"
            onClick={handleFilterSparePartsUnderStockToggle}
          >
            <span className="mr-2 text-sm text-right">Recanvis sota stock</span>
            <input
              type="checkbox"
              checked={filterSparePartsUnderStock}
              onChange={handleFilterSparePartsUnderStockToggle}
              className=""
            />
          </div>
        )}
        {enableFilterActive && (
          <div
            className="flex items-center hover:cursor-pointer"
            onClick={handleFilterActiveToggle}
          >
            <span className="mr-2 text-sm text-right">Actius</span>
            <input
              type="checkbox"
              checked={filterActive}
              onChange={handleFilterActiveToggle}
              className=""
            />
          </div>
        )}
      </div>
    </>
  );
};
