'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslations } from 'app/hooks/useTranslations';
import { InvoiceSearchFilters, InvoiceStatus } from 'app/interfaces/Invoice';
import { ca } from 'date-fns/locale';
import { Button } from 'designSystem/Button/Buttons';
import { Search, X } from 'lucide-react';

interface InvoiceAdvancedSearchFormProps {
  onSearch: (filters: InvoiceSearchFilters) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function InvoiceAdvancedSearchForm({ 
  onSearch, 
  onClear, 
  isLoading = false 
}: InvoiceAdvancedSearchFormProps) {
  const { t } = useTranslations();
  const [filters, setFilters] = useState<InvoiceSearchFilters>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  const translateInvoiceStatus = (status: InvoiceStatus): string => {
    switch (status) {
      case InvoiceStatus.Draft:
        return t('invoice.status.draft');
      case InvoiceStatus.Pending:
        return t('invoice.status.pending');
      case InvoiceStatus.Paid:
        return t('invoice.status.paid');
      case InvoiceStatus.Cancelled:
        return t('invoice.status.cancelled');
      case InvoiceStatus.Overdue:
        return t('invoice.status.overdue');
      default:
        return t('invoice.status.unknown');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">{t('invoices.advanced.search')}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="font-medium">{t('company.name')}</label>
            <input
              type="text"
              value={filters.companyName || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, companyName: e.target.value }))}
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
              onChange={(e) => setFilters(prev => ({ ...prev, customerId: e.target.value }))}
              placeholder={t('customer.id.placeholder')}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Invoice Code */}
          <div className="space-y-2">
            <label className="font-medium">{t('invoice.code')}</label>
            <input
              type="text"
              value={filters.invoiceCode || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, invoiceCode: e.target.value }))}
              placeholder={t('invoice.code.placeholder')}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="font-medium">{t('status')}</label>
            <select
              value={filters.status !== undefined ? filters.status : ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                status: e.target.value ? Number(e.target.value) as InvoiceStatus : undefined 
              }))}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">{t('all.statuses')}</option>
              {Object.values(InvoiceStatus)
                .filter(value => typeof value === 'number')
                .map(status => (
                  <option key={status} value={status}>
                    {translateInvoiceStatus(status as InvoiceStatus)}
                  </option>
                ))}
            </select>
          </div>

          {/* Delivery Note ID */}
          <div className="space-y-2">
            <label className="font-medium">{t('delivery.note.id')}</label>
            <input
              type="text"
              value={filters.deliveryNoteId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, deliveryNoteId: e.target.value }))}
              placeholder={t('delivery.note.id.placeholder')}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Has Delivery Note */}
          <div className="space-y-2">
            <label className="font-medium">{t('has.delivery.note')}</label>
            <select
              value={filters.hasDeliveryNote !== undefined ? String(filters.hasDeliveryNote) : ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                hasDeliveryNote: e.target.value ? e.target.value === 'true' : undefined 
              }))}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">{t('all')}</option>
              <option value="true">{t('with.delivery.note')}</option>
              <option value="false">{t('without.delivery.note')}</option>
            </select>
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
                  startDate: date ? date.toISOString().split('T')[0] : undefined,
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
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                minAmount: e.target.value ? Number(e.target.value) : undefined 
              }))}
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
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                maxAmount: e.target.value ? Number(e.target.value) : undefined 
              }))}
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