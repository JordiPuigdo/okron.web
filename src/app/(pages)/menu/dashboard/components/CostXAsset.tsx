import { useTranslations } from 'app/hooks/useTranslations';
import WorkOrder from 'app/interfaces/workOrder';
import RechartsBarChart from 'designSystem/BarChart/RechartsBarChart';

interface CostXAssetProps {
  workOrders: WorkOrder[];
}

const CostXAsset: React.FC<CostXAssetProps> = ({ workOrders }) => {
  const { t } = useTranslations();
  const assetCostMap = new Map<string, number>();

  workOrders.forEach(workOrder => {
    const total = workOrder.workOrderSpareParts?.reduce(
      (acc, sparePart) => acc + sparePart.quantity * sparePart.sparePart.price,
      0
    );

    const assetDescription = workOrder.asset?.description || 'Unknown Asset';

    if (total) {
      const currentCost = assetCostMap.get(assetDescription) || 0;
      assetCostMap.set(assetDescription, currentCost + total);
    }
  });

  const chartData = Array.from(assetCostMap.entries())
    .map(([asset, total]) => ({ asset, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <RechartsBarChart
      chartData={chartData}
      title={t('material.cost.per.equipment')}
      showLegend={false}
      barColor="#3b82f6"
    />
  );
};

export default CostXAsset;
