import {
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
} from 'app/interfaces/Asset';

class AssetService {
  private static instance: AssetService;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public static getInstance(baseUrl?: string): AssetService {
    if (!AssetService.instance && baseUrl) {
      AssetService.instance = new AssetService(baseUrl);
    }
    return AssetService.instance;
  }

  async getAll(): Promise<Asset[]> {
    try {
      const response = await fetch(`${this.baseUrl}Asset`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch assets');
      return response.json();
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  async createAsset(assetData: CreateAssetRequest): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}Asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData),
      });
      if (!response.ok) throw new Error('Failed to create asset');
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  }

  async updateAsset(assetData: UpdateAssetRequest): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}Asset`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData),
      });
      if (!response.ok) throw new Error('Failed to update asset');
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  }

  async deleteAsset(assetId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}Asset/${assetId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to delete asset');
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }

  async getAssetById(assetId: string): Promise<Asset> {
    try {
      const response = await fetch(`${this.baseUrl}Asset/${assetId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch asset');
      return response.json();
    } catch (error) {
      console.error('Error fetching asset by ID:', error);
      throw error;
    }
  }

  async updateParentId(assetId: string, parentId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}Asset/${assetId}/parent/${parentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error('Failed to update asset parent');
    } catch (error) {
      console.error('Error updating asset parent ID:', error);
      throw error;
    }
  }
}

export const assetService = AssetService.getInstance(
  process.env.NEXT_PUBLIC_API_BASE_URL!
);

export default AssetService;
