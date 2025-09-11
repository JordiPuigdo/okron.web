'use client';

import 'react-datepicker/dist/react-datepicker.css';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useCustomers } from 'app/hooks/useCustomers';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { Customer } from 'app/interfaces/Customer';
import { DeliveryNote } from 'app/interfaces/DeliveryNote';
import { InvoiceCreateRequest } from 'app/interfaces/Invoice';
import { cn } from 'app/lib/utils';
import ChooseElement from 'components/ChooseElement';
import { HeaderForm } from 'components/layout/HeaderForm';
import { ca } from 'date-fns/locale';
import { Button } from 'designSystem/Button/Buttons';
import { Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { DeliveryNoteService } from '../../../services/deliveryNoteService';
import { InvoiceService } from '../../../services/invoiceService';

export function InvoiceCreateForm() {
  const { t } = useTranslations();
  const { customers, getById } = useCustomers();
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<InvoiceCreateRequest>>({
    deliveryNoteId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 30 days from now
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
  const [selectedDeliveryNoteId, setSelectedDeliveryNoteId] = useState<
    string | undefined
  >(undefined);
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<
    DeliveryNote | undefined
  >(undefined);
  const deliveryNoteService = new DeliveryNoteService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const invoiceService = new InvoiceService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const handleSelectedCustomer = (id: string) => {
    setSelectedCustomerId(id);
    fetchCustomer(id);
    fetchCustomerDeliveryNotes(id);
    // Reset delivery note selection when customer changes
    setSelectedDeliveryNoteId(undefined);
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
    setSelectedDeliveryNoteId(undefined);
    setSelectedDeliveryNote(undefined);
    setFormData(prev => ({
      ...prev,
      deliveryNoteId: '',
    }));
  };

  const handleDeliveryNoteSelected = async (deliveryNoteId: string) => {
    setSelectedDeliveryNoteId(deliveryNoteId);
    setFormData(prev => ({
      ...prev,
      deliveryNoteId: deliveryNoteId,
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
    setSelectedDeliveryNoteId(undefined);
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
      newErrors.invoiceDate = t('date.required');
    }

    if (!formData.dueDate?.trim()) {
      newErrors.dueDate = t('due.date.required');
    }

    if (!selectedCustomerId) {
      newErrors.customerId = t('select.customer.required');
    }

    if (!formData.deliveryNoteId) {
      newErrors.deliveryNoteId = t('select.delivery.note.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <HeaderForm header={t('create.invoice')} isCreate={true} />

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
            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-semibold">{t('date')}</label>
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
                <label className="font-semibold">{t('due.date')}</label>
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
              <label className="font-semibold">{t('customer')}</label>
              <ChooseElement
                elements={customers ? customers.filter(x => x.active) : []}
                selectedElements={
                  selectedCustomerId ? [selectedCustomerId] : []
                }
                onElementSelected={handleSelectedCustomer}
                onDeleteElementSelected={handleDeleteSelectedCustomer}
                placeholder={t('search.customer')}
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
                <label className="font-semibold">{t('customer.delivery.notes')}</label>
                {availableDeliveryNotes.length > 0 ? (
                  <>
                    <ChooseElement
                      elements={availableDeliveryNotes}
                      selectedElements={
                        selectedDeliveryNoteId ? [selectedDeliveryNoteId] : []
                      }
                      onElementSelected={handleDeliveryNoteSelected}
                      onDeleteElementSelected={handleDeleteSelectedDeliveryNote}
                      placeholder={t('search.delivery.note')}
                      mapElement={deliveryNote => ({
                        id: deliveryNote.id,
                        description: `${deliveryNote.code} - ${new Date(
                          deliveryNote.deliveryNoteDate
                        ).toLocaleDateString()} - ${deliveryNote.total.toFixed(
                          2
                        )}€`,
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
                    {t('no.delivery.notes.available')}
                  </p>
                )}
              </div>
            )}

            {/* Selected Delivery Note Preview */}
            {selectedDeliveryNote && (
              <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold">
                  {t('selected.delivery.note.details')}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>{t('customer')}:</strong> {selectedCustomer?.name}
                  </div>
                  <div>
                    <strong>{t('delivery.note.code')}:</strong> {selectedDeliveryNote.code}
                  </div>
                  <div>
                    <strong>{t('date')}:</strong>{' '}
                    {new Date(
                      selectedDeliveryNote.deliveryNoteDate
                    ).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>{t('total')}:</strong>{' '}
                    {selectedDeliveryNote.total.toFixed(2)}€
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
                <p>{t('generate.draft')}</p>
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
                <p>{t('cancel')}</p>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
