'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { usePermissions } from 'app/hooks/usePermissions';
import { useWorkOrders } from 'app/hooks/useWorkOrders';
import { OperatorType } from 'app/interfaces/Operator';
import { UserType } from 'app/interfaces/User';
import { WorkOrderType } from 'app/interfaces/workOrder';
import { useSessionStore } from 'app/stores/globalStore';
import DataTable from 'components/table/DataTable';
import { TableButtons } from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

import { WorkOrdersFiltersTable } from './WorkOrderFiltersTable/WorkOrdersFiltersTable';

interface WorkOrderTableProps {
  enableFilterAssets?: boolean;
  enableFilters: boolean;
  enableDetail?: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  assetId?: string | '';
  enableFinalizeWorkOrdersDayBefore?: boolean;
  operatorId?: string | '';
  workOrderType?: WorkOrderType;
  refresh?: boolean;
}

const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  enableFilters = false,
  enableFilterAssets = false,
  enableDetail = false,
  enableEdit,
  enableDelete,
  enableFinalizeWorkOrdersDayBefore = false,
  operatorId,
}) => {
  const { workOrderColumns } = usePermissions();

  const { operatorLogged, loginUser } = useSessionStore(state => state);

  const {
    filters,
    setFilters,
    filteredWorkOrders,
    validStates,
    workOrderTypeCount,
    isLoading,
  } = useWorkOrders(operatorId);

  const tableButtons: TableButtons = {
    edit: enableEdit,
    delete: enableDelete,
    detail: enableDetail,
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {enableFilters && filters && (
        <WorkOrdersFiltersTable
          setWorkOrdersFilters={setFilters}
          workOrdersFilters={filters}
          enableFinalizeWorkOrdersDayBefore={enableFinalizeWorkOrdersDayBefore}
          enableFilterAssets={enableFilterAssets}
          validStates={validStates}
          enableFilterType={loginUser?.userType === UserType.Maintenance}
          workOrderTypeCount={workOrderTypeCount}
          setSelectedAssetId={() => {}}
          assets={[]}
        />
      )}
      {filteredWorkOrders.length > 0 && (
        <DataTable
          columns={workOrderColumns()}
          data={filteredWorkOrders}
          tableButtons={tableButtons}
          entity={EntityTable.WORKORDER}
          enableFilterActive={false}
          enableCheckbox={
            operatorLogged?.operatorLoggedType === OperatorType.Quality
          }
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default WorkOrderTable;
