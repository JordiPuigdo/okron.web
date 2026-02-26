'use client';

import { CreditNote, CreditNoteType } from 'app/interfaces/CreditNote';
import dayjs from 'dayjs';
import { Calendar, FileText, Hash, Percent, User } from 'lucide-react';

interface CreditNoteInfoCardProps {
  creditNote: CreditNote;
  t: (key: string) => string;
}

const TYPE_LABELS: Record<CreditNoteType, string> = {
  [CreditNoteType.Total]: 'Total',
  [CreditNoteType.Partial]: 'Parcial',
  [CreditNoteType.External]: 'Externa',
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <div className="text-sm font-medium text-gray-800 mt-0.5 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

export function CreditNoteInfoCard({ creditNote, t }: CreditNoteInfoCardProps) {
  const invoiceReference =
    creditNote.originalInvoiceCode ||
    creditNote.externalInvoiceCode ||
    t('common.not.available');

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        {t('creditNote.information')}
      </h3>

      <div className="divide-y divide-gray-50">
        <InfoRow
          icon={<Hash className="w-4 h-4 text-gray-400" />}
          label={t('creditNote.code')}
          value={creditNote.code}
        />

        <InfoRow
          icon={<FileText className="w-4 h-4 text-gray-400" />}
          label={t('creditNote.originalInvoice')}
          value={invoiceReference}
        />

        <InfoRow
          icon={<Calendar className="w-4 h-4 text-gray-400" />}
          label={t('creditNote.date')}
          value={dayjs(creditNote.creditNoteDate).format('DD/MM/YYYY')}
        />

        <InfoRow
          icon={<User className="w-4 h-4 text-gray-400" />}
          label={t('creditNote.customer')}
          value={creditNote.companyName || t('common.not.available')}
        />

        <InfoRow
          icon={<Percent className="w-4 h-4 text-gray-400" />}
          label={t('creditNote.type')}
          value={TYPE_LABELS[creditNote.type] ?? t('common.unknown')}
        />

        {creditNote.creditPercentage !== undefined &&
          creditNote.creditPercentage !== null && (
            <InfoRow
              icon={<Percent className="w-4 h-4 text-gray-400" />}
              label={t('creditNote.percentage')}
              value={`${creditNote.creditPercentage}%`}
            />
          )}
      </div>
    </div>
  );
}
