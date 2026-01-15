'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import {
  DeliveryNote,
  DeliveryNoteItem,
  DeliveryNoteStatus,
  DeliveryNoteWorkOrder,
} from 'app/interfaces/DeliveryNote';
import { DeliveryNoteService } from 'app/services/deliveryNoteService';
import useRoutes from 'app/utils/useRoutes';
import Loader from 'components/Loader/loader';
import {
  ActionButton,
  CommentBlock,
  CustomerInfo,
  DateCard,
  ItemRowCompact,
  StatusBadge,
  TotalsSummary,
} from 'components/PreviewPanel';
import {
  SlidePanel,
  SlidePanelActions,
  SlidePanelSection,
} from 'components/SlidePanel';
import { ClipboardList, Edit2, FileText, Printer, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface DeliveryNotePreviewPanelProps {
  /** Albarán a mostrar */
  deliveryNote: DeliveryNote | null;
  /** Controla si el panel está abierto */
  isOpen: boolean;
  /** Callback cuando se cierra */
  onClose: () => void;
  /** Callback opcional para refrescar datos después de editar */
  onRefresh?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<
  DeliveryNoteStatus,
  { label: string; className: string }
> = {
  [DeliveryNoteStatus.Draft]: {
    label: 'Esborrany',
    className: 'bg-gray-100 text-gray-700',
  },
  [DeliveryNoteStatus.Sent]: {
    label: 'Enviat',
    className: 'bg-blue-100 text-blue-700',
  },
  [DeliveryNoteStatus.Paid]: {
    label: 'Pagat',
    className: 'bg-green-100 text-green-700',
  },
  [DeliveryNoteStatus.Valued]: {
    label: 'Valorat',
    className: 'bg-purple-100 text-purple-700',
  },
  [DeliveryNoteStatus.NotValued]: {
    label: 'No Valorat',
    className: 'bg-orange-100 text-orange-700',
  },
  [DeliveryNoteStatus.Cancelled]: {
    label: 'Cancel·lat',
    className: 'bg-gray-100 text-gray-500',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Panel de vista previa de albarán.
 * Principios SOLID:
 * - SRP: Orquesta subcomponentes para mostrar albarán
 * - OCP: Fácil añadir nuevas secciones
 * - DIP: Usa componentes abstractos de PreviewPanel
 */
export function DeliveryNotePreviewPanel({
  deliveryNote,
  isOpen,
  onClose,
}: DeliveryNotePreviewPanelProps) {
  const router = useRouter();
  const ROUTES = useRoutes();
  const { t } = useTranslations();

  // Estado para el albarán completo cargado desde el servidor
  const [fullDeliveryNote, setFullDeliveryNote] = useState<DeliveryNote | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch del detalle completo cuando se abre el panel
  useEffect(() => {
    if (isOpen && deliveryNote?.id) {
      setIsLoading(true);
      const deliveryNoteService = new DeliveryNoteService(
        process.env.NEXT_PUBLIC_API_BASE_URL || ''
      );
      deliveryNoteService
        .getById(deliveryNote.id)
        .then(data => {
          setFullDeliveryNote(data);
        })
        .catch(error => {
          console.error('Error fetching delivery note details:', error);
          // Fallback al deliveryNote parcial si falla
          setFullDeliveryNote(deliveryNote);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!isOpen) {
      // Limpiar cuando se cierra
      setFullDeliveryNote(null);
    }
  }, [isOpen, deliveryNote?.id]);

  if (!deliveryNote) return null;

  // Usar el albarán completo si está disponible, sino el parcial
  const displayDeliveryNote = fullDeliveryNote || deliveryNote;
  const statusConfig = STATUS_CONFIG[displayDeliveryNote.status];

  const handleEdit = () => {
    router.push(ROUTES.deliveryNote.detail(deliveryNote.id));
    onClose();
  };

  const handlePrint = () => {
    window.open(`/print/deliveryNote?id=${deliveryNote.id}`, '_blank');
  };

  // Navegar a crear factura con este albarán preseleccionado
  const handleCreateInvoice = () => {
    router.push(`${ROUTES.invoices.create}?deliveryNoteId=${deliveryNote.id}`);
    onClose();
  };

  // Navegar al detalle de la factura si existe invoiceId
  const handleViewInvoice = () => {
    if (displayDeliveryNote.invoiceId) {
      router.push(`${ROUTES.invoices.detail}${displayDeliveryNote.invoiceId}`);
    }
    onClose();
  };

  // Preparar datos del cliente para el componente reutilizable
  const customerData = {
    companyName: displayDeliveryNote.companyName,
    customerNif: displayDeliveryNote.customerNif,
    customerEmail: displayDeliveryNote.customerEmail,
    customerPhone: displayDeliveryNote.customerPhone,
    customerAddress: displayDeliveryNote.customerAddress,
    installation: displayDeliveryNote.installation,
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={displayDeliveryNote.code}
      subtitle={displayDeliveryNote.companyName}
      headerActions={
        <StatusBadge
          label={statusConfig.label}
          className={statusConfig.className}
        />
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : (
        <>
          {/* Resumen de totales */}
          <TotalsSummary
            label="Total albarà"
            total={displayDeliveryNote.total}
            subtotal={displayDeliveryNote.subtotal}
            totalTax={displayDeliveryNote.totalTax}
            extraContent={
              displayDeliveryNote.invoiceId && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                  💰 Facturat
                </span>
              )
            }
          />

          {/* Información del cliente */}
          <SlidePanelSection title="Client">
            <CustomerInfo
              data={customerData}
              extraContent={
                displayDeliveryNote.refCustomerIds && (
                  <RefCustomerBadge
                    refIds={displayDeliveryNote.refCustomerIds}
                  />
                )
              }
            />
          </SlidePanelSection>

          {/* Fecha */}
          <SlidePanelSection title="Data">
            <DateCard
              label="Data albarà"
              date={new Date(displayDeliveryNote.deliveryNoteDate)}
            />
          </SlidePanelSection>

          {/* Work Orders con sus items */}
          <SlidePanelSection
            title={`Ordres de Treball (${
              displayDeliveryNote.workOrders?.length || 0
            })`}
          >
            <WorkOrdersList workOrders={displayDeliveryNote.workOrders} />
          </SlidePanelSection>

          {/* Comentarios */}
          {displayDeliveryNote.externalComments && (
            <SlidePanelSection title="Comentaris">
              <CommentBlock
                title="Comentari extern (visible al client)"
                content={displayDeliveryNote.externalComments}
                variant="external"
              />
            </SlidePanelSection>
          )}

          {/* Acciones */}
          <SlidePanelActions>
            {/* Acción principal de facturación */}
            {displayDeliveryNote.invoiceId ? (
              <ActionButton
                onClick={handleViewInvoice}
                icon={Receipt}
                label={t('see.invoice')}
                variant="success"
              />
            ) : (
              <ActionButton
                onClick={handleCreateInvoice}
                icon={Receipt}
                label={t('create.invoice')}
                variant="warning"
              />
            )}
            <ActionButton
              onClick={handleEdit}
              icon={Edit2}
              label={t('edit')}
              variant="primary"
            />
            <ActionButton
              onClick={handlePrint}
              icon={Printer}
              label={t('print')}
              variant="secondary"
            />
            <ActionButton
              onClick={handlePrint}
              icon={FileText}
              label="PDF"
              variant="secondary"
            />
          </SlidePanelActions>
        </>
      )}
    </SlidePanel>
  );
}

// ============================================================================
// SUB-COMPONENTS (Específicos de DeliveryNote)
// ============================================================================

function RefCustomerBadge({ refIds }: { refIds: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
      <ClipboardList className="w-5 h-5 text-blue-600 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-blue-700">Ref. Client</p>
        <p className="text-sm text-gray-700">{refIds}</p>
      </div>
    </div>
  );
}

function WorkOrdersList({
  workOrders,
}: {
  workOrders: DeliveryNoteWorkOrder[];
}) {
  if (!workOrders || workOrders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No hi ha ordres de treball</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workOrders.map((workOrder, index) => (
        <WorkOrderCard
          key={workOrder.workOrderId || index}
          workOrder={workOrder}
        />
      ))}
    </div>
  );
}

function WorkOrderCard({ workOrder }: { workOrder: DeliveryNoteWorkOrder }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header de la OT */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#6E41B6]" />
            <span className="font-semibold text-gray-900">
              {workOrder.workOrderCode}
            </span>
          </div>
          {workOrder.workOrderRefId && (
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
              Ref: {workOrder.workOrderRefId}
            </span>
          )}
        </div>
        {workOrder.concept && (
          <p className="text-sm text-gray-600 mt-1 truncate">
            {workOrder.concept}
          </p>
        )}
      </div>

      {/* Items de la OT */}
      <div className="divide-y divide-gray-100">
        {workOrder.items && workOrder.items.length > 0 ? (
          workOrder.items.map((item, index) => (
            <ItemRowCompact
              key={item.id || index}
              item={mapDeliveryNoteItemToItemData(item)}
            />
          ))
        ) : (
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            Sense línies
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function mapDeliveryNoteItemToItemData(item: DeliveryNoteItem) {
  return {
    id: item.id,
    type: item.type as number,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountPercentage: item.discountPercentage,
    lineTotal: item.lineTotal,
    taxPercentage: item.taxPercentage,
  };
}

export default DeliveryNotePreviewPanel;
