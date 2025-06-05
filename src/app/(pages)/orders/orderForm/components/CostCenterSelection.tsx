import { useEffect, useState } from 'react';
import { CostCenter } from 'app/interfaces/CostCenter';
import { CostService } from 'app/services/costService';

interface CostCenterSelectionProps {
  onSelectedCostCenter: (costCenter: CostCenter) => void;
  selectedId?: string;
}

export default function CostCenterSelection({
  onSelectedCostCenter,
  selectedId,
}: CostCenterSelectionProps) {
  const costCenterService = new CostService();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);

  useEffect(() => {
    async function fetchCostCenters() {
      try {
        const costCenters = await costCenterService.getAll();
        setCostCenters(costCenters.filter(x => x.active == true));
        if (costCenters.length > 0) {
          if (selectedId)
            onSelectedCostCenter(costCenters.find(x => x.id === selectedId)!);
          else onSelectedCostCenter(costCenters[0]);
        }
      } catch (error) {
        console.error('Error fetching cost centers:', error);
      }
    }

    fetchCostCenters();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-semibold">Centre de Costs:</label>
      <select
        className="w-full p-2 border rounded-md"
        value={costCenters.find(x => x.id === selectedId)?.id}
        onChange={e => {
          const selectedCostCenter = e.target.value;
          onSelectedCostCenter(
            costCenters.find(x => x.id === selectedCostCenter)!
          );
        }}
      >
        {costCenters.map(costCenter => (
          <option key={costCenter.id} value={costCenter.id}>
            {costCenter.code} - {costCenter.description}
          </option>
        ))}
      </select>
    </div>
  );
}
