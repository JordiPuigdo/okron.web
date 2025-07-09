// hooks/useCrmPermissions.ts
import { OperatorType } from 'app/interfaces/Operator';
import { useSessionStore } from 'app/stores/globalStore';

type PermissionFilter<T> = {
  crmValues: T[];
  defaultValues: T[];
};

export const usePermissions = () => {
  const isCRM = useSessionStore(state => state.config?.isCRM ?? false);

  /**
   * Filtra un array de valores según los permisos CRM
   * @param options Las opciones de filtrado { crmValues: valores permitidos en CRM, defaultValues: valores por defecto }
   * @returns Array filtrado según los permisos
   */
  const filterByCrm = <T>({
    crmValues,
    defaultValues,
  }: PermissionFilter<T>): T[] => {
    return isCRM ? crmValues : defaultValues;
  };

  /**
   * Determina si un valor específico está permitido según los permisos CRM
   * @param value El valor a comprobar
   * @param options Las opciones de filtrado { crmAllowed: permitido en CRM, defaultAllowed: permitido por defecto }
   * @returns Booleano indicando si está permitido
   */
  const isAllowed = <T>(
    value: T,
    {
      crmAllowed,
      defaultAllowed,
    }: { crmAllowed: boolean; defaultAllowed: boolean }
  ): boolean => {
    return isCRM ? crmAllowed : defaultAllowed;
  };

  return {
    isCRM,
    filterByCrm,
    isAllowed,
    // Métodos específicos reutilizables
    filterOperatorTypes: (operatorTypes: any[]) =>
      filterByCrm({
        crmValues: operatorTypes.filter(
          type =>
            type === OperatorType.Assembly || type === OperatorType.Repairs
        ),
        defaultValues: operatorTypes,
      }),
  };
};
