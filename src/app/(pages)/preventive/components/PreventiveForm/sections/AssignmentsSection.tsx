import { ContentCard } from 'app/(pages)/workOrders/[id]/components/WorkOrderForm/layout/ContentCard';
import InspectionPoint from 'app/interfaces/inspectionPoint';
import Operator from 'app/interfaces/Operator';
import ChooseElement from 'components/ChooseElement';
import ChooseInspectionPoint from 'components/inspectionPoint/ChooseInspectionPoint';
import ChooseOperatorV2 from 'components/operator/ChooseOperatorV2';
import { ElementList } from 'components/selector/ElementList';

interface AssignmentsSectionProps {
  availableInspectionPoints: InspectionPoint[];
  selectedInspectionPoints: string[];
  onInspectionPointSelected: (pointId: string) => void;
  onDeleteInspectionPointSelected: (pointId: string) => void;
  availableOperators: Operator[];
  selectedOperators: string[];
  onSelectedOperator: (operatorId: string) => void;
  onDeleteSelectedOperator: (operatorId: string) => void;
  assets?: ElementList[];
  selectedAssets?: string[];
  onAssetSelected?: (assetId: string) => void;
  onDeleteSelectedAsset?: (assetId: string) => void;
  isDisabled?: boolean;
}

export function AssignmentsSection({
  availableInspectionPoints,
  selectedInspectionPoints,
  onInspectionPointSelected,
  onDeleteInspectionPointSelected,
  availableOperators,
  selectedOperators,
  onSelectedOperator,
  onDeleteSelectedOperator,
  assets,
  selectedAssets,
  onAssetSelected,
  onDeleteSelectedAsset,
}: AssignmentsSectionProps) {
  return (
    <ContentCard>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Assignacions
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <ChooseInspectionPoint
          preventiveInspectionPoints={availableInspectionPoints}
          onInspectionPointSelected={onInspectionPointSelected}
          onDeleteInspectionPointSelected={onDeleteInspectionPointSelected}
          preventiveSelectedInspectionPoints={selectedInspectionPoints}
        />

        <ChooseOperatorV2
          availableOperators={availableOperators}
          preventiveSelectedOperators={selectedOperators}
          onDeleteSelectedOperator={onDeleteSelectedOperator}
          onSelectedOperator={onSelectedOperator}
        />

        {assets && selectedAssets && onAssetSelected && onDeleteSelectedAsset && (
          <ChooseElement
            elements={assets}
            selectedElements={selectedAssets}
            onElementSelected={onAssetSelected}
            onDeleteElementSelected={onDeleteSelectedAsset}
            placeholder="Buscar Equip"
            mapElement={asset => ({
              id: asset.id,
              code: asset.code,
              description: asset.code + ' - ' + asset.description,
            })}
            labelText="Equips"
          />
        )}
      </div>
    </ContentCard>
  );
}
