'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCreditNotes } from 'app/hooks/useCreditNotes';
import { useInvoices } from 'app/hooks/useInvoices';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import {
  CreditNoteCreationRequest,
  CreditNoteItemRequest,
  CreditNoteType,
} from 'app/interfaces/CreditNote';
import { DeliveryNoteItem } from 'app/interfaces/DeliveryNote';
import { Invoice } from 'app/interfaces/Invoice';
import { Button } from 'designSystem/Button/Buttons';
import {
  AlertTriangle,
  Check,
  FileText,
  Percent,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

interface CreditNoteCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preloadedInvoice?: Invoice | null;
}

interface FlattenedInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  lineTotal: number;
  workOrderCode?: string;
}

type CreditMode = 'total' | 'percentage' | 'lines';

export function CreditNoteCreateModal({
  isOpen,
  onClose,
  onSuccess,
  preloadedInvoice,
}: CreditNoteCreateModalProps) {
  const { t } = useTranslations();
  const { createCreditNote, isLoading } = useCreditNotes();
  const { fetchInvoiceById, searchInvoices } = useInvoices();

  const [sourceMode, setSourceMode] = useState<'internal' | 'external'>(
    'internal'
  );
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [externalInvoiceCode, setExternalInvoiceCode] = useState('');
  const [externalItems, setExternalItems] = useState<CreditNoteItemRequest[]>(
    []
  );

  const [creditMode, setCreditMode] = useState<CreditMode>('total');
  const [creditPercentage, setCreditPercentage] = useState<number>(100);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set()
  );
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && preloadedInvoice) {
      setSourceMode('internal');
      setSelectedInvoice(preloadedInvoice);
      setCreditMode('total');
    }
  }, [isOpen, preloadedInvoice]);

  const resetForm = () => {
    setSourceMode('internal');
    setInvoiceSearch('');
    setSearchResults([]);
    setSelectedInvoice(null);
    setIsSearching(false);
    setSearchError(null);
    setExternalInvoiceCode('');
    setExternalItems([]);
    setCreditMode('total');
    setCreditPercentage(100);
    setSelectedItemIds(new Set());
    setReason('');
    setSubmitError(null);
  };

  const flattenedItems: FlattenedInvoiceItem[] = useMemo(() => {
    if (!selectedInvoice?.deliveryNotes) return [];
    const items: FlattenedInvoiceItem[] = [];
    selectedInvoice.deliveryNotes.forEach(dn => {
      dn.workOrders?.forEach(wo => {
        wo.items?.forEach((item: DeliveryNoteItem, idx: number) => {
          items.push({
            id: item.id || `${wo.workOrderId}-${idx}`,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercentage: item.discountPercentage,
            discountAmount: item.discountAmount,
            taxPercentage: item.taxPercentage,
            lineTotal: item.lineTotal,
            workOrderCode: wo.workOrderCode,
          });
        });
      });
    });
    return items;
  }, [selectedInvoice]);

  useEffect(() => {
    if (creditMode === 'total') {
      setSelectedItemIds(new Set(flattenedItems.map(i => i.id)));
    }
  }, [creditMode, flattenedItems]);

  const handleSearchInvoice = async () => {
    if (!invoiceSearch.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const results = await searchInvoices({
        invoiceCode: invoiceSearch.trim(),
        companyName: invoiceSearch.trim(),
      });
      if (results.length === 0) {
        setSearchError(t('creditNotes.invoiceNotFound'));
      } else {
        setSearchResults(results);
      }
    } catch {
      setSearchError(t('creditNotes.invoiceNotFound'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectInvoice = async (invoice: Invoice) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const fullInvoice = await fetchInvoiceById(invoice.id);
      setSelectedInvoice(fullInvoice);
      setSearchResults([]);
      setCreditMode('total');
    } catch {
      setSearchError(t('creditNotes.invoiceLoadError'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSelectedInvoice = () => {
    setSelectedInvoice(null);
    setSearchResults([]);
    setInvoiceSearch('');
  };

  const toggleItemSelection = (itemId: string) => {
    if (creditMode !== 'lines') return;
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const addExternalItem = () => {
    setExternalItems(prev => [
      ...prev,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountPercentage: 0,
        discountAmount: 0,
        taxPercentage: 21,
      },
    ]);
  };

  const updateExternalItem = (
    index: number,
    field: keyof CreditNoteItemRequest,
    value: string | number
  ) => {
    setExternalItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeExternalItem = (index: number) => {
    setExternalItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateItemTotal = useCallback(
    (item: { quantity: number; unitPrice: number; discountPercentage: number; taxPercentage: number }) => {
      const base = item.quantity * item.unitPrice;
      const discounted = base * (1 - (item.discountPercentage || 0) / 100);
      const withTax = discounted * (1 + (item.taxPercentage || 0) / 100);
      return withTax;
    },
    []
  );

  const creditTotals = useMemo(() => {
    if (sourceMode === 'external') {
      let subtotal = 0;
      let taxAmount = 0;
      externalItems.forEach(item => {
        const base = item.quantity * item.unitPrice;
        const discounted = base * (1 - (item.discountPercentage || 0) / 100);
        subtotal += discounted;
        taxAmount += discounted * ((item.taxPercentage || 0) / 100);
      });
      return { subtotal, taxAmount, total: subtotal + taxAmount };
    }

    if (!selectedInvoice) return { subtotal: 0, taxAmount: 0, total: 0 };

    let relevantItems = flattenedItems;
    if (creditMode === 'lines') {
      relevantItems = flattenedItems.filter(i => selectedItemIds.has(i.id));
    }

    let subtotal = 0;
    let taxAmount = 0;
    relevantItems.forEach(item => {
      const base = item.quantity * item.unitPrice;
      const discounted = base * (1 - (item.discountPercentage || 0) / 100);
      const itemSubtotal =
        creditMode === 'percentage'
          ? discounted * (creditPercentage / 100)
          : discounted;
      subtotal += itemSubtotal;
      taxAmount += itemSubtotal * ((item.taxPercentage || 0) / 100);
    });

    return { subtotal, taxAmount, total: subtotal + taxAmount };
  }, [
    sourceMode,
    externalItems,
    selectedInvoice,
    flattenedItems,
    creditMode,
    creditPercentage,
    selectedItemIds,
  ]);

  const canSubmit = useMemo(() => {
    if (sourceMode === 'external') {
      return externalInvoiceCode.trim() !== '' && externalItems.length > 0;
    }
    if (!selectedInvoice) return false;
    if (creditMode === 'lines' && selectedItemIds.size === 0) return false;
    if (creditMode === 'percentage' && (creditPercentage <= 0 || creditPercentage > 100)) return false;
    return true;
  }, [
    sourceMode,
    externalInvoiceCode,
    externalItems,
    selectedInvoice,
    creditMode,
    selectedItemIds,
    creditPercentage,
  ]);

  const handleSubmit = async () => {
    setSubmitError(null);
    try {
      let request: CreditNoteCreationRequest;

      if (sourceMode === 'external') {
        request = {
          externalInvoiceCode: externalInvoiceCode.trim(),
          type: CreditNoteType.External,
          reason: reason || undefined,
          creditNoteDate: new Date().toISOString(),
          items: externalItems,
        };
      } else {
        const type =
          creditMode === 'total' ? CreditNoteType.Total : CreditNoteType.Partial;

        request = {
          originalInvoiceId: selectedInvoice!.id,
          type,
          reason: reason || undefined,
          creditNoteDate: new Date().toISOString(),
          creditPercentage:
            creditMode === 'percentage' ? creditPercentage : undefined,
          selectedItemIds:
            creditMode === 'lines'
              ? Array.from(selectedItemIds)
              : undefined,
        };
      }

      await createCreditNote(request);
      onSuccess?.();
      onClose();
    } catch {
      setSubmitError(t('creditNotes.createError'));
    }
  };

  if (!isOpen) return null;

  const invoiceSubtotal = selectedInvoice?.deliveryNotes?.reduce(
    (acc, dn) => acc + (dn.subtotal || 0),
    0
  ) ?? 0;
  const invoiceTax = selectedInvoice?.deliveryNotes?.reduce(
    (acc, dn) => acc + (dn.totalTax || 0),
    0
  ) ?? 0;
  const invoiceTotal = selectedInvoice?.deliveryNotes?.reduce(
    (acc, dn) => acc + (dn.total || 0),
    0
  ) ?? 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <ModalHeader
            sourceMode={sourceMode}
            onSourceModeChange={setSourceMode}
            onClose={onClose}
            t={t}
          />

          <div className="flex-1 flex min-h-0 overflow-hidden">
            <LeftPanel
              sourceMode={sourceMode}
              invoiceSearch={invoiceSearch}
              onInvoiceSearchChange={setInvoiceSearch}
              onSearchInvoice={handleSearchInvoice}
              isSearching={isSearching}
              searchError={searchError}
              searchResults={searchResults}
              onSelectInvoice={handleSelectInvoice}
              selectedInvoice={selectedInvoice}
              onClearSelectedInvoice={handleClearSelectedInvoice}
              flattenedItems={flattenedItems}
              creditMode={creditMode}
              selectedItemIds={selectedItemIds}
              onToggleItem={toggleItemSelection}
              creditPercentage={creditPercentage}
              invoiceSubtotal={invoiceSubtotal}
              invoiceTax={invoiceTax}
              invoiceTotal={invoiceTotal}
              externalInvoiceCode={externalInvoiceCode}
              onExternalInvoiceCodeChange={setExternalInvoiceCode}
              externalItems={externalItems}
              onAddExternalItem={addExternalItem}
              onUpdateExternalItem={updateExternalItem}
              onRemoveExternalItem={removeExternalItem}
              calculateItemTotal={calculateItemTotal}
              t={t}
            />

            <RightPanel
              sourceMode={sourceMode}
              selectedInvoice={selectedInvoice}
              creditMode={creditMode}
              onCreditModeChange={setCreditMode}
              creditPercentage={creditPercentage}
              onCreditPercentageChange={setCreditPercentage}
              reason={reason}
              onReasonChange={setReason}
              creditTotals={creditTotals}
              selectedItemIds={selectedItemIds}
              flattenedItems={flattenedItems}
              t={t}
            />
          </div>

          <ModalFooter
            canSubmit={canSubmit}
            isLoading={isLoading}
            submitError={submitError}
            onClose={onClose}
            onSubmit={handleSubmit}
            t={t}
          />
        </div>
      </div>
    </>
  );
}

function ModalHeader({
  sourceMode,
  onSourceModeChange,
  onClose,
  t,
}: {
  sourceMode: 'internal' | 'external';
  onSourceModeChange: (mode: 'internal' | 'external') => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-gradient-to-r from-[#6E41B6] to-[#8B5CF6] px-6 py-4 rounded-t-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {t('creditNotes.createTitle')}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSourceModeChange('internal')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            sourceMode === 'internal'
              ? 'bg-white text-[#6E41B6]'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {t('creditNotes.fromInvoice')}
        </button>
        <button
          onClick={() => onSourceModeChange('external')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            sourceMode === 'external'
              ? 'bg-white text-[#6E41B6]'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {t('creditNotes.externalInvoice')}
        </button>
      </div>
    </div>
  );
}

function LeftPanel({
  sourceMode,
  invoiceSearch,
  onInvoiceSearchChange,
  onSearchInvoice,
  isSearching,
  searchError,
  searchResults,
  onSelectInvoice,
  selectedInvoice,
  onClearSelectedInvoice,
  flattenedItems,
  creditMode,
  selectedItemIds,
  onToggleItem,
  creditPercentage,
  invoiceSubtotal,
  invoiceTax,
  invoiceTotal,
  externalInvoiceCode,
  onExternalInvoiceCodeChange,
  externalItems,
  onAddExternalItem,
  onUpdateExternalItem,
  onRemoveExternalItem,
  calculateItemTotal,
  t,
}: {
  sourceMode: 'internal' | 'external';
  invoiceSearch: string;
  onInvoiceSearchChange: (value: string) => void;
  onSearchInvoice: () => void;
  isSearching: boolean;
  searchError: string | null;
  searchResults: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  selectedInvoice: Invoice | null;
  onClearSelectedInvoice: () => void;
  flattenedItems: FlattenedInvoiceItem[];
  creditMode: CreditMode;
  selectedItemIds: Set<string>;
  onToggleItem: (id: string) => void;
  creditPercentage: number;
  invoiceSubtotal: number;
  invoiceTax: number;
  invoiceTotal: number;
  externalInvoiceCode: string;
  onExternalInvoiceCodeChange: (value: string) => void;
  externalItems: CreditNoteItemRequest[];
  onAddExternalItem: () => void;
  onUpdateExternalItem: (
    index: number,
    field: keyof CreditNoteItemRequest,
    value: string | number
  ) => void;
  onRemoveExternalItem: (index: number) => void;
  calculateItemTotal: (item: {
    quantity: number;
    unitPrice: number;
    discountPercentage: number;
    taxPercentage: number;
  }) => number;
  t: (key: string) => string;
}) {
  if (sourceMode === 'external') {
    return (
      <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {t('creditNotes.externalInvoiceData')}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('creditNotes.externalInvoiceCode')}
            </label>
            <input
              type="text"
              value={externalInvoiceCode}
              onChange={e => onExternalInvoiceCodeChange(e.target.value)}
              placeholder="FAC-2025-001"
              className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-[#6E41B6] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {t('creditNotes.lines')}
            </span>
            <button
              onClick={onAddExternalItem}
              className="flex items-center gap-1 text-sm text-[#6E41B6] hover:text-[#5a35a0] font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('creditNotes.addLine')}
            </button>
          </div>

          {externalItems.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('creditNotes.noLinesYet')}</p>
            </div>
          )}

          <div className="space-y-3">
            {externalItems.map((item, idx) => (
              <ExternalItemRow
                key={idx}
                item={item}
                index={idx}
                onUpdate={onUpdateExternalItem}
                onRemove={onRemoveExternalItem}
                calculateTotal={calculateItemTotal}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {t('creditNotes.originalInvoice')}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!selectedInvoice && (
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={invoiceSearch}
                onChange={e => onInvoiceSearchChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSearchInvoice()}
                placeholder={t('creditNotes.searchInvoicePlaceholder')}
                className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-[#6E41B6] focus:border-transparent outline-none"
              />
              <button
                onClick={onSearchInvoice}
                disabled={isSearching}
                className="h-10 px-4 bg-[#6E41B6] text-white rounded-lg hover:bg-[#5a35a0] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? (
                  <SvgSpinner className="w-4 h-4" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map(invoice => (
                  <InvoiceSearchResultRow
                    key={invoice.id}
                    invoice={invoice}
                    onSelect={onSelectInvoice}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {searchError && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            {searchError}
          </div>
        )}

        {selectedInvoice && (
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-600">
                {t('creditNotes.selectedInvoice')}
              </h4>
              <button
                onClick={onClearSelectedInvoice}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                {t('creditNotes.changeInvoice')}
              </button>
            </div>

            <InvoiceInfoCard
              invoice={selectedInvoice}
              subtotal={invoiceSubtotal}
              tax={invoiceTax}
              total={invoiceTotal}
              t={t}
            />

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">
                {t('creditNotes.invoiceLines')} ({flattenedItems.length})
              </h4>
              <div className="space-y-2">
                {flattenedItems.map(item => (
                  <InvoiceItemRow
                    key={item.id}
                    item={item}
                    isSelected={selectedItemIds.has(item.id)}
                    isSelectable={creditMode === 'lines'}
                    isPartialPercentage={creditMode === 'percentage'}
                    creditPercentage={creditPercentage}
                    onToggle={() => onToggleItem(item.id)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {!selectedInvoice && searchResults.length === 0 && !searchError && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">
              {t('creditNotes.searchInvoiceHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceSearchResultRow({
  invoice,
  onSelect,
  t,
}: {
  invoice: Invoice;
  onSelect: (invoice: Invoice) => void;
  t: (key: string) => string;
}) {
  const customerName =
    invoice.deliveryNotes?.[0]?.companyName ?? t('creditNotes.unknownCustomer');
  const total =
    invoice.deliveryNotes?.reduce((acc, dn) => acc + (dn.total || 0), 0) ?? 0;

  return (
    <button
      onClick={() => onSelect(invoice)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#6E41B6]/5 transition-colors border-b border-gray-100 last:border-b-0 text-left"
    >
      <div className="bg-[#6E41B6]/10 rounded-full p-2 flex-shrink-0">
        <FileText className="w-4 h-4 text-[#6E41B6]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{invoice.code}</p>
        <p className="text-xs text-gray-500 truncate">{customerName}</p>
      </div>
      <span className="text-sm font-bold text-[#6E41B6] flex-shrink-0">
        {total.toFixed(2)} €
      </span>
    </button>
  );
}

function InvoiceInfoCard({
  invoice,
  subtotal,
  tax,
  total,
  t,
}: {
  invoice: Invoice;
  subtotal: number;
  tax: number;
  total: number;
  t: (key: string) => string;
}) {
  const customerName =
    invoice.deliveryNotes?.[0]?.companyName ?? t('creditNotes.unknownCustomer');

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-800">{invoice.code}</span>
        <span className="text-xs bg-[#6E41B6]/10 text-[#6E41B6] px-2 py-1 rounded-full font-medium">
          {t('creditNotes.invoice')}
        </span>
      </div>
      <p className="text-sm text-gray-600">{customerName}</p>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">{t('creditNotes.subtotal')}</p>
          <p className="text-sm font-semibold">{subtotal.toFixed(2)} €</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('creditNotes.tax')}</p>
          <p className="text-sm font-semibold">{tax.toFixed(2)} €</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('creditNotes.total')}</p>
          <p className="text-sm font-bold text-[#6E41B6]">
            {total.toFixed(2)} €
          </p>
        </div>
      </div>
    </div>
  );
}

function InvoiceItemRow({
  item,
  isSelected,
  isSelectable,
  isPartialPercentage,
  creditPercentage,
  onToggle,
}: {
  item: FlattenedInvoiceItem;
  isSelected: boolean;
  isSelectable: boolean;
  isPartialPercentage: boolean;
  creditPercentage: number;
  onToggle: () => void;
}) {
  const effectiveTotal = isPartialPercentage
    ? item.lineTotal * (creditPercentage / 100)
    : item.lineTotal;

  const isAffected = isSelectable ? isSelected : true;

  return (
    <div
      onClick={isSelectable ? onToggle : undefined}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        isSelectable ? 'cursor-pointer' : ''
      } ${
        isAffected
          ? 'border-[#6E41B6]/30 bg-[#6E41B6]/5'
          : 'border-gray-200 bg-white opacity-50'
      }`}
    >
      {isSelectable && (
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            isSelected
              ? 'bg-[#6E41B6] border-[#6E41B6]'
              : 'border-gray-300 bg-white'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {item.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>
            {item.quantity} × {item.unitPrice.toFixed(2)} €
          </span>
          {item.discountPercentage > 0 && (
            <span className="text-orange-500">
              -{item.discountPercentage}%
            </span>
          )}
          {item.workOrderCode && (
            <span className="bg-gray-200 px-1.5 py-0.5 rounded">
              {item.workOrderCode}
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        {isPartialPercentage && (
          <p className="text-xs text-gray-400 line-through">
            {item.lineTotal.toFixed(2)} €
          </p>
        )}
        <p
          className={`text-sm font-semibold ${isAffected ? 'text-[#6E41B6]' : 'text-gray-400'}`}
        >
          {effectiveTotal.toFixed(2)} €
        </p>
      </div>
    </div>
  );
}

function ExternalItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  calculateTotal,
  t,
}: {
  item: CreditNoteItemRequest;
  index: number;
  onUpdate: (
    index: number,
    field: keyof CreditNoteItemRequest,
    value: string | number
  ) => void;
  onRemove: (index: number) => void;
  calculateTotal: (item: {
    quantity: number;
    unitPrice: number;
    discountPercentage: number;
    taxPercentage: number;
  }) => number;
  t: (key: string) => string;
}) {
  const total = calculateTotal({
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountPercentage: item.discountPercentage || 0,
    taxPercentage: item.taxPercentage || 21,
  });

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
      <div className="flex items-start justify-between">
        <input
          type="text"
          value={item.description}
          onChange={e => onUpdate(index, 'description', e.target.value)}
          placeholder={t('creditNotes.itemDescription')}
          className="flex-1 h-8 rounded border border-gray-300 px-2 text-sm focus:ring-2 focus:ring-[#6E41B6] focus:border-transparent outline-none"
        />
        <button
          onClick={() => onRemove(index)}
          className="ml-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-gray-500">
            {t('creditNotes.quantity')}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.quantity}
            onChange={e =>
              onUpdate(index, 'quantity', parseFloat(e.target.value) || 0)
            }
            className="w-full h-8 rounded border border-gray-300 px-2 text-sm focus:ring-2 focus:ring-[#6E41B6] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">
            {t('creditNotes.unitPrice')}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={e =>
              onUpdate(index, 'unitPrice', parseFloat(e.target.value) || 0)
            }
            className="w-full h-8 rounded border border-gray-300 px-2 text-sm focus:ring-2 focus:ring-[#6E41B6] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">
            {t('creditNotes.discount')} %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={item.discountPercentage || 0}
            onChange={e =>
              onUpdate(
                index,
                'discountPercentage',
                parseFloat(e.target.value) || 0
              )
            }
            className="w-full h-8 rounded border border-gray-300 px-2 text-sm focus:ring-2 focus:ring-[#6E41B6] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">
            {t('creditNotes.taxShort')} %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={item.taxPercentage || 21}
            onChange={e =>
              onUpdate(
                index,
                'taxPercentage',
                parseFloat(e.target.value) || 0
              )
            }
            className="w-full h-8 rounded border border-gray-300 px-2 text-sm focus:ring-2 focus:ring-[#6E41B6] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="text-right">
        <span className="text-sm font-semibold text-[#6E41B6]">
          {total.toFixed(2)} €
        </span>
      </div>
    </div>
  );
}

function RightPanel({
  sourceMode,
  selectedInvoice,
  creditMode,
  onCreditModeChange,
  creditPercentage,
  onCreditPercentageChange,
  reason,
  onReasonChange,
  creditTotals,
  selectedItemIds,
  flattenedItems,
  t,
}: {
  sourceMode: 'internal' | 'external';
  selectedInvoice: Invoice | null;
  creditMode: CreditMode;
  onCreditModeChange: (mode: CreditMode) => void;
  creditPercentage: number;
  onCreditPercentageChange: (value: number) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  creditTotals: { subtotal: number; taxAmount: number; total: number };
  selectedItemIds: Set<string>;
  flattenedItems: FlattenedInvoiceItem[];
  t: (key: string) => string;
}) {
  const isInternalWithInvoice = sourceMode === 'internal' && selectedInvoice;

  return (
    <div className="w-1/2 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {t('creditNotes.creditNoteDetail')}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {sourceMode === 'internal' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t('creditNotes.creditType')}
            </label>
            <div className="flex border-2 border-[#6E41B6] rounded-full overflow-hidden bg-white">
              {(
                [
                  { key: 'total', label: t('creditNotes.totalCredit') },
                  { key: 'percentage', label: t('creditNotes.percentageCredit') },
                  { key: 'lines', label: t('creditNotes.byLines') },
                ] as { key: CreditMode; label: string }[]
              ).map((tab, idx) => (
                <button
                  key={tab.key}
                  onClick={() => onCreditModeChange(tab.key)}
                  disabled={!isInternalWithInvoice}
                  className={`flex-1 text-center text-sm font-semibold transition px-3 py-2 ${
                    creditMode === tab.key
                      ? 'bg-[#6E41B6] text-white'
                      : 'text-[#6E41B6] bg-white hover:bg-[#6E41B6]/10'
                  } disabled:opacity-40 disabled:cursor-not-allowed ${
                    idx === 0 ? 'rounded-l-full' : ''
                  } ${idx === 2 ? 'rounded-r-full' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {creditMode === 'percentage' && isInternalWithInvoice && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              {t('creditNotes.percentageToCredit')}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="100"
                value={creditPercentage}
                onChange={e =>
                  onCreditPercentageChange(parseInt(e.target.value))
                }
                className="flex-1 accent-[#6E41B6]"
              />
              <div className="flex items-center gap-1 bg-[#6E41B6]/10 rounded-lg px-3 py-1.5">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={creditPercentage}
                  onChange={e =>
                    onCreditPercentageChange(
                      Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-12 text-center text-sm font-bold text-[#6E41B6] bg-transparent outline-none"
                />
                <Percent className="w-4 h-4 text-[#6E41B6]" />
              </div>
            </div>
          </div>
        )}

        {creditMode === 'lines' && isInternalWithInvoice && (
          <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              {t('creditNotes.selectLinesHint')} ({selectedItemIds.size}/
              {flattenedItems.length})
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('creditNotes.reason')}
          </label>
          <textarea
            value={reason}
            onChange={e => onReasonChange(e.target.value)}
            placeholder={t('creditNotes.reasonPlaceholder')}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#6E41B6] focus:border-transparent outline-none resize-none"
          />
        </div>

        <CreditNoteSummary totals={creditTotals} t={t} />
      </div>
    </div>
  );
}

function CreditNoteSummary({
  totals,
  t,
}: {
  totals: { subtotal: number; taxAmount: number; total: number };
  t: (key: string) => string;
}) {
  return (
    <div className="bg-gradient-to-br from-[#6E41B6]/5 to-[#8B5CF6]/10 rounded-xl p-5 space-y-3 border border-[#6E41B6]/20">
      <h4 className="font-semibold text-gray-700">
        {t('creditNotes.creditSummary')}
      </h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('creditNotes.subtotal')}</span>
          <span className="font-medium">{totals.subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('creditNotes.tax')}</span>
          <span className="font-medium">{totals.taxAmount.toFixed(2)} €</span>
        </div>
        <div className="h-px bg-[#6E41B6]/20" />
        <div className="flex justify-between">
          <span className="font-bold text-gray-800">
            {t('creditNotes.totalCredit')}
          </span>
          <span className="text-xl font-bold text-[#6E41B6]">
            {totals.total.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}

function ModalFooter({
  canSubmit,
  isLoading,
  submitError,
  onClose,
  onSubmit,
  t,
}: {
  canSubmit: boolean;
  isLoading: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmit: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="px-6 py-4 border-t border-gray-200 rounded-b-2xl bg-gray-50">
      {submitError && (
        <div className="flex items-center gap-2 text-red-500 text-sm mb-3">
          <AlertTriangle className="w-4 h-4" />
          {submitError}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button type="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button
          type="create"
          onClick={onSubmit}
          disabled={!canSubmit || isLoading}
          customStyles="gap-2 flex"
        >
          {isLoading ? (
            <SvgSpinner className="w-5 h-5" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          {t('creditNotes.createCreditNote')}
        </Button>
      </div>
    </div>
  );
}
