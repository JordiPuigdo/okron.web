'use client';
import { useEffect, useState } from 'react';
import SparePartTable from 'app/(pages)/spareParts/components/SparePartTable';
import { useTranslations } from 'app/hooks/useTranslations';
import { useWorkOrders } from 'app/hooks/useWorkOrders';
import { SvgSpinner } from 'app/icons/icons';
import { LoginUser, UserPermission } from 'app/interfaces/User';
import WorkOrder, {
  OriginWorkOrder,
  SearchWorkOrderFilters,
  StateWorkOrder,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import OperatorService from 'app/services/operatorService';
import {
  translateStateWorkOrder,
  translateWorkOrderType,
} from 'app/utils/utils';
import { DateFilters } from 'components/Filters/DateFilter';
import dayjs from 'dayjs';

import CostXAsset from '../components/CostXAsset';
import OrdersDashboard from '../components/OrdersDashboard';
import WorkOrdersDashboard from '../components/WorkOrdersDashboard';
import { ChartsGrid } from './components/ChartsGrid';
import { DashboardHeader } from './components/DashboardHeader';
import { NavigationTabs } from './components/NavigationTabs';
import { StatusCardsGrid } from './components/StatusCardsGrid';

interface WorkOrdersChartProps {
  operator: string;
  Correctius: number;
  Preventius: number;
  Tickets: number;
}

export interface WorkOrderTypeChartProps {
  workOrderType: WorkOrderType;
  value: number;
  index: string;
}

interface WorkOrderStateChartProps {
  statWorkOrder: StateWorkOrder;
  value: number;
  color: string;
}


export interface DashboardMM {
  loginUser: LoginUser;
}

export const DashboardMM: React.FC<DashboardMM> = ({ loginUser }) => {
  const operatorService = new OperatorService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );

  const validStates = [
    StateWorkOrder.Waiting,
    StateWorkOrder.OnGoing,
    StateWorkOrder.Paused,
    StateWorkOrder.PendingToValidate,
    StateWorkOrder.Finished,
  ];
  const [workOrderState, setWorkOrderState] = useState<
    WorkOrderStateChartProps[]
  >([]);

  const [chartData, setChartData] = useState<WorkOrdersChartProps[]>([]);
  const [selectedButton, setSelectedButton] = useState<string | null>(
    'work.orders'
  );

  const handleButtonClick = (buttonName: string) => {
    setSelectedButton(buttonName);
  };

  const [isLoading, setIsLoading] = useState(false);

  const [workOrderTypeChartData, setWorkOrderTypeChartData] = useState<
    WorkOrderTypeChartProps[]
  >([]);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [totalCosts, setTotalCosts] = useState<number>(0);

  const firstDayOfMonth = dayjs().startOf('month').toDate();

  const { fetchWithFilters } = useWorkOrders();
  const { t } = useTranslations();

  const stateColors: { [key in StateWorkOrder]: string } = {
    [StateWorkOrder.Waiting]: 'bg-okron-pending',
    [StateWorkOrder.OnGoing]: 'bg-okron-onCourse',
    [StateWorkOrder.Paused]: 'bg-okron-paused',
    [StateWorkOrder.PendingToValidate]: 'bg-okron-pendingValidate',
    [StateWorkOrder.Requested]: 'bg-red-500',
    [StateWorkOrder.Finished]: 'bg-okron-finished',
    [StateWorkOrder.Open]: 'bg-green-500',
    [StateWorkOrder.Closed]: 'bg-okron-finished',
    [StateWorkOrder.NotFinished]: 'bg-okron-paused',
    [StateWorkOrder.Invoiced]: 'bg-okron-error',
  };

  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: firstDayOfMonth,
    endDate: dayjs().endOf('day').toDate(),
  });

  async function fetchData() {
    setIsLoading(true);

    if (!dateFilters.startDate || !dateFilters.endDate) {
      return;
    }

    const operators = await operatorService.getOperators();

    setWorkOrderState([]);

    const filters: SearchWorkOrderFilters = {
      assetId: '',
      operatorId: '',
      startDateTime: dateFilters.startDate,
      endDateTime: dateFilters.endDate,
      userType: loginUser.userType,
      originWorkOrder: OriginWorkOrder.Maintenance,
    };

    await fetchWithFilters(filters).then(response => {
      setWorkOrders(response);

      if (!operators) return;

      const updatedWorkOrderTypes = validStates.map(state => ({
        statWorkOrder: state,
        value: 0,
        color: stateColors[state],
      }));

      const operatorMap = new Map<string, WorkOrdersChartProps>();
      const workOrderTypeMap = new Map<
        WorkOrderType,
        WorkOrderTypeChartProps
      >();

      getTotalMinutes(response);
      getTotalCosts(response);
      response.forEach(workOrder => {
        const index = validStates.findIndex(
          state => state === workOrder.stateWorkOrder
        );
        if (index !== -1) {
          updatedWorkOrderTypes[index].value++;
        }

        const workOrderType = workOrder.workOrderType;
        if (workOrderTypeMap.has(workOrderType)) {
          workOrderTypeMap.get(workOrderType)!.value++;
        } else {
          const workOrderTypeChartProps: WorkOrderTypeChartProps = {
            workOrderType: workOrderType,
            value: 1,
            index: translateWorkOrderType(workOrderType, t),
          };
          workOrderTypeMap.set(workOrderType, workOrderTypeChartProps);
        }

        const operatorId = workOrder.operatorId?.map(op => op) || [];

        operatorId.forEach(operatorName => {
          const existingOperator = operatorMap.get(operatorName);

          if (existingOperator) {
            if (workOrder.workOrderType === WorkOrderType.Preventive) {
              existingOperator.Preventius++;
            } else if (workOrder.workOrderType === WorkOrderType.Corrective) {
              existingOperator.Correctius++;
            } else if (workOrder.workOrderType === WorkOrderType.Ticket) {
              existingOperator.Tickets++;
            }
          } else {
            const newOperatorEntry: WorkOrdersChartProps = {
              operator:
                operators.find(x => x.id === operatorName)?.name || 'Proves',
              Preventius:
                workOrder.workOrderType === WorkOrderType.Preventive ? 1 : 0,
              Correctius:
                workOrder.workOrderType === WorkOrderType.Corrective ? 1 : 0,
              Tickets: workOrder.workOrderType === WorkOrderType.Ticket ? 1 : 0,
            };
            operatorMap.set(operatorName, newOperatorEntry);
          }
        });
      });
      setWorkOrderState(updatedWorkOrderTypes);
      const workOrderTypeChartData = Array.from(workOrderTypeMap.values());
      setWorkOrderTypeChartData(workOrderTypeChartData);
      const data = Array.from(operatorMap.values());
      setChartData(data);
    });
    setIsLoading(false);
  }

  const getTotalMinutes = (workOrders: WorkOrder[]) => {
    let totalMinutes = 0;
    workOrders.forEach(workOrder => {
      totalMinutes += calculateTotalTime(workOrder);
    });
    setTotalMinutes(totalMinutes);
  };

  const calculateTotalTime = (workOrder: WorkOrder) => {
    let totalTime = 0;

    workOrder.workOrderOperatorTimes?.forEach(time => {
      const startTime = new Date(time.startTime).getTime();
      const endTime = time.endTime ? new Date(time.endTime).getTime() : null;

      if (endTime && startTime < endTime) {
        const timeDifference = endTime - startTime;
        totalTime += timeDifference;
      }
    });

    return totalTime / (1000 * 60);
  };

  const getTotalCosts = (workOrders: WorkOrder[]) => {
    let totalCosts = 0;
    workOrders.forEach(workOrder => {
      totalCosts += calculateTotalCosts(workOrder);
    });

    setTotalCosts(parseFloat(totalCosts.toFixed(2)));
  };

  const calculateTotalCosts = (workOrder: WorkOrder) => {
    let totalCosts = 0;

    workOrder.workOrderSpareParts?.forEach(sparePart => {
      totalCosts += sparePart.quantity * sparePart.sparePart.price;
    });

    return totalCosts;
  };

  useEffect(() => {
    if (loginUser?.permission == UserPermission.Administrator) {
      fetchData();
      const initialWorkOrderTypes = validStates.map(state => ({
        statWorkOrder: state,
        value: 0,
        color: stateColors[state],
      }));
      setWorkOrderState(initialWorkOrderTypes);
    }
  }, []);

  const totalPreventive = workOrderTypeChartData
    .filter(x => x.workOrderType == WorkOrderType.Preventive)
    .reduce((acc, item) => acc + item.value, 0);
  const totalCorrective = workOrderTypeChartData
    .filter(x => x.workOrderType == WorkOrderType.Corrective)
    .reduce((acc, item) => acc + item.value, 0);

  if (isLoading) return <SvgSpinner className="w-full text-white" />;

  if (loginUser?.permission !== UserPermission.Administrator) return <></>;
  return (
    <div className="flex flex-col w-full gap-6 p-2">
      {/* Header con filtros y KPIs */}
      <DashboardHeader
        dateFilters={dateFilters}
        setDateFilters={setDateFilters}
        onSearch={fetchData}
        totalMinutes={totalMinutes}
        totalCosts={totalCosts}
        searchLabel={t('search')}
        minutesLabel={t('minutes')}
        costLabel={t('cost.material')}
      />

      {/* Status Cards */}
      <div className="flex gap-4 w-full">
        <StatusCardsGrid
          workOrderStates={workOrderState}
          translateFn={state => translateStateWorkOrder(state, t)}
          startDate={dateFilters.startDate}
          endDate={dateFilters.endDate}
        />
      </div>

      {/* Navigation Tabs */}
      <NavigationTabs
        selectedTab={selectedButton}
        onTabChange={handleButtonClick}
      />

      {/* Content Section */}
      {selectedButton === 'costs' ? (
        <div className="flex flex-col lg:flex-row flex-grow gap-4 ">
          <div className="flex flex-col flex-grow border-2 p-2 w-full rounded-xl bg-white">
            <p className="text-lg lg:text-2xl font-semibold p-2 text-left">
              {t('costs')}
            </p>
            {workOrders.length > 0 ? (
              <WorkOrdersDashboard
                workOrders={workOrders.sort((a, b) => {
                  const dateA = new Date(a.creationTime).getTime();
                  const dateB = new Date(b.creationTime).getTime();
                  return dateB - dateA;
                })}
              />
            ) : (
              <span className="font-sm p-3 text-gray-500 text-sm mt-2">
                {t('no.results.filters')}
              </span>
            )}
          </div>
          <div className="flex w-full bg-white rounded-xl p-2 border-2 h-full">
            <CostXAsset workOrders={workOrders} />
          </div>
        </div>
      ) : selectedButton === 'spare.parts' ? (
        <div className="flex flex-col w-full gap-4 items-center">
          <div className="flex flex-col w-full bg-white rounded-xl border-2 p-2">
            <p className="text-lg lg:text-2xl p-2 mb-4 font-semibold text-left">
              {t('spare.parts.low.stock')}
            </p>

            <SparePartTable
              enableFilters={true}
              enableDetail={false}
              enableCreate={false}
              withoutStock={true}
              enableFilterActive={false}
              timer={60000}
            />
          </div>
        </div>
      ) : selectedButton === 'purchases' ? (
        <OrdersDashboard dateRange={dateFilters} />
      ) : (
        <ChartsGrid
          operatorData={chartData}
          totalCorrective={totalCorrective}
          totalPreventive={totalPreventive}
          t={t}
        />
      )}
    </div>
  );
};
