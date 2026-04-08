'use client';

import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { OrderStatus, OrderType } from 'app/interfaces/Order';
import { orderService } from 'app/services/orderService';
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
import { Ban, Edit2, MessageCircle, Printer, RotateCcw, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ORDER_TYPE_CONFIG, STATUS_CONFIG } from './constants';
import { OrderItemsList } from './OrderItemsList';
import { ProviderInfo } from './ProviderInfo';
import { RelatedOrdersList, ReturnOrdersList } from './RelatedOrdersList';
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
  const { t } = useTranslations();
  const { displayOrder, relatedOrders, returnOrders, isLoading } = useOrderPreview({
    order,
    isOpen,
  });
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!order) return null;

  // Datos derivados
  const statusConfig =
    STATUS_CONFIG[displayOrder?.status ?? OrderStatus.Pending];
  const typeConfig =
    ORDER_TYPE_CONFIG[displayOrder?.type ?? OrderType.Purchase];
  const items = displayOrder?.items || [];
  const totals = calculateOrderTotals(items);
  const receptionProgress = calculateReceptionProgress(items);

  // Filtrar órdenes relacionadas por tipo
  const deliveryOrders = relatedOrders.filter(
    order => order.type === OrderType.Delivery
  );

  // Flags de estado
  const isPurchaseOrder = displayOrder?.type === OrderType.Purchase;
  const isDeliveryOrder = displayOrder?.type === OrderType.Delivery;
  const isPending = displayOrder?.status === OrderStatus.Pending;
  const isCompleted = displayOrder?.status === OrderStatus.Completed;
  const isCancelled = displayOrder?.status === OrderStatus.Cancelled;

  // Verificar si hay albaranes activos (no cancelados)
  const hasActiveDeliveries = deliveryOrders.some(
    order => order.status !== OrderStatus.Cancelled
  );

  // Handlers
  const handleEdit = () => {
    router.push(`${ROUTES.orders.order}/${order.id}`);
    onClose();
  };

  const handleCreateDeliveryNote = () => {
    router.push(`${ROUTES.orders.order}/orderForm?purchaseOrderId=${order.id}`);
    onClose();
  };

  const handleCreateReturn = () => {
    router.push(`${ROUTES.orders.order}/orderForm?returnOrderId=${order.id}`);
    onClose();
  };

  const handlePrint = () => {
    window.open(`/print/order?id=${order.id}`, '_blank');
  };

  const handleWhatsApp = () => {
    const phone = displayOrder?.provider?.phoneNumber;
    if (!phone) return;

    // Formatear número: quitar caracteres no numéricos y asegurar prefijo 34
    const formattedPhone = phone.replace(/\D/g, '').replace(/^(?!34)/, '34');
    const message = encodeURIComponent(
      `Bon dia, em poso en contacte per la comanda ${displayOrder?.code || ''}.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleNavigateToRelatedOrder = (orderId: string) => {
    router.push(`${ROUTES.orders.order}/${orderId}`);
    onClose();
  };

  const handleCancel = async () => {
    if (!order?.id) return;
    setIsCanceling(true);
    setCancelError(null);
    try {
      await orderService.cancel(order.id);
      onClose();
      window.location.reload();
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : t('order.cancel.error'));
    } finally {
      setIsCanceling(false);
    }
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
          deliveryOrders={deliveryOrders}
          returnOrders={returnOrders}
          receptionProgress={receptionProgress}
          isPurchaseOrder={isPurchaseOrder}
          isDeliveryOrder={isDeliveryOrder}
          isPending={isPending}
          isCompleted={isCompleted}
          isCancelled={isCancelled}
          hasActiveDeliveries={hasActiveDeliveries}
          onEdit={handleEdit}
          onCreateDeliveryNote={handleCreateDeliveryNote}
          onCreateReturn={handleCreateReturn}
          onPrint={handlePrint}
          onWhatsApp={handleWhatsApp}
          hasProviderPhone={!!displayOrder?.provider?.phoneNumber}
          onNavigateToRelatedOrder={handleNavigateToRelatedOrder}
          onCancel={handleCancel}
          isCanceling={isCanceling}
          cancelError={cancelError}
          cancelLabel={t('cancel')}
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
  deliveryOrders: ReturnType<typeof useOrderPreview>['relatedOrders'];
  returnOrders: ReturnType<typeof useOrderPreview>['returnOrders'];
  receptionProgress: number;
  isPurchaseOrder: boolean;
  isDeliveryOrder: boolean;
  isPending: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  hasActiveDeliveries: boolean;
  onEdit: () => void;
  onCreateDeliveryNote: () => void;
  onCreateReturn: () => void;
  onPrint: () => void;
  onWhatsApp: () => void;
  hasProviderPhone: boolean;
  onNavigateToRelatedOrder: (orderId: string) => void;
  onCancel: () => void;
  isCanceling: boolean;
  cancelError: string | null;
  cancelLabel: string;
}

function OrderPreviewContent({
  displayOrder,
  totals,
  items,
  deliveryOrders,
  returnOrders,
  receptionProgress,
  isPurchaseOrder,
  isDeliveryOrder,
  isPending,
  isCompleted,
  isCancelled,
  hasActiveDeliveries,
  onEdit,
  onCreateDeliveryNote,
  onCreateReturn,
  onPrint,
  onWhatsApp,
  hasProviderPhone,
  onNavigateToRelatedOrder,
  onCancel,
  isCanceling,
  cancelError,
  cancelLabel,
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

      {/* Albaranes de recepción */}
      {deliveryOrders.length > 0 && (
        <SlidePanelSection title="Albarans de Recepció">
          <RelatedOrdersList
            relatedOrders={deliveryOrders}
            onNavigate={onNavigateToRelatedOrder}
          />
        </SlidePanelSection>
      )}

      {/* Abonos */}
      {returnOrders.length > 0 && (
        <SlidePanelSection title="Abonos">
          <ReturnOrdersList
            returnOrders={returnOrders}
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

      {/* Error de cancelació */}
      {cancelError && (
        <p className="text-red-600 text-sm px-4 py-2 bg-red-50 rounded-lg mx-4">
          {cancelError}
        </p>
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

        {isDeliveryOrder && !isCancelled && (
          <ActionButton
            onClick={onCreateReturn}
            icon={RotateCcw}
            label="Crear Devolució"
            variant="secondary"
          />
        )}

        {hasProviderPhone && (
          <ActionButton
            onClick={onWhatsApp}
            icon={MessageCircle}
            label="WhatsApp"
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

        {isPurchaseOrder && isPending && !hasActiveDeliveries && (
          <ActionButton
            onClick={onCancel}
            icon={Ban}
            label={isCanceling ? '...' : cancelLabel}
            variant="warning"
          />
        )}
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
