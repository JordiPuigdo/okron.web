'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { DeliveryNoteSearchFilters } from 'app/interfaces/Invoice';
import { DeliveryNoteStatus } from 'app/interfaces/DeliveryNote';
import { Button } from 'designSystem/Button/Buttons';
import { Search, X } from 'lucide-react';
import { ca } from 'date-fns/locale';

interface DeliveryNoteAdvancedSearchFormProps {
  onSearch: (filters: DeliveryNoteSearchFilters) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function DeliveryNoteAdvancedSearchForm({ 
  onSearch, 
  onClear, 
  isLoading = false 
}: DeliveryNoteAdvancedSearchFormProps) {
  const [filters, setFilters] = useState<DeliveryNoteSearchFilters>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  const translateDeliveryNoteStatus = (status: DeliveryNoteStatus): string => {
    switch (status) {
      case DeliveryNoteStatus.Draft:
        return 'Borrador';
      case DeliveryNoteStatus.Sent:
        return 'Enviat';
      case DeliveryNoteStatus.Paid:
        return 'Pagat';
      case DeliveryNoteStatus.Overdue:
        return 'Vençut';
      case DeliveryNoteStatus.Cancelled:
        return 'Cancel·lat';
      default:
        return 'Desconegut';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">Cerca Avançada d'Albarans</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="font-medium">Nom de l'Empresa</label>
            <input
              type="text"
              value={filters.companyName || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, companyName: e.target.value }))}
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
              onChange={(e) => setFilters(prev => ({ ...prev, customerId: e.target.value }))}
              placeholder="ID del client..."
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Delivery Note Code */}
          <div className="space-y-2">
            <label className="font-medium">Codi Albarà</label>
            <input
              type="text"
              value={filters.deliveryNoteCode || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, deliveryNoteCode: e.target.value }))}
              placeholder="Codi de l'albarà..."
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="font-medium">Estat</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Tots els estats</option>
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
            <label className="font-medium">Té Factura</label>
            <select
              value={filters.hasInvoice !== undefined ? String(filters.hasInvoice) : ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                hasInvoice: e.target.value ? e.target.value === 'true' : undefined 
              }))}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Tots</option>
              <option value="true">Amb factura</option>
              <option value="false">Sense factura</option>
            </select>
          </div>

          {/* Work Order IDs */}
          <div className="space-y-2">
            <label className="font-medium">IDs Ordres de Treball</label>
            <input
              type="text"
              value={filters.workOrderIds?.join(', ') || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                workOrderIds: e.target.value ? e.target.value.split(',').map(id => id.trim()).filter(id => id) : undefined
              }))}
              placeholder="ID1, ID2, ID3..."
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
            />
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
                  startDate: date ? date.toISOString().split('T')[0] : undefined,
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
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                minAmount: e.target.value ? Number(e.target.value) : undefined 
              }))}
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
            type="search"
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