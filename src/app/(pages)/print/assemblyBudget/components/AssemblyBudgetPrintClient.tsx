'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  AssemblyFolder,
  AssemblyNode,
  Budget,
  BudgetNodeType,
} from 'app/interfaces/Budget';
import { SystemConfiguration } from 'app/interfaces/Config';
import { RotateCcw } from 'lucide-react';

import { AssemblyBudgetPrintBody } from './AssemblyBudgetPrintBody';
import { AssemblyBudgetPrintFooter } from './AssemblyBudgetPrintFooter';
import { AssemblyBudgetPrintHeader } from './AssemblyBudgetPrintHeader';
import { NodeSelectionModal } from './NodeSelectionModal';

interface AssemblyBudgetPrintClientProps {
  budget: Budget;
  config: SystemConfiguration;
}

function collectAllNodeIds(nodes: AssemblyNode[]): string[] {
  const ids: string[] = [];
  const walk = (items: AssemblyNode[]) => {
    for (const node of items) {
      ids.push(node.id);
      if (node.nodeType === BudgetNodeType.Folder) {
        walk((node as AssemblyFolder).children || []);
      }
    }
  };
  walk(nodes);
  return ids;
}

function filterNodes(
  nodes: AssemblyNode[],
  selectedIds: Set<string>
): AssemblyNode[] {
  return nodes
    .filter(node => selectedIds.has(node.id))
    .map(node => {
      if (node.nodeType === BudgetNodeType.Folder) {
        const folder = node as AssemblyFolder;
        return {
          ...folder,
          children: filterNodes(folder.children || [], selectedIds),
        };
      }
      return node;
    });
}

function sumNodeTotals(nodes: AssemblyNode[]): number {
  return nodes.reduce((sum, node) => sum + node.totalAmount, 0);
}

export function AssemblyBudgetPrintClient({
  budget,
  config,
}: AssemblyBudgetPrintClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[] | null>(null);

  const allNodeIds = useMemo(
    () => collectAllNodeIds(budget.assemblyNodes || []),
    [budget.assemblyNodes]
  );

  const filteredData = useMemo(() => {
    if (!selectedNodeIds) return null;

    const selectedSet = new Set(selectedNodeIds);
    const filteredNodes = filterNodes(
      budget.assemblyNodes || [],
      selectedSet
    );
    const filteredSubtotal = sumNodeTotals(filteredNodes);

    const ratio =
      budget.subtotal > 0 ? filteredSubtotal / budget.subtotal : 0;

    const scaledTaxBreakdowns = (budget.taxBreakdowns || []).map(tb => ({
      ...tb,
      taxableBase: tb.taxableBase * ratio,
      taxAmount: tb.taxAmount * ratio,
    }));

    const scaledTotalTax = budget.totalTax * ratio;

    return {
      nodes: filteredNodes,
      subtotal: filteredSubtotal,
      totalTax: scaledTotalTax,
      total: filteredSubtotal + scaledTotalTax,
      taxBreakdowns: scaledTaxBreakdowns,
    };
  }, [budget, selectedNodeIds]);

  const handleConfirmSelection = useCallback(
    (selectedIds: string[]) => {
      setSelectedNodeIds(selectedIds);
      setIsModalOpen(false);
      setTimeout(() => window.print(), 500);
    },
    []
  );

  const handleReselect = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <>
      <NodeSelectionModal
        isVisible={isModalOpen}
        nodes={budget.assemblyNodes || []}
        allNodeIds={allNodeIds}
        onConfirm={handleConfirmSelection}
      />

      {filteredData && !isModalOpen && (
        <div className="relative px-4 w-full flex-grow text-sm flex flex-col bg-white">
          <div className="flex flex-col flex-grow p-4">
            <AssemblyBudgetPrintHeader budget={budget} config={config} />
            <AssemblyBudgetPrintBody nodes={filteredData.nodes} />
            {budget.externalComments && (
              <div className="border border-gray-300 rounded p-3 mt-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Observacions
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {budget.externalComments}
                </p>
              </div>
            )}
            <AssemblyBudgetPrintFooter
              subtotal={filteredData.subtotal}
              totalTax={filteredData.totalTax}
              total={filteredData.total}
              taxBreakdowns={filteredData.taxBreakdowns}
            />
          </div>

          <button
            type="button"
            onClick={handleReselect}
            className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors print:hidden"
          >
            <RotateCcw className="h-4 w-4" />
            Canviar selecció
          </button>
        </div>
      )}
    </>
  );
}
