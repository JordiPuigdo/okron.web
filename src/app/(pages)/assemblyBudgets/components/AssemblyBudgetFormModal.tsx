'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useBudgetAssembly } from 'app/hooks/useBudgetAssembly';
import { useCustomers } from 'app/hooks/useCustomers';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { Customer } from 'app/interfaces/Customer';
import ChooseElement from 'components/ChooseElement';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import { Calendar, FileText, User } from 'lucide-react';

interface AssemblyBudgetFormModalProps {
  isVisible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AssemblyBudgetFormData {
  customerId: string;
  budgetDate: Date;
  validUntil: Date;
  externalComments: string;
  internalComments: string;
}

const INITIAL_FORM_DATA: AssemblyBudgetFormData = {
  customerId: '',
  budgetDate: new Date(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  externalComments: '',
  internalComments: '',
};

export function AssemblyBudgetFormModal({
  isVisible,
  onSuccess,
  onCancel,
}: AssemblyBudgetFormModalProps) {
  const { t } = useTranslations();
  const { customers } = useCustomers();
  const { createAssemblyBudget } = useBudgetAssembly();

  const [formData, setFormData] =
    useState<AssemblyBudgetFormData>(INITIAL_FORM_DATA);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    setFormData(INITIAL_FORM_DATA);
    setSelectedCustomer(undefined);
  }, [isVisible]);

  const handleSelectCustomer = (id: string) => {
    const customer = customers.find(c => c.id === id);
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customerId: id }));
  };

  const handleDeleteCustomer = () => {
    setSelectedCustomer(undefined);
    setFormData(prev => ({ ...prev, customerId: '' }));
  };

  const handleFieldChange = (
    field: keyof AssemblyBudgetFormData,
    value: string | number | Date
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.customerId !== '';

  const formatDate = (date: Date): string => date.toISOString();

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      const result = await createAssemblyBudget({
        customerId: formData.customerId,
        budgetDate: formatDate(formData.budgetDate),
        validUntil: formatDate(formData.validUntil),
        externalComments: formData.externalComments || undefined,
        internalComments: formData.internalComments || undefined,
      });
      if (result) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal2
      isVisible={isVisible}
      setIsVisible={onCancel}
      type="center"
      width="w-full max-w-2xl"
      height="h-auto max-h-[90vh]"
      className="overflow-hidden flex flex-col shadow-2xl"
      closeOnEsc
    >
      <div className="flex flex-col h-full overflow-hidden">
        <ModalHeader t={t} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <CustomerField
            customers={customers}
            selectedCustomerId={formData.customerId}
            selectedCustomer={selectedCustomer}
            onSelect={handleSelectCustomer}
            onDelete={handleDeleteCustomer}
            t={t}
          />

          <DateFields
            budgetDate={formData.budgetDate}
            validUntil={formData.validUntil}
            onBudgetDateChange={date => handleFieldChange('budgetDate', date)}
            onValidUntilChange={date => handleFieldChange('validUntil', date)}
            t={t}
          />

          <DescriptionField
            value={formData.externalComments}
            onChange={value => handleFieldChange('externalComments', value)}
            t={t}
          />

          <NotesField
            value={formData.internalComments}
            onChange={value => handleFieldChange('internalComments', value)}
            t={t}
          />
        </div>

        <ModalFooter
          isSubmitting={isSubmitting}
          isFormValid={isFormValid}
          onCancel={onCancel}
          onSubmit={handleSubmit}
          t={t}
        />
      </div>
    </Modal2>
  );
}

function ModalHeader({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex-shrink-0 p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white rounded-lg w-10 h-10 flex items-center justify-center">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {t('assemblyBudget.create.title')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('assemblyBudget.create.description')}
          </p>
        </div>
      </div>
    </div>
  );
}

function CustomerField({
  customers,
  selectedCustomerId,
  selectedCustomer,
  onSelect,
  onDelete,
  t,
}: {
  customers: Customer[];
  selectedCustomerId: string;
  selectedCustomer?: Customer;
  onSelect: (id: string) => void;
  onDelete: () => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        <User className="h-4 w-4 inline mr-1" />
        {t('customer')} *
      </label>
      <ChooseElement
        elements={customers}
        selectedElements={selectedCustomerId ? [selectedCustomerId] : []}
        onElementSelected={onSelect}
        onDeleteElementSelected={onDelete}
        placeholder={t('customer.search.customer')}
        mapElement={(customer: Customer) => ({
          id: customer.id,
          description: customer.name,
          code: customer.taxId,
        })}
        className="rounded-lg border-2 border-gray-200 focus-within:border-blue-500 transition-colors"
      />
      {selectedCustomer && (
        <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm">
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {selectedCustomer.name}
              </p>
              <p className="text-xs text-gray-500">{selectedCustomer.taxId}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DateFields({
  budgetDate,
  validUntil,
  onBudgetDateChange,
  onValidUntilChange,
  t,
}: {
  budgetDate: Date;
  validUntil: Date;
  onBudgetDateChange: (date: Date) => void;
  onValidUntilChange: (date: Date) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          <Calendar className="h-4 w-4 inline mr-1" />
          {t('budget.preview.budgetDate')}
        </label>
        <DatePicker
          selected={budgetDate}
          onChange={date => date && onBudgetDateChange(date)}
          dateFormat="dd/MM/yyyy"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          <Calendar className="h-4 w-4 inline mr-1" />
          {t('budget.preview.validUntil')}
        </label>
        <DatePicker
          selected={validUntil}
          onChange={date => date && onValidUntilChange(date)}
          dateFormat="dd/MM/yyyy"
          minDate={budgetDate}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
        />
      </div>
    </div>
  );
}

function DescriptionField({
  value,
  onChange,
  t,
}: {
  value: string;
  onChange: (value: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {t('description')}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t('assemblyBudget.field.description.placeholder')}
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
      />
    </div>
  );
}

function NotesField({
  value,
  onChange,
  t,
}: {
  value: string;
  onChange: (value: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {t('notes')}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t('assemblyBudget.field.notes.placeholder')}
        rows={2}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
      />
    </div>
  );
}

function ModalFooter({
  isSubmitting,
  isFormValid,
  onCancel,
  onSubmit,
  t,
}: {
  isSubmitting: boolean;
  isFormValid: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex-shrink-0 flex justify-end items-center gap-3 px-6 py-4 border-t bg-gray-50">
      <Button
        type="cancel"
        onClick={onCancel}
        customStyles="px-5 py-2.5"
        disabled={isSubmitting}
      >
        {t('common.cancel')}
      </Button>
      <Button
        type="create"
        onClick={onSubmit}
        customStyles="px-5 py-2.5 gap-2 flex items-center"
        disabled={isSubmitting || !isFormValid}
      >
        {t('create')}
        {isSubmitting && <SvgSpinner className="h-4 w-4" />}
      </Button>
    </div>
  );
}
