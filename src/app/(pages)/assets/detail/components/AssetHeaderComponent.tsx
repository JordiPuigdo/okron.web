'use client';
import { useEffect, useState } from 'react';
import { SvgSpinner } from 'app/icons/icons';
import { Asset } from 'app/interfaces/Asset';
import AssetService from 'app/services/assetService';

interface AssetHeaderProps {
  assetId: string;
}

const AssetHeader = ({ assetId }: AssetHeaderProps) => {
  const [loading, setLoading] = useState(true);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);

  useEffect(() => {
    fetchAsset(assetId);
  }, [assetId]);

  const fetchAsset = async (id: string) => {
    try {
      const asset = await assetService.getAssetById(id);
      setCurrentAsset(asset);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <header className="bg-blue-50 p-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <SvgSpinner />
        </div>
      </header>
    );
  }

  return (
    <header className="bg-blue-50 p-4 shadow-sm">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800">
          {currentAsset?.description || 'Activo no encontrado'}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-center">
          <p className="text-sm text-blue-600">
            Codi: {currentAsset?.code || 'N/A'}
          </p>
        </div>
      </div>
    </header>
  );
};

export default AssetHeader;
