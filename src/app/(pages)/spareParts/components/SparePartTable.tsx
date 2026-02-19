'use client';
import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { usePermissions } from 'app/hooks/usePermissions';
import { SvgCreate, SvgMachines, SvgSpinner } from 'app/icons/icons';
import SparePart, {
  SparePartDetailRequest,
  SparePartPerAssetResponse,
} from 'app/interfaces/SparePart';
import SparePartService from 'app/services/sparePartService';
import { useSessionStore } from 'app/stores/globalStore';
import { formatDateQuery } from 'app/utils/utils';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  ColumnnAlign,
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';
import ca from 'date-fns/locale/ca';
import { Button } from 'designSystem/Button/Buttons';

import { useTranslations } from '../../../hooks/useTranslations';

interface SparePartTableProps {
  enableFilterAssets?: boolean;
  enableFilters: boolean;
  enableDetail?: boolean;
  enableEdit?: boolean;
  assetId?: string | '';
  enableCreate?: boolean;
  sparePartId?: string;
  withoutStock?: boolean;
  enableFilterActive?: boolean;
  timer?: number;
}

const getColumns = (t: any): Column[] => [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spareParts.code'),
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spareParts.description'),
    key: 'description',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spareParts.family'),
    key: 'family',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spareParts.location'),
    key: 'ubication',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spareParts.providerRef'),
    key: 'refProviders',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spareParts.min'),
    key: 'minium',
    format: ColumnFormat.NUMBER,
    align: ColumnnAlign.RIGHT,
  },
  {
    label: t('spareParts.max'),
    key: 'maximum',
    format: ColumnFormat.NUMBER,
    align: ColumnnAlign.RIGHT,
  },
  {
    label: t('spareParts.stock'),
    key: 'stock',
    format: ColumnFormat.NUMBER,
    align: ColumnnAlign.RIGHT,
  },
  {
    label: t('price'),
    key: 'price',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
  {
    label: t('pending'),
    key: 'pendingQuantity',
    format: ColumnFormat.NUMBER,
    align: ColumnnAlign.RIGHT,
    className:
      'font-semibold bg-yellow-200 p-2 rounded-xl text-xl  text-center',
  },
  {
    key: 'lastMovementConsume',
    label: t('spareParts.lastConsumption'),
    format: ColumnFormat.DATETIME,
  },
  {
    label: t('active'),
    key: 'active',
    format: ColumnFormat.BOOLEAN,
  },
];

const getColumnsPerAsset = (t: any): Column[] => [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('work.order.code'),
    key: 'workOrderCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spareParts.consumptionDate'),
    key: 'dateConsume',
    format: ColumnFormat.DATE,
  },
  {
    label: t('work.order.description'),
    key: 'workOrderDescription',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('operator'),
    key: 'operatorName',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spare.part.code'),
    key: 'sparePartCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spare.part.description'),
    key: 'sparePartDescription',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('quantity'),
    key: 'sparePartQuantity',
    format: ColumnFormat.NUMBER,
  },
];

const getFiltersPerAsset = (t: any): Filters[] => [
  {
    key: 'sparePartCode',
    label: t('spare.part.code'),
    format: FiltersFormat.TEXT,
  },
  {
    key: 'sparePartDescription',
    label: t('spare.part.description'),
    format: FiltersFormat.TEXT,
  },
];

const getFilters = (t: any): Filters[] => [
  {
    key: 'code',
    label: t('spareParts.code'),
    format: FiltersFormat.TEXT,
  },
  {
    key: 'description',
    label: t('spareParts.description'),
    format: FiltersFormat.TEXT,
  },
  {
    key: 'family',
    label: t('spareParts.family'),
    format: FiltersFormat.TEXT,
  },
  {
    key: 'ubication',
    label: t('spareParts.location'),
    format: FiltersFormat.TEXT,
  },
  {
    key: 'refProviders',
    label: t('spareParts.providerRef'),
    format: FiltersFormat.TEXT,
  },
];

