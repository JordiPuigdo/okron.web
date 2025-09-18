'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { SubmitHandler, useForm } from 'react-hook-form';
import ModalDowntimeReasons from 'app/(pages)/corrective/components/ModalDowntimeReasons';
import ModalGenerateCorrective from 'app/(pages)/corrective/components/ModalGenerateCorrective';
import { usePermissions } from 'app/hooks/usePermissions';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgPrint } from 'app/icons/designSystem/SvgPrint';
import { SvgSave } from 'app/icons/designSystem/SvgSave';
import { SvgClose, SvgSpinner } from 'app/icons/icons';
import Operator, { OperatorType } from 'app/interfaces/Operator';
import { DowntimesReasons } from 'app/interfaces/Production/Downtimes';
import SparePart from 'app/interfaces/SparePart';
import { UserPermission, UserType } from 'app/interfaces/User';
import WorkOrder, {
  OriginWorkOrder,
  StateWorkOrder,
  UpdateWorkOrderRequest,
  WorkOrderComment,
  WorkOrderEvents,
  WorkOrderEventType,
  WorkOrderInspectionPoint,
  WorkOrderOperatorTimes,
  WorkOrderSparePart,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import OperatorService from 'app/services/operatorService';
import SparePartService from 'app/services/sparePartService';
import { workOrderService } from 'app/services/workOrderService';
import { useGlobalStore, useSessionStore } from 'app/stores/globalStore';
import useRoutes from 'app/utils/useRoutes';
import {
  differenceBetweenDates,
  formatDate,
  translateStateWorkOrder,
  translateWorkOrderEventType,
} from 'app/utils/utils';
import ChooseElement from 'components/ChooseElement';
import { CostsObject } from 'components/Costs/CostsObject';
import CompleteInspectionPoints from 'components/inspectionPoint/CompleteInspectionPoint';
import WorkOrderOperatorComments from 'components/operator/WorkOrderCommentOperator';
import WorkOrderOperatorTimesComponent from 'components/operator/WorkOrderOperatorTimes';
import ChooseSpareParts from 'components/sparePart/ChooseSpareParts';
import ca from 'date-fns/locale/ca';
import { Button } from 'designSystem/Button/Buttons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import DowntimesComponent from './Downtimes/Downtimes';
import WorkOrderButtons from './WorkOrderButtons';

type WorkOrdeEditFormProps = {
  id: string;
};
interface TabWO {
  key: string;
  permission: UserPermission;
}
const WorkOrderEditForm: React.FC<WorkOrdeEditFormProps> = ({ id }) => {
  const { t } = useTranslations();
  
  const getTabLabels = () => ({
    OPERATORTIMES: t('workOrders.operatorTimes'),
    COMMENTS: t('workOrders.comments'),
    SPAREPARTS: t('workOrders.spareParts'),
    INSPECTIONPOINTS: t('workOrders.inspectionPoints'),
    EVENTSWORKORDER: t('workOrders.events'),
  });
  const { register, handleSubmit, setValue } = useForm<WorkOrder>({});
  const tabLabels = getTabLabels();
  const { filterOperatorTypesWorkOrder, workorderHeader, isAdmin, isCRM } =
    usePermissions();
  const router = useRouter();
  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder>();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { isModalOpen, setIsModalOpen } = useGlobalStore(state => state);

  const operatorService = new OperatorService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const sparePartService = new SparePartService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const [aviableOperators, setAviableOperators] = useState<
    Operator[] | undefined
  >(undefined);
  const [availableSpareParts, setAvailableSpareParts] = useState<SparePart[]>(
    []
  );
  const [selectedSpareParts, setSelectedSpareParts] = useState<
    WorkOrderSparePart[]
  >([]);

  const [inspectionPoints, setInspectionPoints] = useState<
    WorkOrderInspectionPoint[]
  >([]);
  const [passedInspectionPoints, setPassedInspectionPoints] = useState<
    WorkOrderInspectionPoint[]
  >([]);

  const [workOrderOperatorTimes, setworkOrderOperatorTimes] = useState<
    WorkOrderOperatorTimes[]
  >([]);

  const [workOrderComments, setWorkOrderComments] = useState<
    WorkOrderComment[]
  >([]);
  const [workOrderEvents, setWorkOrderEvents] = useState<WorkOrderEvents[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<Operator[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [isFinished, setIsFinished] = useState(false);
  const { loginUser } = useSessionStore(state => state);
  const [totalCosts, setTotalCosts] = useState<number>(0);
  const [sparePartCosts, setSparePartCosts] = useState<number>(0);
  const [operatorCosts, setOperatorCosts] = useState<number>(0);
  const Routes = useRoutes();
  const { operatorLogged } = useSessionStore(state => state);
  const [workOrderTimeExceeded, setWorkOrderTimeExceeded] =
    useState<boolean>(false);
  const [showDowntimeReasonsModal, setShowDowntimeReasonsModal] =
    useState(false);
  const [showModal, setShowModal] = useState(false);
  const { config } = useSessionStore();

  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (!isModalOpen) {
      setShowModal(false);
      setShowDowntimeReasonsModal(false);
    }
  }, [isModalOpen]);

  async function fetchWorkOrder() {
    await workOrderService
      .getWorkOrderById(id)
      .then(responseWorkOrder => {
        if (responseWorkOrder) {
          setIsFinished(
            (responseWorkOrder.stateWorkOrder == StateWorkOrder.Finished ||
              responseWorkOrder.stateWorkOrder ==
                StateWorkOrder.PendingToValidate) &&
              !isAdmin()
              ? true
              : false
          );
          setCurrentWorkOrder(responseWorkOrder);
          setWorkOrderTimeExceeded(isWorkOrderTimeExceeded(responseWorkOrder));
          loadForm(responseWorkOrder);
        }
      })
      .catch(e => {
        setErrorMessage(t('error.loading.data') + ' ' + e.message);
      });
  }

  async function fetchSparePart() {
    await sparePartService
      .getSpareParts()
      .then(parts => {
        setAvailableSpareParts(parts);
      })
      .catch(e => {
        setErrorMessage(t('error.loading.spare.parts') + ' ' + e.message);
      });
  }
  async function fetchOperators() {
    await operatorService
      .getOperators()
      .then(responseOperators => {
        if (responseOperators) {
          setAviableOperators(responseOperators);
          return responseOperators;
        }
      })
      .catch(e => {
        setErrorMessage(t('error.loading.data') + ' ' + e.message);
      });
  }

  async function handleDeleteWordOrder() {
    toggleLoading('DELETE');
    const isConfirmed = window.confirm(
      t('confirm.delete.work.order')
    );
    if (isConfirmed) {
      await workOrderService.deleteWorkOrder(id);
      setShowSuccessMessage(true);
      setTimeout(() => {
        history.back();
      }, 2000);
    }
    toggleLoading('DELETE');
  }

  async function loadForm(responseWorkOrder: WorkOrder | null) {
    setSelectedSpareParts([]);
    setworkOrderOperatorTimes([]);
    setWorkOrderComments([]);
    setWorkOrderEvents([]);

    if (responseWorkOrder) {
      setValue('code', responseWorkOrder.code);
      setValue('description', responseWorkOrder.description);
      setValue('stateWorkOrder', responseWorkOrder.stateWorkOrder);
      const startTimeDate = new Date(responseWorkOrder.startTime);
      if (startTimeDate.getFullYear() > 1900 && !isNaN(startTimeDate.getTime())) {
        setValue('startTime', responseWorkOrder.startTime);
      } else {
        setValue('startTime', new Date().toISOString());
      }
      setValue('downtimeReason', responseWorkOrder.downtimeReason);
      setValue('visibleReport', responseWorkOrder.visibleReport);
      setValue('refCustomerId', responseWorkOrder.refCustomerId);
      const creationTimeDate = new Date(responseWorkOrder.creationTime);
      if (creationTimeDate.getFullYear() > 1900 && !isNaN(creationTimeDate.getTime())) {
        setValue('creationTime', responseWorkOrder.creationTime);
      } else {
        setValue('creationTime', new Date().toISOString());
      }

      if (responseWorkOrder.asset) {
        setSelectedAssetId(responseWorkOrder.asset!.id);
      }
      const finalData = new Date(responseWorkOrder.creationTime);
      if (finalData.getFullYear() > 1900 && !isNaN(finalData.getTime())) {
        setStartDate(finalData);
      } else {
        setStartDate(new Date());
      }

      const operatorsToAdd = aviableOperators?.filter((operator: any) =>
        responseWorkOrder.operatorId!.includes(operator.id)
      );
      setSelectedOperators(operatorsToAdd!);

      setWorkOrderEvents(prevSelected => [
        ...prevSelected,
        ...(responseWorkOrder.workOrderEvents || []).sort((a, b) => {
          const dateA = new Date(a.date) as Date;
          const dateB = new Date(b.date) as Date;
          return dateB.getTime() - dateA.getTime();
        }),
      ]);

      if (
        responseWorkOrder &&
        responseWorkOrder.workOrderSpareParts &&
        responseWorkOrder.workOrderSpareParts.length > 0
      ) {
        setSelectedSpareParts(prevSelected => [
          ...prevSelected,
          ...responseWorkOrder.workOrderSpareParts!,
        ]);
      }

      setPassedInspectionPoints(responseWorkOrder.workOrderInspectionPoint!);
      /*const x = responseWorkOrder.workOrderInspectionPoint?.map(
        (order) => order.inspectionPoint
      );
      if (x) setInspectionPoints(x!);*/
      if (responseWorkOrder.workOrderInspectionPoint?.length! > 0 || 0)
        setInspectionPoints(responseWorkOrder.workOrderInspectionPoint!);

      if (responseWorkOrder.workOrderComments?.length! > 0) {
        setWorkOrderComments(responseWorkOrder.workOrderComments!);
      }

      if (responseWorkOrder.workOrderOperatorTimes) {
        setworkOrderOperatorTimes(prevworkOrderOperatorTimes => {
          const newworkOrderOperatorTimes =
            responseWorkOrder.workOrderOperatorTimes!.map(t => ({
              operator: t.operator,
              startTime: t.startTime,
              endTime: t.endTime,
              id: t.id,
              totalTime: t.endTime
                ? formatTotaltime(t.startTime, t.endTime)
                : '',
              type: t.type,
            }));
          return [...prevworkOrderOperatorTimes, ...newworkOrderOperatorTimes];
        });
      }

      const operatorTimes = responseWorkOrder.workOrderOperatorTimes;
      const spareParts = responseWorkOrder.workOrderSpareParts;
      if (
        responseWorkOrder.workOrderOperatorTimes?.length ||
        0 > 0 ||
        responseWorkOrder.workOrderSpareParts?.length ||
        0 > 0
      ) {
        const costsOperator: number[] = [];
        operatorTimes?.forEach(x => {
          const startTime = new Date(x.startTime).getTime();
          if (x.endTime != undefined) {
            const endTime = new Date(x.endTime).getTime();

            if (endTime != undefined) {
              const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
              const costForOperator = hoursWorked * x.operator.priceHour;
              costsOperator.push(costForOperator);
            }
          }
        });
        const totalCostOperators = costsOperator?.reduce(
          (acc, x) => acc + x,
          0
        );

        const sparePartCosts = spareParts?.map(
          x => x.sparePart.price * x.quantity
        );
        const totalCostSpareParts =
          sparePartCosts?.length || 0 > 0
            ? sparePartCosts?.reduce((acc, price) => acc + price, 0)
            : 0;

        setSparePartCosts(parseFloat(totalCostSpareParts!.toFixed(2)));
        setOperatorCosts(parseFloat(totalCostOperators?.toFixed(2)));
        const total = totalCostOperators + totalCostSpareParts!;

        setTotalCosts(parseFloat(total.toFixed(2)));
      }
    }
  }

  const formatTotaltime = (startTime: Date, endTime: Date) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalTimeInMilliseconds = end.getTime() - start.getTime();
    const totalTimeInSeconds = Math.floor(totalTimeInMilliseconds / 1000);
    return `${Math.floor(totalTimeInSeconds / 3600)}h ${Math.floor(
      (totalTimeInSeconds % 3600) / 60
    )}m ${totalTimeInSeconds % 60}s`;
  };

  useEffect(() => {
    fetchSparePart();
    fetchOperators();
  }, []);

  useEffect(() => {
    if (aviableOperators) fetchWorkOrder();
  }, [aviableOperators, availableSpareParts]);

  function isWorkOrderTimeExceeded(workOrder: WorkOrder): boolean {
    const currentDate = new Date();
    let totalMilliseconds = 0;
    workOrder.workOrderEvents?.forEach(event => {
      if (event.workOrderEventType === WorkOrderEventType.Started) {
        const startDate = new Date(event.date);
        const endDate = event.endDate ? new Date(event.endDate) : currentDate;
        totalMilliseconds += endDate.getTime() - startDate.getTime();
      }
    });

    const plannedDurationMilliseconds = parseDuration(
      workOrder.plannedDuration
    );

    return plannedDurationMilliseconds == 0
      ? false
      : totalMilliseconds > plannedDurationMilliseconds;
  }

  function parseDuration(duration: string): number {
    const [hours, minutes] = duration.split(':').map(Number);
    return (hours * 3600 + minutes * 60) * 1000;
  }

  const handleSubmitForm = async () => {
    handleSubmit(onSubmit)();
  };

  function toggleLoading(id: string) {
    setIsLoading(prevLoading => ({ ...prevLoading, [id]: !prevLoading[id] }));
  }

  function isValidData(data: WorkOrder): Promise<string> {
    return new Promise(resolve => {
      const workOrderHasOperators =
        currentWorkOrder?.workOrderType !== WorkOrderType.Ticket &&
        selectedOperators.length === 0;

      if (workOrderHasOperators) {
        resolve(t('error.select.operator'));
      }

      const hasChangeState =
        hasDefaultReason &&
        data.stateWorkOrder === StateWorkOrder.PendingToValidate;

      if (hasChangeState) {
        resolve(t('error.state.not.changed'));
      }

      // No issues found
      resolve('');
    });
  }

  const onSubmit: SubmitHandler<WorkOrder> = async data => {
    toggleLoading('SAVE');
    const errorMessage = isValidData(data);
    if ((await errorMessage).length > 0) {
      alert(t('alert.select.operator'));
      toggleLoading('SAVE');
      return;
    }

    try {
      const updatedWorkOrderData: UpdateWorkOrderRequest = {
        id: id,
        description: data.description,
        stateWorkOrder: data.stateWorkOrder,
        operatorId:
          selectedOperators.length > 0 ? selectedOperators.map(x => x.id) : [],
        creationTime: startDate || new Date(),
        operatorCreatorId:
          operatorLogged?.idOperatorLogged ||
          (selectedOperators.length > 0 ? selectedOperators[0].id : ''),
        originWorkOrder:
          loginUser?.userType != undefined
            ? loginUser.userType
            : UserType.Maintenance,
        downtimeReason: data.downtimeReason,
        visibleReport: data.visibleReport,
        refCustomerId: data.refCustomerId,
      };
      await workOrderService.updateWorkOrder(updatedWorkOrderData);

      setShowSuccessMessage(true);
      setShowErrorMessage(false);
    } catch (error) {
      setTimeout(() => {
        toggleLoading('SAVE');
        setShowErrorMessage(false);
      }, 3000);
      setShowSuccessMessage(false);
      setShowErrorMessage(true);
    }
    setTimeout(() => {
      toggleLoading('SAVE');
      fetchWorkOrder();
    }, 2000);
  };

  function handleSelectOperator(operatorId: string) {
    const operator = aviableOperators?.find(x => x.id === operatorId);
    const updatedOperators = [...selectedOperators, operator!];
    setSelectedOperators(updatedOperators);
    setValue('operatorId', updatedOperators.map(x => x.id).concat(','));
  }

  function handleDeleteSelectedOperator(operatorId: string) {
    const updatedOperators = selectedOperators.filter(x => x.id !== operatorId);
    setSelectedOperators(updatedOperators);
    setValue('operatorId', updatedOperators.map(x => x.id).concat(','));
  }

  const hasDefaultReason =
    currentWorkOrder?.downtimeReason != undefined &&
    currentWorkOrder.downtimeReason.machineId == '';

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = parseInt(event.target.value, 10);

    if (
      selectedValue === StateWorkOrder.PendingToValidate &&
      hasDefaultReason
    ) {
      setValue('stateWorkOrder', currentWorkOrder!.stateWorkOrder);
      alert(t('alert.default.reason'));
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex p-4 items-center flex-col sm:flex-row bg-white rounded shadow-md border-2 border-blue-900">
        <div
          className="cursor-pointer mb-4 sm:mb-0"
          onClick={() => router.back()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 inline-block mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </div>
        <div className="items-center text-center w-full">
          <div className="mb-4">
            <span className="text-2xl font-bold text-black mx-auto">
              {currentWorkOrder?.workOrderType == WorkOrderType.Ticket
                ? t('ticket')
                : t('work.order')}{' '}
              - {currentWorkOrder?.code}
            </span>
          </div>
          <div>
            <span className="text-xl font-bold text-black mx-auto">
              {workorderHeader(currentWorkOrder!)}
            </span>
          </div>
        </div>
        {errorMessage !== '' && (
          <p className="text-red-500 text-xl">{errorMessage}</p>
        )}
        <div>
          <Link
            href={`/print/workorder?id=${currentWorkOrder?.id}&urlLogo=${config?.company.urlLogo}`}
            passHref
            target="_blank"
          >
            <SvgPrint className="text-black hover:text-blue-900" />
          </Link>
        </div>
      </div>
    );
  };

  const isDisabledField =
    isFinished || currentWorkOrder?.stateWorkOrder == StateWorkOrder.Closed;

  const renderForm = () => {
    const getAvailableStates = () => {
      if (currentWorkOrder?.workOrderType === WorkOrderType.Ticket) {
        return [StateWorkOrder.Open, StateWorkOrder.Closed];
      }

      if (isFinished) {
        return [currentWorkOrder?.stateWorkOrder];
      }

      return Object.values(StateWorkOrder).filter(
        value =>
          typeof value === 'number' &&
          value !== StateWorkOrder.Open &&
          value !== StateWorkOrder.Closed
      );
    };
    return (
      <>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white flex-grow rounded-lg p-4 shadow-md"
        >
          <div className="flex flex-col w-full">
            <div>
              {workOrderTimeExceeded && (
                <div className="text-red-500 text-center">
                  {t('workorder.execution.time.exceeded')}
                </div>
              )}
            </div>
            <div className="w-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 py-2"
              >
                {t('description')}
              </label>
              <input
                {...register('description')}
                type="text"
                id="description"
                name="description"
                className="p-3 border text-sm border-gray-300 rounded-md w-full"
                disabled={isDisabledField}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            {isCRM && (
              <>
                <div className="w-full">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 py-2"
                  >
                    {t('client.ref')}
                  </label>
                  <input
                    {...register('refCustomerId')}
                    type="text"
                    id="refCustomerId"
                    name="refCustomerId"
                    className="p-3 border text-sm border-gray-300 rounded-md w-full"
                    disabled={isDisabledField}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 py-2"
                  >
                    {t('store')}
                  </label>
                  <div className="flex flex-col gap-2">
                    <p>
                      {
                        currentWorkOrder?.customerWorkOrder
                          ?.customerInstallationCode
                      }
                    </p>
                    <p>
                      {
                        currentWorkOrder?.customerWorkOrder
                          ?.customerInstallationAddress?.address
                      }
                    </p>
                    <p>
                      {
                        currentWorkOrder?.customerWorkOrder
                          ?.customerInstallationAddress?.city
                      }
                    </p>
                  </div>
                </div>
              </>
            )}
            <div>
              <label
                htmlFor="stateWorkOrder"
                className="block text-sm font-medium text-gray-700 py-2"
              >
                {t('state')}
              </label>
              <select
                {...register('stateWorkOrder', { valueAsNumber: true })}
                className="p-3 text-sm border border-gray-300 rounded-md w-full"
                onChange={handleStateChange}
                disabled={!isDisabledField}
              >
                {getAvailableStates().map(state => (
                  <option key={state} value={state}>
                    {translateStateWorkOrder(state, t)}
                  </option>
                ))}
              </select>
            </div>
            <div className="">
              <label
                htmlFor="stateWorkOrder"
                className="block text-sm font-medium text-gray-700 py-2"
              >
                {t('creation.date')}
              </label>
              <DatePicker
                disabled={isDisabledField}
                id="creationTime"
                selected={startDate}
                onChange={(date: Date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                locale={ca}
                className="p-3 border border-gray-300 rounded-md text-sm"
              />
            </div>
            {currentWorkOrder?.workOrderType != WorkOrderType.Ticket && (
              <div className="w-full">
                <label
                  htmlFor="operators"
                  className="block text-sm font-medium text-gray-700 py-2"
                >
                  {t('operators')}
                </label>
                {aviableOperators !== undefined &&
                  aviableOperators?.length > 0 && (
                    <ChooseElement
                      elements={filterOperatorTypesWorkOrder(
                        aviableOperators!
                      ).map(x => ({
                        id: x.id,
                        description: x.name,
                      }))}
                      onDeleteElementSelected={handleDeleteSelectedOperator}
                      onElementSelected={handleSelectOperator}
                      placeholder={t('select.operator')}
                      selectedElements={selectedOperators.map(x => x.id)}
                      mapElement={aviableOperators => ({
                        id: aviableOperators.id,
                        description: aviableOperators.description,
                      })}
                      disabled={isDisabledField}
                      className={
                        selectedOperators.length == 0 ? ' border-red-500 ' : ''
                      }
                    />
                  )}
              </div>
            )}
            {currentWorkOrder?.originWorkOrder ==
              OriginWorkOrder.Production && (
              <>
                <div className="w-full">
                  <label
                    htmlFor="operators"
                    className="block text-sm font-medium text-gray-700 py-2"
                  >
                    {t('downtime.reason')}
                  </label>
                  <input
                    className={`p-3 border text-sm border-gray-300 rounded-md w-full ${
                      currentWorkOrder.downtimeReason?.assetId == ''
                        ? 'border-red-500'
                        : ''
                    }`}
                    value={currentWorkOrder.downtimeReason?.description}
                    readOnly
                    onClick={() =>
                      !isDisabledField && setShowDowntimeReasonsModal(true)
                    }
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="operators"
                    className="block text-sm font-medium text-gray-700 py-2"
                  >
                    {t('visible.report')}
                  </label>
                  <input
                    type="checkbox"
                    className={`p-3 border text-sm border-gray-300 rounded-md w-[15px]`}
                    {...register('visibleReport')}
                  />
                </div>
              </>
            )}
          </div>
          <div className="py-4 flex gap-2">
            {isAdmin() && (
              <>
                <Button
                  onClick={() => handleSubmitForm()}
                  type="create"
                  customStyles="flex"
                >
                  {isLoading['SAVE'] ? (
                    <SvgSpinner className="text-white" />
                  ) : (
                    <SvgSave className="text-white w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() => handleDeleteWordOrder()}
                  type="delete"
                  customStyles="flex"
                >
                  {isLoading['DELETE'] ? (
                    <SvgSpinner className="text-white" />
                  ) : (
                    <SvgClose className="text-white w-4 h-4" />
                  )}
                </Button>

                <Button
                  href={`${Routes.configuration.assets}/${currentWorkOrder?.asset?.id}`}
                  type="none"
                  className="bg-blue-700 hover:bg-blue-900 text-white font-semibold p2- rounded-l"
                  customStyles="flex"
                  onClick={() => toggleLoading('SEEACTIVE')}
                  isHide={isCRM}
                >
                  {isLoading['SEEACTIVE'] ? (
                    <SvgSpinner className="text-white" />
                  ) : (
                    t('see.asset')
                  )}
                </Button>
                {currentWorkOrder?.workOrderType == WorkOrderType.Preventive &&
                  currentWorkOrder?.preventive?.id != undefined && (
                    <Button
                      href={`${Routes.preventive.configuration}/${currentWorkOrder?.preventive?.id}`}
                      type="none"
                      className="bg-blue-700 hover:bg-blue-900 text-white font-semibold p2- rounded-l"
                      customStyles="flex"
                      onClick={() => toggleLoading('SEEPREVENTIVE')}
                    >
                      {isLoading['SEEPREVENTIVE'] ? (
                        <SvgSpinner className="text-white" />
                      ) : (
                        t('see.preventive')
                      )}
                    </Button>
                  )}
              </>
            )}
            {((currentWorkOrder?.workOrderType == WorkOrderType.Ticket &&
              loginUser?.userType == UserType.Maintenance &&
              !currentWorkOrder?.workOrderCreatedId) ||
              (currentWorkOrder?.workOrderType == WorkOrderType.Preventive &&
                currentWorkOrder?.preventive?.id != undefined)) && (
              <Button
                type="none"
                className="bg-red-700 hover:bg-red-900 text-white font-semibold p2- rounded-l"
                customStyles="flex"
                onClick={() => {
                  setShowModal(true);
                }}
              >
                {t('create.corrective')}
              </Button>
            )}
            {currentWorkOrder?.originalWorkOrderId && (
              <Link
                href={`/workOrders/${currentWorkOrder.originalWorkOrderId}`}
                passHref
              >
                <Button
                  type="none"
                  className="bg-green-700 hover:bg-green-900 text-white font-semibold p2- rounded-l"
                  customStyles="flex"
                >
                  {t('see.ticket')}
                </Button>
              </Link>
            )}
            {currentWorkOrder?.workOrderCreatedId && (
              <Link
                href={`/workOrders/${currentWorkOrder.workOrderCreatedId}`}
                passHref
              >
                <Button
                  type="none"
                  className="bg-green-700 hover:bg-green-900 text-white font-semibold p2- rounded-l"
                  customStyles="flex"
                >
                  {t('see.corrective')}
                </Button>
              </Link>
            )}
          </div>
        </form>
      </>
    );
  };

  const [sortOrder, setSortOrder] = useState('asc');
  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
  };

  const sortedEvents = [...workOrderEvents].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (sortOrder === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });

  function onSelectedDowntimeReasons(downtimeReasons: DowntimesReasons) {
    setValue('downtimeReason', downtimeReasons);
    currentWorkOrder!.downtimeReason = downtimeReasons;
    handleSubmitForm();
    setShowDowntimeReasonsModal(false);
  }

  if (!currentWorkOrder) return <>{t('loading.data')}</>;
  return (
    <div className="pt-4">
      {renderHeader()}
      <div className="flex gap-2 rounded bg-blue-900 my-2 p-2">
        <div className="flex flex-col w-[70%] gap-2 ">
          {showDowntimeReasonsModal && (
            <ModalDowntimeReasons
              selectedId={currentWorkOrder.asset?.id || ''}
              onSelectedDowntimeReasons={onSelectedDowntimeReasons}
            />
          )}
          {renderForm()}
          {totalCosts > 0 &&
            loginUser?.permission == UserPermission.Administrator && (
              <div className="flex flex-grow p-2 bg-white rounded-lg">
                <CostsObject
                  operatorCosts={operatorCosts}
                  sparePartCosts={sparePartCosts}
                  totalCosts={totalCosts}
                />
              </div>
            )}
        </div>

        <div className="p-2 bg-white rounded-lg shadow-md  w-full  flex flex-col">
          {currentWorkOrder && (
            <>
              <div>
                <WorkOrderButtons
                  workOrder={currentWorkOrder}
                  handleReload={fetchWorkOrder}
                />
              </div>
              <div className="py-2">
                <WorkOrderOperatorComments
                  workOrderComments={workOrderComments}
                  workOrderId={currentWorkOrder.id}
                  isFinished={isFinished}
                  setWorkOrderComments={setWorkOrderComments}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className={`bg-blue-900 p-2 rounded-lg shadow-md flex gap-2 my-2 ${
          currentWorkOrder.workOrderType === WorkOrderType.Preventive
            ? 'flex-col md:flex-row '
            : 'flex-col '
        }`}
      >
        {currentWorkOrder?.originWorkOrder == OriginWorkOrder.Production &&
          currentWorkOrder.downtimes && (
            <DowntimesComponent
              downtimes={currentWorkOrder.downtimes}
              workOrderId={currentWorkOrder.id}
              currentWorkOrder={currentWorkOrder}
              loginUser={loginUser}
            />
          )}
        {currentWorkOrder?.workOrderType != WorkOrderType.Ticket && (
          <div className="flex w-full">
            <WorkOrderOperatorTimesComponent
              operators={aviableOperators!}
              workOrderOperatortimes={workOrderOperatorTimes}
              setWorkOrderOperatortimes={setworkOrderOperatorTimes}
              workOrderId={currentWorkOrder.id}
              isFinished={isFinished}
            />
          </div>
        )}
        {currentWorkOrder.workOrderType === WorkOrderType.Preventive && (
          <div className="flex flex-grow w-full">
            <CompleteInspectionPoints
              workOrderInspectionPoints={passedInspectionPoints!}
              setCompletedWorkOrderInspectionPoints={setPassedInspectionPoints}
              workOrderId={currentWorkOrder.id}
              isFinished={
                currentWorkOrder.stateWorkOrder == StateWorkOrder.Finished ||
                currentWorkOrder.stateWorkOrder ==
                  StateWorkOrder.PendingToValidate ||
                currentWorkOrder.stateWorkOrder == StateWorkOrder.Waiting
              }
              workOrder={currentWorkOrder}
            />
          </div>
        )}
      </div>
      <div className="flex flex-grow w-full p-2 bg-blue-900 rounded-lg shadow-md my-2">
        <ChooseSpareParts
          selectedSpareParts={selectedSpareParts}
          setSelectedSpareParts={setSelectedSpareParts}
          workOrder={currentWorkOrder}
          isFinished={isFinished}
        />
      </div>
      <div className="py-2 p-2 bg-blue-900 rounded-lg shadow-md  w-full  flex flex-col">
        {currentWorkOrder && isAdmin() && (
          <div className="flex flex-col  bg-gray-100 rounded-lg shadow-md justify-start">
            <div className="flex flex-row gap-4 p-4">
              <div
                className="text-gray-600 font-semibold text-lg w-[20%]"
                onClick={toggleSortOrder}
              >
                {t('action.date')} {sortOrder === 'asc' ? '▲' : '▼'}
              </div>
              <div className="text-gray-600 font-semibold w-[20%] text-lg">
                {t('action')}
              </div>
              <div className="text-gray-600 font-semibold w-[20%] text-lg">
                {t('operator')}
              </div>
              <div
                className="text-gray-600 font-semibold text-lg w-[20%]"
                onClick={toggleSortOrder}
              >
                {t('final')}
              </div>
              <div className="text-gray-600 font-semibold w-[20%] text-lg">
                {t('total')}
              </div>
            </div>
            {sortedEvents.map((x, index) => {
              return (
                <div
                  key={index}
                  className={`flex flex-row gap-4 p-4 rounded-lg items-center ${
                    index % 2 == 0 ? 'bg-gray-200' : ''
                  }`}
                >
                  <div className="text-gray-600 w-[20%]">
                    {formatDate(x.date)}
                  </div>
                  <div className=" w-[20%]">
                    {translateWorkOrderEventType(x.workOrderEventType, t)}
                  </div>
                  <div className="w-[20%]">{x.operator?.name || ''}</div>
                  <div className="text-gray-600 w-[20%]">
                    {formatDate(x.endDate)}
                  </div>
                  <div className="text-gray-600 w-[20%]">
                    {x.endDate != undefined && (
                      <span>
                        {
                          differenceBetweenDates(
                            new Date(x.date),
                            new Date(x.endDate),
                            t
                          ).fullTime
                        }
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showModal && (
        <ModalGenerateCorrective
          assetId={currentWorkOrder?.asset?.id!}
          description={currentWorkOrder.description}
          stateWorkOrder={StateWorkOrder.OnGoing}
          operatorIds={currentWorkOrder?.operatorId}
          originalWorkOrderId={currentWorkOrder.id}
          originalWorkOrderCode={currentWorkOrder.code}
        />
      )}
    </div>
  );
};

export default WorkOrderEditForm;
