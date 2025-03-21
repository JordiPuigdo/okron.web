'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { SubmitHandler, useForm } from 'react-hook-form';
import ModalDowntimeReasons from 'app/(pages)/corrective/components/ModalDowntimeReasons';
import ModalGenerateCorrective from 'app/(pages)/corrective/components/ModalGenerateCorrective';
import { useAssetHook } from 'app/hooks/useAssetHook';
import { SvgSpinner } from 'app/icons/icons';
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
import WorkOrderService from 'app/services/workOrderService';
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
enum Tab {
  OPERATORTIMES = 'Temps Operaris',
  COMMENTS = 'Comentaris',
  SPAREPARTS = 'Recanvis',
  INSPECTIONPOINTS = "Punts d'Inspecció",
  EVENTSWORKORDER = 'Events',
}

const WorkOrderEditForm: React.FC<WorkOrdeEditFormProps> = ({ id }) => {
  const { register, handleSubmit, setValue } = useForm<WorkOrder>({});
  const router = useRouter();
  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder>();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { isModalOpen, setIsModalOpen } = useGlobalStore(state => state);
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
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
  const [activeTab, setActiveTab] = useState<Tab>(Tab.OPERATORTIMES);
  const { operatorLogged } = useSessionStore(state => state);
  const [workOrderTimeExceeded, setWorkOrderTimeExceeded] =
    useState<boolean>(false);
  const [showDowntimeReasonsModal, setShowDowntimeReasonsModal] =
    useState(false);
  const [showModal, setShowModal] = useState(false);

  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(
    undefined
  );

  const { assets, assetsError, fetchAllAssets } = useAssetHook();

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
            responseWorkOrder.stateWorkOrder == StateWorkOrder.Finished ||
              responseWorkOrder.stateWorkOrder ==
                StateWorkOrder.PendingToValidate
              ? true
              : false
          );
          setCurrentWorkOrder(responseWorkOrder);
          setWorkOrderTimeExceeded(isWorkOrderTimeExceeded(responseWorkOrder));
          loadForm(responseWorkOrder);
        }
      })
      .catch(e => {
        setErrorMessage('Error carregant les dades ' + e.message);
      });
  }

  async function fetchSparePart() {
    await sparePartService
      .getSpareParts()
      .then(parts => {
        setAvailableSpareParts(parts);
      })
      .catch(e => {
        setErrorMessage('Error carregant les dades dels recanvis ' + e.message);
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
        setErrorMessage('Error carregant les dades ' + e.message);
      });
  }

  async function handleDeleteWordOrder() {
    toggleLoading('DELETE');
    const isConfirmed = window.confirm(
      'Segur que voleu eliminar aquest ordre de treball?'
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
      setValue('startTime', responseWorkOrder.startTime);
      setValue('downtimeReason', responseWorkOrder.downtimeReason);
      setValue('visibleReport', responseWorkOrder.visibleReport);

      setSelectedAssetId(responseWorkOrder.asset!.id);
      const finalData = new Date(responseWorkOrder.startTime);
      setStartDate(finalData);
      const operatorsToAdd = aviableOperators?.filter((operator: any) =>
        responseWorkOrder.operatorId!.includes(operator.id)
      );
      setSelectedOperators(prevSelected => [
        ...prevSelected,
        ...operatorsToAdd!,
      ]);

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
    if (aviableOperators && availableSpareParts.length > 0) fetchWorkOrder();
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

    return totalMilliseconds > plannedDurationMilliseconds;
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
        resolve('Falta seleccionar almenys un operari');
      }

      const hasChangeState =
        hasDefaultReason &&
        data.stateWorkOrder === StateWorkOrder.PendingToValidate;

      if (hasChangeState) {
        resolve('L’estat de l’ordre no ha canviat correctament');
      }

      // No issues found
      resolve('');
    });
  }

  const onSubmit: SubmitHandler<WorkOrder> = async data => {
    toggleLoading('SAVE');
    const errorMessage = isValidData(data);
    if ((await errorMessage).length > 0) {
      alert('Has de seleccionar almenys un operari');
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
        startTime: startDate || new Date(),
        operatorCreatorId:
          operatorLogged?.idOperatorLogged ||
          (selectedOperators.length > 0 ? selectedOperators[0].id : ''),
        originWorkOrder:
          loginUser?.userType != undefined
            ? loginUser.userType
            : UserType.Maintenance,
        downtimeReason: data.downtimeReason,
        visibleReport: data.visibleReport,
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
    setSelectedOperators([...selectedOperators, operator!]);
    setValue('operatorId', selectedOperators.map(x => x.id).concat(','));
  }

  function handleDeleteSelectedOperator(operatorId: string) {
    setSelectedOperators(prevSelected =>
      prevSelected.filter(x => x.id !== operatorId)
    );
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
      alert("Tens el motiu per defecte, no pots canviar l'estat");
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
                ? 'Ticket'
                : 'Ordre de Treball'}{' '}
              - {currentWorkOrder?.code}
            </span>
          </div>
          <div>
            <span className="text-xl font-bold text-black mx-auto">
              Equip - {currentWorkOrder?.asset?.description}
            </span>
          </div>
        </div>
        {errorMessage !== '' && (
          <p className="text-red-500 text-xl">{errorMessage}</p>
        )}
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
                  Temps d'execució excedit
                </div>
              )}
            </div>
            <div className="w-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 py-2"
              >
                Descripció
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
            <div>
              <label
                htmlFor="stateWorkOrder"
                className="block text-sm font-medium text-gray-700 py-2"
              >
                Estat
              </label>
              <select
                {...register('stateWorkOrder', { valueAsNumber: true })}
                className="p-3 text-sm border border-gray-300 rounded-md w-full"
                onChange={handleStateChange}
                disabled={!isDisabledField}
              >
                {getAvailableStates().map(state => (
                  <option key={state} value={state}>
                    {translateStateWorkOrder(state)}
                  </option>
                ))}
              </select>
            </div>
            <div className="">
              <label
                htmlFor="stateWorkOrder"
                className="block text-sm font-medium text-gray-700 py-2"
              >
                Data Inici
              </label>
              <DatePicker
                disabled={isDisabledField}
                id="startDate"
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
                  Operaris
                </label>

                {aviableOperators !== undefined &&
                  aviableOperators?.length > 0 && (
                    <ChooseElement
                      elements={aviableOperators!
                        .filter(x => x.operatorType == OperatorType.Maintenance)
                        .map(x => ({
                          id: x.id,
                          description: x.name,
                        }))}
                      onDeleteElementSelected={handleDeleteSelectedOperator}
                      onElementSelected={handleSelectOperator}
                      placeholder={'Selecciona un Operari'}
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
                    Motiu Aturada
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
                    Visible Report
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
            {loginUser?.permission == UserPermission.Administrator && (
              <>
                <Button
                  onClick={() => handleSubmitForm()}
                  type="create"
                  customStyles="flex"
                >
                  {isLoading['SAVE'] ? (
                    <SvgSpinner className="text-white" />
                  ) : (
                    'Actualitzar'
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
                    'Eliminar'
                  )}
                </Button>
                <Button
                  href={`${Routes.configuration.assets}/${currentWorkOrder?.asset?.id}`}
                  type="none"
                  className="bg-blue-700 hover:bg-blue-900 text-white font-semibold p2- rounded-l"
                  customStyles="flex"
                  onClick={() => toggleLoading('SEEACTIVE')}
                >
                  {isLoading['SEEACTIVE'] ? (
                    <SvgSpinner className="text-white" />
                  ) : (
                    'Veure Actiu'
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
                        'Veure Revisió'
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
                Crear Avaria
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
                  Veure Tiquet
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
                  Veure Avaria
                </Button>
              </Link>
            )}
          </div>
        </form>
      </>
    );
  };

  const availableTabs = Object.values(Tab).filter(tab => {
    if (currentWorkOrder?.workOrderType === WorkOrderType.Corrective) {
      return tab !== Tab.INSPECTIONPOINTS;
    } else if (currentWorkOrder?.workOrderType === WorkOrderType.Preventive) {
      return tab !== Tab.SPAREPARTS;
    }
  });

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

  if (!currentWorkOrder) return <>Carregant Dades</>;
  return (
    <div className="pt-4">
      {renderHeader()}
      <div className="flex gap-2 rounded bg-blue-900 my-2 p-2">
        <div className="flex flex-col w-full gap-2 ">
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
              isFinished={
                currentWorkOrder.stateWorkOrder == StateWorkOrder.Finished ||
                currentWorkOrder.stateWorkOrder ==
                  StateWorkOrder.PendingToValidate ||
                currentWorkOrder.stateWorkOrder == StateWorkOrder.Waiting
              }
            />
          </div>
        )}
        <div className="flex flex-grow w-full">
          {currentWorkOrder.workOrderType === WorkOrderType.Preventive && (
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
          )}
          {currentWorkOrder.workOrderType === WorkOrderType.Corrective && (
            <ChooseSpareParts
              availableSpareParts={availableSpareParts}
              selectedSpareParts={selectedSpareParts}
              setSelectedSpareParts={setSelectedSpareParts}
              WordOrderId={currentWorkOrder.id}
              isFinished={isFinished}
            />
          )}
        </div>
      </div>
      <div className="py-2 p-2 bg-blue-900 rounded-lg shadow-md  w-full  flex flex-col">
        {currentWorkOrder &&
          loginUser?.permission == UserPermission.Administrator && (
            <div className="flex flex-col  bg-gray-100 rounded-lg shadow-md justify-start">
              <div className="flex flex-row gap-4 p-4">
                <div
                  className="text-gray-600 font-semibold text-lg w-[20%]"
                  onClick={toggleSortOrder}
                >
                  Data Acció {sortOrder === 'asc' ? '▲' : '▼'}
                </div>
                <div className="text-gray-600 font-semibold w-[20%] text-lg">
                  Acció
                </div>
                <div className="text-gray-600 font-semibold w-[20%] text-lg">
                  Operari
                </div>
                <div
                  className="text-gray-600 font-semibold text-lg w-[20%]"
                  onClick={toggleSortOrder}
                >
                  Final
                </div>
                <div className="text-gray-600 font-semibold w-[20%] text-lg">
                  Total
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
                      {translateWorkOrderEventType(x.workOrderEventType)}
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
                              new Date(x.endDate)
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
