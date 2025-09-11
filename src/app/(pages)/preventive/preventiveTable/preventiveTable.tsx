'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { Preventive } from 'app/interfaces/Preventive';
import PreventiveService from 'app/services/preventiveService';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

interface PreventiveTableProps {
  enableFilters: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  assetId?: string;
}

const getColumns = (t: any): Column[] => [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('code'),
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('description'),
    key: 'description',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('equipment'),
    key: 'asset.description',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('last.execution'),
    key: 'lastExecution',
    format: ColumnFormat.DATE,
  },
  {
    label: t('next.execution'),
    key: 'nextExecutionDate',
    format: ColumnFormat.DATE,
  },
  {
    label: t('days'),
    key: 'days',
    format: ColumnFormat.NUMBER,
  },
  {
    label: t('active'),
    key: 'active',
    format: ColumnFormat.BOOLEAN,
  },
];

const getFilters = (t: any): Filters[] => [
  {
    key: 'code',
    label: t('code'),
    format: FiltersFormat.TEXT,
  },
  {
    key: 'description',
    label: t('description'),
    format: FiltersFormat.TEXT,
  },
];

const PreventiveTable: React.FC<PreventiveTableProps> = ({
  enableFilters,
  enableEdit,
  enableDelete,
  assetId,
}) => {
  const { t } = useTranslations();
  const preventiveService = new PreventiveService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const [preventives, setPreventives] = useState<Preventive[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const tableButtons: TableButtons = {
    edit: enableEdit,
    delete: enableDelete,
  };

  useEffect(() => {
    const fetchPreventives = async () => {
      try {
        if (assetId !== undefined) {
          const fetchedPreventives =
            await preventiveService.getPreventiveByAssetId(assetId!);
          setPreventives(fetchedPreventives);
        } else {
          await preventiveService.getPreventives().then(fetchedPreventives => {
            setPreventives(fetchedPreventives);
          });

        }
      } catch (error) {
        console.error(t('error.fetching.preventives'), error);
      }
    };

    if (preventives.length == 0) fetchPreventives();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const isConfirmed = window.confirm(
        t('confirm.delete.preventive')
      );
      if (!isConfirmed) {
        setIsLoading(false);
        return;
      }

      await preventiveService.deletePreventive(id);

      setPreventives(prevPreventives =>
        prevPreventives.filter(preventive => preventive.id !== id)
      );
      setIsLoading(false);
    } catch (error) {
      console.error(t('error.deleting.preventive'), error);
    }
  };

  return (
    <DataTable
      data={preventives}
      columns={getColumns(t)}
      filters={enableFilters ? getFilters(t) : undefined}
      tableButtons={tableButtons}
      entity={EntityTable.PREVENTIVE}
      onDelete={handleDelete}
    />
  );
};

export default PreventiveTable;
