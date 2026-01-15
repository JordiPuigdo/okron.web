'use client';

import {
  Budget,
  BudgetItem,
  BudgetItemType,
  BudgetStatus,
} from 'app/interfaces/Budget';
import useRoutes from 'app/utils/useRoutes';
import {
  SlidePanel,
  SlidePanelActions,
  SlidePanelSection,
} from 'components/SlidePanel';
import {
  Calendar,
  Clock,
  Edit2,
  FileText,
  MapPin,
  Package,
  Printer,
  User,
  Wrench,
} from 'lucide-react';
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

const ITEM_TYPE_CONFIG: Record<
  BudgetItemType,
  { label: string; icon: React.ElementType; color: string }
> = {
  [BudgetItemType.Labor]: {
    label: "Mà d'obra",
    icon: User,
    color: 'text-blue-600',
  },
  [BudgetItemType.SparePart]: {
    label: 'Recanvi',
    icon: Package,
    color: 'text-green-600',
  },
  [BudgetItemType.Other]: {
    label: 'Altre',
    icon: Wrench,
    color: 'text-gray-600',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Panel de vista previa de presupuesto.
 *
 * Principios SOLID:
 * - SRP: Solo muestra la información del presupuesto
 * - OCP: Fácil añadir nuevas secciones o acciones
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

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={budget.code}
      subtitle={budget.companyName}
      headerActions={
        <StatusBadge status={budget.status} config={statusConfig} />
      }
    >
      {/* Resumen de totales */}
      <TotalsSummary budget={budget} />

      {/* Información del cliente */}
      <SlidePanelSection title="Client">
        <CustomerInfo budget={budget} />
      </SlidePanelSection>

      {/* Fechas */}
      <SlidePanelSection title="Dates">
        <DatesInfo budget={budget} />
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
// SUB-COMPONENTS
// ============================================================================

function StatusBadge({
  status,
  config,
}: {
  status: BudgetStatus;
  config: { label: string; className: string };
}) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function TotalsSummary({ budget }: { budget: Budget }) {
  return (
    <div className="bg-gradient-to-r from-[#6E41B6] to-[#8B5CF6] text-white px-6 py-6">
      <div className="text-center">
        <p className="text-purple-200 text-sm mb-1">Total pressupost</p>
        <p className="text-4xl font-bold">{formatCurrency(budget.total)}</p>
      </div>

      <div className="flex justify-center gap-8 mt-4 text-sm">
        <div className="text-center">
          <p className="text-purple-200">Subtotal</p>
          <p className="font-semibold">{formatCurrency(budget.subtotal)}</p>
        </div>
        <div className="text-center">
          <p className="text-purple-200">Impostos</p>
          <p className="font-semibold">{formatCurrency(budget.totalTax)}</p>
        </div>
      </div>
    </div>
  );
}

function CustomerInfo({ budget }: { budget: Budget }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <User className="w-5 h-5 text-gray-400 mt-0.5" />
        <div>
          <p className="font-medium text-gray-900">{budget.companyName}</p>
          {budget.customerNif && (
            <p className="text-sm text-gray-500">NIF: {budget.customerNif}</p>
          )}
        </div>
      </div>

      {budget.customerAddress && (
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="text-sm text-gray-600">
            {budget.customerAddress.address && (
              <p>{budget.customerAddress.address}</p>
            )}
            {budget.customerAddress.city && (
              <p>
                {budget.customerAddress.postalCode}{' '}
                {budget.customerAddress.city}
                {budget.customerAddress.province &&
                  `, ${budget.customerAddress.province}`}
              </p>
            )}
          </div>
        </div>
      )}

      {budget.installation && (
        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
          <MapPin className="w-5 h-5 text-[#6E41B6] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#6E41B6]">Instal·lació</p>
            <p className="text-sm text-gray-700">{budget.installation.code}</p>
            {budget.installation.address?.address && (
              <p className="text-sm text-gray-500">
                {budget.installation.address.address}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DatesInfo({ budget }: { budget: Budget }) {
  const budgetDate = new Date(budget.budgetDate);
  const validUntil = new Date(budget.validUntil);
  const isExpired =
    validUntil < new Date() && budget.status !== BudgetStatus.Converted;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <Calendar className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-xs text-gray-500">Data presupuesto</p>
          <p className="font-medium">{formatDate(budgetDate)}</p>
        </div>
      </div>

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
            className={`text-xs ${
              isExpired ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            Vàlid fins
          </p>
          <p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
            {formatDate(validUntil)}
          </p>
        </div>
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
        <ItemRow key={item.id || index} item={item} />
      ))}
    </div>
  );
}

function ItemRow({ item }: { item: BudgetItem }) {
  const typeConfig = ITEM_TYPE_CONFIG[item.type];
  const Icon = typeConfig.icon;

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`p-2 rounded-lg bg-white ${typeConfig.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.description}</p>
        <p className="text-sm text-gray-500">
          {item.quantity} x {formatCurrency(item.unitPrice)}
          {item.discountPercentage > 0 && (
            <span className="text-orange-600 ml-2">
              -{item.discountPercentage}%
            </span>
          )}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-gray-900">
          {formatCurrency(item.lineTotal)}
        </p>
        <p className="text-xs text-gray-500">IVA {item.taxPercentage}%</p>
      </div>
    </div>
  );
}

function CommentsSection({ budget }: { budget: Budget }) {
  return (
    <div className="space-y-4">
      {budget.externalComments && (
        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <p className="text-xs font-medium text-blue-700 mb-1">
            Comentari extern (visible al client)
          </p>
          <p className="text-sm text-gray-700">{budget.externalComments}</p>
        </div>
      )}

      {budget.internalComments && (
        <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <p className="text-xs font-medium text-yellow-700 mb-1">
            Comentari intern
          </p>
          <p className="text-sm text-gray-700">{budget.internalComments}</p>
        </div>
      )}
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  variant: 'primary' | 'secondary';
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  variant,
}: ActionButtonProps) {
  const baseClasses =
    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses =
    variant === 'primary'
      ? 'bg-[#6E41B6] text-white hover:bg-[#5a3596]'
      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ca-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default BudgetPreviewPanel;
