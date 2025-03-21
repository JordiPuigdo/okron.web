import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useWorkOrders } from 'app/hooks/useWorkOrders';
import { SvgSpinner } from 'app/icons/icons';
import { LoginUser, UserType } from 'app/interfaces/User';
import { OriginWorkOrder } from 'app/interfaces/workOrder';
import ca from 'date-fns/locale/ca';

interface CostsProps {
  operatorCosts: number;
  sparePartCosts: number;
  totalCosts: number;
}

export function CostsObject({
  operatorCosts,
  sparePartCosts,
  totalCosts,
}: CostsProps) {
  return (
    <div className="flex-grow w-full">
      <div className="flex justify-between items-center mb-2 border-b-2">
        <div className="text-gray-700 text-xl">Cost Operaris:</div>
        <div className="text-blue-600 font-semibold text-xl">
          {operatorCosts}€
        </div>
      </div>

      <div className="flex justify-between items-center mb-2  border-b-2">
        <div className="text-gray-700 text-xl">Cost Recanvis:</div>
        <div className="text-blue-600 font-semibold text-xl">
          {sparePartCosts}€
        </div>
      </div>

      <div className="flex justify-between items-center font-semibold border-b-2">
        <div className="text-gray-700 text-xl">Cost Total:</div>
        <div className="text-red-600 font-semibold text-xl">{totalCosts}€</div>
      </div>
    </div>
  );
}

interface CostsObjectComponentProps {
  assetId: string;
  loginUser: LoginUser;
}
interface AssetCosts {
  totalCosts: number;
  operatorCosts: number;
  sparePartCosts: number;
}
export const CostsObjectComponent: React.FC<CostsObjectComponentProps> = ({
  assetId,
  loginUser,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [assetCosts, setAssetCosts] = useState<AssetCosts>({
    totalCosts: 0,
    operatorCosts: 0,
    sparePartCosts: 0,
  });

  const { fetchWithFilters } = useWorkOrders();

  async function caculateAssetCosts() {
    setIsLoading(true);
    const workOrders = await fetchWithFilters({
      assetId: assetId,
      startDateTime: startDate!,
      endDateTime: endDate!,
      userType:
        loginUser?.userType != undefined
          ? loginUser.userType
          : UserType.Maintenance,
      originWorkOrder: OriginWorkOrder.Maintenance,
    });

    const totalCosts: AssetCosts = {
      totalCosts: 0,
      operatorCosts: 0,
      sparePartCosts: 0,
    };

    workOrders?.forEach(workOrder => {
      const operatorCosts = workOrder.workOrderOperatorTimes?.reduce(
        (acc, x) => acc + x.operator.priceHour,
        0
      );
      const sparePartCosts = workOrder.workOrderSpareParts?.reduce(
        (acc, x) => acc + x.sparePart.price,
        0
      );
      totalCosts.operatorCosts += operatorCosts || 0;
      totalCosts.sparePartCosts += sparePartCosts || 0;
      totalCosts.totalCosts += (operatorCosts || 0) + (sparePartCosts || 0);
    });

    setAssetCosts(totalCosts);
    setIsLoading(false);
  }
  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        <span className="font-semibold">Costos entre dates</span>
        <DatePicker
          id="startDate"
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
          locale={ca}
          className="p-3 border border-gray-300 rounded-md text-sm"
        />
        <DatePicker
          id="endDate"
          selected={endDate}
          onChange={(date: Date) => setEndDate(date)}
          dateFormat="dd/MM/yyyy"
          locale={ca}
          className="p-3 border border-gray-300 rounded-md text-sm"
        />
        <button
          type="button"
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
          onClick={caculateAssetCosts}
        >
          Calcular
          {isLoading && <SvgSpinner className="ml-2 w-6 h-6" />}
        </button>
      </div>
      <CostsObject {...assetCosts} />
    </>
  );
};
