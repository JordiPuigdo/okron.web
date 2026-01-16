'use client';

import { useTranslations } from 'app/hooks/useTranslations';
import { SvgPrint } from 'app/icons/designSystem/SvgPrint';
import WorkOrder, { WorkOrderType } from 'app/interfaces/workOrder';
import { useSessionStore } from 'app/stores/globalStore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface WorkOrderHeaderProps {
  workOrder: WorkOrder;
  /** Funció per obtenir el text del header (asset/machine info) */
  getHeaderText: (workOrder: WorkOrder) => string;
  /** Missatge d'error opcional */
  errorMessage?: string;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * WorkOrderHeader - Capçalera de la pàgina d'edició d'ordre de treball.
 *
 * Mostra:
 * - Botó per tornar enrere
 * - Codi i tipus de l'ordre
 * - Informació de l'actiu/màquina
 * - Botó d'imprimir
 *
 * Es manté igual que l'original a petició de l'usuari.
 */
export function WorkOrderHeader({
  workOrder,
  getHeaderText,
  errorMessage,
  className = '',
}: WorkOrderHeaderProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const { config } = useSessionStore();

  const isTicket = workOrder.workOrderType === WorkOrderType.Ticket;
  const title = isTicket ? t('ticket') : t('work.order');

  return (
    <div
      className={`
        flex p-4 items-center flex-col sm:flex-row
        bg-white rounded-xl shadow-sm
        border-2 border-okron-primary
        ${className}
      `}
    >
      {/* Back Button */}
      <button
        type="button"
        className="cursor-pointer mb-4 sm:mb-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => router.back()}
        aria-label={t('back') || 'Tornar'}
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" />
      </button>

      {/* Title & Info */}
      <div className="flex-1 items-center text-center w-full">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {title} - {workOrder.code}
          </h1>
        </div>
        <div>
          <span className="text-lg font-medium text-gray-600">
            {getHeaderText(workOrder)}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-500 text-sm font-medium px-4">{errorMessage}</p>
      )}

      {/* Print Button */}
      <Link
        href={`/print/workorder?id=${workOrder.id}&urlLogo=${config?.company.urlLogo}`}
        target="_blank"
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={t('print') || 'Imprimir'}
      >
        <SvgPrint className="w-6 h-6 text-gray-700 hover:text-okron-primary transition-colors" />
      </Link>
    </div>
  );
}
