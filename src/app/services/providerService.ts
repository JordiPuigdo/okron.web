import {
  AddSparePartProvider,
  Provider,
  ProviderRequest,
  ProviderResponse,
  ProviderSparePartRequest,
  UpdateProviderRequest,
  UpdateSparePartDiscountRequest,
} from 'app/interfaces/Provider';

export interface IProviderService {
  create(providerRequest: ProviderRequest): Promise<Provider>;
  getById(id: string): Promise<ProviderResponse>;
  update(provider: UpdateProviderRequest): Promise<Provider>;
  addOrRemoveSparePart(
    id: string,
    request: AddSparePartProvider
  ): Promise<boolean>;
  updateSparePartPrice(request: ProviderSparePartRequest): Promise<boolean>;
  updateSparePartDiscount(
    request: UpdateSparePartDiscountRequest
  ): Promise<boolean>;
}

export class ProviderService implements IProviderService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL!) {
    this.baseUrl = baseUrl;
  }

  async updateSparePartPrice(
    request: ProviderSparePartRequest
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}provider/updateSparePartPrice`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to update spare part price: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating spare part price:', error);
      throw error;
    }
  }
  async getById(id: string): Promise<ProviderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}provider/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch provider: ${response.statusText}`);
      }
      const provider = await response.json();
      return provider;
    } catch (error) {
      console.error('Error fetching provider:', error);
      throw error;
    }
  }

  async create(providerRequest: ProviderRequest): Promise<Provider> {
    try {
      const response = await fetch(`${this.baseUrl}provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(providerRequest),
      });
      if (!response.ok) {
        throw new Error(`Failed to create provider: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  }

  async update(provider: UpdateProviderRequest): Promise<Provider> {
    try {
      const response = await fetch(`${this.baseUrl}provider`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(provider),
      });
      if (!response.ok) {
        throw new Error(`Failed to update provider: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating provider:', error);
      throw error;
    }
  }

  async addOrRemoveSparePart(
    id: string,
    request: AddSparePartProvider
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}provider/${id}/sparePart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error(`Failed to update provider: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating provider:', error);
      throw error;
    }
  }
  async updateSparePartDiscount(
    request: UpdateSparePartDiscountRequest
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}provider/updateSparePartDiscount`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to update spare part discount: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating spare part discount:', error);
      throw error;
    }
  }
}
export default ProviderService;
