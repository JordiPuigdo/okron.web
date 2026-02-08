'use client';

import { useFamilies } from 'app/hooks/useFamilies';
import { useTranslations } from 'app/hooks/useTranslations';
import { Family } from 'app/interfaces/Family';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

const getColumnsFamily = (t: (key: string) => string): Column[] => [
  {
    label: t('common.id'),
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('name'),
    key: 'name',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('code.prefix'),
    key: 'codePrefix',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('code.pattern'),
    key: 'codePattern',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('parent.family'),
    key: 'parentFamilyId',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('active'),
    key: 'active',
    format: ColumnFormat.BOOLEAN,
  },
];

export const tableButtons = {
  edit: true,
  detail: true,
};

const getFilterFamily = (t: (key: string) => string): Filters[] => [
  {
    label: t('name'),
    key: 'name',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('code.prefix'),
    key: 'codePrefix',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('code.pattern'),
    key: 'codePattern',
    format: FiltersFormat.TEXT,
  },
];

interface FamilyTableProps {
  onEdit?: (family: Family) => void;
}

export const FamilyTable = ({ onEdit }: FamilyTableProps) => {
  const { t } = useTranslations();
  const { families, loading, error } = useFamilies();

  if (loading) return <div>{t('loading.families')}</div>;
  if (error) return <div className="text-red-500">{t('error')}: {error}</div>;

  return (
    <div className="w-full">
      <DataTable
        data={families}
        columns={getColumnsFamily(t)}
        entity={EntityTable.FAMILY}
        tableButtons={tableButtons}
        hideShadow={false}
        filters={getFilterFamily(t)}
        onEdit={onEdit}
      />
    </div>
  );
};
