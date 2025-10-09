import { useState } from 'react';
import {
  AddSparePartProvider,
  Provider,
  ProviderRequest,
  ProviderSparePartRequest,
  UpdateProviderRequest,
  UpdateSparePartDiscountRequest,
} from 'app/interfaces/Provider';
import {
  IProviderService,
  ProviderService,
} from 'app/services/providerService';
import { fetcher } from 'app/utils/utils';
import useSWR, { mutate } from 'swr';

export const useProviders = (
  shouldFetchProviders: boolean = false,
  providerService: IProviderService = new ProviderService()
) => {
  const [isProviderSuccessFull, setIsSuccessFull] = useState<boolean | null>(
    null
  );
  const [isLoadingProvider, setIsLoadingProvider] = useState(false);
  const {
    data: providers,
    error: providersError,
    mutate: fetchProviders,
  } = useSWR<Provider[]>(
    shouldFetchProviders
      ? process.env.NEXT_PUBLIC_API_BASE_URL + 'provider'
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  const createProvider = async (
    provider: ProviderRequest
  ): Promise<Provider> => {
    try {
      const response = await providerService.create(provider);

      return response;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  };

  const getById = async (id: string) => {
    try {
      const response = await providerService.getById(id);
      return response;
    } catch (error) {
      console.error('Error fetching provider:', error);
      throw error;
    }
  };

  const updateProvider = async (provider: UpdateProviderRequest) => {
    try {
      setIsLoadingProvider(true);
      const response = await providerService.update(provider);
      if (response) {
        setSuccessFull(true);
        await mutate(process.env.NEXT_PUBLIC_API_BASE_URL + 'provider');
      }

      return response;
    } catch (error) {
      console.error('Error updating provider:', error);
      setSuccessFull(false);
      throw error;
    } finally {
      setIsLoadingProvider(false);
    }
  };

  const addOrRemoveSparePart = async (
    id: string,
    request: AddSparePartProvider
  ) => {
    try {
      await providerService.addOrRemoveSparePart(id, request);
    } catch (error) {
      console.error('Error updating provider:', error);
      setSuccessFull(false);
      throw error;
    } finally {
      setIsLoadingProvider(false);
    }
  };

  function setSuccessFull(isSuccessFull: boolean) {
    setIsSuccessFull(isSuccessFull);
    const timeout = setTimeout(() => setIsSuccessFull(null), 5000);
    return () => clearTimeout(timeout);
  }

  const updateSparePartPrice = async (request: ProviderSparePartRequest) => {
    try {
      await providerService.updateSparePartPrice(request);
    } catch (error) {
      console.error('Error updating spare part price:', error);
      throw error;
    }
  };

  const updateSparePartDiscount = async (
    request: UpdateSparePartDiscountRequest
  ) => {
    try {
      await providerService.updateSparePartDiscount(request);
    } catch (error) {
      console.error('Error updating spare part discount:', error);
      throw error;
    }
  };

  return {
    providers,
    providersError,
    fetchProviders,
    createProvider,
    getById,
    updateProvider,
    addOrRemoveSparePart,
    isLoadingProvider,
    isProviderSuccessFull,
    updateSparePartPrice,
    updateSparePartDiscount,
  };
};
