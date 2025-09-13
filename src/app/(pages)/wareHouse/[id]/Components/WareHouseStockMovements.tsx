import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
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
  const { t } = useTranslations();
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
      if (!response || (response.length === 0 && !firstLoad)) {
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
      fetchStockMovements(new Date(), new Date());
      setFirstLoad(false);
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
  const [active, setActive] = useState(true);

  const filteredStockMovements = useMemo(() => {
    return stockMovements.filter(
      movement =>
        (movement.sparePartCode.toLowerCase().includes(search.toLowerCase()) ||
          movement.providerInfo.toLowerCase().includes(search.toLowerCase())) &&
        movement.active == active
    );
  }, [stockMovements, search, active]);

  return (
    <div className="flex flex-col bg-white rounded-xl gap-4 p-4 shadow-md flex-1 overflow-y-auto">
      <span className="text-lg font-semibold">{t('warehouse.stock.movements')}</span>
      <div className="flex flex-row items-center">
        <DateFilter dateFilters={dateFilters} setDateFilters={setDateFilters} />
        <input
          type="text"
          placeholder={t('common.search')}
          className="rounded"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div
          className="ml-2 flex flex-row gap-2 items-center hover:cursor-pointer"
          onClick={() => setActive(!active)}
        >
          <label className="hover:cursor-pointer">{t('common.active')}</label>
          <input
            id="actives"
            placeholder={t('active')}
            type="checkbox"
            checked={active}
          />
        </div>
        {showNoResults && !firstLoad && (
          <div className="text-red-500">
            {t('common.no.results.with.filters')}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        <DataTable
          data={filteredStockMovements}
          columns={getColumnsStockMovements(t)}
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

const getColumnsStockMovements = (t: any): Column[] => [
  {
    key: 'relatedDocumentId',
    label: t('common.id'),
    format: ColumnFormat.TEXT,
  },
  {
    key: 'sparePartCode',
    label: t('spareparts.spare.part'),
    format: ColumnFormat.TEXT,
  },
  {
    key: 'creationDate',
    label: t('common.date'),
    format: ColumnFormat.DATETIME,
  },
  {
    key: 'quantity',
    label: t('common.quantity'),
    format: ColumnFormat.TEXT,
  },
  {
    key: 'relatedDocumentCode',
    label: t('warehouse.operation'),
    format: ColumnFormat.TEXT,
  },
  {
    key: 'stockMovementType',
    label: t('warehouse.type'),
    format: ColumnFormat.STOCKMOVEMENTTYPE,
  },
];
