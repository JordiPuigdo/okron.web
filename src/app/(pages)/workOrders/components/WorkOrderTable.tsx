'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
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
import WorkOrderService from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import { ElementList } from 'components/selector/ElementList';
import DataTable from 'components/table/DataTable';
import { TableButtons } from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';
import { Button } from 'designSystem/Button/Buttons';

import { baseColumns, columnsTicket } from './utilsWorkOrderTable';
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
  workOrderType,
  refresh,
}) => {
  const { operatorLogged, loginUser, setFilterWorkOrders, filterWorkOrders } =
    useSessionStore(state => state);
  const [startDate, setStartDate] = useState<Date | null>(
    filterWorkOrders?.startDateTime
      ? new Date(filterWorkOrders?.startDateTime)
      : new Date()
  );
  const [endDate, setEndDate] = useState<Date | null>(
    filterWorkOrders?.endDateTime
      ? new Date(filterWorkOrders?.endDateTime)
      : new Date()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [workOrders, setWorkOrders] = useState<WorkOrder[] | []>([]);
  const [assets, setAssets] = useState<ElementList[]>([]);
  const [selectedStateFilter, setSelectedStateFilter] = useState<
    number | undefined
  >(undefined);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    number | undefined
  >(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const [workOrdersFilters, setWorkOrdersFilters] = useState<WorkOrdersFilters>(
    {
      dateRange: { startDate: startDate, endDate: endDate },
      workOrderType: [],
      workOrderState: [],
      searchTerm: '',
      assetId: '',
    }
  );

  useEffect(() => {
    if (
      !firstLoad &&
      workOrdersFilters.dateRange.startDate != null &&
      workOrdersFilters.dateRange.endDate != null
    ) {
      setStartDate(workOrdersFilters.dateRange.startDate);
      setEndDate(workOrdersFilters.dateRange.endDate);
    }
  }, [workOrdersFilters]);

  useEffect(() => {
    if (!firstLoad) {
      fetchWorkOrders();
    }
  }, [startDate, endDate]);

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

  const validStates: StateWorkOrder[] =
    loginUser?.userType === UserType.Production
      ? [StateWorkOrder.Open, StateWorkOrder.Closed]
      : [
          StateWorkOrder.Waiting,
          StateWorkOrder.Paused,
          StateWorkOrder.OnGoing,
          StateWorkOrder.PendingToValidate,
          StateWorkOrder.Finished,
          StateWorkOrder.Open,
        ];
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
    if (operatorId !== undefined) handleSearch();
    fetchWorkOrders();
    setFirstLoad(false);
  }, []);

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    await searchWorkOrders();
    setIsLoading(false);
  };

  useEffect(() => {
    if (refresh) {
      setSelectedTypeFilter(workOrderType);
    }
  }, [refresh, workOrderType]);

  const searchWorkOrders = async () => {
    let search: SearchWorkOrderFilters;
    try {
      search = {
        assetId: '',
        operatorId: operatorId || '',
        startDateTime: startDate!,
        endDateTime: endDate!,
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
      search.stateWorkOrder = StateWorkOrder.PendingToValidate;
      search.startDateTime = undefined;
      search.endDateTime = undefined;
    }
    // const filters: FilterWorkOrders = {
    //   startDateTime: startDate!,
    //   endDateTime: endDate!,
    //   workOrderType: selectedTypeFilter
    //     ? selectedTypeFilter
    //     : filterWorkOrders?.workOrderType,
    // };
    // setFilterWorkOrders(filters);
    const workOrders = await workOrderService.getWorkOrdersWithFilters(search);
    if (workOrders.length == 0 && !firstLoad) {
      setMessage('No hi ha ordres disponibles amb aquests filtres');

      setTimeout(() => {
        setMessage('');
      }, 3000);
    }

    setWorkOrders(
      workOrders.sort((a, b) => {
        const startTimeA = new Date(a.startTime).valueOf();
        const startTimeB = new Date(b.startTime).valueOf();
        return startTimeA - startTimeB;
      })
    );
  };

  const handleSearch = async () => {
    setIsLoading(true);

    await searchWorkOrders();
    setIsLoading(false);
  };

  const handleDeleteOrder = (orderId: string) => {
    const isConfirmed = window.confirm(
      `Esteu segurs que voleu eliminar l'ordre de treball?`
    );

    if (isConfirmed) {
      workOrderService.deleteWorkOrder(orderId);
      setWorkOrders(prevWorkOrders =>
        prevWorkOrders
          .filter(prevWorkOrders => prevWorkOrders.id !== orderId)
          .sort((a, b) => {
            const startTimeA = new Date(a.startTime).valueOf();
            const startTimeB = new Date(b.startTime).valueOf();
            return startTimeA - startTimeB;
          })
      );
    } else {
      console.log(`Deletion of work order with ID ${orderId} canceled`);
    }
  };

  const applyFilters = (order: WorkOrder) => {
    const filters = [
      () =>
        searchTerm.length === 0 ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.code.toLowerCase().includes(searchTerm.toLowerCase()),
      () =>
        selectedAssetId === undefined ||
        selectedAssetId.length === 0 ||
        order.asset?.id === selectedAssetId,
      () =>
        workOrdersFilters?.workOrderState.length === 0 ||
        workOrdersFilters?.workOrderState.includes(order.stateWorkOrder),
      () =>
        workOrdersFilters?.workOrderType.length === 0 ||
        workOrdersFilters?.workOrderType.includes(order.workOrderType),
    ];

    return filters.every(filter => filter());
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
            message: 'Ordres actualitzades correctament',
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
              message: 'Error actualitzant ordres',
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
        {enableFilters && (
          <WorkOrdersFiltersTable
            setWorkOrdersFilters={setWorkOrdersFilters}
            workOrdersFilters={workOrdersFilters}
            enableFinalizeWorkOrdersDayBefore={
              enableFinalizeWorkOrdersDayBefore
            }
            setSelectedAssetId={setSelectedAssetId}
            assets={assets}
            enableFilterAssets={enableFilterAssets}
            setSearchTerm={setSearchTerm}
            validStates={validStates}
            enableFilterType={loginUser?.userType == UserType.Maintenance}
            workOrderTypeCount={getWorkOrderTypeCount()}
          />
        )}
        {filteredWorkOrders.length > 0 && (
          <DataTable
            columns={
              loginUser?.userType == UserType.Maintenance
                ? baseColumns
                : columnsTicket
            }
            data={filteredWorkOrders}
            tableButtons={tableButtons}
            entity={EntityTable.WORKORDER}
            onDelete={handleDeleteOrder}
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
                <>Finalitzar</>
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
