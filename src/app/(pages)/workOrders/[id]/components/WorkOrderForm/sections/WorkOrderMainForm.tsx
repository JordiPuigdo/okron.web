'use client';

import 'react-datepicker/dist/react-datepicker.css';

import DatePicker from 'react-datepicker';
import { UseFormRegister } from 'react-hook-form';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import Operator from 'app/interfaces/Operator';
import WorkOrder, {
  OriginWorkOrder,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import { translateStateWorkOrder } from 'app/utils/utils';
import { getStatesForWorkOrderType } from 'app/utils/utilsWorkOrder';
import ChooseElement from 'components/ChooseElement';
import ca from 'date-fns/locale/ca';
import { Button } from 'designSystem/Button/Buttons';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  Eye,
  FileText,
  MapPin,
  Users,
} from 'lucide-react';

import { ContentCard } from '../layout';

// ============================================================================
// TYPES
// ============================================================================

interface WorkOrderMainFormProps {
  workOrder: WorkOrder;
  register: UseFormRegister<WorkOrder>;
  // State
  isDisabled: boolean;
  isCRM: boolean;
  timeExceeded: boolean;
  startDate: Date | null;
  // Operators
  availableOperators: Operator[];
  selectedOperators: Operator[];
  filterOperatorTypes: (operators: Operator[]) => Operator[];
  onSelectOperator: (operatorId: string) => void;
  onRemoveOperator: (operatorId: string) => void;
  // Handlers
  onStateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onDateChange: (date: Date | null) => void;
  onChangeCustomer: () => void;
  onDowntimeReasonClick: () => void;
  // Loading
  isUpdatingCustomer: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * WorkOrderMainForm - Formulari principal de l'ordre de treball.
 *
 * Conté:
 * - Descripció
 * - Estat
 * - Data de creació
 * - Operadors assignats
 * - Camps específics per CRM (client, botiga)
 * - Camps específics per Production (downtime reason)
 */
export function WorkOrderMainForm({
  workOrder,
  register,
  isDisabled,
  isCRM,
  timeExceeded,
  startDate,
  availableOperators,
  selectedOperators,
  filterOperatorTypes,
  onSelectOperator,
  onRemoveOperator,
  onStateChange,
  onDateChange,
  onChangeCustomer,
  onDowntimeReasonClick,
  isUpdatingCustomer,
}: WorkOrderMainFormProps) {
  const { t } = useTranslations();
  const isTicket = workOrder.workOrderType === WorkOrderType.Ticket;
  const isProduction = workOrder.originWorkOrder === OriginWorkOrder.Production;
  const hasDefaultReason = workOrder.downtimeReason?.machineId === '';

  return (
    <ContentCard className="space-y-5">
      {/* Warning: Time Exceeded */}
      {timeExceeded && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">
            {t('workorder.execution.time.exceeded')}
          </span>
        </div>
      )}

      {/* Description */}
      <FormField
        icon={<FileText className="w-4 h-4" />}
        label={t('description')}
      >
        <input
          {...register('description')}
          type="text"
          id="description"
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-okron-primary focus:border-transparent transition-all"
          disabled={isDisabled}
          onKeyPress={e => e.key === 'Enter' && e.preventDefault()}
        />
      </FormField>

      {/* CRM: Client Reference & Store */}
      {isCRM && (
        <>
          <FormField
            icon={<Building2 className="w-4 h-4" />}
            label={t('client.ref')}
            action={
              <Button
                type="change"
                onClick={onChangeCustomer}
                disabled={isUpdatingCustomer}
              >
                {isUpdatingCustomer ? (
                  <SvgSpinner className="text-white w-3 h-3 animate-spin" />
                ) : (
                  t('change.customer')
                )}
              </Button>
            }
          >
            <input
              {...register('refCustomerId')}
              type="text"
              id="refCustomerId"
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-okron-primary focus:border-transparent transition-all"
            />
          </FormField>

          <FormField icon={<MapPin className="w-4 h-4" />} label={t('store')}>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {workOrder.customerWorkOrder?.customerInstallationCode}
              </p>
              <p className="text-sm text-gray-600">
                {
                  workOrder.customerWorkOrder?.customerInstallationAddress
                    ?.address
                }
              </p>
              <p className="text-sm text-gray-500">
                {workOrder.customerWorkOrder?.customerInstallationAddress?.city}
              </p>
            </div>
          </FormField>
        </>
      )}

      {/* State */}
      <FormField icon={<Clock className="w-4 h-4" />} label={t('state')}>
        <select
          {...register('stateWorkOrder', { valueAsNumber: true })}
          className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-okron-primary focus:border-transparent transition-all"
          onChange={onStateChange}
          disabled={isDisabled}
        >
          {getStatesForWorkOrderType(workOrder.workOrderType, isCRM).map(
            state => (
              <option key={state} value={state}>
                {translateStateWorkOrder(state, t)}
              </option>
            )
          )}
        </select>
      </FormField>

      {/* Creation Date */}
      <FormField
        icon={<Calendar className="w-4 h-4" />}
        label={t('creation.date')}
      >
        <DatePicker
          disabled={isDisabled}
          id="creationTime"
          selected={startDate}
          onChange={onDateChange}
          dateFormat="dd/MM/yyyy"
          locale={ca}
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-okron-primary focus:border-transparent transition-all"
        />
      </FormField>

      {/* Operators (not for tickets) */}
      {!isTicket && availableOperators.length > 0 && (
        <FormField icon={<Users className="w-4 h-4" />} label={t('operators')}>
          <ChooseElement
            elements={filterOperatorTypes(availableOperators).map(x => ({
              id: x.id,
              description: x.name,
            }))}
            onDeleteElementSelected={onRemoveOperator}
            onElementSelected={onSelectOperator}
            placeholder={t('select.operator')}
            selectedElements={selectedOperators.map(x => x.id)}
            mapElement={op => ({
              id: op.id,
              description: op.description,
            })}
            disabled={isDisabled}
            className={selectedOperators.length === 0 ? 'border-red-300' : ''}
          />
        </FormField>
      )}

      {/* Active checkbox (only if inactive) */}
      {workOrder.active === false && (
        <FormField label={t('active')}>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-gray-300 text-okron-primary focus:ring-okron-primary"
              {...register('active')}
            />
            <span className="text-sm text-gray-600">
              {t('activate.work.order') || 'Activar ordre de treball'}
            </span>
          </div>
        </FormField>
      )}

      {/* Production: Downtime Reason */}
      {isProduction && (
        <>
          <FormField
            icon={<AlertTriangle className="w-4 h-4" />}
            label={t('downtime.reason')}
          >
            <button
              type="button"
              onClick={() => !isDisabled && onDowntimeReasonClick()}
              className={`
                w-full p-3 text-left border rounded-lg text-sm transition-all
                ${
                  hasDefaultReason
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }
                ${
                  isDisabled
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer'
                }
              `}
              disabled={isDisabled}
            >
              {workOrder.downtimeReason?.description || t('select.reason')}
            </button>
          </FormField>

          <FormField
            icon={<Eye className="w-4 h-4" />}
            label={t('visible.report')}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-okron-primary focus:ring-okron-primary"
                {...register('visibleReport')}
              />
              <span className="text-sm text-gray-600">
                {t('show.in.report') || 'Mostrar en informes'}
              </span>
            </div>
          </FormField>
        </>
      )}
    </ContentCard>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FormFieldProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function FormField({ label, icon, children, action }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {icon && <span className="text-gray-400">{icon}</span>}
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}
