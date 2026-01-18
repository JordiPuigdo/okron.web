'use client';

import { useEffect, useState } from 'react';
import { usePermissions } from 'app/hooks/usePermissions';
import { useTranslations } from 'app/hooks/useTranslations';
import {
  StateWorkOrder,
  WorkOrder,
  WorkOrderComment,
  WorkOrderCommentType,
  WorkOrderOperatorTimes,
  WorkOrderOperatorTimeType,
  WorkOrderSparePart,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import { DeliveryNoteService } from 'app/services/deliveryNoteService';
import { workOrderService } from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import useRoutes from 'app/utils/useRoutes';
import {
  translateStateWorkOrder,
  translateWorkOrderType,
} from 'app/utils/utils';
import Loader from 'components/Loader/loader';
import { ActionButton, StatusBadge } from 'components/PreviewPanel';
import {
  SlidePanel,
  SlidePanelActions,
  SlidePanelSection,
} from 'components/SlidePanel';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Edit2,
  MapPin,
  MessageSquare,
  Package,
  Printer,
  Receipt,
  User,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface WorkOrderPreviewPanelProps {
  workOrder: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
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
};

const TYPE_CONFIG: Record<
  WorkOrderType,
  { icon: React.ElementType; bgColor: string; textColor: string }
> = {
  [WorkOrderType.Corrective]: {
    icon: AlertTriangle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
  },
  [WorkOrderType.Preventive]: {
    icon: Calendar,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  [WorkOrderType.Predicitve]: {
    icon: Clock,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  [WorkOrderType.Ticket]: {
    icon: Wrench,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateTotalTime(operatorTimes: WorkOrderOperatorTimes[]): string {
  let totalMs = 0;
  operatorTimes.forEach(time => {
    if (time.endTime) {
      const start = new Date(time.startTime).getTime();
      const end = new Date(time.endTime).getTime();
      totalMs += end - start;
    }
  });
  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function formatDuration(startTime: Date, endTime?: Date): string {
  if (!endTime) return 'En curs...';
  const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TypeBadge({ type, label }: { type: WorkOrderType; label: string }) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.textColor}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function SourceTicketLink({
  code,
  onClick,
}: {
  code: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-sm font-medium"
    >
      <Wrench className="w-3 h-3" />
      {code}
    </button>
  );
}

function EquipmentCard({
  code,
  description,
  brand,
}: {
  code: string;
  description: string;
  brand?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600">
        <Wrench className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
            {code}
          </span>
          {brand && <span className="text-xs text-gray-500">{brand}</span>}
        </div>
      </div>
    </div>
  );
}

function CustomerCard({ 
  name, 
  nif,
  city,
  installationCode,
  installationCity 
}: { 
  name: string; 
  nif?: string;
  city?: string;
  installationCode?: string;
  installationCity?: string;
}) {
  return (
    <div className="space-y-3">
      {/* Cliente */}
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{name}</p>
          <div className="flex items-center gap-2 mt-1">
            {nif && <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{nif}</span>}
            {city && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {city}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Instalación */}
      {installationCode && (
        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 text-purple-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-purple-600 font-medium">Instal·lació</p>
            <p className="font-medium text-gray-900">{installationCode}</p>
            {installationCity && (
              <p className="text-sm text-gray-500">{installationCity}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OperatorsList({
  operators,
}: {
  operators: { id: string; name: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {operators.map(op => (
        <span
          key={op.id}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
        >
          <User className="w-3 h-3" />
          {op.name}
        </span>
      ))}
    </div>
  );
}

function OperatorTimesList({
  times,
  emptyMessage,
}: {
  times: WorkOrderOperatorTimes[];
  emptyMessage: string;
}) {
  if (!times || times.length === 0) {
    return <EmptyState icon={Clock} message={emptyMessage} />;
  }

  return (
    <div className="space-y-2">
      {times.map((time, index) => (
        <div
          key={time.id || index}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              {time.operator?.name}
            </span>
            {time.type === WorkOrderOperatorTimeType.Travel && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                🚗
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(time.startTime, time.endTime)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SparePartsList({
  spareParts,
  emptyMessage,
}: {
  spareParts: WorkOrderSparePart[];
  emptyMessage: string;
}) {
  if (!spareParts || spareParts.length === 0) {
    return <EmptyState icon={Package} message={emptyMessage} />;
  }

  return (
    <div className="space-y-2">
      {spareParts.map((sp, index) => (
        <div
          key={sp.id || index}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">
                {sp.sparePart?.description}
              </p>
              {sp.sparePart?.code && (
                <p className="text-xs text-gray-500">{sp.sparePart.code}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold text-gray-900">x{sp.quantity}</span>
            {sp.warehouseName && (
              <p className="text-xs text-gray-500">{sp.warehouseName}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentsList({
  comments,
  emptyMessage,
}: {
  comments: WorkOrderComment[];
  emptyMessage: string;
}) {
  if (!comments || comments.length === 0) {
    return <EmptyState icon={MessageSquare} message={emptyMessage} />;
  }

  const getCommentStyle = (type: WorkOrderCommentType) => {
    switch (type) {
      case WorkOrderCommentType.External:
        return 'bg-blue-50 border-blue-200';
      case WorkOrderCommentType.NoFinished:
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {comments.map((comment, index) => (
        <div
          key={comment.id || index}
          className={`p-3 rounded-lg border ${getCommentStyle(comment.type)}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900 text-sm">
              {comment.operator?.name}
            </span>
            <span className="text-xs text-gray-500 ml-auto">
              {new Date(comment.creationDate).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.comment}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) {
  return (
    <div className="text-center py-6 text-gray-500">
      <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p>{message}</p>
    </div>
  );
}

function InspectionPointsList({
  points,
}: {
  points: { id: string; check?: boolean; inspectionPoint: { description: string } }[];
}) {
  const completed = points.filter(p => p.check === true).length;
  const total = points.length;

  return (
    <div className="space-y-2">
      {/* Barra de progreso */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-600">
          {completed}/{total}
        </span>
      </div>

      {/* Lista de puntos */}
      {points.map((point, index) => (
        <div
          key={point.id || index}
          className={`flex items-center gap-3 p-3 rounded-lg ${
            point.check === true 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          {point.check === true ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              point.check === true ? 'text-green-800' : 'text-gray-700'
            }`}>
              {point.inspectionPoint?.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WorkOrderPreviewPanel({
  workOrder,
  isOpen,
  onClose,
}: WorkOrderPreviewPanelProps) {
  const router = useRouter();
  const ROUTES = useRoutes();
  const { t } = useTranslations();
  const { config } = useSessionStore();
  const { isCRM } = usePermissions();

  const [fullWorkOrder, setFullWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingDeliveryNote, setIsCreatingDeliveryNote] = useState(false);

  useEffect(() => {
    if (isOpen && workOrder?.id) {
      setIsLoading(true);
      workOrderService
        .getWorkOrderById(workOrder.id)
        .then((data: WorkOrder | undefined) => {
          if (data) setFullWorkOrder(data);
        })
        .catch((error: Error) => {
          console.error('Error fetching work order details:', error);
          setFullWorkOrder(workOrder);
        })
        .finally(() => setIsLoading(false));
    } else if (!isOpen) {
      setFullWorkOrder(null);
    }
  }, [isOpen, workOrder?.id]);

  if (!workOrder) return null;

  const displayWorkOrder = fullWorkOrder || workOrder;
  const stateLabel = translateStateWorkOrder(
    displayWorkOrder.stateWorkOrder,
    t
  );
  const stateStyle = STATE_STYLES[displayWorkOrder.stateWorkOrder];
  const typeLabel = translateWorkOrderType(displayWorkOrder.workOrderType, t);

  const handleEdit = () => {
    router.push(`${ROUTES.workOrders}/${workOrder.id}`);
    onClose();
  };

  const handlePrint = () => {
    window.open(
      `/print/workorder?id=${workOrder.id}&urlLogo=${config?.company.urlLogo}`,
      '_blank'
    );
  };

  const handleGoToSourceTicket = () => {
    if (displayWorkOrder.originalWorkOrderId) {
      router.push(
        `${ROUTES.workOrders}/${displayWorkOrder.originalWorkOrderId}`
      );
      onClose();
    }
  };

  const handleCreateDeliveryNote = async () => {
    if (!displayWorkOrder.customerWorkOrder?.customerId || isCreatingDeliveryNote) return;
    
    setIsCreatingDeliveryNote(true);
    try {
      const deliveryNoteService = new DeliveryNoteService(
        process.env.NEXT_PUBLIC_API_BASE_URL || ''
      );
      
      const response = await deliveryNoteService.create({
        deliveryNoteDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        customerId: displayWorkOrder.customerWorkOrder.customerId,
        workOrderIds: [workOrder.id],
      });
      
      router.push(`/deliveryNotes/${response.id}`);
      onClose();
    } catch (error) {
      console.error('Error creating delivery note:', error);
    } finally {
      setIsCreatingDeliveryNote(false);
    }
  };

  const equipmentDescription =
    displayWorkOrder.asset?.description ||
    displayWorkOrder.machine?.description;
  const operatorTimes = displayWorkOrder.workOrderOperatorTimes || [];
  const totalTime =
    operatorTimes.length > 0 ? calculateTotalTime(operatorTimes) : null;

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={displayWorkOrder.code}
      subtitle={equipmentDescription || displayWorkOrder.description}
      headerActions={
        <div className="flex items-center gap-2">
          <TypeBadge type={displayWorkOrder.workOrderType} label={typeLabel} />
          {displayWorkOrder.originalWorkOrderCode && (
            <SourceTicketLink
              code={displayWorkOrder.originalWorkOrderCode}
              onClick={handleGoToSourceTicket}
            />
          )}
          <StatusBadge label={stateLabel} className={stateStyle} />
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : (
        <>
          {/* Descripción */}
          {displayWorkOrder.description && (
            <SlidePanelSection title={t('common.description')}>
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                {displayWorkOrder.description}
              </p>
            </SlidePanelSection>
          )}

          {/* Equipo */}
          {displayWorkOrder.asset && (
            <SlidePanelSection title={t('workorder.equipment')}>
              <EquipmentCard
                code={displayWorkOrder.asset.code}
                description={displayWorkOrder.asset.description}
                brand={displayWorkOrder.asset.brand}
              />
            </SlidePanelSection>
          )}

          {/* Puntos de inspección (solo preventivos) */}
          {displayWorkOrder.workOrderInspectionPoint && 
           displayWorkOrder.workOrderInspectionPoint.length > 0 && (
            <SlidePanelSection 
              title={`${t('inspectionPoints')} (${displayWorkOrder.workOrderInspectionPoint.length})`}
            >
              <InspectionPointsList points={displayWorkOrder.workOrderInspectionPoint} />
            </SlidePanelSection>
          )}

          {/* Cliente */}
          {(isCRM && displayWorkOrder.customerWorkOrder) && (
            <SlidePanelSection title={t('customer.customer')}>
              <CustomerCard
                name={displayWorkOrder.customerWorkOrder.customerName}
                nif={displayWorkOrder.customerWorkOrder.customerNif}
                city={displayWorkOrder.customerWorkOrder.customerAddress?.city}
                installationCode={displayWorkOrder.customerWorkOrder.customerInstallationCode}
                installationCity={displayWorkOrder.customerWorkOrder.customerInstallationAddress?.city}
              />
            </SlidePanelSection>
          )}

          {/* Operadores asignados */}
          <SlidePanelSection title={t('workorder.operators')}>
            {displayWorkOrder.operator &&
            displayWorkOrder.operator.length > 0 ? (
              <OperatorsList operators={displayWorkOrder.operator} />
            ) : (
              <EmptyState icon={User} message={t('workorder.no.operators')} />
            )}
          </SlidePanelSection>

          {/* Tiempos de operarios */}
          <SlidePanelSection
            title={`${t('workOrders.operatorTimes')}${
              totalTime ? ` (${totalTime})` : ''
            }`}
          >
            <OperatorTimesList
              times={operatorTimes}
              emptyMessage={t('workorder.no.times')}
            />
          </SlidePanelSection>

          {/* Repuestos */}
          <SlidePanelSection
            title={`${t('workOrders.spareParts')} (${
              displayWorkOrder.workOrderSpareParts?.length || 0
            })`}
          >
            <SparePartsList
              spareParts={displayWorkOrder.workOrderSpareParts || []}
              emptyMessage={t('no.spare.parts.used')}
            />
          </SlidePanelSection>

          {/* Comentarios */}
          <SlidePanelSection
            title={`${t('workOrders.comments')} (${
              displayWorkOrder.workOrderComments?.length || 0
            })`}
          >
            <CommentsList
              comments={displayWorkOrder.workOrderComments || []}
              emptyMessage={t('workorder.no.comments')}
            />
          </SlidePanelSection>

          {/* Acciones */}
          <SlidePanelActions>            {/* Botón crear albarán - solo si es CRM, tiene cliente y no tiene albarán */}
            {isCRM && 
             displayWorkOrder.customerWorkOrder?.customerId && 
             !displayWorkOrder.hasDeliveryNote && 
             !isCreatingDeliveryNote && (
              <ActionButton
                onClick={handleCreateDeliveryNote}
                icon={Receipt}
                label={t('create.delivery.note')}
                variant="warning"
              />
            )}            <ActionButton
              onClick={handleEdit}
              icon={Edit2}
              label={t('edit')}
              variant="primary"
            />
            <ActionButton
              onClick={handlePrint}
              icon={Printer}
              label={t('budget.actions.print')}
              variant="secondary"
            />
          </SlidePanelActions>
        </>
      )}
    </SlidePanel>
  );
}

export default WorkOrderPreviewPanel;
