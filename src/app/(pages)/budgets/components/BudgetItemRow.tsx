'use client';

import { BudgetItemType } from 'app/interfaces/Budget';
import Operator from 'app/interfaces/Operator';
import SparePart from 'app/interfaces/SparePart';
import { Package, Trash2, User, Wrench } from 'lucide-react';

/** Formato de moneda simple para el presupuesto */
function formatCurrency(value: number): string {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

/** Representa un item del presupuesto en el formulario (sin id hasta guardarse) */
export interface BudgetItemFormData {
  tempId: string; // ID temporal para el frontend
  type: BudgetItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxPercentage: number;
  sparePartId?: string;
  operatorId?: string;
}

interface BudgetItemRowProps {
  item: BudgetItemFormData;
  index: number;
  spareParts: SparePart[];
  operators: Operator[];
  onUpdate: (tempId: string, updates: Partial<BudgetItemFormData>) => void;
  onDelete: (tempId: string) => void;
  disabled?: boolean;
}

/**
 * Componente para renderizar una fila de item del presupuesto.
 * Single Responsibility: Solo se encarga de mostrar y editar un item individual.
 */
export function BudgetItemRow({
  item,
  index,
  spareParts,
  operators,
  onUpdate,
  onDelete,
  disabled = false,
}: BudgetItemRowProps) {
  const lineTotal = calculateLineTotal(item);

  const getTypeIcon = () => {
    switch (item.type) {
      case BudgetItemType.Labor:
        return <User className="w-4 h-4" />;
      case BudgetItemType.SparePart:
        return <Package className="w-4 h-4" />;
      case BudgetItemType.Other:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case BudgetItemType.Labor:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case BudgetItemType.SparePart:
        return 'bg-green-100 text-green-700 border-green-200';
      case BudgetItemType.Other:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleTypeChange = (newType: BudgetItemType) => {
    const updates: Partial<BudgetItemFormData> = { type: newType };

    // Reset related fields when type changes
    if (newType === BudgetItemType.SparePart) {
      updates.operatorId = undefined;
    } else if (newType === BudgetItemType.Labor) {
      updates.sparePartId = undefined;
    } else {
      updates.sparePartId = undefined;
      updates.operatorId = undefined;
    }

    onUpdate(item.tempId, updates);
  };

  const handleSparePartChange = (sparePartId: string) => {
    const sparePart = spareParts.find(sp => sp.id === sparePartId);
    if (sparePart) {
      onUpdate(item.tempId, {
        sparePartId,
        description: sparePart.description,
        unitPrice: sparePart.rrp || sparePart.price,
      });
    }
  };

  const handleOperatorChange = (operatorId: string) => {
    const operator = operators.find(op => op.id === operatorId);
    if (operator) {
      onUpdate(item.tempId, {
        operatorId,
        description: `Mà d'obra - ${operator.name}`,
        unitPrice: operator.priceHour,
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Index & Type */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">
            #{index + 1}
          </span>
          <div className={`p-2 rounded-lg border ${getTypeColor()}`}>
            {getTypeIcon()}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-3">
          {/* Type Selector */}
          <div className="flex gap-2">
            {[
              { type: BudgetItemType.Labor, label: "Mà d'obra", icon: User },
              {
                type: BudgetItemType.SparePart,
                label: 'Recanvi',
                icon: Package,
              },
              { type: BudgetItemType.Other, label: 'Altre', icon: Wrench },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                disabled={disabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  item.type === type
                    ? 'bg-[#6E41B6] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Dynamic Selector based on Type */}
          {item.type === BudgetItemType.SparePart && (
            <select
              value={item.sparePartId || ''}
              onChange={e => handleSparePartChange(e.target.value)}
              disabled={disabled}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#6E41B6] focus:outline-none"
            >
              <option value="">Selecciona un recanvi...</option>
              {spareParts.map(sp => (
                <option key={sp.id} value={sp.id}>
                  {sp.code} - {sp.description} (
                  {formatCurrency(sp.rrp || sp.price)})
                </option>
              ))}
            </select>
          )}

          {item.type === BudgetItemType.Labor && (
            <select
              value={item.operatorId || ''}
              onChange={e => handleOperatorChange(e.target.value)}
              disabled={disabled}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#6E41B6] focus:outline-none"
            >
              <option value="">Selecciona un operari...</option>
              {operators.map(op => (
                <option key={op.id} value={op.id}>
                  {op.name} ({formatCurrency(op.priceHour)}/h)
                </option>
              ))}
            </select>
          )}

          {/* Description */}
          <input
            type="text"
            value={item.description}
            onChange={e =>
              onUpdate(item.tempId, { description: e.target.value })
            }
            disabled={disabled}
            placeholder="Descripció..."
            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#6E41B6] focus:outline-none"
          />

          {/* Quantity, Price, Discount, Tax */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Quantitat
              </label>
              <input
                type="number"
                value={item.quantity}
                onChange={e =>
                  onUpdate(item.tempId, {
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={disabled}
                min="0"
                step="0.5"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#6E41B6] focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Preu unit.
              </label>
              <input
                type="number"
                value={item.unitPrice}
                onChange={e =>
                  onUpdate(item.tempId, {
                    unitPrice: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={disabled}
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#6E41B6] focus:outline-none text-right"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Desc. %
              </label>
              <input
                type="number"
                value={item.discountPercentage}
                onChange={e =>
                  onUpdate(item.tempId, {
                    discountPercentage: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={disabled}
                min="0"
                max="100"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#6E41B6] focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">IVA %</label>
              <select
                value={item.taxPercentage}
                onChange={e =>
                  onUpdate(item.tempId, {
                    taxPercentage: parseFloat(e.target.value),
                  })
                }
                disabled={disabled}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#6E41B6] focus:outline-none"
              >
                <option value="0">0%</option>
                <option value="4">4%</option>
                <option value="10">10%</option>
                <option value="21">21%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Total & Delete */}
        <div className="flex flex-col items-end justify-between h-full min-w-[100px]">
          <button
            type="button"
            onClick={() => onDelete(item.tempId)}
            disabled={disabled}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="text-right mt-auto">
            <span className="text-xs text-gray-500 block">Total línia</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(lineTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Calcula el total de una línea aplicando descuento
 */
export function calculateLineTotal(item: BudgetItemFormData): number {
  const subtotal = item.quantity * item.unitPrice;
  const discountAmount = subtotal * (item.discountPercentage / 100);
  return subtotal - discountAmount;
}

/**
 * Calcula el total con impuestos de una línea
 */
export function calculateLineTotalWithTax(item: BudgetItemFormData): number {
  const lineTotal = calculateLineTotal(item);
  const taxAmount = lineTotal * (item.taxPercentage / 100);
  return lineTotal + taxAmount;
}

/**
 * Genera un ID temporal único para items del formulario
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Crea un nuevo item vacío con valores por defecto
 */
export function createEmptyItem(
  type: BudgetItemType = BudgetItemType.Other
): BudgetItemFormData {
  return {
    tempId: generateTempId(),
    type,
    description: '',
    quantity: 1,
    unitPrice: 0,
    discountPercentage: 0,
    taxPercentage: 21,
  };
}
