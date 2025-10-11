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
import { DateFilter, DateFilters } from 'components/Filters/DateFilter';
import dayjs from 'dayjs';
import { BarChartComponent } from 'designSystem/BarChart/BarChartComponent';
import { Button } from 'designSystem/Button/Buttons';
import { DonutChartComponent } from 'designSystem/DonutChart/DonutChartComponent';

import ButtonsSections from '../components/ButtonsSections';
import CostXAsset from '../components/CostXAsset';
import OrdersDashboard from '../components/OrdersDashboard';
import WorkOrdersDashboard from '../components/WorkOrdersDashboard';

interface WorkOrdersChartProps {
  operator: string;
  Correctius: number;
  Preventius: number;
}

export interface AssetChartProps {
  asset: string;
  Correctius: number;
  Preventius: number;
  number: number;
}

export interface ConsumedSparePartsChartProps {
  sparePart: string;
  number: number;
  totalStock: number;
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

const Filter = [
  { key: 0, label: 'Mensual' },
  { key: 1, label: 'Setmanal' },
  { key: 2, label: 'Dia' },
];

export interface DashboardMM {
  loginUser: LoginUser;
}

export const DashboardMM: React.FC<DashboardMM> = ({ loginUser }) => {
  const operatorService = new OperatorService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const currentDate = dayjs().startOf('day').toDate();

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

  const [chartData, setChartData] = useState<any[]>([]);
  const [chartAssets, setChartAssets] = useState<any[]>([]);
  const [chartConsumedSpareParts, setChartConsumedSpareParts] = useState<any[]>(
    []
  );
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
  const [selectedFilter, setSelectedFilter] = useState<number | null>(0);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [totalCosts, setTotalCosts] = useState<number>(0);

  const firstDayOfMonth = dayjs().startOf('month').toDate();
  const firstDayOfWeek = dayjs().startOf('isoWeek').toDate();

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

  const handleFilterClick = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filter = parseInt(e.target.value, 10);
    if (filter === selectedFilter) return;

    setSelectedFilter(filter);
    switch (filter) {
      case 0:
        fetchData(firstDayOfMonth);
        break;
      case 1:
        fetchData(firstDayOfWeek);
        break;
      case 2:
        fetchData(currentDate);
        break;
      default:
        break;
    }
  };

