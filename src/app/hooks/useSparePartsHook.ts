import SparePart, {
  SparePartDetailRequest,
  SparePartsConsumedsReport,
} from 'app/interfaces/SparePart';
import SparePartService from 'app/services/sparePartService';
import useSWR from 'swr';

const sparePartService = new SparePartService(
  process.env.NEXT_PUBLIC_API_BASE_URL!
);

const fetchAllSpareParts = async (): Promise<SparePart[]> => {
  try {
    const response = await sparePartService.getSpareParts();
    return response;
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    throw error;
  }
};

const fetchSparePartByRequest = async (
  sparePartDetailRequest: SparePartDetailRequest
): Promise<SparePart> => {
  sparePartService
    .getSparePart(sparePartDetailRequest)
    .then(response => {
      if (response) {
        return response;
      }
    })
    .catch(error => {
      console.log(error);
      throw error;
    });
  return {} as SparePart;
};

const fetchSparePartsConsumeds = async (
  from: string,
  to: string,
  assetId: string = ''
): Promise<SparePartsConsumedsReport[]> => {
  try {
    const response = await sparePartService.getSparePartsConsumeds(
      from,
      to,
      assetId
    );
    return response;
  } catch (error) {
    console.error('Error fetching spareParts Consumeds data:', error);
    throw error;
  }
};

export const useSparePartsHook = (shouldFetchSpareParts = false) => {
  const {
    data: spareParts,
    error: sparePartsError,
    mutate: fetchSpareParts,
  } = useSWR<SparePart[]>(
    shouldFetchSpareParts ? 'spareParts' : null,
    fetchAllSpareParts
  );

  const fetchSparePart = (sparePartDetailRequest: SparePartDetailRequest) => {
    const { data, error, mutate } = useSWR<SparePart>(
      ['sparePart', sparePartDetailRequest],
      () => fetchSparePartByRequest(sparePartDetailRequest)
    );
    return {
      sparePart: data,
      isLoading: !error && !data,
      isError: error,
      reloadSparePart: mutate,
    };
  };

  const fetchSparePartsConsumedsHook = (
    from: string,
    to: string,
    assetId = ''
  ) => {
    const { data, error, mutate } = useSWR<SparePartsConsumedsReport[]>(
      ['sparePartsConsumeds', from, to, assetId],
      () => fetchSparePartsConsumeds(from, to)
    );
    return {
      sparePartsConsumeds: data,
      isLoading: !error && !data,
      isError: error,
      reloadSparePartsConsumeds: mutate,
    };
  };

  return {
    spareParts,
    sparePartsError,
    fetchSpareParts,
    fetchSparePart,
    fetchSparePartsConsumedsHook,
  };
};
