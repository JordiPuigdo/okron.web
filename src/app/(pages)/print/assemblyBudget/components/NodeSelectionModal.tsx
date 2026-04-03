'use client';

import { useCallback, useState } from 'react';
import { AssemblyNode } from 'app/interfaces/Budget';
import { Printer } from 'lucide-react';

import { AssemblyNodeSelector } from '../../../assemblyBudgets/components/AssemblyNodeSelector';

interface NodeSelectionModalProps {
  isVisible: boolean;
  nodes: AssemblyNode[];
  allNodeIds: string[];
  onConfirm: (selectedIds: string[]) => void;
}

export function NodeSelectionModal({
  isVisible,
  nodes,
  allNodeIds,
  onConfirm,
}: NodeSelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(allNodeIds);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Printer className="h-5 w-5 text-blue-600" />
            Selecciona els elements a imprimir
          </h2>
        </div>

        <div className="flex-1 overflow-hidden px-6 py-4">
          <AssemblyNodeSelector
            nodes={nodes}
            allNodeIds={allNodeIds}
            selectAllLabel="Seleccionar tot"
            selectNoneLabel="Deseleccionar tot"
            countLabel={(s, t) => `${s} de ${t} elements seleccionats`}
            onChange={setSelectedIds}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={() => onConfirm(selectedIds)}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="h-4 w-4" />
            Imprimir ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}
