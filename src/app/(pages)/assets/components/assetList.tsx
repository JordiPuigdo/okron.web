'use client';
import { useEffect, useState } from 'react';
import { SvgCreate, SvgMachines, SvgSpinner } from 'app/icons/icons';
import { Asset } from 'app/interfaces/Asset';
import AssetService from 'app/services/assetService';
import { LoadingState } from 'app/types/loadingState';
import { ButtonTypesTable } from 'components/table/DataTable';
import { Button } from 'designSystem/Button/Buttons';
import Link from 'next/link';

interface Props {
  asset: Asset;
  onDelete: (id: string) => void;
}

const AssetListItem: React.FC<Props> = ({ asset, onDelete }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const [loadingState, setLoadingState] = useState<LoadingState>({});

  const handleDelete = async (id: string) => {
    toggleLoading(id, ButtonTypesTable.Delete, true);
    onDelete && onDelete(id);
    toggleLoading(id, ButtonTypesTable.Delete, false);
  };
  const toggleLoading = (
    id: string,
    buttonType: ButtonTypesTable,
    isLoading: boolean
  ) => {
    const loadingKey = `${id}_${buttonType}`;
    setLoadingState(prevLoadingState => ({
      ...prevLoadingState,
      [loadingKey]: isLoading,
    }));
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="mt-4 bg-white rounded-xl">
      <li className=" p-4 flex flex-col border-2 ">
        <div className="flex items-center mb-2">
          {asset.childs.length > 0 && (
            <button
              onClick={toggleExpanded}
              className="mr-2 focus:outline-none rounded-full bg-blue-500 text-white px-2 py-1"
            >
              {expanded ? '-' : '+'}
            </button>
          )}
          <div className="flex-grow">
            <strong>Codi:</strong> {asset.code} | <strong>Descripció:</strong>{' '}
            {asset.description} | <strong>Nivell:</strong> {asset.level}
          </div>
          <div className="flex flex-row">
            {asset.level < 7 && (
              <Link
                href={`/assets/0?parentId=${asset.id}&level=${asset.level + 1}`}
                passHref
              >
                <button
                  onClick={e => {
                    toggleLoading(asset.id, ButtonTypesTable.Create, true);
                  }}
                  className="flex items-center mr-2 bg-okron-btCreate text-white px-2 py-1 rounded hover:bg-okron-btCreateHover"
                >
                  Afegir actiu
                  {loadingState[`${asset.id}_${ButtonTypesTable.Create}`] && (
                    <span className="items-center ml-2 text-white">
                      <SvgSpinner className="w-6 h-6" />
                    </span>
                  )}
                </button>
              </Link>
            )}
            <Link href={`/assets/${asset.id}`} passHref>
              <button
                onClick={e => {
                  toggleLoading(asset.id, ButtonTypesTable.Edit, true);
                }}
                className="flex items-center mr-2 bg-okron-btEdit text-white px-2 py-1 rounded hover:bg-okron-btEditHover"
              >
                Editar
                {loadingState[`${asset.id}_${ButtonTypesTable.Edit}`] && (
                  <span className="items-center ml-2 text-white">
                    <SvgSpinner className="w-6 h-6" />
                  </span>
                )}
              </button>
            </Link>
            <button
              className="flex bg-okron-btDelete text-white px-2 py-1 rounded hover:bg-okron-btDeleteHover"
              onClick={e => {
                handleDelete(asset.id);
              }}
            >
              Eliminar
              {loadingState[`${asset.id}_${ButtonTypesTable.Delete}`] && (
                <span className="items-center ml-2 text-white">
                  <SvgSpinner className="w-6 h-6" />
                </span>
              )}
            </button>
          </div>
        </div>
        {expanded && asset.childs.length > 0 && (
          <ul className="pl-4 ">
            {asset.childs.map(child => (
              <AssetListItem key={child.id} asset={child} onDelete={onDelete} />
            ))}
          </ul>
        )}
      </li>
    </div>
  );
};

const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);
  const [message, setMessage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    assetService
      .getAll()
      .then((assets: Asset[]) => {
        setAssets(assets);
      })
      .catch((error: any) => {
        console.error('Error al obtener activos:', error);
      });
  }, []);

  const handleDelete = (id: string) => {
    const confirm = window.confirm('Segur que voleu eliminar aquest equip?');
    if (!confirm) return;
    assetService
      .deleteAsset(id)
      .then(data => {
        if (data) {
          window.location.reload();
        }
      })
      .catch(error => {
        console.error('Error al eliminar activo:', error);
        setMessage('Error al eliminar activo');
        setTimeout(() => {
          setMessage('');
        }, 3000);
      });
  };
  const filterAssetsRecursive = (assets: Asset[], term: string): Asset[] => {
    return assets.reduce((filtered: Asset[], asset) => {
      const includesTerm =
        asset.code.toLowerCase().includes(term.toLowerCase()) ||
        asset.description.toLowerCase().includes(term.toLowerCase());

      const filteredChildren = filterAssetsRecursive(asset.childs, term);

      if (includesTerm || filteredChildren.length > 0) {
        filtered.push({
          ...asset,
          childs: filteredChildren,
        });
      }

      return filtered;
    }, []);
  };

  const filteredAssets = filterAssetsRecursive(assets, searchTerm);

  const renderHeader = () => {
    return (
      <div className="flex w-full">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            Actius i Equips
          </h2>
          <span className="text-l">Inici - Llistat d'Actius i Equips</span>
        </div>
        <div className="w-full flex justify-end items-center">
          <Link href="/assets/0" passHref>
            <Button className="py-4" customStyles="flex gap-2">
              <SvgCreate className="text-white" />
              Crear Equip
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto py-4">
      {renderHeader()}
      <div className="bg-white rounded-sm p-4 m-4 border-2">
        <input
          type="text"
          placeholder="Buscar per codi o descripció"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex w-full border border-gray-300 rounded"
        />
      </div>

      <ul>
        {filteredAssets.map(asset => (
          <AssetListItem key={asset.id} asset={asset} onDelete={handleDelete} />
        ))}
      </ul>
      {message != '' && <span className="text-red-500">{message}</span>}
    </div>
  );
};

export default AssetList;
