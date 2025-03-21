import { useEffect, useState } from 'react';
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

const columns: Column[] = [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Codi',
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Descripció',
    key: 'description',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Equip',
    key: 'asset.description',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Última execució',
    key: 'lastExecution',
    format: ColumnFormat.DATE,
  },
  {
    label: 'Pròxima execució',
    key: 'nextExecution',
    format: ColumnFormat.DATE,
  },
  {
    label: 'Actiu',
    key: 'active',
    format: ColumnFormat.BOOLEAN,
  },
];

const filters: Filters[] = [
  {
    key: 'code',
    label: 'Codi',
    format: FiltersFormat.TEXT,
  },
  {
    key: 'description',
    label: 'Descripció',
    format: FiltersFormat.TEXT,
  },
];

const PreventiveTable: React.FC<PreventiveTableProps> = ({
  enableFilters,
  enableEdit,
  enableDelete,
  assetId,
}) => {
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
            setPreventives(
              fetchedPreventives.map(x => {
                const days = x.days === 0 ? x.hours! / 24 : x.days;
                let nextExecutionDate = x.lastExecution
                  ? new Date(x.lastExecution)
                  : undefined;
                nextExecutionDate?.setDate(nextExecutionDate.getDate() + days);

                if (!nextExecutionDate) {
                  nextExecutionDate = new Date(x.startExecution);
                }

                return {
                  ...x,
                  nextExecution:
                    nextExecutionDate != undefined ? nextExecutionDate : null,
                };
              })
            );
          });

          if (filters.filter(x => x.key === 'asset.description').length == 0)
            filters.push({
              key: 'asset.description',
              label: 'Equip',
              format: FiltersFormat.TEXT,
            });
        }
      } catch (error) {
        console.error('Error fetching preventives:', error);
      }
    };

    if (preventives.length == 0) fetchPreventives();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const isConfirmed = window.confirm(
        `Esteu segurs que voleu eliminar el preventiu?`
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
      console.error('Error deleting preventive:', error);
    }
  };

  return (
    <DataTable
      data={preventives}
      columns={columns}
      filters={enableFilters ? filters : undefined}
      tableButtons={tableButtons}
      entity={EntityTable.PREVENTIVE}
      onDelete={handleDelete}
    />
  );
};

export default PreventiveTable;
