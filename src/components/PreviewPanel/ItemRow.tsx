'use client';

import { Package, User, Wrench } from 'lucide-react';

import { formatCurrency } from './utils';

// ============================================================================
// TYPES
// ============================================================================

/** Tipos de items comunes entre Budget y DeliveryNote */
export enum ItemType {
  Labor = 0,
  SparePart = 1,
  Other = 2,
}

export interface ItemData {
  id?: string;
  type: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  lineTotal: number;
  taxPercentage?: number;
}

interface ItemRowProps {
  item: ItemData;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ITEM_TYPE_CONFIG: Record<
  ItemType,
  { label: string; icon: React.ElementType; color: string }
> = {
  [ItemType.Labor]: {
    label: "Mà d'obra",
    icon: User,
    color: 'text-blue-600',
  },
  [ItemType.SparePart]: {
    label: 'Recanvi',
    icon: Package,
    color: 'text-green-600',
  },
  [ItemType.Other]: {
    label: 'Altre',
    icon: Wrench,
    color: 'text-gray-600',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Fila de item reutilizable para mostrar líneas de presupuesto/albarán.
 * Principio SRP: Solo renderiza una línea de item.
 */
export function ItemRow({ item }: ItemRowProps) {
  const typeConfig =
    ITEM_TYPE_CONFIG[item.type as ItemType] || ITEM_TYPE_CONFIG[ItemType.Other];
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
          {(item.discountPercentage ?? 0) > 0 && (
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
        <p className="text-xs text-gray-500">IVA {item.taxPercentage ?? 0}%</p>
      </div>
    </div>
  );
}

/**
 * Fila de item compacta para usar dentro de cards (ej: WorkOrderCard).
 */
export function ItemRowCompact({ item }: ItemRowProps) {
  const typeConfig =
    ITEM_TYPE_CONFIG[item.type as ItemType] || ITEM_TYPE_CONFIG[ItemType.Other];
  const Icon = typeConfig.icon;

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className={`p-2 rounded-lg bg-gray-100 ${typeConfig.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.description}</p>
        <p className="text-sm text-gray-500">
          {item.quantity} x {formatCurrency(item.unitPrice)}
          {(item.discountPercentage ?? 0) > 0 && (
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
        <p className="text-xs text-gray-500">IVA {item.taxPercentage ?? 0}%</p>
      </div>
    </div>
  );
}
