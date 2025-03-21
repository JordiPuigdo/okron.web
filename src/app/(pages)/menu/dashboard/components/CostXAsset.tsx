import WorkOrder from "app/interfaces/workOrder";
import { BarChartComponent } from "designSystem/BarChart/BarChartComponent";

interface CostXAssetProps {
  workOrders: WorkOrder[];
}

const CostXAsset: React.FC<CostXAssetProps> = ({ workOrders }) => {
  const assetCostMap = new Map<string, number>();

  workOrders.forEach((workOrder) => {
    const totalCost = workOrder.workOrderSpareParts?.reduce(
      (acc, sparePart) => acc + sparePart.quantity * sparePart.sparePart.price,
      0
    );

    const assetDescription = workOrder.asset?.description || "Unknown Asset";

    if (totalCost) {
      const currentCost = assetCostMap.get(assetDescription) || 0;
      assetCostMap.set(assetDescription, currentCost + totalCost);
    }
  });

  const chartData = Array.from(assetCostMap.entries())
    .map(([asset, totalCost]) => ({ asset, totalCost }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 10);

  return (
    <BarChartComponent
      category={["totalCost"]}
      chartData={chartData}
      index="asset"
      title="Cost Material per Equip"
      showLegend={false}
    />
  );
};

export default CostXAsset;
