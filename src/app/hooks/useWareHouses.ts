import { useState } from 'react';
import { StockMovementFilters } from 'app/interfaces/StockMovement';
import {
  UpdateWareHouseRequest,
  WareHouse,
  WareHouseRequest,
  WareHouseSparePartRequest,
  WareHouseStockRequest,
} from 'app/interfaces/WareHouse';
import {
  IWareHouseService,
  WareHouseService,
} from 'app/services/wareHouseService';
import { fetcher } from 'app/utils/utils';
import useSWR from 'swr';

export const useWareHouses = (
  shouldFetchWarehouses: boolean = false,
  wareHouseService: IWareHouseService = new WareHouseService()
) => {
  const [isWareHouseSuccessFull, setIsSuccessFull] = useState<boolean | null>(
    null
  );
  const [errorWareHouseHook, setErrorWareHouseHook] = useState<string | null>(
    null
  );
  const [isLoadingWareHouse, setIsLoadingWareHouse] = useState(false);

  const { data: warehouses, mutate: mutateWarehouses } = useSWR<WareHouse[]>(
    shouldFetchWarehouses
      ? process.env.NEXT_PUBLIC_API_BASE_URL + 'warehouse'
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  const createWareHouse = async (
    wareHouse: WareHouseRequest
  ): Promise<WareHouse> => {
    try {
      const response = await wareHouseService.createWareHouse(wareHouse);
      mutateWarehouses([...(warehouses || []), response], false);
      return response;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  };

  const getWareHouse = async (id: string) => {
    try {
      const response = await wareHouseService.getWareHouse(id);
      return response;
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      throw error;
    }
  };

  const updateWareHouse = async (wareHouse: UpdateWareHouseRequest) => {
    setIsLoadingWareHouse(true);
    try {
      const response = await wareHouseService.updateWareHouse(wareHouse);
      if (response) setSuccessFull(true);
      mutateWarehouses();
      return response;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      setSuccessFull(false);
      throw error;
    } finally {
      setIsLoadingWareHouse(false);
    }
  };

  const addSparePart = async (
    wareHouseSparePartRequest: WareHouseSparePartRequest
  ) => {
    try {
      const response = await wareHouseService.addSparePart(
        wareHouseSparePartRequest
      );
      return response;
    } catch (error) {
      console.error('Error adding spare part to warehouse:', error);
      throw error;
    }
  };

  const removeSparePart = async (
    wareHouseSparePartRequest: WareHouseSparePartRequest
  ) => {
    try {
      const response = await wareHouseService.removeSparePart(
        wareHouseSparePartRequest
      );
      return response;
    } catch (error) {
      console.error('Error removing spare part from warehouse:', error);
      throw error;
    }
  };

  const getSparePartsByWarehouseId = async (wareHouseId: string) => {
    try {
      const response = await wareHouseService.warehouseSpareParts(wareHouseId);
      return response;
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      throw error;
    }
  };

  function setSuccessFull(isSuccessFull: boolean) {
    setIsSuccessFull(isSuccessFull);
    const timeout = setTimeout(() => setIsSuccessFull(null), 5000);
    return () => clearTimeout(timeout);
  }

  const deleteWareHouse = async (id: string) => {
    try {
      const response = await wareHouseService.deleteWareHouse(id);
      if (response) setSuccessFull(true);
      mutateWarehouses();
      return response;
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      setSuccessFull(false);
      throw error;
    } finally {
      setIsLoadingWareHouse(false);
    }
  };

  const getStockAvailability = async () => {
    try {
      const response = await wareHouseService.stockAvailability();
      return response;
    } catch (error) {
      console.log('error fetching getStockAvailability');
      throw error;
    }
  };

  const getStockMovementsByWarehouseAndDate = async (
    filters: StockMovementFilters
  ) => {
    try {
      const response =
        await wareHouseService.getStockMovementsByWarehouseAndDate(filters);
      return response;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  };

  const warehouseStockRequest = async (
    wareHouseStockRequest: WareHouseStockRequest
  ) => {
    try {
      const response = await wareHouseService.warehouseStockRequest(
        wareHouseStockRequest
      );
      return response;
    } catch (error) {
      console.error('Error creating warehouse stock:', error);
      throw error;
    }
  };

  return {
    warehouses: warehouses || [],
    createWareHouse,
    getWareHouse,
    updateWareHouse,
    addSparePart,
    removeSparePart,
    getSparePartsByWarehouseId,
    deleteWareHouse,
    getStockMovementsByWarehouseAndDate,
    getStockAvailability,
    isLoadingWareHouse,
    isWareHouseSuccessFull,
    warehouseStockRequest,
  };
};
