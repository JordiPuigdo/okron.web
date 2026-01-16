'use client';

import { useState } from 'react';
import { Order, OrderItem } from 'app/interfaces/Order';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp, Truck } from 'lucide-react';

import { STATUS_CONFIG } from './constants';
import { RelatedOrdersListProps } from './types';
import { calculateOrderTotals } from './utils';

/**
 * Lista de albaranes de recepción relacionados con detalle completo.
 * SRP: Muestra lista expandible con detalle inline.
 */
export function RelatedOrdersList({
  relatedOrders,
  onNavigate,
}: RelatedOrdersListProps) {
  if (!relatedOrders || relatedOrders.length === 0) {
    return <EmptyRelationsMessage />;
  }

  return (
    <div className="space-y-3">
      {relatedOrders.map(order => (
        <RelatedOrderCard
          key={order.id}
          order={order}
          onNavigate={() => onNavigate(order.id)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function EmptyRelationsMessage() {
  return (
    <p className="text-gray-500 text-sm italic">
      No hi ha albarans de recepció
    </p>
  );
}

interface RelatedOrderCardProps {
  order: Order;
  onNavigate: () => void;
}

function RelatedOrderCard({ order, onNavigate }: RelatedOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[order.status];
  const totals = calculateOrderTotals(order.items || []);

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Header - siempre visible */}
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#6E41B6]" />
              <span className="font-medium text-[#6E41B6]">{order.code}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
              <span>{dayjs(order.date).format('DD/MM/YYYY')}</span>
              {order.deliveryProviderCode && (
                <>
                  <span>·</span>
                  <span>Albarà: {order.deliveryProviderCode}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold text-gray-900">
              {totals.total.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#6E41B6] transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Ocultar detall
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Veure detall ({order.items?.length || 0} articles)
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onNavigate}
            className="text-sm text-[#6E41B6] hover:underline font-medium"
          >
            Anar al detall →
          </button>
        </div>
      </div>

      {/* Detalle expandible */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50/50 p-3">
          <RelatedOrderItemsList items={order.items || []} />
        </div>
      )}
    </div>
  );
}

interface RelatedOrderItemsListProps {
  items: OrderItem[];
}

function RelatedOrderItemsList({ items }: RelatedOrderItemsListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No hi ha articles</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <RelatedOrderItemRow key={item.id || index} item={item} />
      ))}
    </div>
  );
}

interface RelatedOrderItemRowProps {
  item: OrderItem;
}

function RelatedOrderItemRow({ item }: RelatedOrderItemRowProps) {
  const unitPrice = parseFloat(item.unitPrice) || 0;
  const lineTotal = item.quantity * unitPrice * (1 - item.discount / 100);

  return (
    <div className="flex justify-between items-center py-1.5 px-2 bg-white rounded border border-gray-100">
      <div className="flex-1">
        <span className="text-sm text-gray-900">
          {item.sparePartName || item.sparePart?.code || '-'}
        </span>
        <span className="text-xs text-gray-500 ml-2">
          {item.quantity} x {unitPrice.toFixed(2)} €
          {item.discount > 0 && (
            <span className="text-orange-600 ml-1">(-{item.discount}%)</span>
          )}
        </span>
      </div>
      <span className="text-sm font-medium text-gray-900">
        {lineTotal.toFixed(2)} €
      </span>
    </div>
  );
}
