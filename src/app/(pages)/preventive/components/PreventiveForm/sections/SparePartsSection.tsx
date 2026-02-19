import { ContentCard } from 'app/(pages)/workOrders/[id]/components/WorkOrderForm/layout/ContentCard';
import { SparePartPreventive } from 'app/interfaces/Preventive';
import { PreventiveSparePart } from 'app/(pages)/preventive/preventiveForm/components/PreventiveSparePart';

interface SparePartsSectionProps {
  selectedSpareParts: SparePartPreventive[];
  onSparePartsChange: (spareParts: SparePartPreventive[]) => void;
  isDisabled?: boolean;
}

export function SparePartsSection({
  selectedSpareParts,
  onSparePartsChange,
  isDisabled = false,
}: SparePartsSectionProps) {
  return (
    <ContentCard>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recanvis
      </h3>

      <PreventiveSparePart
        onSparePartsChange={onSparePartsChange}
        initialSelectedSpareParts={selectedSpareParts}
      />
    </ContentCard>
  );
}
