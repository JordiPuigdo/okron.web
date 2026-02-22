'use client';

import { SvgMachines } from 'app/icons/icons';
import { Preventive } from 'app/interfaces/Preventive';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PreventiveHeaderProps {
  preventive?: Preventive;
  isEditMode?: boolean;
  errorMessage?: string;
  className?: string;
}

export function PreventiveHeader({
  preventive,
  isEditMode = false,
  errorMessage,
  className = '',
}: PreventiveHeaderProps) {
  const router = useRouter();

  const title = isEditMode ? 'Editar Revisió' : 'Nova Revisió';
  const assetInfo = preventive?.asset?.description || '';

  return (
    <div
      className={`
        flex p-4 items-center flex-col sm:flex-row
        bg-white rounded-xl shadow-sm
        border-2 border-okron-primary
        ${className}
      `}
    >
      <button
        type="button"
        className="cursor-pointer mb-4 sm:mb-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => router.back()}
        aria-label="Tornar"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" />
      </button>

      <div className="flex-1 items-center text-center w-full">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <SvgMachines className="w-6 h-6" />
            {title}
            {preventive?.code && ` - ${preventive.code}`}
          </h1>
        </div>
        {assetInfo && (
          <div>
            <span className="text-lg font-medium text-gray-600">
              {assetInfo}
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="text-red-500 text-sm font-medium px-4">{errorMessage}</p>
      )}

      {isEditMode && preventive && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Codi: {preventive.code}</span>
        </div>
      )}
    </div>
  );
}
