import { Asset } from 'app/interfaces/Asset';
import AssetService from 'app/services/assetService';
import { ElementList } from 'components/selector/ElementList';
import useSWR from 'swr';

const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);

const fetchAssets = async (): Promise<ElementList[]> => {
  try {
    const assets = await assetService.getAll();

    const elements: ElementList[] = [];

    const addAssetAndChildren = (asset: Asset) => {
      if (asset.createWorkOrder) {
        elements.push({
          id: asset.id,
          description: asset.description,
        });
      }

      if (asset.childs?.length) {
        asset.childs.forEach(childAsset => {
          addAssetAndChildren(childAsset);
        });
      }
    };

    assets.forEach(asset => {
      addAssetAndChildren(asset);
    });

    return elements;
  } catch (error) {
    console.error('Error al obtener activos:', error);
    return []; // Return an empty array in case of error
  }
};

export const useAssetHook = () => {
  const {
    data: assets,
    error: assetsError,
    mutate: fetchAllAssets,
  } = useSWR<ElementList[]>('operators', fetchAssets, {
    revalidateOnFocus: false,
  });

  return { assets, assetsError, fetchAllAssets };
};
