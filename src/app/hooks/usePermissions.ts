import {
  baseColumns,
  columnsCRM,
  columnsTicket,
} from 'app/(pages)/workOrders/components/utilsWorkOrderTable';
import Operator, { OperatorType } from 'app/interfaces/Operator';
import { UserPermission, UserType } from 'app/interfaces/User';
import WorkOrder from 'app/interfaces/workOrder';
import { useSessionStore } from 'app/stores/globalStore';

type PermissionFilter<T> = {
  crmValues: T[];
  defaultValues: T[];
};

export const usePermissions = () => {
  const isCRM = useSessionStore(state => state.config?.isCRM ?? false);
  const { loginUser } = useSessionStore(state => state);

  const filterByCrm = <T>({
    crmValues,
    defaultValues,
  }: PermissionFilter<T>): T[] => {
    return isCRM ? crmValues : defaultValues;
  };
  const isAllowed = <T>(
    value: T,
    {
      crmAllowed,
      defaultAllowed,
    }: { crmAllowed: boolean; defaultAllowed: boolean }
  ): boolean => {
    return isCRM ? crmAllowed : defaultAllowed;
  };

  const isAdmin = (): boolean => {
    if (!loginUser?.permission) return false;

    return isCRM
      ? loginUser.permission === UserPermission.AdminCRM
      : loginUser.permission === UserPermission.Administrator;
  };

  return {
    isCRM,
    filterByCrm,
    isAllowed,
    filterOperatorTypes: (operatorTypes: any[]) =>
      filterByCrm({
        crmValues: operatorTypes.filter(
          type =>
            type === OperatorType.Assembly || type === OperatorType.Repairs
        ),
        defaultValues: operatorTypes,
      }),
    filterOperatorTypesWorkOrder: (operatorTypes: Operator[]) =>
      filterByCrm({
        crmValues: operatorTypes.filter(
          operator =>
            operator.operatorType === OperatorType.Assembly ||
            operator.operatorType === OperatorType.Repairs
        ),
        defaultValues: operatorTypes.filter(
          operator => operator.operatorType === OperatorType.Maintenance
        ),
      }),
    workorderHeader: (workOrder: WorkOrder): string => {
      return isCRM
        ? `Client - ${workOrder?.customerWorkOrder?.customerName ?? ''}`
        : `Equip - ${workOrder?.asset?.description ?? ''}`;
    },
    workOrderColumns: () => {
      return isCRM
        ? columnsCRM
        : loginUser?.userType == UserType.Maintenance
        ? baseColumns
        : columnsTicket;
    },
    isAdmin,
  };
};
