'use client';

import 'react-datepicker/dist/react-datepicker.css';

import React, { useCallback, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Budget, BudgetStatus } from 'app/interfaces/Budget';
import useRoutes from 'app/utils/useRoutes';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  GitBranch,
  Percent,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { STATUS_CONFIG } from './AssemblyBudgetStatusConfig';

interface AssemblyBudgetHeaderProps {
  budget: Budget;
  isReadOnly: boolean;
  onStatusChange: (value: string) => void;
  onValidUntilChange: (date: Date) => void;
  onTitleChange: (value: string) => void;
  onMarginPercentageChange: (value: number) => void;
  onUpdateMargin: (marginPercentage: number) => Promise<void>;
  onOpenMarginModal: () => void;
  onOpenVersionsModal: () => void;
  t: (key: string) => string;
}

export const AssemblyBudgetHeader = React.memo(function AssemblyBudgetHeader({
  budget,
  isReadOnly,
  onStatusChange,
  onValidUntilChange,
  onTitleChange,
  onMarginPercentageChange,
  onUpdateMargin,
  onOpenMarginModal,
  onOpenVersionsModal,
  t,
}: AssemblyBudgetHeaderProps) {
  const router = useRouter();
  const routes = useRoutes();
  const statusConfig = STATUS_CONFIG[budget.status];

  const handleGoBack = useCallback(() => {
    router.push(routes.assemblyBudget.list);
  }, [router, routes.assemblyBudget.list]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 space-y-3">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {budget.code}
              </h1>
              {budget.activeVersionNumber != null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  <GitBranch className="h-3 w-3" />
                  v{budget.activeVersionNumber}
                  {budget.activeVersionDescription && (
                    <span className="font-normal text-blue-600">
                      · {budget.activeVersionDescription}
                    </span>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {t('assemblyBudget')} ·{' '}
              {dayjs(budget.creationDate).format('DD/MM/YYYY')}
            </p>
          </div>
        </div>

        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

        <TitleField
          value={budget.title || ''}
          isReadOnly={isReadOnly}
          onChange={onTitleChange}
          t={t}
        />

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
      </div>

      <div className="flex items-center gap-3 pl-[52px]">
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

        <button
          type="button"
          onClick={onOpenVersionsModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
        >
          <GitBranch className="h-3.5 w-3.5" />
          {t('assemblyBudget.versions.title')}
        </button>
      </div>
    </div>
  );
});

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
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.className}`}
      >
        {statusConfig.label}
      </span>
    );
  }

  return (
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

function TitleField({
  value,
  isReadOnly,
  onChange,
  t,
}: {
  value: string;
  isReadOnly: boolean;
  onChange: (value: string) => void;
  t: (key: string) => string;
}) {
  if (isReadOnly) {
    return value ? (
      <span className="text-sm font-medium text-gray-700">{value}</span>
    ) : null;
  }

  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={t('assemblyBudget.field.title.placeholder')}
      className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
    />
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
