"use client";
import { useEffect, useState } from "react";
import InspectionPoint from "app/interfaces/inspectionPoint";
import AutocompleteSearchBar from "components/selector/AutocompleteSearchBar";

interface ChooseInspectionPointProps {
  preventiveInspectionPoints: InspectionPoint[];
  preventiveSelectedInspectionPoints: string[];
  onInspectionPointSelected: (pointId: string) => void;
  onDeleteInspectionPointSelected: (pointId: string) => void;
}

const ChooseInspectionPoint: React.FC<ChooseInspectionPointProps> = ({
  preventiveInspectionPoints,
  preventiveSelectedInspectionPoints,
  onInspectionPointSelected,
  onDeleteInspectionPointSelected,
}) => {
  const [selectedInspectionPoints, setSelectedInspectionPoints] = useState<
    InspectionPoint[]
  >([]);

  useEffect(() => {
    const selectedPoints = preventiveInspectionPoints.filter((point) =>
      preventiveSelectedInspectionPoints.includes(point.id)
    );
    setSelectedInspectionPoints(selectedPoints);
  }, [preventiveInspectionPoints, preventiveSelectedInspectionPoints]);

  const handleDeleteSelectedPoint = (pointId: string) => {
    setSelectedInspectionPoints((prevSelected) =>
      prevSelected.filter((point) => point.id !== pointId)
    );
    onDeleteInspectionPointSelected(pointId);
  };
  const handleInspectionPointSelected = (id: string) => {
    if (id == "") return;
    const x = preventiveInspectionPoints.find((point) => point.id === id);
    setSelectedInspectionPoints((prevSelected) => [...prevSelected, x!]);
    onInspectionPointSelected(id);
  };

  return (
    <div className="flex flex-row gap-8 w-full">
      <div className="w-full">
        <label className="block text-gray-700 font-bold mb-2 text-sm">
          Punts d'inspecció
        </label>
        <AutocompleteSearchBar
          elements={preventiveInspectionPoints.filter(
            (x) =>
              x.active && !selectedInspectionPoints.some((y) => y.id === x.id)
          )}
          setCurrentId={handleInspectionPointSelected}
          placeholder="Buscar punts d'inspecció"
        />
        <div className="mt-4 p-2">
          {selectedInspectionPoints.map((point) => (
            <div
              key={point.id}
              className="flex items-center justify-between mb-2 border-b-2 border-gray-800 p-2"
            >
              <span className="text-gray-600 font-medium">
                {point.description}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteSelectedPoint(point.id)}
                className="bg-red-600 hover:bg-red-900 text-white rounded-xl py-2 px-4 text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseInspectionPoint;
