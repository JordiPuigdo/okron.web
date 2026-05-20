'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { ScheduledPreventiveItem } from 'app/interfaces/Preventive';
import { StateWorkOrder, WorkOrder } from 'app/interfaces/workOrder';
import useRoutes from 'app/utils/useRoutes';
import {
  translateStateWorkOrder,
  translateWorkOrderType,
} from 'app/utils/utils';
import {
  SlidePanel,
  SlidePanelActions,
  SlidePanelSection,
} from 'components/SlidePanel';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Package,
  Play,
  Printer,
  User,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface ScheduledPreventivePreviewPanelProps {
  item: ScheduledPreventiveItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (item: ScheduledPreventiveItem) => Promise<void>;
  isLaunching?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATE_STYLES: Record<StateWorkOrder, string> = {
  [StateWorkOrder.Waiting]: 'bg-amber-100 text-amber-800',
  [StateWorkOrder.OnGoing]: 'bg-teal-100 text-teal-800',
  [StateWorkOrder.Paused]: 'bg-gray-100 text-gray-800',
  [StateWorkOrder.Finished]: 'bg-green-100 text-green-800',
  [StateWorkOrder.Requested]: 'bg-orange-100 text-orange-800',
  [StateWorkOrder.PendingToValidate]: 'bg-purple-100 text-purple-800',
  [StateWorkOrder.Open]: 'bg-blue-100 text-blue-800',
  [StateWorkOrder.Closed]: 'bg-gray-200 text-gray-700',
  [StateWorkOrder.NotFinished]: 'bg-red-100 text-red-800',
  [StateWorkOrder.Invoiced]: 'bg-indigo-100 text-indigo-800',
  [StateWorkOrder.InProcess]: 'bg-cyan-100 text-cyan-800',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ScheduledPreventivePreviewPanel: React.FC<
  ScheduledPreventivePreviewPanelProps
> = ({ item, isOpen, onClose, onLaunch, isLaunching = false }) => {
  const { t } = useTranslations();
  const router = useRouter();
  const ROUTES = useRoutes();

  const handleLaunch = useCallback(async () => {
    if (!item || item.isLaunched) return;
    await onLaunch(item);
  }, [item, onLaunch]);

  const handleEditPreventive = useCallback(() => {
    if (!item) return;
    router.push(`${ROUTES.PREVENTIVE}/${item.preventive.id}`);
  }, [item, router, ROUTES.PREVENTIVE]);

  const handleViewWorkOrder = useCallback(() => {
    if (!item?.workOrder) return;
    router.push(`${ROUTES.WORKORDER}/${item.workOrder.id}`);
  }, [item, router, ROUTES.WORKORDER]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!item) return null;

  const { preventive, workOrder, scheduledDate, isLaunched } = item;

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={preventive.code}
      subtitle={preventive.description}
      width="full"
      headerActions={
        <div className="flex items-center gap-2">
          {isLaunched ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle2 className="w-4 h-4" />
              {t('preventive.scheduled.launched') || 'Lanzado'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4" />
              {t('preventive.scheduled.pending') || 'Pendiente'}
            </span>
          )}
        </div>
      }
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {/* Fecha programada */}
          <SlidePanelSection>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  {t('preventive.scheduled.scheduledFor') || 'Programado para'}
                </p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatDate(scheduledDate)}
                </p>
              </div>
            </div>
          </SlidePanelSection>

          {/* Si tiene WorkOrder - mostrar info de la OT */}
          {isLaunched && workOrder && (
            <WorkOrderPreviewSection
              workOrder={workOrder}
              onView={handleViewWorkOrder}
              t={t}
            />
          )}

          {/* Si NO tiene WorkOrder - mostrar info del preventivo */}
          {!isLaunched && (
            <PreventiveInfoSection preventive={preventive} t={t} />
          )}

          {/* Equipo */}
          <SlidePanelSection title={t('preventive.asset') || 'Equipo'}>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  {preventive.asset?.description || '-'}
                </p>
                {preventive.asset?.code && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                    {preventive.asset.code}
                  </span>
                )}
              </div>
            </div>
          </SlidePanelSection>

          {/* Operadores asignados */}
          {preventive.operators && preventive.operators.length > 0 && (
            <SlidePanelSection
              title={t('preventive.operators') || 'Operadores asignados'}
            >
              <div className="flex flex-wrap gap-2">
                {preventive.operators.map(op => (
                  <div
                    key={op.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{op.name}</span>
                  </div>
                ))}
              </div>
            </SlidePanelSection>
          )}

          {/* Puntos de inspección */}
          {preventive.inspectionPoints &&
            preventive.inspectionPoints.length > 0 && (
              <SlidePanelSection
                title={t('preventive.inspectionPoints') || 'Puntos de inspección'}
              >
                <div className="space-y-2">
                  {preventive.inspectionPoints.slice(0, 5).map((ip, index) => (
                    <div
                      key={ip.id || index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {ip.description}
                      </span>
                    </div>
                  ))}
                  {preventive.inspectionPoints.length > 5 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      +{preventive.inspectionPoints.length - 5}{' '}
                      {t('common.more') || 'más'}
                    </p>
                  )}
                </div>
              </SlidePanelSection>
            )}

          {/* Repuestos */}
          {preventive.spareParts && preventive.spareParts.length > 0 && (
            <SlidePanelSection
              title={t('preventive.spareParts') || 'Repuestos previstos'}
            >
              <div className="space-y-2">
                {preventive.spareParts.map((sp, index) => (
                  <div
                    key={sp.sparePartId || index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {sp.sparePartDescription || sp.sparePartCode}
                    </span>
                  </div>
                ))}
              </div>
            </SlidePanelSection>
          )}

          {/* Duración planificada */}
          {preventive.plannedDuration && (
            <SlidePanelSection
              title={t('preventive.plannedDuration') || 'Duración planificada'}
            >
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900 font-medium">
                  {preventive.plannedDuration}
                </span>
              </div>
            </SlidePanelSection>
          )}
        </div>

        {/* Actions */}
        <SlidePanelActions>
          {isLaunched ? (
            <>
              <button
                onClick={handleViewWorkOrder}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t('preventive.scheduled.viewWorkOrder') || 'Ver Orden de Trabajo'}
              </button>
              <button
                onClick={handleEditPreventive}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {t('preventive.scheduled.editPreventive') || 'Editar Preventivo'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLaunch}
                disabled={isLaunching}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLaunching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('common.creating') || 'Creando...'}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {t('preventive.scheduled.createWorkOrder') ||
                      'Crear Orden de Trabajo'}
                  </>
                )}
              </button>
              <button
                onClick={handleEditPreventive}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {t('preventive.scheduled.editPreventive') || 'Editar Preventivo'}
              </button>
            </>
          )}
        </SlidePanelActions>
      </div>
    </SlidePanel>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface WorkOrderPreviewSectionProps {
  workOrder: WorkOrder;
  onView: () => void;
  t: (key: string) => string;
}

