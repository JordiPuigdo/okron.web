'use client';

import 'react-datepicker/dist/react-datepicker.css';

import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useCustomers } from 'app/hooks/useCustomers';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { useSparePartsHook } from 'app/hooks/useSparePartsHook';
import { SvgSpinner } from 'app/icons/icons';
import { BudgetCreationRequest } from 'app/interfaces/Budget';
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
  X,
} from 'lucide-react';

import { BudgetItemList } from './budget/BudgetItemList';
import { BudgetItemFormData } from './budget/BudgetItemRow';
import { WorkOrderSelector } from './budget/WorkOrderSelector';

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <ModalHeader step={step} steps={steps} onClose={onClose} />

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
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
                onSelectWorkOrder={setSelectedWorkOrder}
              />
            )}

            {step === 2 && (
              <Step2Items
                items={items}
                onChange={setItems}
                spareParts={spareParts || []}
                operators={operators || []}
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
                itemsCount={items.length}
                onBudgetDateChange={setBudgetDate}
                onValidUntilChange={setValidUntil}
                onExternalCommentsChange={setExternalComments}
                onInternalCommentsChange={setInternalComments}
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
}: {
  step: Step;
  steps: { number: number; title: string; icon: React.ElementType }[];
  onClose: () => void;
}) {
  return (
    <div className="bg-gradient-to-r from-[#6E41B6] to-[#8B5CF6] px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Nou pressupost</h2>
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
}) {
  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Client *
        </label>
        <ChooseElement
          elements={customers}
          selectedElements={selectedCustomerId ? [selectedCustomerId] : []}
          onElementSelected={onSelectCustomer}
          onDeleteElementSelected={onDeleteCustomer}
          placeholder="Cercar client..."
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Instal·lació (opcional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.installations.map(installation => (
                    <button
                      key={installation.id}
                      type="button"
                      onClick={() =>
                        onSelectInstallation(
                          selectedInstallation?.id === installation.id
                            ? undefined
                            : installation
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                        selectedInstallation?.id === installation.id
                          ? 'border-[#6E41B6] bg-[#6E41B6] text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200'
                      }`}
                    >
                      {installation.code}
                    </button>
                  ))}
                </div>
              </div>
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
}: {
  items: BudgetItemFormData[];
  onChange: (items: BudgetItemFormData[]) => void;
  spareParts: SparePart[];
  operators: Operator[];
}) {
  return (
    <BudgetItemList
      items={items}
      onChange={onChange}
      spareParts={spareParts}
      operators={operators}
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
  itemsCount,
  onBudgetDateChange,
  onValidUntilChange,
  onExternalCommentsChange,
  onInternalCommentsChange,
}: {
  budgetDate: Date;
  validUntil: Date;
  externalComments: string;
  internalComments: string;
  selectedCustomer?: Customer;
  selectedInstallation?: CustomerInstallations;
  selectedWorkOrder?: WorkOrder;
  itemsCount: number;
  onBudgetDateChange: (date: Date) => void;
  onValidUntilChange: (date: Date) => void;
  onExternalCommentsChange: (value: string) => void;
  onInternalCommentsChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Dates Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data pressupost
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
            Vàlid fins
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
          Validesa ràpida
        </label>
        <div className="flex gap-2 flex-wrap">
          {[15, 30, 60, 90].map(days => (
            <button
              key={days}
              type="button"
              onClick={() =>
                onValidUntilChange(
                  new Date(budgetDate.getTime() + days * 24 * 60 * 60 * 1000)
                )
              }
              className="px-4 py-2 text-sm rounded-full border-2 border-gray-200 hover:border-[#6E41B6] hover:bg-purple-50 transition-all font-medium"
            >
              {days} dies
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Comentaris externs
          </label>
          <textarea
            value={externalComments}
            onChange={e => onExternalCommentsChange(e.target.value)}
            placeholder="Comentaris visibles pel client..."
            rows={3}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#6E41B6] focus:outline-none transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Comentaris interns
          </label>
          <textarea
            value={internalComments}
            onChange={e => onInternalCommentsChange(e.target.value)}
            placeholder="Notes internes (no es mostraran al client)..."
            rows={3}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#6E41B6] focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-700 mb-3">
          Resum del pressupost
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Client:</span>
            <p className="font-medium">{selectedCustomer?.name}</p>
          </div>
          {selectedInstallation && (
            <div>
              <span className="text-gray-500">Instal·lació:</span>
              <p className="font-medium">{selectedInstallation.code}</p>
            </div>
          )}
          {selectedWorkOrder && (
            <div>
              <span className="text-gray-500">Ordre de treball:</span>
              <p className="font-medium">{selectedWorkOrder.code}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Línies:</span>
            <p className="font-medium">{itemsCount}</p>
          </div>
          <div>
            <span className="text-gray-500">Validesa:</span>
            <p className="font-medium">
              {Math.ceil(
                (validUntil.getTime() - budgetDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              dies
            </p>
          </div>
        </div>
      </div>
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
}: {
  step: Step;
  canProceedToStep2: boolean;
  canProceedToStep3: boolean;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const canProceed =
    step === 1 ? canProceedToStep2 : step === 2 ? canProceedToStep3 : true;

  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
      <div className="flex gap-3">
        {step > 1 && (
          <Button type="cancel" onClick={onBack} customStyles="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Enrere
          </Button>
        )}

        <div className="flex-1" />

        {step < 3 ? (
          <Button
            type="create"
            onClick={onNext}
            disabled={!canProceed}
            customStyles="gap-2"
          >
            Continuar
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="create"
            onClick={onSubmit}
            disabled={isLoading}
            customStyles="gap-2"
          >
            {isLoading ? (
              <>
                <SvgSpinner className="w-5 h-5 animate-spin" />
                Creant...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Crear pressupost
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
