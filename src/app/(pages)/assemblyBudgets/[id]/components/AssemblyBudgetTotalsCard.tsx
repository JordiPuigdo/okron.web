'use client';

import React from 'react';
import { Budget } from 'app/interfaces/Budget';
import { formatCurrencyServerSider } from 'app/utils/utils';

interface AssemblyBudgetTotalsCardProps {
  budget: Budget;
  t: (key: string) => string;
}

export const AssemblyBudgetTotalsCard = React.memo(
  function AssemblyBudgetTotalsCard({
    budget,
    t,
  }: AssemblyBudgetTotalsCardProps) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
          {t('totals')}
        </h2>
        <div className="space-y-2">
          <TotalRow
            label={t('subtotal')}
            amount={budget.subtotal}
            isBold={false}
          />

          {budget.taxBreakdowns?.map((breakdown, index) => (
            <div key={index} className="space-y-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">
                  {t('taxBase')} {breakdown.taxPercentage}%
                </span>
                <span className="tabular-nums">
                  {formatCurrencyServerSider(breakdown.taxableBase)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  IVA {breakdown.taxPercentage}%
                </span>
                <span className="tabular-nums">
                  {formatCurrencyServerSider(breakdown.taxAmount)}
                </span>
              </div>
            </div>
          ))}

          {(!budget.taxBreakdowns || budget.taxBreakdowns.length === 0) && (
            <TotalRow label="IVA" amount={budget.totalTax} isBold={false} />
          )}

          <div className="border-t pt-2.5 mt-2.5 flex justify-between items-baseline">
            <span className="text-base font-bold text-gray-900">
              {t('total')}
            </span>
            <span className="text-xl font-bold text-blue-600 tabular-nums">
              {formatCurrencyServerSider(budget.total)}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

function TotalRow({
  label,
  amount,
  isBold,
}: {
  label: string;
  amount: number;
  isBold: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`tabular-nums ${isBold ? 'font-bold' : 'font-medium'}`}>
        {formatCurrencyServerSider(amount)}
      </span>
    </div>
  );
}
