'use client';

import 'react-datepicker/dist/react-datepicker.css';

import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useCustomers } from 'app/hooks/useCustomers';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { useRates } from 'app/hooks/useRates';
import { useSparePartsHook } from 'app/hooks/useSparePartsHook';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { BudgetCreationRequest, BudgetItemType } from 'app/interfaces/Budget';
import { Customer, CustomerInstallations } from 'app/interfaces/Customer';
import Operator from 'app/interfaces/Operator';
import SparePart from 'app/interfaces/SparePart';
import { WorkOrder } from 'app/interfaces/workOrder';
import { BudgetService } from 'app/services/budgetService';
import ChooseElement from 'components/ChooseElement';
import { ca } from 'date-fns/locale';
import { Button } from 'designSystem/Button/Buttons';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  Search,
  X,
} from 'lucide-react';

import { BudgetItemList } from '../../budgets/components/BudgetItemList';
import { BudgetItemFormData } from '../../budgets/components/BudgetItemRow';
import { WorkOrderSelector } from '../../budgets/components/WorkOrderSelector';

// ============================================================================
// TYPES
// ============================================================================

type Step = 1 | 2 | 3;

interface BudgetCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Modal para crear presupuestos con flujo de 3 pasos.
 * Sigue principios SOLID:
 * - SRP: Orquesta los pasos, delega lógica a componentes hijos
 * - OCP: Fácil añadir nuevos pasos o tipos de items
 * - DIP: Usa hooks e interfaces, no implementaciones concretas
 */
