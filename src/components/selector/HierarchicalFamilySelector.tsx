'use client';

import { useEffect, useState } from 'react';
import { useFamilies } from 'app/hooks/useFamilies';
import { useTranslations } from 'app/hooks/useTranslations';
import { Family } from 'app/interfaces/Family';
import { ChevronRight, Folder, FolderOpen } from 'lucide-react';

interface HierarchicalFamilySelectorProps {
  selectedFamilyId: string | null;
  onSelect: (familyId: string) => void;
  className?: string;
}

interface FamilyNode extends Family {
  children: FamilyNode[];
  level: number;
  fullPath: string[];
}

export function HierarchicalFamilySelector({
  selectedFamilyId,
  onSelect,
  className = '',
}: HierarchicalFamilySelectorProps) {
  const { t } = useTranslations();
  const { families } = useFamilies();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [familyTree, setFamilyTree] = useState<FamilyNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  useEffect(() => {
    const buildTree = (
      parentId: string | undefined | null = null,
      level: number = 0,
      path: string[] = []
    ): FamilyNode[] => {
      return families
        .filter(f => {
          const familyParentId = f.parentFamilyId ?? null;
          const compareParentId = parentId ?? null;
          return familyParentId === compareParentId;
        })
        .map(family => {
          const currentPath = [...path, family.id];
          return {
            ...family,
            children: buildTree(family.id, level + 1, currentPath),
            level,
            fullPath: currentPath,
          };
        });
    };

    setFamilyTree(buildTree());
  }, [families]);

  useEffect(() => {
    if (selectedFamilyId) {
      const findPath = (
        nodes: FamilyNode[],
        targetId: string
      ): string[] | null => {
        for (const node of nodes) {
          if (node.id === targetId) {
            return node.fullPath;
          }
          const childPath = findPath(node.children, targetId);
          if (childPath) return childPath;
        }
        return null;
      };

      const path = findPath(familyTree, selectedFamilyId);
      if (path) {
        setSelectedPath(path);
        path.forEach(id => {
          setExpandedNodes(prev => new Set([...prev, id]));
        });
      }
    }
  }, [selectedFamilyId, familyTree]);

  const toggleExpand = (familyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(familyId)) {
        newSet.delete(familyId);
      } else {
        newSet.add(familyId);
      }
      return newSet;
    });
  };

  const handleSelect = (family: FamilyNode) => {
    onSelect(family.id);
    setSelectedPath(family.fullPath);
  };

  const renderFamilyNode = (node: FamilyNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedFamilyId === node.id;
    const hasChildren = node.children.length > 0;
    const isInPath = selectedPath.includes(node.id);

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg transition-colors ${
            isSelected
              ? 'bg-blue-100 text-blue-900 font-semibold'
              : isInPath
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${node.level * 1.5 + 0.75}rem` }}
          onClick={() => handleSelect(node)}
        >
          {hasChildren && (
            <button
              onClick={e => toggleExpand(node.id, e)}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-600" />
          ) : (
            <Folder className="h-4 w-4 text-gray-600" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">{node.name}</span>
              <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">
                {node.codePrefix}
              </span>
            </div>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>{node.children.map(child => renderFamilyNode(child))}</div>
        )}
      </div>
    );
  };

  const getFullFamilyPath = (): string => {
    if (!selectedFamilyId || selectedPath.length === 0) return '';

    const pathNames: string[] = [];
    let currentPath = '';

    selectedPath.forEach(id => {
      const findFamily = (nodes: FamilyNode[]): FamilyNode | null => {
        for (const node of nodes) {
          if (node.id === id) return node;
          const found = findFamily(node.children);
          if (found) return found;
        }
        return null;
      };

      const family = findFamily(familyTree);
      if (family) {
        pathNames.push(family.name);
        currentPath += family.codePrefix;
      }
    });

    return `${pathNames.join(' → ')} (${currentPath})`;
  };

  return (
    <div className={className}>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="max-h-64 overflow-y-auto p-2 bg-white">
          {familyTree.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('no.families.available')}
            </div>
          ) : (
            familyTree.map(node => renderFamilyNode(node))
          )}
        </div>

        {selectedFamilyId && (
          <div className="border-t bg-blue-50 px-3 py-2">
            <div className="text-xs text-gray-600">{t('selected.path')}:</div>
            <div className="text-sm font-medium text-blue-900 mt-1">
              {getFullFamilyPath()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
