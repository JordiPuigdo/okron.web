'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useCustomers } from 'app/hooks/useCustomers';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { Customer } from 'app/interfaces/Customer';
import { DeliveryNoteCreateRequest } from 'app/interfaces/DeliveryNote';
import { UserType } from 'app/interfaces/User';
import WorkOrder, { OriginWorkOrder } from 'app/interfaces/workOrder';
import { cn } from 'app/lib/utils';
import { workOrderService } from 'app/services/workOrderService';
import ChooseElement from 'components/ChooseElement';
import { HeaderForm } from 'components/layout/HeaderForm';
import { ca } from 'date-fns/locale';
import { Button } from 'designSystem/Button/Buttons';
import { Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { DeliveryNoteService } from '../../../services/deliveryNoteService';

export function DeliveryNoteCreateForm() {
  const { t } = useTranslations();
  const { customers, getById } = useCustomers();
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<DeliveryNoteCreateRequest>>({
    deliveryNoteDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    customerId: '',
    workOrderIds: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >(undefined);
  const [availableWorkOrders, setAvailableWorkOrders] = useState<WorkOrder[]>(
    []
  );
  const [selectedWorkOrderIds, setSelectedWorkOrderIds] = useState<string[]>(
    []
  );

  const deliveryNoteService = new DeliveryNoteService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const handleSelectedCustomer = async (id: string) => {
    setSelectedCustomerId(id);
    await fetchCustomer(id);
    fetchWorkOrders(id);
    setFormData(prev => ({
      ...prev,
      customerId: id,
    }));
  };

  const fetchCustomer = async (id: string) => {
    const customer = await getById(id);
    setSelectedCustomer(customer);
  };

  const fetchWorkOrders = async (customerId = '') => {
    try {
      // Get work orders from last month for this customer
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);

      const search = {
        startDateTime: startDate!,
        endDateTime: endDate!,
        originWorkOrder: OriginWorkOrder.Maintenance,
        userType: UserType.Maintenance,
        customerId: selectedCustomer?.id ?? customerId,
      };
      const workOrders = await workOrderService.getWorkOrdersWithFilters(
        search
      );
      setAvailableWorkOrders(workOrders);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    }
  };

  const handleDeleteSelectedCustomer = () => {
    setSelectedCustomer(undefined);
    setSelectedCustomerId(undefined);
    setAvailableWorkOrders([]);
    setSelectedWorkOrderIds([]);
    setFormData(prev => ({
      ...prev,
      customerId: '',
      workOrderIds: [],
    }));
  };

  const handleWorkOrderSelected = (workOrderId: string) => {
    if (!selectedWorkOrderIds.includes(workOrderId)) {
      const newSelected = [...selectedWorkOrderIds, workOrderId];
      setSelectedWorkOrderIds(newSelected);
      setFormData(prev => ({
        ...prev,
        workOrderIds: newSelected,
      }));
    }
  };

  const handleDeleteWorkOrder = (workOrderId: string) => {
    const newSelected = selectedWorkOrderIds.filter(id => id !== workOrderId);
    setSelectedWorkOrderIds(newSelected);
    setFormData(prev => ({
      ...prev,
      workOrderIds: newSelected,
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
      const response = await deliveryNoteService.create(
        formData as DeliveryNoteCreateRequest
      );
      router.push(`/deliveryNotes/${response.id}`);
    } catch (error) {
      console.error('Error creating delivery note:', error);
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.deliveryNoteDate?.trim()) {
      newErrors.deliveryNoteDate = t('date.required');
    }
    if (!formData.workOrderIds || formData.workOrderIds.length === 0) {
      newErrors.workOrderIds = t('select.work.order.required');
    }
    if (!formData.customerId) {
      newErrors.customerId = t('select.customer.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <HeaderForm header={t('create.delivery.note')} isCreate={true} />

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
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2 flex flex-col">
                <label className="font-semibold">{t('date')}</label>
                <DatePicker
                  selected={
                    formData.deliveryNoteDate
                      ? new Date(formData.deliveryNoteDate)
                      : new Date()
                  }
                  onChange={(date: Date | null) =>
                    setFormData(prev => ({
                      ...prev,
                      deliveryNoteDate:
                        date?.toISOString() || new Date().toISOString(),
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  locale={ca}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm',
                    errors.deliveryNoteDate && 'border-destructive'
                  )}
                />
                {errors.deliveryNoteDate && (
                  <p className="text-destructive text-sm text-red-500">
                    {errors.deliveryNoteDate}
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

            {/* Work Orders Selection */}
            {selectedCustomer && availableWorkOrders.length > 0 && (
              <div className="space-y-2">
                <label className="font-semibold">{t('work.orders')}</label>
                <ChooseElement
                  elements={availableWorkOrders}
                  selectedElements={selectedWorkOrderIds}
                  onElementSelected={handleWorkOrderSelected}
                  onDeleteElementSelected={handleDeleteWorkOrder}
                  placeholder={t('search.work.orders')}
                  mapElement={workOrder => ({
                    id: workOrder.id,
                    description: `${workOrder.code} - ${
                      workOrder.refCustomerId ?? ''
                    } - ${workOrder.description} - ${
                      workOrder.asset?.description
                    } - ${
                      workOrder.customerWorkOrder?.customerInstallationCode ??
                      ''
                    }  - ${
                      workOrder.customerWorkOrder?.customerInstallationAddress
                        .city ?? ''
                    }  `,
                  })}
                />
              </div>
            )}
            {errors.workOrderIds && (
              <p className="text-destructive text-sm text-red-500">
                {errors.workOrderIds}
              </p>
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
                <p>{t('create.delivery.note')}</p>
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
