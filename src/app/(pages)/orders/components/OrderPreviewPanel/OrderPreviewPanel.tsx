'use client';

import { OrderStatus, OrderType } from 'app/interfaces/Order';
import useRoutes from 'app/utils/useRoutes';
import Loader from 'components/Loader/loader';
import {
  ActionButton,
  DateCard,
  StatusBadge,
  TotalsSummary,
} from 'components/PreviewPanel';
import {
  SlidePanel,
  SlidePanelActions,
  SlidePanelSection,
} from 'components/SlidePanel';
import { Edit2, Printer, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ORDER_TYPE_CONFIG, STATUS_CONFIG } from './constants';
import { OrderItemsList } from './OrderItemsList';
import { ProviderInfo } from './ProviderInfo';
import { RelatedOrdersList } from './RelatedOrdersList';
import { OrderPreviewPanelProps } from './types';
import { useOrderPreview } from './useOrderPreview';
import { calculateOrderTotals, calculateReceptionProgress } from './utils';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Panel de vista previa de orden de compra.
 *
 * Principios SOLID aplicados:
 * - SRP: Orquesta subcomponentes, cada uno con responsabilidad única
 * - OCP: Fácil añadir nuevas secciones sin modificar existentes
 * - DIP: Usa componentes abstractos de PreviewPanel y SlidePanel
 * - ISP: Interfaces segregadas por tipo de prop
 */
export function OrderPreviewPanel({
  order,
  isOpen,
  onClose,
}: OrderPreviewPanelProps) {
  const router = useRouter();
  const ROUTES = useRoutes();
  const { displayOrder, relatedOrders, isLoading } = useOrderPreview({
    order,
    isOpen,
  });

  if (!order) return null;

  // Datos derivados
  const statusConfig = STATUS_CONFIG[displayOrder?.status ?? OrderStatus.Pending];
  const typeConfig = ORDER_TYPE_CONFIG[displayOrder?.type ?? OrderType.Purchase];
  const items = displayOrder?.items || [];
  const totals = calculateOrderTotals(items);
  const receptionProgress = calculateReceptionProgress(items);

  // Flags de estado
  const isPurchaseOrder = displayOrder?.type === OrderType.Purchase;
  const isCompleted = displayOrder?.status === OrderStatus.Completed;

  // Handlers
  const handleEdit = () => {
    router.push(`${ROUTES.orders.order}/${order.id}`);
    onClose();
  };

  const handleCreateDeliveryNote = () => {
    router.push(`${ROUTES.orders.order}?purchaseOrderId=${order.id}`);
    onClose();
  };

  const handlePrint = () => {
    window.open(`/print/order?id=${order.id}`, '_blank');
  };

  const handleNavigateToRelatedOrder = (orderId: string) => {
    router.push(`${ROUTES.orders.order}/${orderId}`);
    onClose();
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={displayOrder?.code || ''}
      subtitle={`${typeConfig.icon} ${typeConfig.label}`}
      headerActions={
        <StatusBadge
          label={statusConfig.label}
          className={statusConfig.className}
        />
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : (
        <OrderPreviewContent
          displayOrder={displayOrder!}
          totals={totals}
          items={items}
          relatedOrders={relatedOrders}
          receptionProgress={receptionProgress}
          isPurchaseOrder={isPurchaseOrder}
          isCompleted={isCompleted}
          onEdit={handleEdit}
          onCreateDeliveryNote={handleCreateDeliveryNote}
          onPrint={handlePrint}
          onNavigateToRelatedOrder={handleNavigateToRelatedOrder}
        />
      )}
    </SlidePanel>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader />
    </div>
  );
}

interface OrderPreviewContentProps {
  displayOrder: NonNullable<ReturnType<typeof useOrderPreview>['displayOrder']>;
  totals: ReturnType<typeof calculateOrderTotals>;
  items: ReturnType<typeof useOrderPreview>['displayOrder'] extends infer O
    ? O extends { items: infer I }
      ? I
      : never
    : never;
  relatedOrders: ReturnType<typeof useOrderPreview>['relatedOrders'];
  receptionProgress: number;
  isPurchaseOrder: boolean;
  isCompleted: boolean;
  onEdit: () => void;
  onCreateDeliveryNote: () => void;
  onPrint: () => void;
  onNavigateToRelatedOrder: (orderId: string) => void;
}

function OrderPreviewContent({
  displayOrder,
  totals,
  items,
  relatedOrders,
  receptionProgress,
  isPurchaseOrder,
  isCompleted,
  onEdit,
  onCreateDeliveryNote,
  onPrint,
  onNavigateToRelatedOrder,
}: OrderPreviewContentProps) {
  return (
    <>
      {/* Resumen de totales */}
      <TotalsSummary
        label="Total comanda"
        total={totals.total}
        subtotal={totals.subtotal}
        totalTax={totals.totalTax}
        extraContent={
          isPurchaseOrder &&
          receptionProgress > 0 && (
            <ReceptionBadge progress={receptionProgress} />
          )
        }
      />

      {/* Proveedor */}
      <SlidePanelSection title="Proveïdor">
        <ProviderInfo
          provider={displayOrder.provider}
          providerName={displayOrder.providerName}
        />
      </SlidePanelSection>

      {/* Fecha */}
      <SlidePanelSection title="Data">
        <DateCard label="Data comanda" date={new Date(displayOrder.date)} />
      </SlidePanelSection>

      {/* Items */}
      <SlidePanelSection title={`Articles (${items.length})`}>
        <OrderItemsList items={items} />
      </SlidePanelSection>

      {/* Albaranes de recepción (solo para órdenes de compra) */}
      {isPurchaseOrder && (
        <SlidePanelSection title="Albarans de Recepció">
          <RelatedOrdersList
            relatedOrders={relatedOrders}
            onNavigate={onNavigateToRelatedOrder}
          />
        </SlidePanelSection>
      )}

      {/* Comentarios */}
      {displayOrder.comment && (
        <SlidePanelSection title="Comentaris">
          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
            {displayOrder.comment}
          </p>
        </SlidePanelSection>
      )}

      {/* Acciones */}
      <SlidePanelActions>
        {isPurchaseOrder && !isCompleted && (
          <ActionButton
            onClick={onCreateDeliveryNote}
            icon={Truck}
            label="Crear Albarà Recepció"
            variant="success"
          />
        )}

        <ActionButton
          onClick={onEdit}
          icon={Edit2}
          label="Editar"
          variant="primary"
        />

        <ActionButton
          onClick={onPrint}
          icon={Printer}
          label="Imprimir"
          variant="secondary"
        />
      </SlidePanelActions>
    </>
  );
}

interface ReceptionBadgeProps {
  progress: number;
}

function ReceptionBadge({ progress }: ReceptionBadgeProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
        📦 Rebut: {progress}%
      </span>
    </div>
  );
}
