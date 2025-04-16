'use client';

import { useEffect, useState } from 'react';
import ModalOrderWareHouse from 'app/(pages)/orders/orderForm/components/ModalOrderWareHouse';
import { useWareHouses } from 'app/hooks/useWareHouses';
import { SvgConsumeSparePart, SvgRestoreSparePart } from 'app/icons/icons';
import SparePart, {
  ConsumeSparePart,
  RestoreSparePart,
} from 'app/interfaces/SparePart';
import { WareHouseStockAvailability } from 'app/interfaces/WareHouse';
import WorkOrder, { WorkOrderSparePart } from 'app/interfaces/workOrder';
import SparePartService from 'app/services/sparePartService';
import WorkOrderService from 'app/services/workOrderService';
import { useGlobalStore, useSessionStore } from 'app/stores/globalStore';
import { formatDate } from 'app/utils/utils';
import Link from 'next/link';

interface ChooseSparePartsProps {
  selectedSpareParts: WorkOrderSparePart[];
  setSelectedSpareParts: React.Dispatch<
    React.SetStateAction<WorkOrderSparePart[]>
  >;
  isFinished: boolean;
  workOrder: WorkOrder;
}

const ChooseSpareParts: React.FC<ChooseSparePartsProps> = ({
  selectedSpareParts,
  setSelectedSpareParts,
  isFinished,
  workOrder,
}) => {
  const sparePartService = new SparePartService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const [filteredSpareParts, setFilteredSpareParts] =
    useState<WareHouseStockAvailability[]>();
  const { isModalOpen } = useGlobalStore(state => state);
  const { getStockAvailability, warehouses } = useWareHouses(true);

  const fetch = async () => {
    const responseData = await getStockAvailability();
    if (responseData) setFilteredSpareParts(responseData);
  };
  useEffect(() => {
    fetch();
  }, []);

  const sparePartsLimit = 5;
  const [unitsPerSparePart, setUnitsPerSparePart] = useState<{
    [key: string]: number;
  }>({});
  const { operatorLogged } = useSessionStore(state => state);

  const filterSpareParts = (searchTerm: string) => {
    /* const filtered = availableSpareParts.filter(sparePart => {
      const searchText = searchTerm.toLowerCase();
      if (sparePart.active) {
        return [
          sparePart.code,
          sparePart.description,
          sparePart.refProvider,
          sparePart.family,
          sparePart.ubication,
        ].some(field => field && field.toLowerCase().includes(searchText));
      }
    });

    setFilteredSpareParts(filtered);*/
  };

  const [showModalWareHouse, setShowModalWareHouse] = useState<
    WareHouseStockAvailability | undefined
  >(undefined);

  useEffect(() => {
    if (!isModalOpen && showModalWareHouse) {
      setShowModalWareHouse(undefined);
    }
  }, [isModalOpen]);

  function checkSparePart(sparePart: WareHouseStockAvailability): boolean {
    if (operatorLogged == undefined) {
      alert('Has de tenir un operari fitxat per fer aquesta acció!');
      return false;
    }
    if (sparePart.warehouseStock.length > 1) {
      setShowModalWareHouse(sparePart);
      return true;
    }
    const currentUnits = unitsPerSparePart[sparePart.sparePartId] || 0;

    consumeSparePart(
      sparePart,
      currentUnits,
      sparePart.warehouseStock[0].warehouseId
    );
    return false;
  }

  const onSelectedId = (wareHouseId: string) => {
    const sparePart = showModalWareHouse!;
    const currentUnits = unitsPerSparePart[sparePart.sparePartId] || 0;
    if (
      sparePart.warehouseStock.filter(x => x.warehouseId == wareHouseId)[0]
        .stock < currentUnits ||
      currentUnits == null ||
      currentUnits <= 0
    ) {
      alert('No tens tant stock!');
      return;
    }
    consumeSparePart(sparePart, currentUnits, wareHouseId);
    setShowModalWareHouse(undefined);
  };

  async function consumeSparePart(
    sparePart: WareHouseStockAvailability,
    units: number,
    warehouseId: string
  ) {
    if (sparePart) {
      setUnitsPerSparePart(prevUnits => ({
        ...prevUnits,
        [sparePart.sparePartId]: 0,
      }));

      const sparePartFinded = filteredSpareParts?.filter(
        x => x.sparePartId == sparePart.sparePartId
      )[0];
      if (sparePartFinded) {
        const response = sparePartFinded.warehouseStock.filter(
          x => x.warehouseId == warehouseId
        )[0];
        response.stock = response.stock - units;
      }
      //sparePart.unitsConsum = currentUnits;

      setSelectedSpareParts(prevSelected => [
        ...prevSelected,
        mapSparePartToWorkorderSparePart(sparePart, units, warehouseId),
      ]);
      const splitedName = sparePart.sparePartName.split('-');
      const consRequest: ConsumeSparePart = {
        sparePartId: sparePart.sparePartId,
        unitsSparePart: units,
        workOrderId: workOrder.id,
        operatorId: operatorLogged?.idOperatorLogged!,
        warehouseId: warehouseId,
        workOrderCode: workOrder.code + ' - ' + workOrder.description,
        sparePartCode: splitedName[0].trim(),
        warehouseName:
          warehouses.find(x => x.id == warehouseId)?.description ?? '',
      };
      await sparePartService.consumeSparePart(consRequest);
      await workOrderService.cleanCache();
    } else {
      console.log('Spare part not found in the available parts list.');
    }
  }

  const mapSparePartToWorkorderSparePart = (
    sparePart: WareHouseStockAvailability,
    units: number,
    warehouseId: string
  ): WorkOrderSparePart => {
    const name = sparePart.sparePartName.split('-');
    const finalSparePart = {
      id: sparePart.sparePartId,
      code: name[0],
      description: name[1],
      warehouseId: warehouseId,
      warehouses: warehouses.find(x => x.id == warehouseId),
    };
    const workOrderSparePart: WorkOrderSparePart = {
      id: sparePart.sparePartId,
      quantity: units,
      sparePart: finalSparePart as unknown as SparePart,
      warehouse: '',
      warehouseId: warehouseId,
      warehouseName:
        warehouses.find(x => x.id == warehouseId)?.description ?? '',
    };
    return workOrderSparePart;
  };

  async function cancelSparePartConsumption(
    sparePart: SparePart,
    quantity: number,
    wareHouseId: string
  ) {
    if (operatorLogged == undefined) {
      alert('Has de tenir un operari fitxat per fer aquesta acció!');
      return;
    }
    if (quantity <= 0) {
      alert('Quantitat negativa!');
    }

    const sparePartfinded = filteredSpareParts?.find(
      x => x.sparePartId === sparePart.id
    );
    if (sparePartfinded) {
      if (sparePartfinded.warehouseStock.length > 1) {
        sparePartfinded.warehouseStock.filter(
          x => x.warehouseId == wareHouseId
        )[0].stock += quantity;
      } else {
        sparePartfinded.warehouseStock[0].stock += quantity;
      }
    }

    setSelectedSpareParts(prevSelected =>
      prevSelected.filter(x => x.sparePart.id !== sparePart.id)
    );

    const consRequest: RestoreSparePart = {
      sparePartId: sparePart.id,
      unitsSparePart: quantity,
      workOrderId: workOrder.id,
      operatorId: operatorLogged?.idOperatorLogged!,
      warehouseId: wareHouseId,
      workOrderCode: workOrder.code,
      sparePartCode: sparePart.code,
      warehouseName: '',
    };
    await sparePartService.restoreSparePart(consRequest);
    await workOrderService.cleanCache();
  }

  /*useEffect(() => {
    setFilteredSpareParts(availableSpareParts);
  }, [availableSpareParts]);*/

  return (
    <>
      <div className="flex flex-col flex-grow bg-white rounded-lg p-2 w-full">
        <div className="flex items-center">
          <input
            disabled={isFinished}
            type="text"
            placeholder="Buscador"
            className="p-2 mb-4 border border-gray-300 rounded-md"
            onChange={e => filterSpareParts(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
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
                  Codi - Descripció
                </th>
                <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Magatzem Stock
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
              {filteredSpareParts &&
                filteredSpareParts
                  //.slice(0, sparePartsLimit)
                  .map((sparePart, index) => (
                    <tr
                      key={sparePart.sparePartId}
                      className={`${index % 2 === 0 ? '' : 'bg-gray-100'}`}
                    >
                      <td className="p-2 whitespace-nowrap">
                        {sparePart.sparePartName}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {sparePart.warehouseStock.map((stock, index) => (
                          <div key={index} className="flex justify-start gap-2">
                            <span className="flex border-r-2 border-black pr-2">{`${stock.warehouse}`}</span>
                            <span className="flex font-semibold justify-end">
                              {`${stock.stock} u.`}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <input
                          disabled={isFinished}
                          type="number"
                          className="p-2 border border-gray-300 rounded-md w-20"
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                          value={unitsPerSparePart[sparePart.sparePartId] || ''}
                          onChange={e => {
                            const value = parseInt(e.target.value, 10);
                            setUnitsPerSparePart(prevUnits => ({
                              ...prevUnits,
                              [sparePart.sparePartId]: value,
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
                              ? 'bg-gray-400'
                              : 'bg-orange-400 hover:bg-orange-600'
                          }  text-white font-semibold p-1 rounded-md ${
                            selectedSpareParts.find(
                              part => part.id === sparePart.sparePartId
                            ) !== undefined
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          onClick={e => checkSparePart(sparePart)}
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
            {selectedSpareParts.map(selectedPart => (
              <div
                key={selectedPart.id}
                className=" flex flex-row items-center gap-2"
              >
                <p className="text-blue-600 underline">
                  <Link href={`/spareParts/${selectedPart.sparePart.id}`}>
                    {selectedPart.sparePart.code}
                  </Link>
                </p>
                <p>{' - '}</p>
                <p>{formatDate(selectedPart.creationDate ?? new Date())}</p>
                <p>{' - '}</p>
                <p>{selectedPart.sparePart.description}</p>
                <p>{' - '}</p>
                <p>
                  {warehouses.filter(x => x.id == selectedPart.warehouseId)
                    .length > 0
                    ? warehouses.filter(
                        x => x.id == selectedPart.warehouseId
                      )[0].description
                    : selectedPart.warehouseName}
                </p>
                <p>{' - '}</p>
                <p className="font-bold">{' Unitats Consumides:'} </p>
                {selectedPart.quantity}
                <button
                  disabled={isFinished}
                  type="button"
                  className={`${
                    isFinished ? 'bg-gray-400' : ' bg-red-600 hover:bg-red-400'
                  } text-white font-semibold p-1 rounded-md`}
                  onClick={e =>
                    cancelSparePartConsumption(
                      selectedPart.sparePart,
                      selectedPart.quantity,
                      selectedPart.warehouseId
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
      {showModalWareHouse !== undefined && (
        <ModalOrderWareHouse
          wareHouseIds={showModalWareHouse.warehouseStock.map(
            x => x.warehouseId
          )}
          onSelectedId={onSelectedId}
          wareHouses={warehouses}
        />
      )}
    </>
  );
};

export default ChooseSpareParts;
