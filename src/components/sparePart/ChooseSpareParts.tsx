"use client";

import { useEffect, useState } from "react";
import { SvgConsumeSparePart, SvgRestoreSparePart } from "app/icons/icons";
import SparePart, {
  ConsumeSparePart,
  RestoreSparePart,
} from "app/interfaces/SparePart";
import { WorkOrderSparePart } from "app/interfaces/workOrder";
import SparePartService from "app/services/sparePartService";
import WorkOrderService from "app/services/workOrderService";
import { useSessionStore } from "app/stores/globalStore";
import {
  formatDate,
} from "app/utils/utils";
import Link from "next/link";

interface ChooseSparePartsProps {
  availableSpareParts: SparePart[];
  selectedSpareParts: WorkOrderSparePart[];
  setSelectedSpareParts: React.Dispatch<
    React.SetStateAction<WorkOrderSparePart[]>
  >;
  WordOrderId: string;
  isFinished: boolean;
}

const ChooseSpareParts: React.FC<ChooseSparePartsProps> = ({
  availableSpareParts,
  selectedSpareParts,
  setSelectedSpareParts,
  WordOrderId,
  isFinished,
}) => {
  const sparePartService = new SparePartService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const [filteredSpareParts, setFilteredSpareParts] = useState<SparePart[]>(
    availableSpareParts.filter((x) => x.active)
  );

  const sparePartsLimit = 5;
  const [unitsPerSparePart, setUnitsPerSparePart] = useState<{
    [key: string]: number;
  }>({});
  const { operatorLogged } = useSessionStore((state) => state);

  const filterSpareParts = (searchTerm: string) => {
    const filtered = availableSpareParts.filter((sparePart) => {
      const searchText = searchTerm.toLowerCase();
      if (sparePart.active) {
        return [
          sparePart.code,
          sparePart.description,
          sparePart.refProvider,
          sparePart.family,
          sparePart.ubication,
        ].some((field) => field && field.toLowerCase().includes(searchText));
      }
    });

    setFilteredSpareParts(filtered);
  };

  async function consumeSparePart(sparePart: SparePart) {
    if (operatorLogged == undefined) {
      alert("Has de tenir un operari fitxat per fer aquesta acció!");
      return;
    }
    const currentUnits = unitsPerSparePart[sparePart.id] || 0;
    if (
      sparePart.stock < currentUnits ||
      currentUnits == null ||
      currentUnits <= 0
    ) {
      alert("No tens tant stock!");
      return;
    }
    if (sparePart) {
      setUnitsPerSparePart((prevUnits) => ({
        ...prevUnits,
        [sparePart.id]: 0,
      }));
      sparePart.stock = sparePart.stock - currentUnits;
      sparePart.unitsConsum = currentUnits;

      setSelectedSpareParts((prevSelected) => [
        ...prevSelected,
        mapSparePartToWorkorderSparePart(sparePart, currentUnits),
      ]);

      const consRequest: ConsumeSparePart = {
        sparePartId: sparePart.id,
        unitsSparePart: currentUnits,
        workOrderId: WordOrderId,
        operatorId: operatorLogged?.idOperatorLogged!,
      };
      await sparePartService.consumeSparePart(consRequest);
      await workOrderService.cleanCache();
    } else {
      console.log("Spare part not found in the available parts list.");
    }
  }

  const mapSparePartToWorkorderSparePart = (
    sparePart: SparePart,
    units: number
  ): WorkOrderSparePart => {
    const workOrderSparePart: WorkOrderSparePart = {
      id: sparePart.id,
      quantity: units,
      sparePart: sparePart,
    };
    return workOrderSparePart;
  };

  async function cancelSparePartConsumption(
    sparePart: SparePart,
    quantity: number
  ) {
    if (operatorLogged == undefined) {
      alert("Has de tenir un operari fitxat per fer aquesta acció!");
      return;
    }
    if (quantity <= 0) {
      alert("Quantitat negativa!");
    }

    const sparePartfinded = filteredSpareParts.find(
      (x) => x.id === sparePart.id
    );
    if (sparePartfinded) {
      sparePartfinded.stock += quantity;
    }

    setSelectedSpareParts((prevSelected) =>
      prevSelected.filter((x) => x.sparePart.id !== sparePart.id)
    );

    const consRequest: RestoreSparePart = {
      sparePartId: sparePart.id,
      unitsSparePart: quantity,
      workOrderId: WordOrderId,
      operatorId: operatorLogged?.idOperatorLogged!,
    };
    await sparePartService.restoreSparePart(consRequest);
    await workOrderService.cleanCache();
  }

  useEffect(() => {
    setFilteredSpareParts(availableSpareParts);
  }, [availableSpareParts]);

  return (
    <>
      <div className="flex flex-col flex-grow bg-white rounded-lg p-2 w-full">
        <div className="flex items-center">
          <input
            disabled={isFinished}
            type="text"
            placeholder="Buscador"
            className="p-2 mb-4 border border-gray-300 rounded-md"
            onChange={(e) => filterSpareParts(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div className="">
          <table className="min-w-full divide-y divide-gray-200 border-b-2 ">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Codi
                </th>
                <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Descripció
                </th>
                <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Proveïdor
                </th>
                <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Família
                </th>
                <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Ubicació
                </th>
                <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Unitats
                </th>
                <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Accions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSpareParts
                .filter((x) => x.active)
                .slice(0, sparePartsLimit)
                .map((sparePart, index) => (
                  <tr
                    key={sparePart.id}
                    className={`${index % 2 === 0 ? "" : "bg-gray-100"}`}
                  >
                    <td className="p-2 whitespace-nowrap">{sparePart.code}</td>
                    <td className="p-2 whitespace-normal break-all">
                      {sparePart.description}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      {sparePart.refProvider}
                    </td>
                    <td className="p-2 whitespace-nowrap">{sparePart.stock}</td>
                    <td className="p-2 whitespace-normal break-all">
                      {sparePart.family}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      {sparePart.ubication}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <input
                        disabled={isFinished}
                        type="number"
                        className="p-2 border border-gray-300 rounded-md w-20"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                        value={unitsPerSparePart[sparePart.id] || ""}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          setUnitsPerSparePart((prevUnits) => ({
                            ...prevUnits,
                            [sparePart.id]: value,
                          }));
                        }}
                      />
                    </td>
                    <td className="p-2 text-center whitespace-nowrap">
                      <button
                        disabled={isFinished}
                        type="button"
                        className={` ${
                          isFinished
                            ? "bg-gray-400"
                            : "bg-orange-400 hover:bg-orange-600"
                        }  text-white font-semibold p-1 rounded-md ${
                          selectedSpareParts.find(
                            (part) => part.id === sparePart.id
                          ) !== undefined
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={(e) => consumeSparePart(sparePart)}
                      >
                        <SvgConsumeSparePart className="w-8 h-8" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="text-black p-2">
          <p className="text-sm font-bold border-b-2 py-2">
            Peçes de recanvi consumides a la ordre
          </p>
          <div className="p-2">
            {selectedSpareParts.map((selectedPart) => (
              <div
                key={selectedPart.id}
                className=" flex flex-row items-center gap-2"
              >
                <p className="text-blue-600 underline">
                  <Link href={`/spareParts/${selectedPart.sparePart.id}`}>
                    {selectedPart.sparePart.code}
                  </Link>
                </p>
                <p>{" - "}</p>
                <p>{formatDate(selectedPart.creationDate ?? new Date())}</p>
                <p>{" - "}</p>
                <p>{selectedPart.sparePart.description}</p>
                <p>{" - "}</p>
                <p className="font-bold">{" Unitats Consumides:"} </p>
                {selectedPart.quantity}
                <button
                  disabled={isFinished}
                  type="button"
                  className={`${
                    isFinished ? "bg-gray-400" : " bg-red-600 hover:bg-red-400"
                  } text-white font-semibold p-1 rounded-md`}
                  onClick={(e) =>
                    cancelSparePartConsumption(
                      selectedPart.sparePart,
                      selectedPart.quantity
                    )
                  }
                >
                  <SvgRestoreSparePart className="w-8 h-8" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChooseSpareParts;
