'use client';

import { formatCurrency } from './utils';

// ============================================================================
// TYPES
// ============================================================================

interface TotalsSummaryProps {
  /** Etiqueta del total (ej: "Total pressupost", "Total albarà") */
  label: string;
  /** Valor total */
  total: number;
  /** Valor subtotal */
  subtotal: number;
  /** Valor de impuestos */
  totalTax: number;
  /** Contenido adicional (badges, indicadores) */
  extraContent?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Componente reutilizable para mostrar resumen de totales.
 * Principio SRP: Solo renderiza totales financieros.
 * Principio OCP: Extensible via extraContent prop.
 */
export function TotalsSummary({
  label,
  total,
  subtotal,
  totalTax,
  extraContent,
}: TotalsSummaryProps) {
  return (
    <div className="bg-gradient-to-r from-[#6E41B6] to-[#8B5CF6] text-white px-6 py-6">
      <div className="text-center">
        <p className="text-purple-200 text-sm mb-1">{label}</p>
        <p className="text-4xl font-bold">{formatCurrency(total)}</p>
      </div>

      <div className="flex justify-center gap-8 mt-4 text-sm">
        <div className="text-center">
          <p className="text-purple-200">Subtotal</p>
          <p className="font-semibold">{formatCurrency(subtotal)}</p>
        </div>
        <div className="text-center">
          <p className="text-purple-200">Impostos</p>
          <p className="font-semibold">{formatCurrency(totalTax)}</p>
        </div>
      </div>

      {extraContent && <div className="mt-4 text-center">{extraContent}</div>}
    </div>
  );
}
