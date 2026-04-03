'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Tooltip } from 'react-tooltip';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { Asset, AssetType } from 'app/interfaces/Asset';
import { assetService } from 'app/services/assetService';
import useRoutes from 'app/utils/useRoutes';
import { ElementList } from 'components/selector/ElementList';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import QRButton from './QRButton';

export interface AssetFormData {
  code: string;
  description: string;
  createWorkOrder: boolean;
  active: boolean;
  brand: string;
  assetType: AssetType;
}

interface AssetFormProps {
  id: string;
  loading: boolean;
  assetData?: Asset;
  onSubmit: (data: AssetFormData) => Promise<void>;
  onChange: (header: string, value: string) => Promise<void>;
  parentId?: string;
  level?: number;
  onReload?: () => void;
}

const ASSET_TYPE_KEYS: Record<AssetType, string> = {
  [AssetType.Default]: 'asset.type.default',
  [AssetType.Factory]: 'asset.type.factory',
  [AssetType.Area]: 'asset.type.area',
  [AssetType.Line]: 'asset.type.line',
  [AssetType.Machine]: 'asset.type.machine',
  [AssetType.Component]: 'asset.type.component',
  [AssetType.Vehicle]: 'asset.type.vehicle',
  [AssetType.System]: 'asset.type.system',
};

const AssetForm: React.FC<AssetFormProps> = ({
  id,
  loading,
  assetData,
  onSubmit,
  onChange,
  parentId,
  level,
  onReload,
}) => {
  const { t } = useTranslations();
  const { register, handleSubmit, setValue } = useForm<AssetFormData>();
  const router = useRouter();
  const ROUTES = useRoutes();

  useEffect(() => {
    if (assetData) {
      setValue('code', assetData.code);
      setValue('description', assetData.description);
      setValue('createWorkOrder', assetData.createWorkOrder ?? false);
      setValue('active', assetData.active ?? true);
      setValue('brand', assetData.brand ?? '');
      setValue('assetType', assetData.assetType ?? AssetType.Default);
    }
  }, [assetData]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col h-full"
    >
      <div className="flex flex-row w-full">
        <div className="flex flex-col w-full p-2">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t('code')}:</label>
            <input
              type="text"
              {...register('code', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              onChange={e => onChange('code', e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              {t('description')}:
            </label>
            <input
              type="text"
              {...register('description', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              onChange={e => onChange('description', e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t('brand')}:</label>
            <input
              type="text"
              {...register('brand')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              {t('asset.type')}:
            </label>
            <select
              {...register('assetType', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
            >
              {Object.entries(ASSET_TYPE_KEYS).map(([value, key]) => (
                <option key={value} value={Number(value)}>
                  {t(key)}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              {...register('createWorkOrder')}
              defaultChecked={assetData?.createWorkOrder ?? false}
              className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
            <label className="text-gray-700">{t('create.work.order')}</label>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              {...register('active')}
              defaultChecked={assetData?.active ?? true}
              className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
            <label className="text-gray-700">{t('active')}</label>
          </div>

          <div className="flex mt-auto gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              {loading ? <SvgSpinner /> : id !== '0' ? t('update') : t('add')}
            </button>
            {id === '0' && (
              <button
                type="button"
                disabled={loading}
                className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
                onClick={() => router.back()}
              >
                {loading ? <SvgSpinner /> : t('cancel')}
              </button>
            )}
            {id !== '0' && (
              <Link
                href={ROUTES.preventive.preventiveForm + '?assetId=' + id}
                className="flex items-center justify-center bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-900 transition duration-300 ease-in-out"
              >
                {t('create.revision')}
              </Link>
            )}
            {id !== '0' && (
              <QRButton
                data-tooltip-id="QR"
                data-tooltip-content={t('generate.qr')}
                assetId={id}
              />
            )}
            <Tooltip id="QR" />
          </div>
        </div>
        {id !== '0' && (
          <div className="w-full p-2">
            {t('parent.equipment')}
            <div>
              <ParentAsset currentId={id} onReload={() => onReload?.()} />
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default AssetForm;

interface ParentAssetProps {
  currentId: string;
  onReload?: () => void;
}

const ParentAsset: React.FC<ParentAssetProps> = ({ currentId, onReload }) => {
  const { t } = useTranslations();
  const [assets, setAssets] = useState<ElementList[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<ElementList[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllAssets = async () => {
    try {
      const all = await assetService.getAll();
      const elements: ElementList[] = [];

      const addAssetAndChildren = (asset: { id: string; description: string; childs?: typeof asset[] }) => {
        elements.push({ id: asset.id, description: asset.description });
        asset.childs?.forEach(addAssetAndChildren);
      };

      all.forEach(addAssetAndChildren);
      setAssets(elements);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleConfirmSelection = async () => {
    setIsLoading(true);
    try {
      await assetService.updateParentId(currentId, selectedId);
      onReload?.();
    } catch (error) {
      console.error('Error updating parent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAssets();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredAssets(
      term
        ? assets.filter(a => a.description.toLowerCase().includes(term))
        : assets
    );
  }, [searchTerm, assets]);

  return (
    <div className="flex flex-col pt-2 h-full">
      <input
        type="text"
        placeholder={t('search.equipment')}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded w-full"
      />
      <div className="h-64 overflow-y-auto border p-2 mb-4">
        {filteredAssets.map(asset => (
          <div
            key={asset.id}
            onClick={() => setSelectedId(asset.id)}
            className={`p-2 cursor-pointer hover:bg-gray-200 ${
              selectedId === asset.id ? 'bg-gray-300' : ''
            }`}
          >
            {asset.description}
          </div>
        ))}
      </div>
      <div className="mt-auto">
        <button
          type="button"
          onClick={handleConfirmSelection}
          disabled={!selectedId}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? <SvgSpinner /> : t('confirm')}
        </button>
      </div>
    </div>
  );
};
