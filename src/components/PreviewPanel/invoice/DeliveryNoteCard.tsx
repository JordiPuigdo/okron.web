'use client';

import { useState } from 'react';
import {
  DeliveryNote,
  DeliveryNoteWorkOrder,
} from 'app/interfaces/DeliveryNote';
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Receipt,
} from 'lucide-react';

import { ItemRowCompact } from '../ItemRow';
import { formatCurrency, mapDeliveryNoteItemToItemData } from '../utils';

// ============================================================================
// DeliveryNotesList - Lista de albaranes colapsables
// ============================================================================

interface DeliveryNotesListProps {
  deliveryNotes: DeliveryNote[];
  /** Si true, las cards empiezan expandidas */
  expandByDefault?: boolean;
}

/**
 * Lista de albaranes con cards colapsables.
 * Principio SRP: Renderiza lista de DeliveryNoteCard.
 */
export function DeliveryNotesList({
  deliveryNotes,
  expandByDefault = false,
}: DeliveryNotesListProps) {
  if (!deliveryNotes || deliveryNotes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No hi ha albarans</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deliveryNotes.map((dn, index) => (
        <DeliveryNoteCard
          key={dn.id || index}
          deliveryNote={dn}
          defaultExpanded={expandByDefault}
        />
      ))}
    </div>
  );
}

// ============================================================================
// DeliveryNoteCard - Card individual de albarán
// ============================================================================

interface DeliveryNoteCardProps {
  deliveryNote: DeliveryNote;
  defaultExpanded?: boolean;
}

/**
 * Card colapsable para un albarán.
 * Muestra código, total y OTs cuando está expandida.
 */
export function DeliveryNoteCard({
  deliveryNote,
  defaultExpanded = false,
}: DeliveryNoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const dnTotal = deliveryNote.total || 0;
  const workOrdersCount = deliveryNote.workOrders?.length || 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header del albarán - clickable para expandir/colapsar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-blue-50 px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-blue-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-blue-600" />
          )}
          <Receipt className="w-4 h-4 text-blue-600" />
          <div className="text-left">
            <span className="font-semibold text-gray-900">
              {deliveryNote.code}
            </span>
            <span className="text-sm text-gray-500 ml-2">
              ({workOrdersCount} OT{workOrdersCount !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
        <span className="font-semibold text-gray-900">
          {formatCurrency(dnTotal)}
        </span>
      </button>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {deliveryNote.workOrders && deliveryNote.workOrders.length > 0 ? (
            deliveryNote.workOrders.map((wo, index) => (
              <WorkOrderSection key={wo.workOrderId || index} workOrder={wo} />
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Sense ordres de treball
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WorkOrderSection - Sección de orden de trabajo dentro de un albarán
// ============================================================================

interface WorkOrderSectionProps {
  workOrder: DeliveryNoteWorkOrder;
}

/**
 * Sección que muestra una OT con sus líneas.
 */
function WorkOrderSection({ workOrder }: WorkOrderSectionProps) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Header de la OT */}
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#6E41B6]" />
          <span className="font-medium text-gray-900">
            {workOrder.workOrderCode}
          </span>
          {workOrder.workOrderRefId && (
            <span className="text-sm text-gray-500">
              (Ref: {workOrder.workOrderRefId})
            </span>
          )}
        </div>
      </div>

      {/* Items de la OT */}
      <div className="divide-y divide-gray-50">
        {workOrder.items && workOrder.items.length > 0 ? (
          workOrder.items.map((item, index) => (
            <ItemRowCompact
              key={item.id || index}
              item={mapDeliveryNoteItemToItemData(item)}
            />
          ))
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500 text-center">
            Sense línies
          </div>
        )}
      </div>
    </div>
  );
}
