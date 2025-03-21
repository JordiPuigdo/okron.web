import { StateWorkOrder, WorkOrdersFilters } from 'app/interfaces/workOrder';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { ElementList } from 'components/selector/ElementList';

import FinalizeWorkOrdersDaysBefore from '../FinalizeWorkOrdersDaysBefore';
import { WorkOrderDateFilter } from './WorkOrderDateFilter';
import { WorkOrderStateFilter } from './WorkOrderStateFilter';
import {
  WorkOrderTypeCount,
  WorkOrderTypeCountComponent,
} from './WorkOrderTypeCount';
import { WorkOrderTypeFilter } from './WorkOrderTypeFilter';

interface WorkOrdersFiltersTableProps {
  workOrdersFilters: WorkOrdersFilters;
  setWorkOrdersFilters: (workOrdersFilters: WorkOrdersFilters) => void;
  enableFinalizeWorkOrdersDayBefore?: boolean;
  enableFilterAssets: boolean;
  setSelectedAssetId: (id: string) => void;
  assets: ElementList[];
  setSearchTerm: (term: string) => void;
  validStates: StateWorkOrder[];
  enableFilterType: boolean;
  workOrderTypeCount: WorkOrderTypeCount[];
}

export const WorkOrdersFiltersTable = ({
  workOrdersFilters,
  setWorkOrdersFilters,
  enableFinalizeWorkOrdersDayBefore = false,
  enableFilterAssets = false,
  setSelectedAssetId,
  assets,
  setSearchTerm,
  validStates,
  enableFilterType,
  workOrderTypeCount,
}: WorkOrdersFiltersTableProps) => {
  function searchWorkOrders() {
    console.log('searchWorkOrders');
  }

  function handleCleanFilters() {
    setWorkOrdersFilters({
      workOrderType: [],
      workOrderState: [],
      dateRange: { startDate: null, endDate: null },
      searchTerm: '',
      assetId: '',
    });
    setSearchTerm('');
    setSelectedAssetId('');
  }

  function numberFilters() {
    return workOrdersFilters.workOrderState.length +
      workOrdersFilters.workOrderType.length +
      workOrdersFilters.assetId.length >
      0
      ? 1
      : 0 + workOrdersFilters.searchTerm.length > 0
      ? 1
      : 0;
  }

  function DeleteFilters() {
    if (numberFilters() == 0) return null;
    return (
      <div className="flex w-full ml-14 bg-white underline font-semibold text-sm text-red-500 justify-end items-end">
        <div className="cursor-pointer" onClick={handleCleanFilters}>
          <div>Borrar</div>
          <div>filtres ({numberFilters()})</div>
        </div>
      </div>
    );
  }

  function handleSelectedAssetId(id: string) {
    setWorkOrdersFilters({
      ...workOrdersFilters,
      assetId: id,
    });
    setSelectedAssetId(id);
  }

  function handleSearchTerm(term: string) {
    setWorkOrdersFilters({
      ...workOrdersFilters,
      searchTerm: term,
    });
    setSearchTerm(term);
  }

  return (
    <div className="bg-white rounded-xl gap-4 p-2 shadow-md">
      <div className="flex flex-col gap-4 my-4 items-center">
        <div className="flex items-start w-full">
          <WorkOrderDateFilter
            workOrdersFilters={workOrdersFilters}
            setWorkOrdersFilters={setWorkOrdersFilters}
          />
          {enableFinalizeWorkOrdersDayBefore && (
            <FinalizeWorkOrdersDaysBefore
              onFinalizeWorkOrdersDayBefore={searchWorkOrders}
            />
          )}
          <WorkOrderTypeCountComponent
            workOrderTypeCount={workOrderTypeCount}
          />
          <DeleteFilters />
        </div>
        <div className="flex w-full gap-2">
          {enableFilterAssets && (
            <AutocompleteSearchBar
              elements={assets}
              setCurrentId={handleSelectedAssetId}
              placeholder="Buscar Equips"
            />
          )}
          <input
            type="text"
            placeholder="Codi / Descripció"
            className="p-3 text-sm border border-gray-300 rounded-md w-full"
            value={workOrdersFilters.searchTerm}
            onChange={e => handleSearchTerm(e.target.value)}
          />
          <WorkOrderStateFilter
            validStates={validStates}
            setWorkOrdersFilters={setWorkOrdersFilters}
            workOrdersFilters={workOrdersFilters}
          />
          {enableFilterType && (
            <WorkOrderTypeFilter
              setWorkOrdersFilters={setWorkOrdersFilters}
              workOrdersFilters={workOrdersFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};
