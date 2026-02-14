import {
  AssemblyArticle,
  AssemblyFolder,
  AssemblyNode,
  Budget,
  BudgetNodeType,
} from 'app/interfaces/Budget';

function findFolderById(
  nodes: AssemblyNode[],
  id: string
): AssemblyFolder | null {
  for (const node of nodes) {
    if (node.id === id && node.nodeType === BudgetNodeType.Folder) {
      return node as AssemblyFolder;
    }
    if (node.nodeType === BudgetNodeType.Folder) {
      const found = findFolderById(
        (node as AssemblyFolder).children || [],
        id
      );
      if (found) return found;
    }
  }
  return null;
}

function recalculateNodes(
  nodes: AssemblyNode[],
  parentPrefix: string
): AssemblyNode[] {
  return nodes.map((node, index) => {
    const code = parentPrefix
      ? `${parentPrefix}.${index + 1}`
      : String(index + 1);

    if (node.nodeType === BudgetNodeType.Folder) {
      const folder = node as AssemblyFolder;
      return {
        ...folder,
        code,
        children: recalculateNodes(folder.children || [], code),
      };
    }

    return { ...(node as AssemblyArticle), code };
  });
}

export function recalculateNodeCodes(budget: Budget): Budget {
  if (!budget.assemblyNodes) return budget;

  return {
    ...budget,
    assemblyNodes: recalculateNodes(budget.assemblyNodes, ''),
  };
}

export function generateNextCode(
  nodes: AssemblyNode[] | undefined,
  parentNodeId?: string
): string {
  const rootNodes = nodes || [];

  if (!parentNodeId) {
    return String(rootNodes.length + 1);
  }

  const parent = findFolderById(rootNodes, parentNodeId);
  if (!parent) return '1';

  const siblings = parent.children || [];
  return `${parent.code}.${siblings.length + 1}`;
}
