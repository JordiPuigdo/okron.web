'use client';

import { Calendar } from 'lucide-react';

import { formatDateShort } from './utils';

// ============================================================================
// TYPES
// ============================================================================

interface DateCardProps {
  /** Etiqueta del campo de fecha */
  label: string;
  /** Fecha a mostrar */
  date: Date;
  /** Si está en estado de advertencia (ej: caducado) */
  isWarning?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card reutilizable para mostrar una fecha.
 * Principio SRP: Solo renderiza información de fecha.
 */
export function DateCard({ label, date, isWarning = false }: DateCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        isWarning ? 'bg-red-50' : 'bg-gray-50'
      }`}
    >
      <Calendar
        className={`w-5 h-5 ${isWarning ? 'text-red-400' : 'text-gray-400'}`}
      />
      <div>
        <p
          className={`text-xs ${isWarning ? 'text-red-500' : 'text-gray-500'}`}
        >
          {label}
        </p>
        <p className={`font-medium ${isWarning ? 'text-red-600' : ''}`}>
          {formatDateShort(date)}
        </p>
      </div>
    </div>
  );
}
