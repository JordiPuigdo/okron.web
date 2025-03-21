import {
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
} from 'app/interfaces/Asset';

class AssetService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<Asset[]> {
    try {
      const url = `${this.baseUrl}Asset`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  async createAsset(assetData: CreateAssetRequest): Promise<boolean> {
    try {
      const url = `${this.baseUrl}Asset`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        console.error('Failed to add asset');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  }

  async updateAsset(
    assetId: string,
    assetData: Partial<UpdateAssetRequest>
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}Asset`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        console.error('Failed to update asset');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  }

  async deleteAsset(assetId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}Asset/${assetId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to delete asset');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }

  async getAssetById(assetId: string): Promise<Asset> {
    try {
      const url = `${this.baseUrl}Asset/${assetId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch asset');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching asset by ID:', error);
      throw error;
    }
  }

  async updateParentId(assetId: string, parentId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}Asset/${assetId}/parent/${parentId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to update asset parent ID');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating asset parent ID:', error);
      throw error;
    }
  }
}

export default AssetService;
