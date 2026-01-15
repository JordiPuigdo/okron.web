'use client';

import { useEffect, useState } from 'react';
import { Invoice, InvoiceStatus } from 'app/interfaces/Invoice';
import { InvoiceService } from 'app/services/invoiceService';
import useRoutes from 'app/utils/useRoutes';
import Loader from 'components/Loader/loader';
import {
  ActionButton,
  calculateDeliveryNotesTotals,
  CustomerInfo,
  DeliveryNotesList,
  InvoiceDatesInfo,
  PaymentMethodInfo,
  StatusBadge,
  TotalsSummary,
} from 'components/PreviewPanel';
import {
  SlidePanel,
  SlidePanelActions,
  SlidePanelSection,
} from 'components/SlidePanel';
import { Edit2, FileText, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface InvoicePreviewPanelProps {
  /** Factura a mostrar */
  invoice: Invoice | null;
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
  InvoiceStatus,
  { label: string; className: string }
> = {
  [InvoiceStatus.Pending]: {
    label: 'Pendent',
    className: 'bg-yellow-100 text-yellow-700',
  },
  [InvoiceStatus.Invoiced]: {
    label: 'Facturada',
    className: 'bg-green-100 text-green-700',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Panel de vista previa de factura.
 * Principios SOLID:
 * - SRP: Orquesta subcomponentes para mostrar factura
 * - OCP: Fácil añadir nuevas secciones
 * - DIP: Usa componentes abstractos de PreviewPanel
 */
export function InvoicePreviewPanel({
  invoice,
  isOpen,
  onClose,
}: InvoicePreviewPanelProps) {
  const router = useRouter();
  const ROUTES = useRoutes();

  // Estado para la factura completa cargada desde el servidor
  const [fullInvoice, setFullInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch del detalle completo cuando se abre el panel
  useEffect(() => {
    if (isOpen && invoice?.id) {
      setIsLoading(true);
      const invoiceService = new InvoiceService(
        process.env.NEXT_PUBLIC_API_BASE_URL || ''
      );
      invoiceService
        .getById(invoice.id)
        .then(data => {
          setFullInvoice(data);
        })
        .catch(error => {
          console.error('Error fetching invoice details:', error);
          // Fallback al invoice parcial si falla
          setFullInvoice(invoice);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!isOpen) {
      // Limpiar cuando se cierra
      setFullInvoice(null);
    }
  }, [isOpen, invoice?.id]);

  if (!invoice) return null;

  // Usar la factura completa si está disponible, sino la parcial
  const displayInvoice = fullInvoice || invoice;
  const statusConfig = STATUS_CONFIG[displayInvoice.status];
  const deliveryNotes = displayInvoice.deliveryNotes || [];
  const firstDeliveryNote = deliveryNotes[0];

  // Calcular totales usando la función de utils
  const totals = calculateDeliveryNotesTotals(deliveryNotes);

  // Preparar datos del cliente desde el primer delivery note
  const customerData = firstDeliveryNote
    ? {
        companyName: firstDeliveryNote.companyName,
        customerNif: firstDeliveryNote.customerNif,
        customerEmail: firstDeliveryNote.customerEmail,
        customerPhone: firstDeliveryNote.customerPhone,
        customerAddress: firstDeliveryNote.customerAddress,
        installation: firstDeliveryNote.installation,
      }
    : undefined;

  // Handlers
  const handleEdit = () => {
    router.push(ROUTES.invoices.edit(invoice.id));
    onClose();
  };

  const handlePrint = () => {
    window.open(`/print/invoice?id=${invoice.id}`, '_blank');
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={displayInvoice.code}
      subtitle={firstDeliveryNote?.companyName}
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
          <TotalsSummary
            label="Total factura"
            total={totals.total}
            subtotal={totals.subtotal}
            totalTax={totals.totalTax}
          />

          {customerData && (
            <SlidePanelSection title="Client">
              <CustomerInfo data={customerData} />
            </SlidePanelSection>
          )}

          <SlidePanelSection title="Dates">
            <InvoiceDatesInfo invoice={displayInvoice} />
          </SlidePanelSection>

          {displayInvoice.paymentMethod && (
            <SlidePanelSection title="Pagament">
              <PaymentMethodInfo paymentMethod={displayInvoice.paymentMethod} />
            </SlidePanelSection>
          )}

          <SlidePanelSection title={`Albarans (${deliveryNotes.length})`}>
            <DeliveryNotesList
              deliveryNotes={deliveryNotes}
              expandByDefault={deliveryNotes.length === 1}
            />
          </SlidePanelSection>

          <SlidePanelActions>
            <ActionButton
              onClick={handleEdit}
              icon={Edit2}
              label="Editar"
              variant="primary"
            />
            <ActionButton
              onClick={handlePrint}
              icon={Printer}
              label="Imprimir"
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

export default InvoicePreviewPanel;
