'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SvgSpinner } from 'app/icons/icons';
import { Asset } from 'app/interfaces/Asset';
import AssetService from 'app/services/assetService';
import useRoutes from 'app/utils/useRoutes';
import { ElementList } from 'components/selector/ElementList';
import { useRouter } from 'next/navigation';

interface AssetFormProps {
  id: string;
  loading: boolean;
  assetData?: Asset;
  onSubmit: (data: any) => Promise<void>;
  onChange: (header: string, value: string) => Promise<void>;
  parentId?: string;
  level?: number;
  onReload?: () => void;
}

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
  const { register, handleSubmit, setValue } = useForm();
  const router = useRouter();
  const ROUTES = useRoutes();

  useEffect(() => {
    if (assetData) {
      Object.entries(assetData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [assetData]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
  };

  function fetch() {
    onReload && onReload();
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="w-full flex flex-col h-full"
    >
      <div className="flex flex-row w-full">
        <div className="flex flex-col w-full p-2 ">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Codi:</label>
            <input
              type="text"
              {...register('code', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              onChange={e => {
                onChange('code', e.target.value);
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Descripció:</label>
            <input
              type="text"
              {...register('description', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              onChange={e => {
                onChange('description', e.target.value);
              }}
            />
          </div>
          <div className="mb-4 items-start">
            <label className="block text-gray-700 mb-2">
              Crea Ordre de treball:
            </label>
            <input
              type="checkbox"
              defaultChecked={assetData?.createWorkOrder || true}
              {...register('createWorkOrder')}
              className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-4 items-start">
            <label className="block text-gray-700 mb-2">Actiu:</label>
            <input
              type="checkbox"
              defaultChecked={assetData?.active || true}
              {...register('active')}
              className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex mt-auto gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              {loading ? <SvgSpinner /> : id !== '0' ? 'Actualitzar' : 'Afegir'}
            </button>
            <button
              type="button"
              disabled={loading}
              className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
              onClick={() => {
                router.push(ROUTES.configuration.assets);
              }}
            >
              {loading ? <SvgSpinner /> : 'Cancelar'}
            </button>
          </div>
        </div>
        <div className="w-full p-2">
          Equip Pare
          <div>
            <ParentAsset currentId={id} onReload={fetch} />
          </div>
        </div>
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
  const [assets, setAssets] = useState<ElementList[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<ElementList[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isloading, setIsloading] = useState(false);

  const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);
  const fetchAllAssets = async () => {
    try {
      const assets = await assetService.getAll();

      const elements: ElementList[] = [];

      const addAssetAndChildren = (asset: Asset) => {
        elements.push({
          id: asset.id,
          description: asset.description,
        });

        asset.childs.forEach(childAsset => {
          addAssetAndChildren(childAsset);
        });
      };

      assets.forEach(asset => {
        addAssetAndChildren(asset);
      });

      setAssets(elements);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };
  async function handleConfirmSelection() {
    setIsloading(true);
    await assetService.updateParentId(currentId, selectedId);
    onReload && onReload();
    setIsloading(false);
  }
  useEffect(() => {
    fetchAllAssets();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = assets.filter(asset =>
        asset.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssets(filtered);
    } else {
      setFilteredAssets(assets);
    }
  }, [searchTerm, assets]);
  return (
    <div className="flex flex-col pt-2 h-full">
      <input
        type="text"
        placeholder="Buscar equip..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded w-full"
      />

      <div
        style={{ height: '250px', overflowY: 'auto' }}
        className="border p-2 mb-4"
      >
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
      <div className=" mt-auto">
        <button
          type="button"
          onClick={handleConfirmSelection}
          disabled={!selectedId}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isloading ? <SvgSpinner /> : 'Confirmar'}
        </button>
      </div>
    </div>
  );
};
