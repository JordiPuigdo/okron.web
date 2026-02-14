import {
  AssemblyFolder,
  AssemblyNode,
  BudgetNodeType,
} from 'app/interfaces/Budget';

export interface FlattenedNode {
  id: string;
  node: AssemblyNode;
  parentId: string | undefined;
  depth: number;
  index: number;
  isFolder: boolean;
}

export interface DropPosition {
  targetNodeId: string;
  position: 'before' | 'after' | 'inside';
}

export function flattenNodes(
  nodes: AssemblyNode[],
  parentId?: string,
  depth = 0
): FlattenedNode[] {
  return nodes.reduce<FlattenedNode[]>((acc, node, index) => {
    const flattened: FlattenedNode = {
      id: node.id,
      node,
      parentId,
      depth,
      index,
      isFolder: node.nodeType === BudgetNodeType.Folder,
    };
    acc.push(flattened);

    if (node.nodeType === BudgetNodeType.Folder) {
      const folder = node as AssemblyFolder;
      if (folder.children?.length) {
        acc.push(...flattenNodes(folder.children, node.id, depth + 1));
      }
    }

    return acc;
  }, []);
}

export function findNodeById(
  nodes: AssemblyNode[],
  id: string
): AssemblyNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.nodeType === BudgetNodeType.Folder) {
      const folder = node as AssemblyFolder;
      const found = findNodeById(folder.children || [], id);
      if (found) return found;
    }
  }
  return undefined;
}

export function findParentId(
  nodes: AssemblyNode[],
  targetId: string,
  currentParentId?: string
): string | undefined {
  for (const node of nodes) {
    if (node.id === targetId) return currentParentId;
    if (node.nodeType === BudgetNodeType.Folder) {
      const folder = node as AssemblyFolder;
      const found = findParentId(folder.children || [], targetId, node.id);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

export function isDescendantOf(
  nodes: AssemblyNode[],
  nodeId: string,
  potentialAncestorId: string
): boolean {
  const ancestor = findNodeById(nodes, potentialAncestorId);
  if (!ancestor || ancestor.nodeType !== BudgetNodeType.Folder) return false;
  const folder = ancestor as AssemblyFolder;
  return !!findNodeById(folder.children || [], nodeId);
}

function removeNodeFromTree(
  nodes: AssemblyNode[],
  nodeId: string
): { updatedNodes: AssemblyNode[]; removedNode?: AssemblyNode } {
  let removedNode: AssemblyNode | undefined;

  const updatedNodes = nodes.reduce<AssemblyNode[]>((acc, node) => {
    if (node.id === nodeId) {
      removedNode = node;
      return acc;
    }

    if (node.nodeType === BudgetNodeType.Folder) {
      const folder = node as AssemblyFolder;
      const result = removeNodeFromTree(folder.children || [], nodeId);
      if (result.removedNode) removedNode = result.removedNode;
      acc.push({
        ...folder,
        children: result.updatedNodes,
      } as AssemblyNode);
    } else {
      acc.push(node);
    }

    return acc;
  }, []);

  return { updatedNodes, removedNode };
}

function insertNodeIntoTree(
  nodes: AssemblyNode[],
  targetParentId: string | undefined,
  node: AssemblyNode,
  sortOrder: number
): AssemblyNode[] {
  if (!targetParentId) {
    const result = [...nodes];
    const clampedIndex = Math.min(Math.max(0, sortOrder), result.length);
    result.splice(clampedIndex, 0, { ...node, sortOrder });
    return result.map((n, i) => ({ ...n, sortOrder: i }));
  }

  return nodes.map(n => {
    if (n.id === targetParentId && n.nodeType === BudgetNodeType.Folder) {
      const folder = n as AssemblyFolder;
      const children = [...(folder.children || [])];
      const clampedIndex = Math.min(Math.max(0, sortOrder), children.length);
      children.splice(clampedIndex, 0, { ...node, sortOrder });
      return {
        ...folder,
        children: children.map((c, i) => ({ ...c, sortOrder: i })),
      } as AssemblyNode;
    }

    if (n.nodeType === BudgetNodeType.Folder) {
      const folder = n as AssemblyFolder;
      return {
        ...folder,
        children: insertNodeIntoTree(
          folder.children || [],
          targetParentId,
          node,
          sortOrder
        ),
      } as AssemblyNode;
    }

    return n;
  });
}

export function getSiblingsAndIndex(
  nodes: AssemblyNode[],
  nodeId: string
): { siblings: AssemblyNode[]; index: number } | undefined {
  const idx = nodes.findIndex(n => n.id === nodeId);
  if (idx !== -1) return { siblings: nodes, index: idx };

  for (const node of nodes) {
    if (node.nodeType === BudgetNodeType.Folder) {
      const folder = node as AssemblyFolder;
      const result = getSiblingsAndIndex(folder.children || [], nodeId);
      if (result) return result;
    }
  }
  return undefined;
}

export interface MoveResult {
  newParentNodeId: string | undefined;
  newSortOrder: number;
  optimisticNodes: AssemblyNode[];
}

export function calculateMove(
  nodes: AssemblyNode[],
  draggedId: string,
  dropPosition: DropPosition
): MoveResult | undefined {
  const { targetNodeId, position } = dropPosition;

  if (draggedId === targetNodeId) return undefined;
  if (isDescendantOf(nodes, targetNodeId, draggedId)) return undefined;

  const targetNode = findNodeById(nodes, targetNodeId);
  if (!targetNode) return undefined;

  let newParentNodeId: string | undefined;
  let newSortOrder: number;

  if (position === 'inside') {
    if (targetNode.nodeType !== BudgetNodeType.Folder) return undefined;
    const folder = targetNode as AssemblyFolder;
    newParentNodeId = targetNodeId;
    newSortOrder = folder.children?.length || 0;
  } else {
    newParentNodeId = findParentId(nodes, targetNodeId);
    const container = newParentNodeId
      ? ((findNodeById(nodes, newParentNodeId) as AssemblyFolder)?.children ||
          [])
      : nodes;
    const targetIndex = container.findIndex(n => n.id === targetNodeId);
    newSortOrder =
      position === 'before' ? targetIndex : targetIndex + 1;

    const draggedInSameContainer = container.some(n => n.id === draggedId);
    if (draggedInSameContainer) {
      const draggedIndex = container.findIndex(n => n.id === draggedId);
      if (draggedIndex < newSortOrder) {
        newSortOrder -= 1;
      }
    }
  }

  const { updatedNodes, removedNode } = removeNodeFromTree(nodes, draggedId);
  if (!removedNode) return undefined;

  const optimisticNodes = insertNodeIntoTree(
    updatedNodes,
    newParentNodeId,
    removedNode,
    newSortOrder
  );

  return { newParentNodeId, newSortOrder, optimisticNodes };
}
