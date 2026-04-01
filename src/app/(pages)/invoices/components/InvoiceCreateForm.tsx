'use client';

import 'react-datepicker/dist/react-datepicker.css';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useCustomers } from 'app/hooks/useCustomers';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { Customer } from 'app/interfaces/Customer';
import { DeliveryNote } from 'app/interfaces/DeliveryNote';
import { InvoiceCreateRequest, InvoiceType } from 'app/interfaces/Invoice';
import { cn } from 'app/lib/utils';
import { formatEuropeanCurrency } from 'app/utils/utils';
import ChooseElement from 'components/ChooseElement';
import { HeaderForm } from 'components/layout/HeaderForm';
import { ca } from 'date-fns/locale';
import { Button } from 'designSystem/Button/Buttons';
import { Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { DeliveryNoteService } from '../../../services/deliveryNoteService';
import { InvoiceService } from '../../../services/invoiceService';

export function InvoiceCreateForm() {
  const { customers, getById } = useCustomers();
  const router = useRouter();
  const { t } = useTranslations();
  const [formData, setFormData] = useState<Partial<InvoiceCreateRequest>>({
    deliveryNoteIds: [],
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    invoiceType: InvoiceType.Standard,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >(undefined);
  const [availableDeliveryNotes, setAvailableDeliveryNotes] = useState<
    DeliveryNote[]
  >([]);
  const [selectedDeliveryNoteIds, setSelectedDeliveryNoteIds] = useState<
    string[] | []
  >([]);
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<
    DeliveryNote | undefined
  >(undefined);
  const deliveryNoteService = new DeliveryNoteService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const invoiceService = new InvoiceService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const isProforma = formData.invoiceType === InvoiceType.Proforma;

  const handleSelectedCustomer = (id: string) => {
    setSelectedCustomerId(id);
    fetchCustomer(id);
    fetchCustomerDeliveryNotes(id);
    // Reset delivery note selection when customer changes
    setSelectedDeliveryNoteIds([]);
    setSelectedDeliveryNote(undefined);
    setFormData(prev => ({
      ...prev,
      deliveryNoteId: '',
    }));
  };

  const fetchCustomer = async (id: string) => {
    const customer = await getById(id);
    setSelectedCustomer(customer);
  };

  const fetchCustomerDeliveryNotes = async (customerId: string) => {
    try {
      // Fetch delivery notes for this customer that don't have an invoice yet
      // Try both customerId and companyName to ensure compatibility
      const customer = await getById(customerId);
      const deliveryNotes = await deliveryNoteService.searchDeliveryNotes({
        customerId: customerId,
        companyName: customer?.name,
        hasInvoice: false,
      });
      setAvailableDeliveryNotes(deliveryNotes);
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
      setAvailableDeliveryNotes([]);
    }
  };

  const handleDeleteSelectedCustomer = () => {
    setSelectedCustomer(undefined);
    setSelectedCustomerId(undefined);
    setAvailableDeliveryNotes([]);
    setSelectedDeliveryNoteIds([]);
    setSelectedDeliveryNote(undefined);
    setFormData(prev => ({
      ...prev,
      deliveryNoteId: '',
    }));
  };

  const handleDeliveryNoteSelected = async (deliveryNoteId: string) => {
    const newDeliveryNoteIds = [...selectedDeliveryNoteIds, deliveryNoteId];
    setSelectedDeliveryNoteIds(newDeliveryNoteIds);
    setFormData(prev => ({
      ...prev,
      deliveryNoteIds: newDeliveryNoteIds,
    }));

    // Fetch and set the selected delivery note details
    try {
      const deliveryNote = await deliveryNoteService.getById(deliveryNoteId);
      setSelectedDeliveryNote(deliveryNote);
    } catch (error) {
      console.error('Error fetching delivery note:', error);
    }
  };

  const handleDeleteSelectedDeliveryNote = () => {
    setSelectedDeliveryNote(undefined);
    setSelectedDeliveryNoteIds([]);
    setFormData(prev => ({
      ...prev,
      deliveryNoteId: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);

    try {
      const response = await invoiceService.create(
        formData as InvoiceCreateRequest
      );
      router.push(`/invoices/${response.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.invoiceDate?.trim()) {
      newErrors.invoiceDate = t('invoiceCreate.errorDate');
    }

    if (!formData.dueDate?.trim()) {
      newErrors.dueDate = t('invoiceCreate.errorDueDate');
    }

    if (!isProforma && !selectedCustomerId) {
      newErrors.customerId = t('invoiceCreate.errorCustomer');
    }

    if (!isProforma && (!formData.deliveryNoteIds || formData.deliveryNoteIds.length === 0)) {
      newErrors.deliveryNoteId = t('invoiceCreate.errorDeliveryNote');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <HeaderForm
          header={isProforma ? t('invoice.createProforma') : t('invoice.createStandard')}
          isCreate={true}
        />

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            onKeyDown={e => {
              const tag = (e.target as HTMLElement).tagName.toLowerCase();
              if (
                e.key === 'Enter' &&
                (tag === 'input' || tag === 'textarea')
              ) {
                e.preventDefault();
              }
            }}
          >
            {/* Invoice Type */}
            <div className="space-y-2">
              <label className="font-semibold">{t('invoice.createStandard')}</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      invoiceType: InvoiceType.Standard,
                    }))
                  }
                  className={cn(
                    'flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors',
                    formData.invoiceType === InvoiceType.Standard
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {t('invoice.type.standard')}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      invoiceType: InvoiceType.Proforma,
                    }))
                  }
                  className={cn(
                    'flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors',
                    formData.invoiceType === InvoiceType.Proforma
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {t('invoice.type.proforma')}
                </button>
              </div>
              {isProforma && (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  {t('invoice.proformaInfo')}
                </p>
              )}
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-semibold">Data</label>
                <DatePicker
                  selected={
                    formData.invoiceDate
                      ? new Date(formData.invoiceDate)
                      : new Date()
                  }
                  onChange={(date: Date) =>
                    setFormData(prev => ({
                      ...prev,
                      invoiceDate: date.toISOString().split('T')[0],
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  locale={ca}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm',
                    errors.invoiceDate && 'border-destructive'
                  )}
                />
                {errors.invoiceDate && (
                  <p className="text-destructive text-sm text-red-500">
                    {errors.invoiceDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Data de Venciment</label>
                <DatePicker
                  selected={
                    formData.dueDate ? new Date(formData.dueDate) : null
                  }
                  onChange={(date: Date) =>
                    setFormData(prev => ({
                      ...prev,
                      dueDate: date.toISOString().split('T')[0],
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  locale={ca}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm',
                    errors.dueDate && 'border-destructive'
                  )}
                />
                {errors.dueDate && (
                  <p className="text-destructive text-sm text-red-500">
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>

            {/* Customer Selection */}
            <div className="space-y-2">
              <label className="font-semibold">Client</label>
              <ChooseElement
                elements={customers ? customers.filter(x => x.active) : []}
                selectedElements={
                  selectedCustomerId ? [selectedCustomerId] : []
                }
                onElementSelected={handleSelectedCustomer}
                onDeleteElementSelected={handleDeleteSelectedCustomer}
                placeholder="Buscar Client"
                mapElement={customer => ({
                  id: customer.id,
                  description: `${customer.name} - ${customer.taxId}`,
                })}
              />
              {errors.customerId && (
                <p className="text-destructive text-sm text-red-500">
                  {errors.customerId}
                </p>
              )}
            </div>

            {/* Delivery Note Selection - Only show when customer is selected */}
            {selectedCustomer && (
              <div className="space-y-2">
                <label className="font-semibold">Albarans del Client</label>
                {availableDeliveryNotes.length > 0 ? (
                  <>
                    <ChooseElement
                      elements={availableDeliveryNotes}
                      selectedElements={selectedDeliveryNoteIds}
                      onElementSelected={handleDeliveryNoteSelected}
                      onDeleteElementSelected={handleDeleteSelectedDeliveryNote}
                      placeholder="Buscar Albarà"
                      mapElement={deliveryNote => ({
                        id: deliveryNote.id,
                        description: `${deliveryNote.code} - ${new Date(
                          deliveryNote.deliveryNoteDate
                        ).toLocaleDateString()} - ${deliveryNote.workOrders
                          .map(x => x.workOrderRefId)
                          .join(', ')} - ${deliveryNote.workOrders
                          .map(x => x.workOrderCode)
                          .join(', ')} - ${formatEuropeanCurrency(
                          deliveryNote.subtotal,
                          t
                        )}`,
                      })}
                    />
                    {errors.deliveryNoteId && (
                      <p className="text-destructive text-sm text-red-500">
                        {errors.deliveryNoteId}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Aquest client no té albarans disponibles per facturar.
                  </p>
                )}
              </div>
            )}

            {/* Selected Delivery Note Preview */}
            {selectedDeliveryNote && (
              <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold">
                  Detalls de l'Albarà Seleccionat
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Client:</strong> {selectedCustomer?.name}
                  </div>
                  <div>
                    <strong>Codi Albarà:</strong> {selectedDeliveryNote.code}
                  </div>
                  <div>
                    <strong>Data:</strong>{' '}
                    {new Date(
                      selectedDeliveryNote.deliveryNoteDate
                    ).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Total:</strong>{' '}
                    {formatEuropeanCurrency(selectedDeliveryNote.subtotal, t)}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="create"
                isSubmit
                className="w-full"
                customStyles="flex justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <SvgSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                <p>Generar Borrador</p>
              </Button>
              <Button
                type="cancel"
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
                customStyles="flex justify-center"
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                <p>Cancelar</p>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
