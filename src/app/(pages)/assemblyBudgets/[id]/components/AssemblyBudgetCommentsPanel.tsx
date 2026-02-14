'use client';

import React, { useState } from 'react';
import { Textarea } from 'components/textarea';
import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';

interface AssemblyBudgetCommentsPanelProps {
  externalComments?: string;
  internalComments?: string;
  isReadOnly: boolean;
  onExternalChange: (value: string) => void;
  onInternalChange: (value: string) => void;
  t: (key: string) => string;
}

export const AssemblyBudgetCommentsPanel = React.memo(
  function AssemblyBudgetCommentsPanel({
    externalComments,
    internalComments,
    isReadOnly,
    onExternalChange,
    onInternalChange,
    t,
  }: AssemblyBudgetCommentsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-800">
              {t('comments')}
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="px-5 pb-4 space-y-3 border-t border-gray-100 pt-3">
            <CommentField
              label={t('budget.form.externalComments')}
              value={externalComments}
              isReadOnly={isReadOnly}
              onChange={onExternalChange}
            />
            <CommentField
              label={t('budget.form.internalComments')}
              value={internalComments}
              isReadOnly={isReadOnly}
              onChange={onInternalChange}
            />
          </div>
        )}
      </div>
    );
  }
);

function CommentField({
  label,
  value,
  isReadOnly,
  onChange,
}: {
  label: string;
  value?: string;
  isReadOnly: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      {isReadOnly ? (
        <div className="p-2 bg-gray-50 rounded-lg border text-sm text-gray-700 min-h-[48px]">
          {value || '-'}
        </div>
      ) : (
        <Textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          rows={2}
          className="resize-none text-sm"
        />
      )}
    </div>
  );
}