  async function fetchData(date: Date) {
    setIsLoading(true);

    if (!dateFilters.startDate || !dateFilters.endDate) {
      return;
    }

    const operators = await operatorService.getOperators();

    setChartAssets([]);
    setChartConsumedSpareParts([]);
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
      getTopAssets(response);

      getTopConsumedSpareParts(response);

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

        if (workOrder.workOrderType != WorkOrderType.Ticket) {
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
        }

        const operatorId = workOrder.operatorId?.map(op => op) || [];

        operatorId.forEach(operatorName => {
          const existingOperator = operatorMap.get(operatorName);

          if (existingOperator) {
            if (workOrder.workOrderType === WorkOrderType.Preventive) {
              existingOperator.Preventius++;
            } else if (workOrder.workOrderType === WorkOrderType.Corrective) {
              existingOperator.Correctius++;
            }
          } else {
            const newOperatorEntry: WorkOrdersChartProps = {
              operator:
                operators.find(x => x.id === operatorName)?.name || 'Proves',
              Preventius:
                workOrder.workOrderType === WorkOrderType.Preventive ? 1 : 0,
              Correctius:
                workOrder.workOrderType === WorkOrderType.Corrective ? 1 : 0,
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
    setTotalCosts(totalCosts);
  };

  const calculateTotalCosts = (workOrder: WorkOrder) => {
    let totalCosts = 0;

    workOrder.workOrderSpareParts?.forEach(sparePart => {
      totalCosts += sparePart.quantity * 94.32;
      //sparePart.sparePart.price;
    });

    return totalCosts;
  };

  useEffect(() => {
    if (loginUser?.permission == UserPermission.Administrator) {
      fetchData(firstDayOfMonth);
      const initialWorkOrderTypes = validStates.map(state => ({
        statWorkOrder: state,
        value: 0,
        color: stateColors[state],
      }));
      setWorkOrderState(initialWorkOrderTypes);
    }
  }, []);

  function getTopAssets(workOrders: WorkOrder[], top: number = 3) {
    const assetMap = new Map<string, AssetChartProps>();

    workOrders
      .filter(x => x.active == true)
      .forEach(workOrder => {
        const asset = workOrder.asset?.description;
        if (asset) {
          const existingAsset = assetMap.get(asset);
          if (existingAsset) {
            if (workOrder.workOrderType === WorkOrderType.Preventive) {
              existingAsset.Preventius++;
            }
            if (workOrder.workOrderType === WorkOrderType.Corrective) {
              existingAsset.Correctius++;
            }
            existingAsset.number++;
          } else {
            const newAssetEntry: AssetChartProps = {
              asset: asset,
              number: 1,
              Preventius:
                workOrder.workOrderType === WorkOrderType.Preventive ? 1 : 0,
              Correctius:
                workOrder.workOrderType === WorkOrderType.Corrective ? 1 : 0,
            };
            assetMap.set(asset, newAssetEntry);
          }
        }
      });

    const sortedAssets = Array.from(assetMap.values()).sort(
      (a, b) => b.Correctius - a.Correctius
    );

    setChartAssets(sortedAssets.slice(0, top));
  }

  function getTopConsumedSpareParts(workOrders: WorkOrder[], top: number = 3) {
    const consumedSparePartsMap = new Map<
      string,
      ConsumedSparePartsChartProps
    >();

    workOrders.forEach(workOrder => {
      const consumedSpareParts = workOrder.workOrderSpareParts?.map(
        sparePart => sparePart
      );

      if (consumedSpareParts) {
        consumedSpareParts.forEach(consumedSparePart => {
          const existingConsumedSparePart = consumedSparePartsMap.get(
            consumedSparePart.sparePart.code +
              ' - ' +
              consumedSparePart.sparePart.description
          );
          if (existingConsumedSparePart) {
            existingConsumedSparePart.number += consumedSparePart.quantity;
          } else {
            const newConsumedSparePartEntry: ConsumedSparePartsChartProps = {
              sparePart:
                consumedSparePart.sparePart.code +
                ' - ' +
                consumedSparePart.sparePart.description,
              number: consumedSparePart.quantity,
              totalStock: consumedSparePart.sparePart.stock,
            };
            consumedSparePartsMap.set(
              consumedSparePart.sparePart.code +
                ' - ' +
                consumedSparePart.sparePart.description,
              newConsumedSparePartEntry
            );
          }
        });
      }

      const sortedSpareParts = Array.from(consumedSparePartsMap.values()).sort(
        (a, b) => b.number - a.number
      );
      setChartConsumedSpareParts(sortedSpareParts.slice(0, top));
    });
  }

  const totalPreventive = workOrderTypeChartData
    .filter(x => x.workOrderType == WorkOrderType.Preventive)
    .reduce((acc, item) => acc + item.value, 0);
  const totalCorrective = workOrderTypeChartData
    .filter(x => x.workOrderType == WorkOrderType.Corrective)
    .reduce((acc, item) => acc + item.value, 0);

  if (isLoading) return <SvgSpinner className="w-full text-white" />;

  if (loginUser?.permission !== UserPermission.Administrator) return <></>;
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-col gap-4 w-full items-center p-2">
        <div className="flex justify-start w-full gap-2 py-4">
          {/*} <div className="flex justify-center items-center">
            <select
              className="border-2 border-okron-main text-okron-main bg-transparent rounded-md p-3 w-40 focus:outline-none focus:ring-2 focus:ring-okron-main cursor-pointer"
              value={selectedFilter !== null ? selectedFilter : 0}
              onChange={handleFilterClick}
            >
              {Filter.map(filter => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>*/}

          <div className="flex flex-col lg:flex-row bg-white shadow-md rounded-lg p-4 w-full ml-0  space-y-4 lg:space-y-0 lg:divide-x-2 divide-gray-200">
            <div className="flex items-center w-full lg:justify-start px-0 lg:pr-6">
              {/*<span className="font-bold ml-2">
                {selectedFilter === 0
                  ? formatDate(firstDayOfMonth, false)
                  : selectedFilter === 1
                  ? formatDate(firstDayOfWeek, false)
                  : currentDate.toLocaleDateString('en-GB')}{' '}
                {' - '} {currentDate.toLocaleDateString('en-GB')}
              </span>*/}
              <div className="flex ml-4">
                <DateFilter
                  dateFilters={dateFilters}
                  setDateFilters={setDateFilters}
                  startTimeClassName="text-gray-500 font-semibold"
                  endTimeClassName="text-gray-500 font-semibold"
                />
                <Button
                  type="create"
                  customStyles="flex ml-4"
                  onClick={fetchData}
                >
                  {t('search')}
                </Button>
              </div>
            </div>
            <div className="flex items-center w-full lg:justify-start px-0 lg:px-6">
              <span className="text-gray-500 font-semibold">
                {t('minutes')}:
              </span>
              <span className="font-bold ml-2">
                {Math.round(totalMinutes).toLocaleString().replace(',', '.')}
              </span>
            </div>

            <div className="flex items-center w-full lg:justify-start px-0 lg:pl-6">
              <span className="text-gray-500 font-semibold">
                {t('cost.material')}:
              </span>
              <span className="font-bold ml-2">
                {Math.round(totalCosts).toLocaleString().replace(',', '.')} €
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-white w-full  ">
          {workOrderState.map(workOrderType => (
            <div
              key={workOrderType.statWorkOrder}
              className={`flex flex-col justify-center gap-4 p-2 bg-gray-900 w-full  ${workOrderType.color} rounded`}
            >
              <div className="flex w-full items-center justify-center">
                <p className="text-lg font-semibold text-white">
                  {translateStateWorkOrder(workOrderType.statWorkOrder, t)}
                </p>
              </div>
              <div className="flex w-full items-center justify-around">
                <p className="text-lg font-semibold text-white">
                  {workOrderType.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ButtonsSections
        selectedButton={selectedButton}
        handleButtonClick={handleButtonClick}
      />
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
        <div className="flex flex-col lg:flex-row flex-grow gap-4">
          <div className="flex w-full bg-white rounded-xl p-2 border-2">
            <DonutChartComponent
              chartData={workOrderTypeChartData}
              title={`${t('corrective')} vs ${t(
                'preventive'
              )} (${totalCorrective} / ${totalPreventive})`}
              t={t}
            />
          </div>
          <div className="flex w-full bg-white rounded-xl p-2 border-2">
            <BarChartComponent
              category={['Preventius', 'Correctius']}
              chartData={chartData}
              index="operator"
              title={t('work.orders.per.operator')}
            />
          </div>
        </div>
      )}
    </div>
  );
};