const SparePartTable: React.FC<SparePartTableProps> = ({
  enableFilterAssets = false,
  enableFilters = false,
  enableDetail = false,
  enableEdit,
  assetId,
  enableCreate = true,
  sparePartId,
  withoutStock = false,
  enableFilterActive = true,
  timer = 0,
}) => {
  const { t } = useTranslations();
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [sparePartsPerAsset, setSparePartsPerAsset] = useState<
    SparePartPerAssetResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const sparePartService = new SparePartService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const { loginUser, setFilterSpareParts } = useSessionStore(state => state);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const { isCRM } = usePermissions();

  const columns = getColumns(t);
  const columnsPerAsset = getColumnsPerAsset(t);
  const filtersPerAsset = getFiltersPerAsset(t);
  const filters = getFilters(t);

  const tableButtons: TableButtons = {
    edit: enableEdit,
    detail: enableDetail,
  };

  useEffect(() => {
    async function fetchSpareParts() {
      try {
        const data = await sparePartService.getSpareParts(withoutStock);

        if (isCRM) {
          if (!columns.find(x => x.key === 'rrp')) {
            columns.push(
              {
                key: 'rrp',
                label: t('price'),
                format: ColumnFormat.PRICE,
                align: ColumnnAlign.RIGHT,
              },
              {
                label: t('pending'),
                key: 'pendingQuantity',
                format: ColumnFormat.NUMBER,
                align: ColumnnAlign.RIGHT,
                className:
                  'font-semibold bg-yellow-200 p-2 rounded-xl text-xl  text-center',
              },
              {
                key: 'lastMovementConsume',
                label: t('spareParts.lastConsumption'),
                format: ColumnFormat.DATETIME,
              },
              {
                label: t('active'),
                key: 'active',
                format: ColumnFormat.BOOLEAN,
              }
            );
          }
        }
        if (timer > 0) {
          setSpareParts(data.filter(sparePart => sparePart.active == true));
          return;
        }
        setSpareParts(data);
      } catch (error) {
        console.error('Error fetching operators:', error);
      } finally {
        setLoading(false);
      }
    }

    if (assetId == undefined && sparePartId == undefined) {
      fetchSpareParts();
      if (timer > 0) {
        const interval = setInterval(fetchSpareParts, timer);

        return () => clearInterval(interval);
      }
    }
  }, []);

  const handleSparePartActiveChange = async (id: string) => {
    const isConfirmed = window.confirm(t('spareParts.confirmDelete'));
    if (isConfirmed) {
      await sparePartService.deleteSparePart(id).then(data => {
        setSpareParts(spareParts.filter(sparePart => sparePart.id !== id));
      });
    }
  };

  async function filterSpareParts() {
    /*setFilterSpareParts({
      startDateTime: startDate!,
      endDateTime: endDate!,
      code: code,
      description: description,
      family: family,
      refSupplier: refSupplier,
      ubication: ubication,
    });*/

    const x: SparePartDetailRequest = {
      assetId: assetId,
      id: sparePartId,
      startDate: formatDateQuery(startDate!, true),
      endDate: formatDateQuery(endDate!, false),
    };

    await sparePartService
      .getSparePartHistoryByDates(x)
      .then(response => {
        if (response.length == 0) {
          setMessage(t('spareParts.noResultsFilter'));
          setSparePartsPerAsset([]);

          setTimeout(() => {
            setMessage('');
          }, 3000);
        } else {
          setSparePartsPerAsset(response);
        }
      })
      .catch(error => {
        setMessage(error);
        setTimeout(() => {
          setMessage('');
        });
      });
    setIsLoading(false);
  }

  function handleSearch(): void {
    setIsLoading(true);
    filterSpareParts();
  }

  const renderFilter = () => {
    return (
      <div className="bg-white p-2 my-4 rounded-xl gap-4 shadow-md">
        <div className="flex gap-4 p-2 my-4 items-center">
          <div className="flex items-center">
            <label htmlFor="startDate" className="mr-2">
              {t('start')}
            </label>
            <DatePicker
              id="startDate"
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="border border-gray-300 p-2 rounded-md mr-4"
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="endDate" className="mr-2">
              {t('spareParts.endDate')}
            </label>
            <DatePicker
              id="endDate"
              selected={endDate}
              onChange={(date: Date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="border border-gray-300 p-2 rounded-md mr-4"
            />
          </div>
          <button
            type="button"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center"
            onClick={e => handleSearch()}
          >
            {t('search')}
            {isLoading && <SvgSpinner style={{ marginLeft: '0.5rem' }} />}
          </button>
          {message != '' && (
            <span className="text-red-500 ml-4">{message}</span>
          )}
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2  justify-between">
          <h2 className="text-2xl font-bold text-black flex gap-2 flex-grow">
            <SvgMachines />
            {t('sidebar.spareParts')}
          </h2>
          <span className="text-l self-start">{t('spareParts.listTitle')}</span>
        </div>
        <div className="w-full flex flex-col justify-end items-end gap-2 ">
          <Button
            type="create"
            customStyles="gap-2 flex"
            href="/spareParts/sparePartForm"
          >
            <SvgCreate />
            {t('spareParts.createSparePart')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {enableCreate && (
        <>
          {loading ? (
            <p>{t('loading')}</p>
          ) : (
            <>
              {loginUser != undefined && loginUser?.permission > 0 && (
                <>{renderHeader()}</>
              )}
            </>
          )}
        </>
      )}
      {assetId !== undefined || sparePartId !== undefined ? (
        <>
          {renderFilter()}
          <DataTable
            columns={columnsPerAsset}
            data={sparePartsPerAsset}
            tableButtons={tableButtons}
            entity={EntityTable.WORKORDER}
            filters={enableFilters ? filtersPerAsset : undefined}
            onDelete={handleSparePartActiveChange}
            enableFilterActive={enableFilterActive}
            totalCounts={true}
          />
        </>
      ) : (
        <DataTable
          columns={columns}
          data={spareParts}
          tableButtons={tableButtons}
          entity={EntityTable.SPAREPART}
          filters={enableFilters ? filters : undefined}
          onDelete={handleSparePartActiveChange}
          enableFilterActive={enableFilterActive}
        />
      )}
    </>
  );
};

export default SparePartTable;
