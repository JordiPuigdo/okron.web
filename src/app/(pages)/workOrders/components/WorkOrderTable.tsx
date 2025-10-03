'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import { useQueryParams } from 'app/hooks/useFilters';
import { usePermissions } from 'app/hooks/usePermissions';
import { SvgSpinner } from 'app/icons/icons';
import { Asset } from 'app/interfaces/Asset';
import { OperatorType } from 'app/interfaces/Operator';
import { UserType } from 'app/interfaces/User';
import WorkOrder, {
  OriginWorkOrder,
  SearchWorkOrderFilters,
  StateWorkOrder,
  WorkOrdersFilters,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import AssetService from 'app/services/assetService';
import { workOrderService } from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import { FilterValue } from 'app/types/filters';
import { getValidStates } from 'app/utils/utilsWorkOrder';
import { ElementList } from 'components/selector/ElementList';
import DataTable from 'components/table/DataTable';
import { TableButtons } from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';
import dayjs from 'dayjs';
import { Button } from 'designSystem/Button/Buttons';

import { useTranslations } from '../../../hooks/useTranslations';
import { WorkOrdersFiltersTable } from './WorkOrderFiltersTable/WorkOrdersFiltersTable';
import { WorkOrderTypeCount } from './WorkOrderFiltersTable/WorkOrderTypeCount';

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

interface ResponseMessage {
  message: string;
  isSuccess: boolean;
}

const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  enableFilterAssets = false,
  enableFilters = false,
  enableDetail = false,
  enableEdit,
  enableDelete,
  assetId,
  enableFinalizeWorkOrdersDayBefore = false,
  operatorId,
}) => {
  const { operatorLogged, loginUser } = useSessionStore(state => state);

  const { workOrderColumns } = usePermissions();
  const { t } = useTranslations();

  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    1
  );
  const [workOrders, setWorkOrders] = useState<WorkOrder[] | []>([]);
  const [assets, setAssets] = useState<ElementList[]>([]);

  const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const { updateQueryParams, queryParams } = useQueryParams();

  const [workOrdersFilters, setWorkOrdersFilters] = useState<WorkOrdersFilters>(
    {
      dateRange: { startDate: null, endDate: null },
      workOrderType: [],
      workOrderState: [],
      searchTerm: '',
      assetId: '',
      refCustomerId: '',
      customerName: '',
      isInvoiced: false,
      hasDeliveryNote: false,
    }
  );

  useEffect(() => {
    updateQueryParams(getFilters());
    if (firstLoad) {
      setFilters(queryParams);
    }
  }, [workOrdersFilters]);

  function setFilters(filters: FilterValue) {
    setWorkOrdersFilters({
      ...workOrdersFilters,
      workOrderType: filters.workOrderType
        ? filters.workOrderType
            .toString()
            .split(',')
            .map(Number)
            .filter(n => !isNaN(n))
        : [],
      workOrderState: filters.workOrderState
        ? filters.workOrderState
            .toString()
            .split(',')
            .map(Number)
            .filter(n => !isNaN(n))
        : loginUser?.userType == UserType.CRM
        ? [StateWorkOrder.Finished, StateWorkOrder.NotFinished]
        : [],
      dateRange: {
        startDate: filters.startDate
          ? dayjs(filters.startDate.toString(), 'YYYY-MM-DD').toDate()
          : firstDayOfMonth,
        endDate: filters.endDate
          ? dayjs(filters.endDate.toString(), 'YYYY-MM-DD').toDate()
          : dayjs().startOf('day').toDate(),
      },
      searchTerm: filters.searchTerm?.toString() || '',
      assetId: filters.assetId?.toString() || '',
      refCustomerId: filters.refCustomerId?.toString() || '',
      customerName: filters.customerName?.toString() || '',
      isInvoiced: filters.isInvoiced === 'true' || filters.isInvoiced === true,
      hasDeliveryNote:
        filters.hasDeliveryNote === 'true' || filters.hasDeliveryNote === true,
    });
  }

  function getFilters() {
    const filters: FilterValue = {};
    if (workOrdersFilters.workOrderType.length > 0) {
      filters.workOrderType = workOrdersFilters.workOrderType.join(',');
    }
    if (workOrdersFilters.workOrderState.length > 0) {
      filters.workOrderState = workOrdersFilters.workOrderState.join(',');
    }
    if (workOrdersFilters.dateRange.startDate != null) {
      filters.startDate = dayjs(workOrdersFilters.dateRange.startDate).format(
        'YYYY-MM-DD'
      );
    }
    if (workOrdersFilters.dateRange.endDate != null) {
      filters.endDate = dayjs(workOrdersFilters.dateRange.endDate).format(
        'YYYY-MM-DD'
      );
    }
    if (workOrdersFilters.searchTerm.length > 0) {
      filters.searchTerm = workOrdersFilters.searchTerm;
    }
    if (workOrdersFilters.assetId.length > 0) {
      filters.assetId = workOrdersFilters.assetId;
    }
    if (workOrdersFilters.refCustomerId.length > 0) {
      filters.refCustomerId = workOrdersFilters.refCustomerId;
    }
    if (workOrdersFilters.customerName.length > 0) {
      filters.customerName = workOrdersFilters.customerName;
    }
    if (workOrdersFilters.isInvoiced) {
      filters.isInvoiced = workOrdersFilters.isInvoiced;
    } else {
      filters.isInvoiced = false;
    }
    if (workOrdersFilters.hasDeliveryNote) {
      filters.hasDeliveryNote = workOrdersFilters.hasDeliveryNote;
    } else {
      filters.hasDeliveryNote = false;
    }
    return filters;
  }

  const tableButtons: TableButtons = {
    edit: enableEdit,
    delete: enableDelete,
    detail: enableDetail,
  };

  const [responseMessage, setResponseMessage] =
    useState<ResponseMessage | null>(null);

  const [selectedAssetId, setSelectedAssetId] = useState<string>(assetId!);
  const [firstLoad, setFirstLoad] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const validStates: StateWorkOrder[] = getValidStates(loginUser?.userType!);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assets = await assetService.getAll();
        const elements: ElementList[] = [];

        const addAssetAndChildren = (asset: Asset) => {
          if (asset.createWorkOrder) {
            elements.push({
              id: asset.id,
              description: asset.description,
            });
          }

          asset.childs.forEach(childAsset => {
            addAssetAndChildren(childAsset);
          });
        };

        assets.forEach(asset => {
          addAssetAndChildren(asset);
        });
        setAssets(elements);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    if (assetId == undefined) fetchAssets();

    fetchWorkOrders();

    setFirstLoad(false);
  }, []);

  const fetchWorkOrders = async () => {
    await searchWorkOrders();
  };

  const searchWorkOrders = async () => {
    let search: SearchWorkOrderFilters;
    try {
      search = {
        assetId: '',
        operatorId: operatorId || '',
        startDateTime: workOrdersFilters.dateRange.startDate!,
        endDateTime: workOrdersFilters.dateRange.endDate!,
        originWorkOrder:
          loginUser?.userType == UserType.Maintenance
            ? OriginWorkOrder.Maintenance
            : OriginWorkOrder.Production,
        userType: loginUser!.userType,
      };
    } catch (error) {
      console.error('Error fetching work orders:', error);
      return;
    }

    if (operatorLogged?.operatorLoggedType == OperatorType.Quality) {
      search.stateWorkOrder = [StateWorkOrder.PendingToValidate];
      search.startDateTime = undefined;
      search.endDateTime = undefined;
    }

    const workOrders = await workOrderService.getWorkOrdersWithFilters(search);

    setWorkOrders(workOrders);
  };

  const applyFilters = (order: WorkOrder) => {
    const searchTerms = workOrdersFilters.searchTerm.trim().split(/\s+/);

    const searchTermFilter = () => {
      if (searchTerms.length === 0) return true;

      return searchTerms.every(term => {
        if (term.length === 0) return true;

        const lowerTerm = term.toLowerCase();
        return (
          order.description.toLowerCase().includes(lowerTerm) ||
          order.code.toLowerCase().includes(lowerTerm) ||
          order.customerWorkOrder?.customerName
            ?.toLowerCase()
            .includes(lowerTerm) ||
          order.refCustomerId?.toLowerCase().includes(lowerTerm) ||
          order.customerWorkOrder?.customerInstallationAddress?.city
            ?.toLowerCase()
            .includes(lowerTerm) ||
          order.customerWorkOrder?.customerInstallationCode
            ?.toLowerCase()
            .includes(lowerTerm)
        );
      });
    };

    const passesInvoiced =
      workOrdersFilters?.isInvoiced === undefined ||
      order.isInvoiced === workOrdersFilters.isInvoiced;

    const passesDelivery =
      workOrdersFilters?.hasDeliveryNote === undefined ||
      order.hasDeliveryNote === workOrdersFilters.hasDeliveryNote;

    return (
      searchTermFilter() &&
      (selectedAssetId === undefined ||
        selectedAssetId.length === 0 ||
        order.asset?.id === selectedAssetId) &&
      (workOrdersFilters?.workOrderState.length === 0 ||
        workOrdersFilters?.workOrderState.includes(order.stateWorkOrder)) &&
      (workOrdersFilters?.workOrderType.length === 0 ||
        workOrdersFilters?.workOrderType.includes(order.workOrderType)) &&
      passesInvoiced &&
      passesDelivery
    );
  };

  const filteredWorkOrders = workOrders.filter(applyFilters);

  const handleOnChecked = (id?: string) => {
    if (id != undefined) {
      setSelectedRows(prevSelectedRows => {
        const newSelectedRows = new Set(prevSelectedRows);
        if (newSelectedRows.has(id)) {
          newSelectedRows.delete(id);
        } else {
          newSelectedRows.add(id);
        }
        return newSelectedRows;
      });
    } else {
      if (selectedRows.size === filteredWorkOrders.length) {
        setSelectedRows(new Set());
      } else {
        setSelectedRows(new Set(filteredWorkOrders.map(row => row.id)));
      }
    }
  };

  const handleFinalizeWorkOrders = async () => {
    if (isUpdating || selectedRows.size == 0) return;

    setIsUpdating(true);

    const workOrders = Array.from(selectedRows).map(workOrderId => ({
      workOrderId,
      state: StateWorkOrder.Finished,
      operatorId: operatorLogged?.idOperatorLogged,
      userId: loginUser?.agentId,
    }));

    await workOrderService
      .updateStateWorkOrder(workOrders)
      .then(response => {
        if (response) {
          setResponseMessage({
            message: t('workorders.updated.successfully'),
            isSuccess: true,
          });
          setTimeout(() => {
            setResponseMessage({
              message: '',
              isSuccess: true,
            });
          }, 2000);

          searchWorkOrders();
        } else {
          setTimeout(() => {
            setResponseMessage({
              message: t('workorders.error.updating'),
              isSuccess: false,
            });
          }, 3000);
        }
      })
      .catch(error => {
        setTimeout(() => {
          setResponseMessage({
            message: error,
            isSuccess: false,
          });
        }, 3000);
      });
    setSelectedRows(new Set());
    setIsUpdating(false);
  };

  function getWorkOrderTypeCount() {
    const workOrderTypeCount: WorkOrderTypeCount[] = [];
    Object.keys(WorkOrderType).forEach(key => {
      if (!isNaN(Number(key))) {
        const workOrderType = Number(key) as WorkOrderType;
        const length = filteredWorkOrders.filter(
          x => x.workOrderType == workOrderType
        ).length;
        if (length == 0) return;
        workOrderTypeCount.push({
          count: length,
          workOrderType: workOrderType,
        });
      }
    });
    return workOrderTypeCount;
  }

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        {enableFilters && workOrdersFilters.dateRange.startDate != null && (
          <WorkOrdersFiltersTable
            setWorkOrdersFilters={setWorkOrdersFilters}
            workOrdersFilters={workOrdersFilters}
            enableFinalizeWorkOrdersDayBefore={
              enableFinalizeWorkOrdersDayBefore
            }
            setSelectedAssetId={setSelectedAssetId}
            assets={assets}
            enableFilterAssets={enableFilterAssets}
            validStates={validStates}
            enableFilterType={loginUser?.userType == UserType.Maintenance}
            workOrderTypeCount={getWorkOrderTypeCount()}
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
              operatorLogged?.operatorLoggedType == OperatorType.Quality
            }
            onChecked={handleOnChecked}
          />
        )}
      </div>
      {filteredWorkOrders.length > 0 &&
        operatorLogged?.operatorLoggedType == OperatorType.Quality && (
          <div className="py-4 flex flex-row gap-2">
            <Button
              type="none"
              className={`text-white ${
                selectedRows.size > 0 || !isUpdating
                  ? ' bg-blue-900 hover:bg-blue-950 '
                  : ' bg-gray-200 hover:cursor-not-allowed '
              }  rounded-lg text-sm `}
              size="lg"
              customStyles="align-middle flex"
              onClick={async () => {
                await handleFinalizeWorkOrders();
              }}
            >
              {isUpdating ? (
                <SvgSpinner className="text-white" />
              ) : (
                <>{t('finalize')}</>
              )}
            </Button>
            {responseMessage && (
              <div
                className={` ${
                  responseMessage ? 'text-green-500' : 'text-red-500'
                } text-center font-semibold p-2 items-center flex justify-center`}
              >
                {responseMessage.message}
              </div>
            )}
          </div>
        )}
    </>
  );
};

export default WorkOrderTable;
