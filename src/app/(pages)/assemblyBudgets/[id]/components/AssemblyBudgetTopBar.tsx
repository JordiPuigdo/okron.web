'use client';

import 'react-datepicker/dist/react-datepicker.css';

import React, { useCallback, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Budget, BudgetStatus } from 'app/interfaces/Budget';
import dayjs from 'dayjs';
import { Calendar, Check, FileText, Percent, User } from 'lucide-react';

import { STATUS_CONFIG } from './AssemblyBudgetStatusConfig';

interface AssemblyBudgetTopBarProps {
  budget: Budget;
  isReadOnly: boolean;
  onStatusChange: (value: string) => void;
  onValidUntilChange: (date: Date) => void;
  onMarginPercentageChange: (value: number) => void;
  onUpdateMargin: (marginPercentage: number) => Promise<void>;
  onOpenMarginModal: () => void;
  t: (key: string) => string;
}

export const AssemblyBudgetTopBar = React.memo(function AssemblyBudgetTopBar({
  budget,
  isReadOnly,
  onStatusChange,
  onValidUntilChange,
  onMarginPercentageChange,
  onUpdateMargin,
  onOpenMarginModal,
  t,
}: AssemblyBudgetTopBarProps) {
  const statusConfig = STATUS_CONFIG[budget.status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <BudgetIdentifier code={budget.code} creationDate={budget.creationDate} t={t} />

        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

        <StatusSelector
          status={budget.status}
          statusConfig={statusConfig}
          isReadOnly={isReadOnly}
          onStatusChange={onStatusChange}
        />

        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

        <DateFields
          budgetDate={budget.budgetDate}
          validUntil={budget.validUntil}
          isReadOnly={isReadOnly}
          onValidUntilChange={onValidUntilChange}
          t={t}
        />

        <CompanyBadge
          companyName={budget.companyName}
          customerNif={budget.customerNif}
        />

        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

        <MarginPercentageField
          value={budget.marginPercentage}
          isReadOnly={isReadOnly}
          onChange={onMarginPercentageChange}
          onSave={onUpdateMargin}
          t={t}
        />

        {!isReadOnly && (
          <button
            type="button"
            onClick={onOpenMarginModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
          >
            <Percent className="h-3.5 w-3.5" />
            {t('assemblyBudget.margin.applyMargins')}
          </button>
        )}
      </div>
    </div>
  );
});

function BudgetIdentifier({
  code,
  creationDate,
  t,
}: {
  code: string;
  creationDate: Date;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 text-white rounded-lg w-10 h-10 flex items-center justify-center">
        <FileText className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          {code}
        </h1>
        <p className="text-xs text-gray-500">
          {t('assemblyBudget')} · {dayjs(creationDate).format('DD/MM/YYYY')}
        </p>
      </div>
    </div>
  );
}

function StatusSelector({
  status,
  statusConfig,
  isReadOnly,
  onStatusChange,
}: {
  status: BudgetStatus;
  statusConfig: { label: string; className: string };
  isReadOnly: boolean;
  onStatusChange: (value: string) => void;
}) {
  if (isReadOnly) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={e => onStatusChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      >
        {Object.values(BudgetStatus)
          .filter(value => typeof value === 'number')
          .map(s => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s as BudgetStatus]?.label || s}
            </option>
          ))}
      </select>
    </div>
  );
}

function DateFields({
  budgetDate,
  validUntil,
  isReadOnly,
  onValidUntilChange,
  t,
}: {
  budgetDate: string;
  validUntil: string;
  isReadOnly: boolean;
  onValidUntilChange: (date: Date) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="text-gray-500">
          {t('budget.preview.budgetDate')}:
        </span>
        <span className="font-medium text-gray-800">
          {dayjs(budgetDate).format('DD/MM/YYYY')}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="text-gray-500">
          {t('budget.preview.validUntil')}:
        </span>
        {isReadOnly ? (
          <span className="font-medium text-gray-800">
            {dayjs(validUntil).format('DD/MM/YYYY')}
          </span>
        ) : (
          <DatePicker
            selected={new Date(validUntil)}
            onChange={date => date && onValidUntilChange(date)}
            dateFormat="dd/MM/yyyy"
            minDate={new Date(budgetDate)}
            className="w-28 rounded-md border border-gray-300 px-2 py-1 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        )}
      </div>
    </div>
  );
}

function CompanyBadge({
  companyName,
  customerNif,
}: {
  companyName?: string;
  customerNif?: string;
}) {
  if (!companyName) return null;

  return (
    <div className="ml-auto flex items-center gap-2">
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
        <User className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {companyName}
        </span>
        {customerNif && (
          <span className="text-xs text-gray-400">· {customerNif}</span>
        )}
      </div>
    </div>
  );
}

function MarginPercentageField({
  value,
  isReadOnly,
  onSave,
  t,
}: {
  value: number;
  isReadOnly: boolean;
  onChange: (value: number) => void;
  onSave: (marginPercentage: number) => Promise<void>;
  t: (key: string) => string;
}) {
  const [inputValue, setInputValue] = useState(String(value ?? 0));
  const [savedValue, setSavedValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const parsedValue = parseFloat(inputValue) || 0;
  const hasChanged = parsedValue !== savedValue;

  React.useEffect(() => {
    setInputValue(String(value ?? 0));
    setSavedValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
        setInputValue(raw);
      }
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!hasChanged || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(parsedValue);
      setSavedValue(parsedValue);
    } finally {
      setIsSaving(false);
    }
  }, [hasChanged, isSaving, parsedValue, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Percent className="h-4 w-4 text-gray-400" />
      <span className="text-gray-500">{t('marginPercentage')}:</span>
      {isReadOnly ? (
        <span className="font-medium text-gray-800">{value ?? 0}%</span>
      ) : (
        <div className="flex items-center gap-1">
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm font-medium text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none pr-6"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
              %
            </span>
          </div>
          {hasChanged && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
