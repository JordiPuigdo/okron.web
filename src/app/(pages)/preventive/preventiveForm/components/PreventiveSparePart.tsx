import { useMemo, useState } from 'react';
import { useSparePartsHook } from 'app/hooks/useSparePartsHook';
import { SparePartPreventive } from 'app/interfaces/Preventive';
import ChooseElement from 'components/ChooseElement';

interface PreventiveSparePartProps {
  onSparePartsChange: (spareParts: SparePartPreventive[]) => void;
  initialSelectedSpareParts?: SparePartPreventive[];
}

export const PreventiveSparePart = ({
  onSparePartsChange,
  initialSelectedSpareParts = [],
}: PreventiveSparePartProps) => {
  const { spareParts } = useSparePartsHook(true);
  const [selectedSpareParts, setSelectedSpareParts] = useState<
    SparePartPreventive[]
  >(initialSelectedSpareParts);

  const selectedSparePartIds = useMemo(
    () => selectedSpareParts.map(sp => sp.sparePartId),
    [selectedSpareParts]
  );

  const handleAddSparePart = (id: string) => {
    const sparePart = spareParts?.find(sp => sp.id === id);
    if (!sparePart) return;

    const newSparePart: SparePartPreventive = {
      sparePartId: id,
      sparePartCode: sparePart.code,
      sparePartDescription: sparePart.description,
    };

    const updatedSpareParts = [...selectedSpareParts, newSparePart];
    setSelectedSpareParts(updatedSpareParts);
    onSparePartsChange(updatedSpareParts);
  };

  const handleRemoveSparePart = (id: string) => {
    const updatedSpareParts = selectedSpareParts.filter(
      sp => sp.sparePartId !== id
    );
    setSelectedSpareParts(updatedSpareParts);
    onSparePartsChange(updatedSpareParts);
  };

  if (!spareParts) return null;

  return (
    <div className="flex flex-row gap-4 py-4 w-full">
      <ChooseElement
        elements={spareParts}
        selectedElements={selectedSparePartIds}
        onElementSelected={handleAddSparePart}
        onDeleteElementSelected={handleRemoveSparePart}
        placeholder="Buscar Revanvis"
        mapElement={sparePart => ({
          id: sparePart.id,
          description: sparePart.description,
        })}
        labelText="Recanvis"
      />
    </div>
  );
};