export function BudgetCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: BudgetCreateModalProps) {
  // Hooks
  const { customers, getById } = useCustomers();
  const { spareParts } = useSparePartsHook();
  const { operators } = useOperatorHook();
  const { rates } = useRates();
  const { t } = useTranslations();
  // State - Wizard
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  // State - Step 1: Cliente
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >();
  const [selectedInstallation, setSelectedInstallation] = useState<
    CustomerInstallations | undefined
  >();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<
    WorkOrder | undefined
  >();

  // State - Step 2: Items
  const [items, setItems] = useState<BudgetItemFormData[]>([]);

  // State - Step 3: Fechas y comentarios
  const [budgetDate, setBudgetDate] = useState<Date>(new Date());
  const [validUntil, setValidUntil] = useState<Date>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [externalComments, setExternalComments] = useState<string>('');
  const [internalComments, setInternalComments] = useState<string>('');

  const budgetService = new BudgetService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setSelectedCustomerId('');
    setSelectedCustomer(undefined);
    setSelectedInstallation(undefined);
    setSelectedWorkOrder(undefined);
    setItems([]);
    setBudgetDate(new Date());
    setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setExternalComments('');
    setInternalComments('');
  };

  // Handlers - Step 1
  const handleSelectCustomer = async (id: string) => {
    setSelectedCustomerId(id);
    const customer = await getById(id);
    setSelectedCustomer(customer);
    setSelectedInstallation(undefined);
    setSelectedWorkOrder(undefined);
  };

  const handleDeleteCustomer = () => {
    setSelectedCustomerId('');
    setSelectedCustomer(undefined);
    setSelectedInstallation(undefined);
    setSelectedWorkOrder(undefined);
  };

  // Handler para seleccionar WorkOrder y preseleccionar instalación si existe
  const handleSelectWorkOrder = (workOrder: WorkOrder | undefined) => {
    setSelectedWorkOrder(workOrder);

    // Si la WorkOrder tiene una instalación asociada, preseleccionarla
    if (
      workOrder?.customerWorkOrder?.customerInstallationId &&
      selectedCustomer?.installations
    ) {
      const installation = selectedCustomer.installations.find(
        inst => inst.id === workOrder.customerWorkOrder?.customerInstallationId
      );
      if (installation) {
        setSelectedInstallation(installation);
      }
    }

    // Si la WorkOrder tiene datos, pre-cargar las líneas del presupuesto
    if (workOrder) {
      const newItems: BudgetItemFormData[] = [];

      // 1. Añadir recambios utilizados
      if (
        workOrder.workOrderSpareParts &&
        workOrder.workOrderSpareParts.length > 0
      ) {
        workOrder.workOrderSpareParts.forEach(woSparePart => {
          newItems.push({
            tempId: `sp-${woSparePart.id}-${Date.now()}`,
            type: BudgetItemType.SparePart,
            description:
              woSparePart.sparePart?.description || t('budget.item.sparePart'),
            quantity: woSparePart.quantity,
            unitPrice: woSparePart.sparePart?.price || 0,
            discountPercentage: 0,
            taxPercentage: 21, // IVA por defecto
            sparePartId: woSparePart.sparePart?.id,
          });
        });
      }

      // 2. Añadir horas de mano de obra (trabajo + desplazamiento en una sola línea)
      if (
        workOrder.workOrderOperatorTimes &&
        workOrder.workOrderOperatorTimes.length > 0
      ) {
        let totalMinutes = 0;

        workOrder.workOrderOperatorTimes.forEach(time => {
          if (time.totalTime) {
            // totalTime viene en formato "HH:mm:ss" o similar
            const parts = time.totalTime.split(':');
            if (parts.length >= 2) {
              const hours = parseInt(parts[0], 10) || 0;
              const minutes = parseInt(parts[1], 10) || 0;
              totalMinutes += hours * 60 + minutes;
            }
          } else if (time.startTime && time.endTime) {
            // Calcular tiempo si no viene totalTime
            const start = new Date(time.startTime);
            const end = new Date(time.endTime);
            totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
          }
        });

        if (totalMinutes > 0) {
          const totalHours = Math.round((totalMinutes / 60) * 100) / 100; // Redondear a 2 decimales

          // Obtener precio de mano de obra: primero del cliente, luego de las rates generales
          let laborPrice = 0;

          // Buscar tarifa del cliente si tiene instalación seleccionada
          const installationRates = selectedInstallation?.rates;
          const customerRates = selectedCustomer?.rates;

          if (installationRates && installationRates.length > 0) {
            laborPrice = installationRates[0].price;
          } else if (customerRates && customerRates.length > 0) {
            laborPrice = customerRates[0].price;
          } else if (rates && rates.length > 0) {
            // Usar tarifa general de la empresa
            laborPrice = rates[0].price;
          }

          newItems.push({
            tempId: `labor-${Date.now()}`,
            type: BudgetItemType.Labor,
            description: `${t('budget.itemType.labor')} - ${workOrder.code}`,
            quantity: totalHours,
            unitPrice: laborPrice,
            discountPercentage: 0,
            taxPercentage: 21, // IVA por defecto
          });
        }
      }

      // Actualizar items (añadir a los existentes o reemplazar)
      if (newItems.length > 0) {
        setItems(prevItems => [...prevItems, ...newItems]);
      }
    }
  };

  // Validation
  const canProceedToStep2 = selectedCustomerId !== '';
  const canProceedToStep3 = items.length > 0;

  // Submit
  const handleSubmit = async () => {
    if (!selectedCustomerId) return;

    setIsLoading(true);
    try {
      const request: BudgetCreationRequest = {
        customerId: selectedCustomerId,
        workOrderId: selectedWorkOrder?.id,
        budgetDate: budgetDate.toISOString(),
        validUntil: validUntil.toISOString(),
        customerInstallationId: selectedInstallation?.id,
        externalComments: externalComments || undefined,
        internalComments: internalComments || undefined,
        items: items.map(item => ({
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercentage: item.discountPercentage,
          taxPercentage: item.taxPercentage,
          sparePartId: item.sparePartId,
          operatorId: item.operatorId,
        })),
      };

      await budgetService.create(request);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Step configurations
  const steps = [
    { number: 1, title: 'Client', icon: FileText },
    { number: 2, title: 'Línies', icon: Package },
    { number: 3, title: 'Detalls', icon: Calendar },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <ModalHeader step={step} steps={steps} onClose={onClose} t={t} />

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {step === 1 && (
              <Step1Customer
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                selectedCustomer={selectedCustomer}
                selectedInstallation={selectedInstallation}
                selectedWorkOrder={selectedWorkOrder}
                onSelectCustomer={handleSelectCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onSelectInstallation={setSelectedInstallation}
                onSelectWorkOrder={handleSelectWorkOrder}
                t={t}
              />
            )}

            {step === 2 && (
              <Step2Items
                items={items}
                onChange={setItems}
                spareParts={spareParts || []}
                operators={operators || []}
                t={t}
              />
            )}

            {step === 3 && (
              <Step3Details
                budgetDate={budgetDate}
                validUntil={validUntil}
                externalComments={externalComments}
                internalComments={internalComments}
                selectedCustomer={selectedCustomer}
                selectedInstallation={selectedInstallation}
                selectedWorkOrder={selectedWorkOrder}
                items={items}
                onBudgetDateChange={setBudgetDate}
                onValidUntilChange={setValidUntil}
                onExternalCommentsChange={setExternalComments}
                onInternalCommentsChange={setInternalComments}
                t={t}
              />
            )}
          </div>

          {/* Footer */}
          <ModalFooter
            step={step}
            canProceedToStep2={canProceedToStep2}
            canProceedToStep3={canProceedToStep3}
            isLoading={isLoading}
            onBack={() => setStep((step - 1) as Step)}
            onNext={() => setStep((step + 1) as Step)}
            onSubmit={handleSubmit}
            t={t}
          />
        </div>
      </div>
    </>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Header del modal con stepper */
function ModalHeader({
  step,
  steps,
  onClose,
  t,
}: {
  step: Step;
  steps: { number: number; title: string; icon: React.ElementType }[];
  onClose: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-gradient-to-r from-[#6E41B6] to-[#8B5CF6] px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t('budget.new')}</h2>
            <p className="text-white/80 text-sm">
              Pas {step} de 3: {steps[step - 1].title}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, idx) => (
          <React.Fragment key={s.number}>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                step >= s.number
                  ? 'bg-white text-[#6E41B6]'
                  : 'bg-white/20 text-white/60'
              }`}
            >
              {step > s.number ? (
                <Check className="w-4 h-4" />
              ) : (
                <s.icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium hidden sm:inline">
                {s.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 transition-colors ${
                  step > s.number ? 'bg-white' : 'bg-white/30'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/** Step 1: Selección de cliente */
function Step1Customer({
  customers,
  selectedCustomerId,
  selectedCustomer,
  selectedInstallation,
  selectedWorkOrder,
  onSelectCustomer,
  onDeleteCustomer,
  onSelectInstallation,
  onSelectWorkOrder,
  t,
}: {
  customers: Customer[];
  selectedCustomerId: string;
  selectedCustomer?: Customer;
  selectedInstallation?: CustomerInstallations;
  selectedWorkOrder?: WorkOrder;
  onSelectCustomer: (id: string) => void;
  onDeleteCustomer: () => void;
  onSelectInstallation: (
    installation: CustomerInstallations | undefined
  ) => void;
  onSelectWorkOrder: (workOrder: WorkOrder | undefined) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('customer')} *
        </label>
        <ChooseElement
          elements={customers}
          selectedElements={selectedCustomerId ? [selectedCustomerId] : []}
          onElementSelected={onSelectCustomer}
          onDeleteElementSelected={onDeleteCustomer}
          placeholder={t('customer.search.customer')}
          mapElement={(customer: Customer) => ({
            id: customer.id,
            description: customer.name,
            code: customer.taxId,
          })}
          className="rounded-xl border-2 border-gray-200 focus-within:border-[#6E41B6] transition-colors"
        />
      </div>

      {/* Selected Customer Card */}
      {selectedCustomer && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100 space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-[#6E41B6] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {selectedCustomer.name}
              </h3>
              <p className="text-sm text-gray-600">{selectedCustomer.taxId}</p>
              {selectedCustomer.email && (
                <p className="text-sm text-gray-500">
                  {selectedCustomer.email}
                </p>
              )}
            </div>
          </div>

          {/* Installations */}
          {selectedCustomer.installations &&
            selectedCustomer.installations.length > 0 && (
              <InstallationSelector
                installations={selectedCustomer.installations}
                selectedInstallation={selectedInstallation}
                onSelect={onSelectInstallation}
                t={t}
              />
            )}

          {/* Work Order Selector */}
          <WorkOrderSelector
            customerId={selectedCustomerId}
            selectedWorkOrderId={selectedWorkOrder?.id}
            onSelect={onSelectWorkOrder}
          />
        </div>
      )}
    </div>
  );
}

/** Step 2: Items del presupuesto */
function Step2Items({
  items,
  onChange,
  spareParts,
  operators,
  t,
}: {
  items: BudgetItemFormData[];
  onChange: (items: BudgetItemFormData[]) => void;
  spareParts: SparePart[];
  operators: Operator[];
  t: (key: string) => string;
}) {
  return (
    <BudgetItemList
      items={items}
      onChange={onChange}
      spareParts={spareParts}
      operators={operators}
      t={t}
    />
  );
}

/** Step 3: Fechas y comentarios */
function Step3Details({
  budgetDate,
  validUntil,
  externalComments,
  internalComments,
  selectedCustomer,
  selectedInstallation,
  selectedWorkOrder,
  items,
  onBudgetDateChange,
  onValidUntilChange,
  onExternalCommentsChange,
  onInternalCommentsChange,
  t,
}: {
  budgetDate: Date;
  validUntil: Date;
  externalComments: string;
  internalComments: string;
  selectedCustomer?: Customer;
  selectedInstallation?: CustomerInstallations;
  selectedWorkOrder?: WorkOrder;
  items: BudgetItemFormData[];
  onBudgetDateChange: (date: Date) => void;
  onValidUntilChange: (date: Date) => void;
  onExternalCommentsChange: (value: string) => void;
  onInternalCommentsChange: (value: string) => void;
  t: (key: string) => string;
}) {
  // Calcular días de validez actual
  const currentValidityDays = Math.ceil(
    (validUntil.getTime() - budgetDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calcular totales
  const calculateLineTotal = (item: BudgetItemFormData) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discountPercentage / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (item.taxPercentage / 100);
    return afterDiscount + taxAmount;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const totalDiscount = items.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    return sum + lineSubtotal * (item.discountPercentage / 100);
  }, 0);
  const totalTax = items.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const afterDiscount = lineSubtotal * (1 - item.discountPercentage / 100);
    return sum + afterDiscount * (item.taxPercentage / 100);
  }, 0);
  const total = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);

  const formatCurrency = (value: number) =>
    value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

  return (
    <div className="space-y-6">
      {/* Dates Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            {t('budget.preview.budgetDate')}
          </label>
          <DatePicker
            selected={budgetDate}
            onChange={(date: Date | null) => date && onBudgetDateChange(date)}
            dateFormat="dd/MM/yyyy"
            locale={ca}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#6E41B6] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            {t('budget.preview.validUntil')}
          </label>
          <DatePicker
            selected={validUntil}
            onChange={(date: Date | null) => date && onValidUntilChange(date)}
            dateFormat="dd/MM/yyyy"
            locale={ca}
            minDate={budgetDate}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#6E41B6] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Quick Duration Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          {t('budget.preview.validUntil')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {[15, 30, 60, 90].map(days => {
            const isSelected = currentValidityDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() =>
                  onValidUntilChange(
                    new Date(budgetDate.getTime() + days * 24 * 60 * 60 * 1000)
                  )
                }
                className={`px-4 py-2 text-sm rounded-full border-2 transition-all font-medium ${
                  isSelected
                    ? 'border-[#6E41B6] bg-[#6E41B6] text-white'
                    : 'border-gray-200 hover:border-[#6E41B6] hover:bg-purple-50'
                }`}
              >
                {days} {t('days')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            {t('budget.form.externalComments')}
          </label>
          <textarea
            value={externalComments}
            onChange={e => onExternalCommentsChange(e.target.value)}
            placeholder={t('budget.form.externalCommentsPlaceholder')}
            rows={3}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#6E41B6] focus:outline-none transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            {t('budget.form.internalComments')}
          </label>
          <textarea
            value={internalComments}
            onChange={e => onInternalCommentsChange(e.target.value)}
            placeholder={t('budget.form.internalCommentsPlaceholder')}
            rows={3}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#6E41B6] focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h4 className="font-semibold text-gray-700">
          {t('budget.form.summary')}
        </h4>

        {/* Info principal en dos columnas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <span className="text-gray-500 text-xs uppercase tracking-wide">
              {t('customer')}
            </span>
            <p className="font-semibold text-gray-900 mt-1">
              {selectedCustomer?.name}
            </p>
            {selectedInstallation && (
              <p className="text-xs text-gray-500 mt-0.5">
                📍 {selectedInstallation.code}
              </p>
            )}
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <span className="text-gray-500 text-xs uppercase tracking-wide">
              {t('budget.form.validity')}
            </span>
            <p className="font-semibold text-gray-900 mt-1">
              {validUntil.toLocaleDateString('es-ES')}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentValidityDays} {t('days')}
            </p>
          </div>
        </div>

        {/* Orden de trabajo si existe */}
        {selectedWorkOrder && (
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 flex items-center gap-2">
            <div className="bg-[#6E41B6] rounded-full p-1.5">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-xs text-purple-600 font-medium">
                {t('work.order')}
              </span>
              <p className="font-semibold text-purple-900">
                {selectedWorkOrder.code}
              </p>
            </div>
          </div>
        )}

        {/* Tabla de líneas */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-600">
                  {t('description')}
                </th>
                <th className="text-center py-2 px-2 font-medium text-gray-600 w-16">
                  {t('quantity')}
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600 w-24">
                  {t('total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.tempId}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="py-2 px-3 text-gray-700 truncate max-w-[200px]">
                    {item.description || '-'}
                  </td>
                  <td className="py-2 px-2 text-center text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-gray-900">
                    {formatCurrency(calculateLineTotal(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('subtotal')}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t('discount')}</span>
                <span>-{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('taxes')}</span>
              <span>{formatCurrency(totalTax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
              <span>{t('total')}</span>
              <span className="text-[#6E41B6]">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Selector de instalaciones con búsqueda */
function InstallationSelector({
  installations,
  selectedInstallation,
  onSelect,
  t,
}: {
  installations: CustomerInstallations[];
  selectedInstallation?: CustomerInstallations;
  onSelect: (installation: CustomerInstallations | undefined) => void;
  t: (key: string) => string;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtrar instalaciones por código, ciudad o dirección
  const filteredInstallations = installations.filter(installation => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      installation.code?.toLowerCase().includes(search) ||
      installation.address?.city?.toLowerCase().includes(search) ||
      installation.address?.address?.toLowerCase().includes(search) ||
      installation.address?.postalCode?.toLowerCase().includes(search)
    );
  });

  const handleSelect = (installation: CustomerInstallations) => {
    onSelect(
      selectedInstallation?.id === installation.id ? undefined : installation
    );
    setIsExpanded(false);
    setSearchTerm('');
  };

  // Si hay pocas instalaciones (<=5), mostrar como botones
  if (installations.length <= 5) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          {t('deliveryNote.installation.client')}
        </label>
        <div className="flex flex-wrap gap-2">
          {installations.map(installation => (
            <button
              key={installation.id}
              type="button"
              onClick={() => handleSelect(installation)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 text-left ${
                selectedInstallation?.id === installation.id
                  ? 'border-[#6E41B6] bg-[#6E41B6] text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200'
              }`}
            >
              <div className="font-semibold">{installation.code}</div>
              {installation.address?.city && (
                <div
                  className={`text-xs ${
                    selectedInstallation?.id === installation.id
                      ? 'text-white/80'
                      : 'text-gray-500'
                  }`}
                >
                  {installation.address.city}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Si hay muchas instalaciones, mostrar con buscador
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <MapPin className="w-4 h-4 inline mr-1" />
        {t('deliveryNote.installation.client')} ({installations.length})
      </label>

      {/* Instalación seleccionada */}
      {selectedInstallation && !isExpanded && (
        <div className="mb-2 flex items-center gap-2 bg-[#6E41B6] text-white rounded-lg p-3">
          <div className="flex-1">
            <div className="font-semibold">{selectedInstallation.code}</div>
            <div className="text-sm text-white/80">
              {selectedInstallation.address?.city}
              {selectedInstallation.address?.address &&
                ` - ${selectedInstallation.address.address}`}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Botón para expandir o campo de búsqueda */}
      {!isExpanded && !selectedInstallation && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#6E41B6] hover:text-[#6E41B6] transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          {t('budget.form.searchInstallation')}
        </button>
      )}

      {/* Panel de búsqueda expandido */}
      {isExpanded && (
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
          {/* Input de búsqueda */}
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={t('budget.form.searchByCodeOrCity')}
                className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:border-[#6E41B6] focus:outline-none text-sm"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de instalaciones */}
          <div className="max-h-48 overflow-y-auto">
            {filteredInstallations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {t('budget.form.noInstallationsFound')}
              </div>
            ) : (
              filteredInstallations.map(installation => (
                <button
                  key={installation.id}
                  type="button"
                  onClick={() => handleSelect(installation)}
                  className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 hover:bg-purple-50 transition-colors ${
                    selectedInstallation?.id === installation.id
                      ? 'bg-purple-100'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {installation.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {installation.address?.city}
                        {installation.address?.province &&
                          ` (${installation.address.province})`}
                      </div>
                      {installation.address?.address && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {installation.address.address}
                        </div>
                      )}
                    </div>
                    {installation.kms > 0 && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {installation.kms} km
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Botón para cerrar */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setSearchTerm('');
              }}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Footer del modal con navegación */
function ModalFooter({
  step,
  canProceedToStep2,
  canProceedToStep3,
  isLoading,
  onBack,
  onNext,
  onSubmit,
  t,
}: {
  step: Step;
  canProceedToStep2: boolean;
  canProceedToStep3: boolean;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  t: (key: string) => string;
}) {
  const canProceed =
    step === 1 ? canProceedToStep2 : step === 2 ? canProceedToStep3 : true;

  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
      <div className="flex gap-3">
        {step > 1 && (
          <Button type="cancel" onClick={onBack} customStyles="flex gap-2">
            <ChevronLeft className="w-4 h-4" />
            {t('budget.actions.back')}
          </Button>
        )}

        <div className="flex-1" />

        {step < 3 ? (
          <Button
            type="create"
            onClick={onNext}
            disabled={!canProceed}
            customStyles="gap-2 flex"
          >
            {t('budget.actions.continue')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="create"
            onClick={onSubmit}
            disabled={isLoading}
            customStyles="gap-2 flex"
          >
            {isLoading ? (
              <>
                <SvgSpinner className="w-5 h-5 animate-spin" />
                {t('budget.actions.creating')}...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                {t('budget.actions.createBudget')}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
