'use client';

import React, { useState } from 'react';
import { Budget } from 'app/interfaces/Budget';
import { ChevronDown, ChevronRight, User } from 'lucide-react';

interface AssemblyBudgetCustomerCardProps {
  budget: Budget;
  t: (key: string) => string;
}

export const AssemblyBudgetCustomerCard = React.memo(
  function AssemblyBudgetCustomerCard({
    budget,
    t,
  }: AssemblyBudgetCustomerCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!budget.companyName) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-800">
              {t('customer')}
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="px-5 pb-4 space-y-2 border-t border-gray-100 pt-3">
            <InfoRow label={t('name')} value={budget.companyName} />
            <InfoRow label={t('tax.id')} value={budget.customerNif} />
            <InfoRow
              label={t('company.email.placeholder')}
              value={budget.customerEmail}
            />
            <InfoRow
              label={t('phone')}
              value={budget.customerPhone}
            />
            {budget.customerAddress && (
              <InfoRow
                label={t('customer.main.address')}
                value={[
                  budget.customerAddress.address,
                  budget.customerAddress.city,
                  budget.customerAddress.postalCode,
                  budget.customerAddress.province,
                ]
                  .filter(Boolean)
                  .join(', ')}
              />
            )}
            {budget.installation && (
              <InfoRow
                label={t('store')}
                value={budget.installation.code}
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-gray-400 min-w-[80px] shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-700">{value}</span>
    </div>
  );
}
