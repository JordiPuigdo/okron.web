'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { InvoiceSearchFilters, InvoiceStatus } from 'app/interfaces/Invoice';
import { translateInvoiceStatus } from 'app/utils/invoiceUtils';
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
  isLoading = false,
}: InvoiceAdvancedSearchFormProps) {
  const [filters, setFilters] = useState<InvoiceSearchFilters>({});

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
      <h3 className="text-lg font-semibold mb-4">Cerca Avançada de Factures</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="font-medium">Nom de l'Empresa</label>
            <input
              type="text"
              value={filters.companyName || ''}
              onChange={e =>
                setFilters(prev => ({ ...prev, companyName: e.target.value }))
              }
              placeholder="Cerca per nom..."
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Customer ID */}
          <div className="space-y-2">
            <label className="font-medium">ID Client</label>
            <input
              type="text"
              value={filters.customerId || ''}
              onChange={e =>
                setFilters(prev => ({ ...prev, customerId: e.target.value }))
              }
              placeholder="ID del client..."
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Invoice Code */}
          <div className="space-y-2">
            <label className="font-medium">Codi Factura</label>
            <input
              type="text"
              value={filters.invoiceCode || ''}
              onChange={e =>
                setFilters(prev => ({ ...prev, invoiceCode: e.target.value }))
              }
              placeholder="Codi de la factura..."
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="font-medium">Estat</label>
            <select
              value={filters.status !== undefined ? filters.status : ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  status: e.target.value
                    ? (Number(e.target.value) as InvoiceStatus)
                    : undefined,
                }))
              }
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Tots els estats</option>
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
            <label className="font-medium">ID Albarà</label>
            <input
              type="text"
              value={filters.deliveryNoteId || ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  deliveryNoteId: e.target.value,
                }))
              }
              placeholder="ID de l'albarà..."
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Has Delivery Note */}
          <div className="space-y-2">
            <label className="font-medium">Té Albarà</label>
            <select
              value={
                filters.hasDeliveryNote !== undefined
                  ? String(filters.hasDeliveryNote)
                  : ''
              }
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  hasDeliveryNote: e.target.value
                    ? e.target.value === 'true'
                    : undefined,
                }))
              }
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Tots</option>
              <option value="true">Amb albarà</option>
              <option value="false">Sense albarà</option>
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-medium">Data d'Inici</label>
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
              placeholderText="Selecciona data d'inici"
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">Data de Fi</label>
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
              placeholderText="Selecciona data de fi"
            />
          </div>
        </div>

        {/* Amount Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-medium">Import Mínim (€)</label>
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
            <label className="font-medium">Import Màxim (€)</label>
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
            Cercar
          </Button>

          <Button
            type="cancel"
            variant="outline"
            onClick={handleClear}
            disabled={isLoading}
            className="flex items-center"
          >
            <X className="mr-2 h-4 w-4" />
            Netejar
          </Button>
        </div>
      </form>
    </div>
  );
}
