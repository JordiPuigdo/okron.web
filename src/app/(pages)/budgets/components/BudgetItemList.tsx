'use client';

import { BudgetItemType } from 'app/interfaces/Budget';
import Operator from 'app/interfaces/Operator';
import SparePart from 'app/interfaces/SparePart';
import { Package, Plus, User, Wrench } from 'lucide-react';

import {
  BudgetItemFormData,
  BudgetItemRow,
  calculateLineTotal,
  createEmptyItem,
} from './BudgetItemRow';

interface BudgetItemListProps {
  items: BudgetItemFormData[];
  onChange: (items: BudgetItemFormData[]) => void;
  spareParts: SparePart[];
  operators: Operator[];
  disabled?: boolean;
  t: (key: string) => string;
}

/**
 * Componente para gestionar la lista de items del presupuesto.
 * Single Responsibility: Gestiona el CRUD de items y muestra el resumen de totales.
 * Open/Closed: Fácil de extender con nuevos tipos de items sin modificar.
 */
export function BudgetItemList({
  items,
  onChange,
  spareParts,
  operators,
  disabled = false,
  t,
}: BudgetItemListProps) {
  const handleAddItem = (type: BudgetItemType) => {
    const newItem = createEmptyItem(type);
    onChange([...items, newItem]);
  };

  const handleUpdateItem = (
    tempId: string,
    updates: Partial<BudgetItemFormData>
  ) => {
    onChange(
      items.map(item =>
        item.tempId === tempId ? { ...item, ...updates } : item
      )
    );
  };

  const handleDeleteItem = (tempId: string) => {
    onChange(items.filter(item => item.tempId !== tempId));
  };

  // Cálculos de totales
  const subtotal = items.reduce(
    (acc, item) => acc + calculateLineTotal(item),
    0
  );

  const taxBreakdown = items.reduce((acc, item) => {
    const lineTotal = calculateLineTotal(item);
    const taxAmount = lineTotal * (item.taxPercentage / 100);
    const existingTax = acc.find(t => t.percentage === item.taxPercentage);

    if (existingTax) {
      existingTax.base += lineTotal;
      existingTax.amount += taxAmount;
    } else if (item.taxPercentage > 0) {
      acc.push({
        percentage: item.taxPercentage,
        base: lineTotal,
        amount: taxAmount,
      });
    }
    return acc;
  }, [] as { percentage: number; base: number; amount: number }[]);

  const totalTax = taxBreakdown.reduce((acc, t) => acc + t.amount, 0);
  const total = subtotal + totalTax;

  return (
    <div className="space-y-4">
      {/* Header con botones de añadir */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          ({t('budget.form.lines')})
          {items.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({items.length} {items.length === 1 ? 'línia' : 'línies'})
            </span>
          )}
        </h3>
      </div>

      {/* Quick Add Buttons - Estilo moderno tipo chips */}
      <div className="flex flex-wrap gap-2">
        <QuickAddButton
          onClick={() => handleAddItem(BudgetItemType.Labor)}
          icon={User}
          label={t('budget.itemType.labor')}
          color="blue"
          disabled={disabled}
        />
        <QuickAddButton
          onClick={() => handleAddItem(BudgetItemType.SparePart)}
          icon={Package}
          label={t('budget.itemType.sparePart')}
          color="green"
          disabled={disabled}
        />
        <QuickAddButton
          onClick={() => handleAddItem(BudgetItemType.Other)}
          icon={Wrench}
          label={t('budget.itemType.other')}
          color="gray"
          disabled={disabled}
        />
      </div>

      {/* Lista de items */}
      {items.length === 0 ? (
        <EmptyState onAddItem={handleAddItem} disabled={disabled} t={t} />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <BudgetItemRow
              key={item.tempId}
              item={item}
              index={index}
              spareParts={spareParts}
              operators={operators}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Resumen de totales */}
      {items.length > 0 && (
        <TotalsSummary
          subtotal={subtotal}
          taxBreakdown={taxBreakdown}
          totalTax={totalTax}
          total={total}
          t={t}
        />
      )}
    </div>
  );
}

/** Botón rápido para añadir items */
function QuickAddButton({
  onClick,
  icon: Icon,
  label,
  color,
  disabled,
}: {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  color: 'blue' | 'green' | 'gray';
  disabled?: boolean;
}) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium text-sm transition-all ${
        colorStyles[color]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Plus className="w-4 h-4" />
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/** Estado vacío con call to action */
function EmptyState({
  onAddItem,
  disabled,
  t,
}: {
  onAddItem: (type: BudgetItemType) => void;
  disabled?: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
      <div className="flex justify-center gap-4 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Package className="w-6 h-6 text-green-600" />
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Wrench className="w-6 h-6 text-gray-600" />
        </div>
      </div>
      <h4 className="text-lg font-medium text-gray-700 mb-2">
        {t('budget.newlines')}
      </h4>
      <p className="text-sm text-gray-500 mb-4">
        {t('budget.form.addLinesDescription')}
      </p>
      <button
        type="button"
        onClick={() => onAddItem(BudgetItemType.Other)}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#6E41B6] text-white rounded-full font-medium hover:bg-[#5a3596] transition-colors disabled:opacity-50"
      >
        <Plus className="w-5 h-5" />
        {t('budget.form.addFirstLine')}
      </button>
    </div>
  );
}

/** Formato de moneda simple */
function formatCurrency(value: number): string {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

/** Resumen de totales */
function TotalsSummary({
  subtotal,
  taxBreakdown,
  totalTax,
  total,
  t,
}: {
  subtotal: number;
  taxBreakdown: { percentage: number; base: number; amount: number }[];
  totalTax: number;
  total: number;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {t('budget.preview.subtotal')}:
            </span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {taxBreakdown.map(tax => (
            <div key={tax.percentage} className="flex justify-between text-sm">
              <span className="text-gray-600">IVA {tax.percentage}%:</span>
              <span className="font-medium">{formatCurrency(tax.amount)}</span>
            </div>
          ))}

          {totalTax > 0 && (
            <div className="flex justify-between text-sm border-t border-purple-200 pt-2">
              <span className="text-gray-600">Total impostos:</span>
              <span className="font-medium">{formatCurrency(totalTax)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg border-t-2 border-purple-300 pt-2">
            <span className="font-bold text-gray-900">TOTAL:</span>
            <span className="font-bold text-[#6E41B6]">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
