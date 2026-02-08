import { Family } from 'app/interfaces/Family';

export const buildFamilyPath = (
  families: Family[],
  familyId: string
): string[] => {
  const path: string[] = [];
  let currentId: string | undefined = familyId;

  while (currentId) {
    const family = families.find(f => f.id === currentId);
    if (!family) break;

    path.unshift(family.id);
    currentId = family.parentFamilyId ?? undefined;
  }

  return path;
};

export const buildFullFamilyCode = (
  families: Family[],
  familyId: string
): string => {
  const path = buildFamilyPath(families, familyId);
  return path
    .map(id => families.find(f => f.id === id)?.codePrefix || '')
    .join('');
};

export const getFamilyHierarchyNames = (
  families: Family[],
  familyId: string
): string[] => {
  const path = buildFamilyPath(families, familyId);
  return path.map(id => families.find(f => f.id === id)?.name || '');
};

export const getFamilyHierarchyDisplay = (
  families: Family[],
  familyId: string
): string => {
  const names = getFamilyHierarchyNames(families, familyId);
  const code = buildFullFamilyCode(families, familyId);
  return `${names.join(' → ')} (${code})`;
};

export const getSubfamilies = (
  families: Family[],
  parentId: string | undefined
): Family[] => {
  return families.filter(f => f.parentFamilyId === parentId);
};

export const hasSubfamilies = (
  families: Family[],
  familyId: string
): boolean => {
  return families.some(f => f.parentFamilyId === familyId);
};
