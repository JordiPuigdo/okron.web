'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';
import { usePermissions } from 'app/hooks/usePermissions';
import { useWorkOrdersList } from 'app/hooks/useWorkOrdersList';
import { OperatorType } from 'app/interfaces/Operator';
import { UserType } from 'app/interfaces/User';
import { WorkOrder, WorkOrderType } from 'app/interfaces/workOrder';
import { useSessionStore } from 'app/stores/globalStore';
import DataTable from 'components/table/DataTable';
import { TableButtons } from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

import { WorkOrdersFiltersTable } from './WorkOrderFiltersTable/WorkOrdersFiltersTable';
import { WorkOrderPreviewPanel } from './WorkOrderPreviewPanel';

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
  } = useWorkOrdersList(operatorId);

  // State para el panel de preview
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Handler para abrir el preview
  const handlePreview = (item: WorkOrder) => {
    setSelectedWorkOrder(item);
    setIsPreviewOpen(true);
  };

  // Handler para cerrar el preview
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setTimeout(() => setSelectedWorkOrder(null), 300);
  };

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
          onPreview={handlePreview}
        />
      )}

      {/* Panel de vista previa */}
      <WorkOrderPreviewPanel
        workOrder={selectedWorkOrder}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default WorkOrderTable;
