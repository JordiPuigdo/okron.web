import { useEffect, useMemo, useState } from 'react';
import { useWareHouses } from 'app/hooks/useWareHouses';
import { StockMovement } from 'app/interfaces/StockMovement';
import { DateFilter, DateFilters } from 'components/Filters/DateFilter';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

interface WareHouseStockMovementsProps {
  wareHouseId: string;
}
export default function WareHouseStockMovements({
  wareHouseId,
}: WareHouseStockMovementsProps) {
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: null,
    endDate: null,
  });
  const { getStockMovementsByWarehouseAndDate } = useWareHouses(false);

  const [firstLoad, setFirstLoad] = useState(true);
  const [showNoResults, setShowNoResults] = useState(false);

  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  const fetchStockMovements = async (startDate: Date, endDate: Date) => {
    try {
      const response = await getStockMovementsByWarehouseAndDate({
        from: startDate,
        to: endDate,
        wareHouseId: wareHouseId,
      });
      if (!response || response.length === 0) {
        setShowNoResults(true);
        setTimeout(() => {
          setShowNoResults(false);
        }, 3000);
      }
      setStockMovements(response);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      fetchStockMovements(new Date(), new Date());
    }
  }, [firstLoad]);

  useEffect(() => {
    if (!firstLoad) {
      if (dateFilters.startDate == null && dateFilters.endDate != null) {
        setDateFilters({
          startDate: new Date(),
          endDate: dateFilters.endDate,
        });
      } else if (dateFilters.startDate != null && dateFilters.endDate == null) {
        setDateFilters({
          startDate: dateFilters.startDate,
          endDate: new Date(),
        });
      }
      if (dateFilters.startDate && dateFilters.endDate)
        fetchStockMovements(dateFilters.startDate, dateFilters.endDate);
    }
  }, [dateFilters]);

  const [search, setSearch] = useState('');

  const filteredStockMovements = useMemo(() => {
    return stockMovements.filter(
      movement =>
        movement.sparePartCode.toLowerCase().includes(search.toLowerCase()) ||
        movement.providerInfo.toLowerCase().includes(search.toLowerCase())
    );
  }, [stockMovements, search]);

  return (
    <div className="flex flex-col bg-white rounded-xl gap-4 p-4 shadow-md flex-1 overflow-y-auto">
      <span className="text-lg font-semibold">Moviments Stock</span>
      <div className="flex flex-row items-center">
        <DateFilter dateFilters={dateFilters} setDateFilters={setDateFilters} />
        <input
          type="text"
          placeholder="Buscar"
          className="rounded"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {showNoResults && (
          <div className="text-red-500">
            No hi ha resultats amb aquests filtres
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        <DataTable
          data={filteredStockMovements}
          columns={ColumnsStockMovements}
          entity={EntityTable.ORDER}
          tableButtons={tableButtons}
          enableFilterActive={false}
          hideShadow={true}
          hideExport={true}
        />
      </div>
    </div>
  );
}

const tableButtons: TableButtons = {
  edit: true,
};

const ColumnsStockMovements: Column[] = [
  {
    key: 'relatedDocumentId',
    label: 'ID',
    format: ColumnFormat.TEXT,
  },
  {
    key: 'sparePartCode',
    label: 'Recanvi',
    format: ColumnFormat.TEXT,
  },
  {
    key: 'creationDate',
    label: 'Data',
    format: ColumnFormat.DATETIME,
  },
  {
    key: 'quantity',
    label: 'Quantitat',
    format: ColumnFormat.TEXT,
  },
  {
    key: 'relatedDocumentCode',
    label: 'Operació',
    format: ColumnFormat.TEXT,
  },
  {
    key: 'stockMovementType',
    label: 'Tipus',
    format: ColumnFormat.STOCKMOVEMENTTYPE,
  },
];
