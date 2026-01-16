'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { usePermissions } from 'app/hooks/usePermissions';
import { useTranslations } from 'app/hooks/useTranslations';
import Operator from 'app/interfaces/Operator';
import { DowntimesReasons } from 'app/interfaces/Production/Downtimes';
import SparePart from 'app/interfaces/SparePart';
import { UserType } from 'app/interfaces/User';
import WorkOrder, {
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

// ============================================================================
// TYPES
// ============================================================================

export interface UseWorkOrderFormProps {
  id: string;
}

export interface WorkOrderFormState {
  // Core data
  workOrder: WorkOrder | undefined;
  isLoading: boolean;
  isFinished: boolean;
  errorMessage: string;

  // Messages
  showSuccessMessage: boolean;
  showErrorMessage: boolean;

  // Available data
  availableOperators: Operator[];
  availableSpareParts: SparePart[];

  // Selected/Edited data
  selectedOperators: Operator[];
  selectedSpareParts: WorkOrderSparePart[];
  workOrderOperatorTimes: WorkOrderOperatorTimes[];
  workOrderComments: WorkOrderComment[];
  workOrderEvents: WorkOrderEvents[];
  passedInspectionPoints: WorkOrderInspectionPoint[];
  startDate: Date | null;

  // Calculated data
  costs: {
    operator: number;
    sparePart: number;
    total: number;
  };
  workOrderTimeExceeded: boolean;

  // Modals
  modals: {
    downtimeReasons: boolean;
    generateCorrective: boolean;
    changeCustomer: boolean;
  };

  // Loading states per action
  loadingStates: Record<string, boolean>;
  isUpdatingCustomer: boolean;
}

export interface WorkOrderFormActions {
  // Data fetching
  refresh: () => Promise<void>;

  // Form actions
  handleSubmit: () => Promise<void>;
  handleDelete: () => Promise<void>;

  // Operators
  selectOperator: (operatorId: string) => void;
  removeOperator: (operatorId: string) => void;

  // State changes
  handleStateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  setStartDate: (date: Date | null) => void;

  // Customer
  handleCustomerChange: (
    customerId: string,
    installationId: string
  ) => Promise<void>;

  // Downtime reasons
  selectDowntimeReason: (reason: DowntimesReasons) => void;

  // Modals
  openModal: (modal: keyof WorkOrderFormState['modals']) => void;
  closeModal: (modal: keyof WorkOrderFormState['modals']) => void;

  // Setters for child components
  setSelectedSpareParts: React.Dispatch<
    React.SetStateAction<WorkOrderSparePart[]>
  >;
  setWorkOrderOperatorTimes: React.Dispatch<
    React.SetStateAction<WorkOrderOperatorTimes[]>
  >;
  setWorkOrderComments: React.Dispatch<
    React.SetStateAction<WorkOrderComment[]>
  >;
  setPassedInspectionPoints: React.Dispatch<
    React.SetStateAction<WorkOrderInspectionPoint[]>
  >;
}

export interface UseWorkOrderFormReturn {
  state: WorkOrderFormState;
  actions: WorkOrderFormActions;
  form: ReturnType<typeof useForm<WorkOrder>>;
  permissions: {
    isAdmin: boolean;
    isCRM: boolean;
    canEdit: boolean;
    filterOperatorTypes: (operators: Operator[]) => Operator[];
    getHeaderText: (workOrder: WorkOrder) => string;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTotalTime(startTime: Date, endTime: Date): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const totalTimeInMilliseconds = end.getTime() - start.getTime();
  const totalTimeInSeconds = Math.floor(totalTimeInMilliseconds / 1000);
  const hours = Math.floor(totalTimeInSeconds / 3600);
  const minutes = Math.floor((totalTimeInSeconds % 3600) / 60);
  const seconds = totalTimeInSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function parseDuration(duration: string): number {
  if (!duration) return 0;
  const [hours, minutes] = duration.split(':').map(Number);
  return (hours * 3600 + minutes * 60) * 1000;
}

function calculateTimeExceeded(workOrder: WorkOrder): boolean {
  const currentDate = new Date();
  let totalMilliseconds = 0;

  workOrder.workOrderEvents?.forEach(event => {
    if (event.workOrderEventType === WorkOrderEventType.Started) {
      const startDate = new Date(event.date);
      const endDate = event.endDate ? new Date(event.endDate) : currentDate;
      totalMilliseconds += endDate.getTime() - startDate.getTime();
    }
  });

  const plannedDurationMs = parseDuration(workOrder.plannedDuration);
  return plannedDurationMs === 0 ? false : totalMilliseconds > plannedDurationMs;
}

function calculateCosts(workOrder: WorkOrder): {
  operator: number;
  sparePart: number;
  total: number;
} {
  const operatorTimes = workOrder.workOrderOperatorTimes || [];
  const spareParts = workOrder.workOrderSpareParts || [];

  // Calculate operator costs
  const operatorCostsArray: number[] = [];
  operatorTimes.forEach(x => {
    const startTime = new Date(x.startTime).getTime();
    if (x.endTime != undefined) {
      const endTime = new Date(x.endTime).getTime();
      const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
      const costForOperator = hoursWorked * x.operator.priceHour;
      operatorCostsArray.push(costForOperator);
    }
  });
  const totalOperatorCost = operatorCostsArray.reduce((acc, x) => acc + x, 0);

  // Calculate spare part costs
  const sparePartCostsArray = spareParts.map(x => x.sparePart.price * x.quantity);
  const totalSparePartCost =
    sparePartCostsArray.length > 0
      ? sparePartCostsArray.reduce((acc, price) => acc + price, 0)
      : 0;

  const total = totalOperatorCost + totalSparePartCost;

  return {
    operator: parseFloat(totalOperatorCost.toFixed(2)),
    sparePart: parseFloat(totalSparePartCost.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * useWorkOrderForm - Hook centralitzat per gestionar l'edició d'ordres de treball.
 *
 * Centralitza:
 * - Tots els estats (abans ~35 useState)
 * - Tota la lògica de fetching
 * - Totes les accions i handlers
 * - Càlculs derivats
 *
 * Principis SOLID:
 * - SRP: Gestiona només la lògica del formulari
 * - OCP: Extensible via el return type
 * - DIP: Depèn d'abstraccions (interfaces)
 */
export function useWorkOrderForm({
  id,
}: UseWorkOrderFormProps): UseWorkOrderFormReturn {
  const { t } = useTranslations();
  const { filterOperatorTypesWorkOrder, workorderHeader, isAdmin, isCRM } =
    usePermissions();
  const { loginUser, operatorLogged } = useSessionStore();
  const { isModalOpen } = useGlobalStore();

  // Form
  const form = useForm<WorkOrder>({});
  const { setValue, handleSubmit: formHandleSubmit } = form;

  // ========== STATE ==========

  // Core
  const [workOrder, setWorkOrder] = useState<WorkOrder>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Messages
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Available data
  const [availableOperators, setAvailableOperators] = useState<Operator[]>([]);
  const [availableSpareParts, setAvailableSpareParts] = useState<SparePart[]>([]);
  
  // Ref to avoid dependency issues in callbacks
  const availableOperatorsRef = useRef<Operator[]>([]);
  availableOperatorsRef.current = availableOperators;

  // Selected data
  const [selectedOperators, setSelectedOperators] = useState<Operator[]>([]);
  const [selectedSpareParts, setSelectedSpareParts] = useState<WorkOrderSparePart[]>([]);
  const [workOrderOperatorTimes, setWorkOrderOperatorTimes] = useState<WorkOrderOperatorTimes[]>([]);
  const [workOrderComments, setWorkOrderComments] = useState<WorkOrderComment[]>([]);
  const [workOrderEvents, setWorkOrderEvents] = useState<WorkOrderEvents[]>([]);
  const [passedInspectionPoints, setPassedInspectionPoints] = useState<WorkOrderInspectionPoint[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  // Loading states
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);

  // Modals
  const [modals, setModals] = useState({
    downtimeReasons: false,
    generateCorrective: false,
    changeCustomer: false,
  });

  // Services (memoized)
  const operatorService = useMemo(
    () => new OperatorService(process.env.NEXT_PUBLIC_API_BASE_URL!),
    []
  );
  const sparePartService = useMemo(
    () => new SparePartService(process.env.NEXT_PUBLIC_API_BASE_URL!),
    []
  );

  // ========== COMPUTED VALUES ==========

  const costs = useMemo(() => {
    if (!workOrder) return { operator: 0, sparePart: 0, total: 0 };
    return calculateCosts(workOrder);
  }, [workOrder]);

  const workOrderTimeExceeded = useMemo(() => {
    if (!workOrder) return false;
    return calculateTimeExceeded(workOrder);
  }, [workOrder]);

  const hasDefaultReason = useMemo(() => {
    return (
      workOrder?.downtimeReason != undefined &&
      workOrder.downtimeReason.machineId === ''
    );
  }, [workOrder]);

  // ========== LOADING HELPERS ==========

  const toggleLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ========== FETCH FUNCTIONS ==========

  const fetchOperators = useCallback(async () => {
    try {
      const operators = await operatorService.getOperators();
      if (operators) {
        setAvailableOperators(operators);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setErrorMessage(t('error.loading.data') + ' ' + message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSpareParts = useCallback(async () => {
    try {
      const parts = await sparePartService.getSpareParts();
      setAvailableSpareParts(parts);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setErrorMessage(t('error.loading.spare.parts') + ' ' + message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFormData = useCallback(
    (wo: WorkOrder) => {
      // Reset states
      setSelectedSpareParts([]);
      setWorkOrderOperatorTimes([]);
      setWorkOrderComments([]);
      setWorkOrderEvents([]);

      // Set form values
      setValue('code', wo.code);
      setValue('description', wo.description);
      setValue('stateWorkOrder', wo.stateWorkOrder);
      setValue('downtimeReason', wo.downtimeReason);
      setValue('visibleReport', wo.visibleReport);
      setValue('refCustomerId', wo.refCustomerId);

      // Dates
      const startTimeDate = new Date(wo.startTime);
      setValue(
        'startTime',
        startTimeDate.getFullYear() > 1900 ? startTimeDate : new Date()
      );

      const creationTimeDate = new Date(wo.creationTime);
      setValue(
        'creationTime',
        creationTimeDate.getFullYear() > 1900 ? creationTimeDate : new Date()
      );
      setStartDate(
        creationTimeDate.getFullYear() > 1900 ? creationTimeDate : new Date()
      );

      // Operators - use ref to avoid dependency issues
      const operatorsToAdd = availableOperatorsRef.current.filter(op =>
        wo.operatorId?.includes(op.id)
      );
      setSelectedOperators(operatorsToAdd);

      // Events
      const sortedEvents = [...(wo.workOrderEvents || [])].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      setWorkOrderEvents(sortedEvents);

      // Spare parts
      if (wo.workOrderSpareParts?.length) {
        setSelectedSpareParts(wo.workOrderSpareParts);
      }

      // Inspection points
      if (wo.workOrderInspectionPoint?.length) {
        setPassedInspectionPoints(wo.workOrderInspectionPoint);
      }

      // Comments
      if (wo.workOrderComments?.length) {
        setWorkOrderComments(wo.workOrderComments);
      }

      // Operator times
      if (wo.workOrderOperatorTimes) {
        const formattedTimes = wo.workOrderOperatorTimes.map(t => ({
          ...t,
          totalTime: t.endTime ? formatTotalTime(t.startTime, t.endTime) : '',
        }));
        setWorkOrderOperatorTimes(formattedTimes);
      }
    },
    [setValue]
  );

  const fetchWorkOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const wo = await workOrderService.getWorkOrderById(id);
      if (wo) {
        const finished =
          (wo.stateWorkOrder === StateWorkOrder.Finished ||
            wo.stateWorkOrder === StateWorkOrder.PendingToValidate) &&
          !isAdmin();
        setIsFinished(finished);
        setWorkOrder(wo);
        loadFormData(wo);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setErrorMessage(t('error.loading.data') + ' ' + message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ========== ACTIONS ==========

  const validateData = useCallback(
    (data: WorkOrder): string => {
      if (!operatorLogged) {
        return t('error.operator.required.action');
      }

      if (
        workOrder?.workOrderType !== WorkOrderType.Ticket &&
        selectedOperators.length === 0
      ) {
        return t('error.select.operator');
      }

      if (
        hasDefaultReason &&
        data.stateWorkOrder === StateWorkOrder.PendingToValidate
      ) {
        return t('error.state.not.changed');
      }

      return '';
    },
    [operatorLogged, workOrder, selectedOperators, hasDefaultReason, t]
  );

  const onSubmit: SubmitHandler<WorkOrder> = useCallback(
    async data => {
      toggleLoading('SAVE');

      const validationError = validateData(data);
      if (validationError) {
        alert(validationError);
        toggleLoading('SAVE');
        return;
      }

      try {
        const updateRequest: UpdateWorkOrderRequest = {
          id,
          description: data.description,
          stateWorkOrder: data.stateWorkOrder,
          operatorId: selectedOperators.map(x => x.id),
          creationTime: startDate || new Date(),
          operatorCreatorId:
            operatorLogged?.idOperatorLogged || selectedOperators[0]?.id || '',
          originWorkOrder: loginUser?.userType ?? UserType.Maintenance,
          downtimeReason: data.downtimeReason,
          visibleReport: data.visibleReport,
          refCustomerId: data.refCustomerId,
          active: data.active,
          userId: loginUser!.agentId,
          operatorLoggedId: operatorLogged!.idOperatorLogged,
        };

        await workOrderService.updateWorkOrder(updateRequest);
        setShowSuccessMessage(true);
        setShowErrorMessage(false);
      } catch {
        setShowSuccessMessage(false);
        setShowErrorMessage(true);
        setTimeout(() => {
          toggleLoading('SAVE');
          setShowErrorMessage(false);
        }, 3000);
      }

      setTimeout(() => {
        toggleLoading('SAVE');
        fetchWorkOrder();
      }, 2000);
    },
    [
      id,
      selectedOperators,
      startDate,
      operatorLogged,
      loginUser,
      validateData,
      toggleLoading,
      fetchWorkOrder,
    ]
  );

  const handleFormSubmit = useCallback(async () => {
    formHandleSubmit(onSubmit)();
  }, [formHandleSubmit, onSubmit]);

  const handleDelete = useCallback(async () => {
    toggleLoading('DELETE');
    const isConfirmed = window.confirm(t('confirm.delete.work.order'));
    if (isConfirmed) {
      await workOrderService.deleteWorkOrder(id);
      setShowSuccessMessage(true);
      setTimeout(() => history.back(), 2000);
    }
    toggleLoading('DELETE');
  }, [id, t, toggleLoading]);

  const selectOperator = useCallback(
    (operatorId: string) => {
      const operator = availableOperators.find(x => x.id === operatorId);
      if (operator) {
        const updated = [...selectedOperators, operator];
        setSelectedOperators(updated);
        setValue('operatorId', updated.map(x => x.id));
      }
    },
    [availableOperators, selectedOperators, setValue]
  );

  const removeOperator = useCallback(
    (operatorId: string) => {
      const updated = selectedOperators.filter(x => x.id !== operatorId);
      setSelectedOperators(updated);
      setValue('operatorId', updated.map(x => x.id));
    },
    [selectedOperators, setValue]
  );

  const handleStateChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = parseInt(event.target.value, 10);
      if (selectedValue === StateWorkOrder.PendingToValidate && hasDefaultReason) {
        setValue('stateWorkOrder', workOrder!.stateWorkOrder);
        alert(t('alert.default.reason'));
      }
    },
    [hasDefaultReason, setValue, workOrder, t]
  );

  const handleCustomerChange = useCallback(
    async (customerId: string, installationId: string) => {
      if (!workOrder) return;
      if (
        customerId === workOrder.customerWorkOrder?.customerId &&
        installationId === workOrder.customerWorkOrder?.customerInstallationId
      ) {
        return;
      }

      setIsUpdatingCustomer(true);
      try {
        await workOrderService.updateWorkOrderCustomer({
          workOrderId: workOrder.id,
          customerId,
          customerInstallationId: installationId,
        });
        await fetchWorkOrder();
        setShowSuccessMessage(true);
        setShowErrorMessage(false);
        setModals(prev => ({ ...prev, changeCustomer: false }));
      } catch {
        setShowErrorMessage(true);
        setErrorMessage(t('workOrders.errorUpdatingWork'));
      } finally {
        setIsUpdatingCustomer(false);
      }
    },
    [workOrder, fetchWorkOrder, t]
  );

  const selectDowntimeReason = useCallback(
    (reason: DowntimesReasons) => {
      setValue('downtimeReason', reason);
      if (workOrder) {
        workOrder.downtimeReason = reason;
      }
      handleFormSubmit();
      setModals(prev => ({ ...prev, downtimeReasons: false }));
    },
    [setValue, workOrder, handleFormSubmit]
  );

  const openModal = useCallback((modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  }, []);

  const closeModal = useCallback((modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  }, []);

  // ========== EFFECTS ==========

  // Initial data fetch - only runs once on mount
  useEffect(() => {
    fetchSpareParts();
    fetchOperators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch work order when operators are loaded - only triggers once when operators first load
  useEffect(() => {
    if (availableOperators.length > 0) {
      fetchWorkOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableOperators.length]);

  // Close modals when global modal state changes
  useEffect(() => {
    if (!isModalOpen) {
      setModals({
        downtimeReasons: false,
        generateCorrective: false,
        changeCustomer: false,
      });
    }
  }, [isModalOpen]);

  // ========== RETURN ==========

  const state: WorkOrderFormState = {
    workOrder,
    isLoading,
    isFinished,
    errorMessage,
    showSuccessMessage,
    showErrorMessage,
    availableOperators,
    availableSpareParts,
    selectedOperators,
    selectedSpareParts,
    workOrderOperatorTimes,
    workOrderComments,
    workOrderEvents,
    passedInspectionPoints,
    startDate,
    costs,
    workOrderTimeExceeded,
    modals,
    loadingStates,
    isUpdatingCustomer,
  };

  const actions: WorkOrderFormActions = {
    refresh: fetchWorkOrder,
    handleSubmit: handleFormSubmit,
    handleDelete,
    selectOperator,
    removeOperator,
    handleStateChange,
    setStartDate,
    handleCustomerChange,
    selectDowntimeReason,
    openModal,
    closeModal,
    setSelectedSpareParts,
    setWorkOrderOperatorTimes,
    setWorkOrderComments,
    setPassedInspectionPoints,
  };

  const permissions = {
    isAdmin: isAdmin(),
    isCRM: isCRM,
    canEdit: isAdmin() && !isFinished,
    filterOperatorTypes: filterOperatorTypesWorkOrder,
    getHeaderText: workorderHeader,
  };

  return {
    state,
    actions,
    form,
    permissions,
  };
}
