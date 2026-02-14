'use client';

import 'react-datepicker/dist/react-datepicker.css';

import React from 'react';
import DatePicker from 'react-datepicker';
import { Budget, BudgetStatus } from 'app/interfaces/Budget';
import dayjs from 'dayjs';
import { Calendar, FileText, User } from 'lucide-react';

import { STATUS_CONFIG } from './AssemblyBudgetStatusConfig';

interface AssemblyBudgetTopBarProps {
  budget: Budget;
  isReadOnly: boolean;
  onStatusChange: (value: string) => void;
  onValidUntilChange: (date: Date) => void;
  t: (key: string) => string;
}

export const AssemblyBudgetTopBar = React.memo(function AssemblyBudgetTopBar({
  budget,
  isReadOnly,
  onStatusChange,
  onValidUntilChange,
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
