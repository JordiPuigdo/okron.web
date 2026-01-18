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
  Clock,
  Edit2,
  MapPin,
  MessageSquare,
  Package,
  Printer,
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

function CustomerCard({ name, city }: { name: string; city?: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <User className="w-5 h-5 text-gray-400 mt-0.5" />
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        {city && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3 h-3" />
            {city}
          </div>
        )}
      </div>
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

  const equipmentDescription =
    displayWorkOrder.asset?.description ||
    displayWorkOrder.machine?.description;
  const customerName =
    displayWorkOrder.customerName || displayWorkOrder.customer;
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

          {/* Cliente */}
          {(isCRM || customerName) && (
            <SlidePanelSection title={t('customer.customer')}>
              <CustomerCard
                name={customerName || '-'}
                city={displayWorkOrder.customerInstallationCity}
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
          <SlidePanelActions>
            <ActionButton
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
