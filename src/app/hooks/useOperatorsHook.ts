import Operator from "app/interfaces/Operator";
import OperatorService from "app/services/operatorService";
import useSWR from "swr";

const operatorService = new OperatorService(
  process.env.NEXT_PUBLIC_API_BASE_URL!
);

const fetchOperators = async (): Promise<Operator[]> => {
  try {
    const response = await operatorService.getOperators();
    return response || [];
  } catch (error) {
    console.error("Error fetching operators:", error);
    return [];
  }
};

export const useOperatorHook = () => {
  const {
    data: operators,
    error: operatorsError,
    mutate: fetchAllOperators,
  } = useSWR<Operator[]>("operators", fetchOperators);

  return { operators, operatorsError, fetchAllOperators };
};
