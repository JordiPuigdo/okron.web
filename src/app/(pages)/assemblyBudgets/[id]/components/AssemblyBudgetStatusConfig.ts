import {
  AssemblyFolder,
  AssemblyNode,
  BudgetNodeType,
  BudgetStatus,
} from 'app/interfaces/Budget';

export const STATUS_CONFIG: Record<
  BudgetStatus,
  { label: string; className: string }
> = {
  [BudgetStatus.Draft]: {
    label: 'Esborrany',
    className: 'bg-gray-100 text-gray-700',
  },
  [BudgetStatus.Sent]: {
    label: 'Enviat',
    className: 'bg-blue-100 text-blue-700',
  },
  [BudgetStatus.Accepted]: {
    label: 'Acceptat',
    className: 'bg-green-100 text-green-700',
  },
  [BudgetStatus.Rejected]: {
    label: 'Rebutjat',
    className: 'bg-red-100 text-red-700',
  },
  [BudgetStatus.Expired]: {
    label: 'Caducat',
    className: 'bg-orange-100 text-orange-700',
  },
  [BudgetStatus.Cancelled]: {
    label: 'Cancel·lat',
    className: 'bg-gray-100 text-gray-500',
  },
  [BudgetStatus.Converted]: {
    label: 'Convertit',
    className: 'bg-purple-100 text-purple-700',
  },
};

export interface NodeStats {
  folders: number;
  articles: number;
}

export function countNodes(nodes?: AssemblyNode[]): NodeStats {
  if (!nodes) return { folders: 0, articles: 0 };

  let folders = 0;
  let articles = 0;

  const walk = (list: AssemblyNode[]) => {
    for (const node of list) {
      if (node.nodeType === BudgetNodeType.Folder) {
        folders++;
        walk((node as AssemblyFolder).children ?? []);
      } else {
        articles++;
      }
    }
  };

  walk(nodes);
  return { folders, articles };
}
