import { Asset } from 'app/interfaces/Asset';
import { assetService } from 'app/services/assetService';
import { ElementList } from 'components/selector/ElementList';
import useSWR from 'swr';

const fetchAssets = async (): Promise<ElementList[]> => {
  const assets = await assetService.getAll();
  const elements: ElementList[] = [];

  const addAssetAndChildren = (asset: Asset) => {
    if (asset.createWorkOrder) {
      elements.push({
        id: asset.id,
        code: asset.code,
        description: asset.description,
        brand: asset.brand,
      });
    }
    asset.childs?.forEach(addAssetAndChildren);
  };

  assets.forEach(addAssetAndChildren);
  return elements;
};

export const useAssetHook = () => {
  const {
    data: assets,
    error: assetsError,
    mutate: fetchAllAssets,
  } = useSWR<ElementList[]>('assets', fetchAssets, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
  });

  return { assets, assetsError, fetchAllAssets };
};