function WorkOrderPreviewSection({
  workOrder,
  onView,
  t,
}: WorkOrderPreviewSectionProps) {
  const stateStyle =
    STATE_STYLES[workOrder.state as StateWorkOrder] ||
    'bg-gray-100 text-gray-800';
  const stateLabel = translateStateWorkOrder(workOrder.state);

  return (
    <SlidePanelSection
      title={t('preventive.scheduled.workOrderInfo') || 'Orden de Trabajo'}
    >
      <div
        onClick={onView}
        className="p-4 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-semibold text-green-900">
              {workOrder.code}
            </p>
            {workOrder.description && (
              <p className="text-sm text-green-700 mt-1">
                {workOrder.description}
              </p>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stateStyle}`}>
            {stateLabel}
          </span>
        </div>

        {workOrder.createdDate && (
          <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
            <Calendar className="w-4 h-4" />
            <span>
              {t('workOrder.created') || 'Creada'}:{' '}
              {new Date(workOrder.createdDate).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 mt-2 text-sm text-green-700">
          <ExternalLink className="w-3 h-3" />
          <span>{t('common.clickToView') || 'Clic para ver detalle'}</span>
        </div>
      </div>
    </SlidePanelSection>
  );
}

interface PreventiveInfoSectionProps {
  preventive: ScheduledPreventiveItem['preventive'];
  t: (key: string) => string;
}

function PreventiveInfoSection({ preventive, t }: PreventiveInfoSectionProps) {
  return (
    <SlidePanelSection
      title={t('preventive.scheduled.info') || 'Información del preventivo'}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">
            {t('preventive.frequency') || 'Frecuencia'}
          </span>
          <span className="font-medium text-gray-900">
            {preventive.days}{' '}
            {preventive.days === 1
              ? t('common.day') || 'día'
              : t('common.days') || 'días'}
          </span>
        </div>

        {preventive.lastExecution && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              {t('preventive.lastExecution') || 'Última ejecución'}
            </span>
            <span className="font-medium text-gray-900">
              {new Date(preventive.lastExecution).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}

        {preventive.counter !== undefined && preventive.counter > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              {t('preventive.counter') || 'Contador'}
            </span>
            <span className="font-medium text-gray-900">
              {preventive.counter}
            </span>
          </div>
        )}
      </div>
    </SlidePanelSection>
  );
}

export default ScheduledPreventivePreviewPanel;
