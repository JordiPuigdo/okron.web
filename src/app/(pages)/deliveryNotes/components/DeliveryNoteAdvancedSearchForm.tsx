'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslations } from 'app/hooks/useTranslations';
import { DeliveryNoteStatus } from 'app/interfaces/DeliveryNote';
import { DeliveryNoteSearchFilters } from 'app/interfaces/Invoice';
import { translateDeliveryNoteStatus } from 'app/utils/deliveryNoteUtils';
import { ca } from 'date-fns/locale';
import { Button } from 'designSystem/Button/Buttons';
import { Search, X } from 'lucide-react';

interface DeliveryNoteAdvancedSearchFormProps {
  onSearch: (filters: DeliveryNoteSearchFilters) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function DeliveryNoteAdvancedSearchForm({
  onSearch,
  onClear,
  isLoading = false,
}: DeliveryNoteAdvancedSearchFormProps) {
  const { t } = useTranslations();
  const [filters, setFilters] = useState<DeliveryNoteSearchFilters>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">{t('delivery.notes.advanced.search')}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="font-medium">{t('company.name')}</label>
            <input
              type="text"
              value={filters.companyName || ''}
              onChange={e =>
                setFilters(prev => ({ ...prev, companyName: e.target.value }))
              }
              placeholder={t('search.by.name')}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Customer ID */}
          <div className="space-y-2">
            <label className="font-medium">{t('customer.id')}</label>
            <input
              type="text"
              value={filters.customerId || ''}
              onChange={e =>
                setFilters(prev => ({ ...prev, customerId: e.target.value }))
              }
              placeholder={t('customer.id.placeholder')}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Delivery Note Code */}
          <div className="space-y-2">
            <label className="font-medium">{t('delivery.note.code')}</label>
            <input
              type="text"
              value={filters.deliveryNoteCode || ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  deliveryNoteCode: e.target.value,
                }))
              }
              placeholder={t('delivery.note.code.placeholder')}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="font-medium">{t('status')}</label>
            <select
              value={filters.status || ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  status: e.target.value || undefined,
                }))
              }
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">{t('all.statuses')}</option>
              {Object.values(DeliveryNoteStatus)
                .filter(value => typeof value === 'number')
                .map(status => (
                  <option key={status} value={status}>
                    {translateDeliveryNoteStatus(status as DeliveryNoteStatus)}
                  </option>
                ))}
            </select>
          </div>

          {/* Has Invoice */}
          <div className="space-y-2">
            <label className="font-medium">{t('has.invoice')}</label>
            <select
              value={
                filters.hasInvoice !== undefined
                  ? String(filters.hasInvoice)
                  : ''
              }
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  hasInvoice: e.target.value
                    ? e.target.value === 'true'
                    : undefined,
                }))
              }
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">{t('all')}</option>
              <option value="true">{t('with.invoice')}</option>
              <option value="false">{t('without.invoice')}</option>
            </select>
          </div>

          {/* Work Order IDs */}
          <div className="space-y-2">
            <label className="font-medium">{t('work.order.ids')}</label>
            <input
              type="text"
              value={filters.workOrderIds?.join(', ') || ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  workOrderIds: e.target.value
                    ? e.target.value
                        .split(',')
                        .map(id => id.trim())
                        .filter(id => id)
                    : undefined,
                }))
              }
              placeholder="ID1, ID2, ID3..."
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-medium">{t('start.date')}</label>
            <DatePicker
              selected={filters.startDate ? new Date(filters.startDate) : null}
              onChange={(date: Date | null) =>
                setFilters(prev => ({
                  ...prev,
                  startDate: date
                    ? date.toISOString().split('T')[0]
                    : undefined,
                }))
              }
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
              placeholderText={t('select.start.date')}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">{t('end.date')}</label>
            <DatePicker
              selected={filters.endDate ? new Date(filters.endDate) : null}
              onChange={(date: Date | null) =>
                setFilters(prev => ({
                  ...prev,
                  endDate: date ? date.toISOString().split('T')[0] : undefined,
                }))
              }
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
              placeholderText={t('select.end.date')}
            />
          </div>
        </div>

        {/* Amount Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-medium">{t('minimum.amount.euros')}</label>
            <input
              type="number"
              step="0.01"
              value={filters.minAmount || ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  minAmount: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              placeholder="0.00"
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">{t('maximum.amount.euros')}</label>
            <input
              type="number"
              step="0.01"
              value={filters.maxAmount || ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  maxAmount: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              placeholder="0.00"
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="create"
            isSubmit
            disabled={isLoading}
            className="flex items-center"
          >
            <Search className="mr-2 h-4 w-4" />
            {t('search')}
          </Button>

          <Button
            type="cancel"
            variant="outline"
            onClick={handleClear}
            disabled={isLoading}
            className="flex items-center"
          >
            <X className="mr-2 h-4 w-4" />
            {t('clear')}
          </Button>
        </div>
      </form>
    </div>
  );
}
