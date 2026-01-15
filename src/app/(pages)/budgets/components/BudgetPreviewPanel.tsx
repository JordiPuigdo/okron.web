'use client';

import { Budget, BudgetItem, BudgetStatus } from 'app/interfaces/Budget';
import useRoutes from 'app/utils/useRoutes';
import {
  ActionButton,
  CommentBlock,
  CustomerInfo,
  DateCard,
  formatDateShort,
  ItemRow,
  StatusBadge,
  TotalsSummary,
} from 'components/PreviewPanel';
import {
  SlidePanel,
  SlidePanelActions,
  SlidePanelSection,
} from 'components/SlidePanel';
import { Clock, Edit2, FileText, Package, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface BudgetPreviewPanelProps {
  /** Presupuesto a mostrar */
  budget: Budget | null;
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
  BudgetStatus,
  { label: string; className: string }
> = {
  [BudgetStatus.Draft]: {
    label: 'Esborrany',
    className: 'bg-gray-100 text-gray-700',
  },
  [BudgetStatus.Sent]: {
    label: 'Enviat',
    className: 'bg-blue-100 text-blue-700',
  },
  [BudgetStatus.Accepted]: {
    label: 'Acceptat',
    className: 'bg-green-100 text-green-700',
  },
  [BudgetStatus.Rejected]: {
    label: 'Rebutjat',
    className: 'bg-red-100 text-red-700',
  },
  [BudgetStatus.Expired]: {
    label: 'Caducat',
    className: 'bg-orange-100 text-orange-700',
  },
  [BudgetStatus.Cancelled]: {
    label: 'Cancel·lat',
    className: 'bg-gray-100 text-gray-500',
  },
  [BudgetStatus.Converted]: {
    label: 'Convertit',
    className: 'bg-purple-100 text-purple-700',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Panel de vista previa de presupuesto.
 * Principios SOLID:
 * - SRP: Orquesta subcomponentes para mostrar presupuesto
 * - OCP: Fácil añadir nuevas secciones
 * - DIP: Usa componentes abstractos de PreviewPanel
 */
export function BudgetPreviewPanel({
  budget,
  isOpen,
  onClose,
}: BudgetPreviewPanelProps) {
  const router = useRouter();
  const ROUTES = useRoutes();

  if (!budget) return null;

  const statusConfig = STATUS_CONFIG[budget.status];

  const handleEdit = () => {
    router.push(ROUTES.budget.detail(budget.id));
    onClose();
  };

  const handlePrint = () => {
    window.open(ROUTES.print.budget(budget.id), '_blank');
  };

  // Preparar datos del cliente para el componente reutilizable
  const customerData = {
    companyName: budget.companyName,
    customerNif: budget.customerNif,
    customerAddress: budget.customerAddress,
    installation: budget.installation,
  };

  const budgetDate = new Date(budget.budgetDate);
  const validUntil = new Date(budget.validUntil);
  const isExpired =
    validUntil < new Date() && budget.status !== BudgetStatus.Converted;

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={budget.code}
      subtitle={budget.companyName}
      headerActions={
        <StatusBadge
          label={statusConfig.label}
          className={statusConfig.className}
        />
      }
    >
      {/* Resumen de totales */}
      <TotalsSummary
        label="Total pressupost"
        total={budget.total}
        subtotal={budget.subtotal}
        totalTax={budget.totalTax}
      />

      {/* Información del cliente */}
      <SlidePanelSection title="Client">
        <CustomerInfo data={customerData} />
      </SlidePanelSection>

      {/* Fechas */}
      <SlidePanelSection title="Dates">
        <DatesInfo
          budgetDate={budgetDate}
          validUntil={validUntil}
          isExpired={isExpired}
        />
      </SlidePanelSection>

      {/* Items del presupuesto */}
      <SlidePanelSection title={`Línies (${budget.items?.length || 0})`}>
        <ItemsList items={budget.items} />
      </SlidePanelSection>

      {/* Comentarios */}
      {(budget.externalComments || budget.internalComments) && (
        <SlidePanelSection title="Comentaris">
          <CommentsSection budget={budget} />
        </SlidePanelSection>
      )}

      {/* Acciones */}
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
    </SlidePanel>
  );
}

// ============================================================================
// SUB-COMPONENTS (Específicos de Budget)
// ============================================================================

interface DatesInfoProps {
  budgetDate: Date;
  validUntil: Date;
  isExpired: boolean;
}

function DatesInfo({ budgetDate, validUntil, isExpired }: DatesInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <DateCard label="Data pressupost" date={budgetDate} />
      <ValidUntilCard date={validUntil} isExpired={isExpired} />
    </div>
  );
}

function ValidUntilCard({
  date,
  isExpired,
}: {
  date: Date;
  isExpired: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        isExpired ? 'bg-red-50' : 'bg-gray-50'
      }`}
    >
      <Clock
        className={`w-5 h-5 ${isExpired ? 'text-red-400' : 'text-gray-400'}`}
      />
      <div>
        <p
          className={`text-xs ${isExpired ? 'text-red-500' : 'text-gray-500'}`}
        >
          Vàlid fins
        </p>
        <p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
          {formatDateShort(date)}
        </p>
      </div>
    </div>
  );
}

function ItemsList({ items }: { items: BudgetItem[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No hi ha línies</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <ItemRow key={item.id || index} item={mapBudgetItemToItemData(item)} />
      ))}
    </div>
  );
}

function CommentsSection({ budget }: { budget: Budget }) {
  return (
    <div className="space-y-4">
      {budget.externalComments && (
        <CommentBlock
          title="Comentari extern (visible al client)"
          content={budget.externalComments}
          variant="external"
        />
      )}
      {budget.internalComments && (
        <CommentBlock
          title="Comentari intern"
          content={budget.internalComments}
          variant="internal"
        />
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function mapBudgetItemToItemData(item: BudgetItem) {
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

export default BudgetPreviewPanel;
