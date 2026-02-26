'use client';

import { formatCurrencyServerSider } from 'app/utils/utils';

interface CreditNoteTotalsCardProps {
  subtotal: number;
  taxAmount: number;
  total: number;
  creditPercentage?: number;
  t: (key: string) => string;
}

export function CreditNoteTotalsCard({
  subtotal,
  taxAmount,
  total,
  creditPercentage,
  t,
}: CreditNoteTotalsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        {t('creditNote.totals')}
      </h3>

      <div className="space-y-3">
        {creditPercentage !== undefined && creditPercentage !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{t('creditNote.percentage')}</span>
            <span className="font-medium text-gray-700">
              {creditPercentage}%
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{t('subtotal')}</span>
          <span className="font-medium text-gray-700">
            {formatCurrencyServerSider(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{t('tax')}</span>
          <span className="font-medium text-gray-700">
            {formatCurrencyServerSider(taxAmount)}
          </span>
        </div>

        <div className="h-px bg-gray-200 my-1" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {t('total')}
          </span>
          <span className="text-lg font-bold text-okron-primary">
            {formatCurrencyServerSider(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
