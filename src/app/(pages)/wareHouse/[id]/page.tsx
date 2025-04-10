'use client';
import { useEffect, useState } from 'react';
import { useWareHouses } from 'app/hooks/useWareHouses';
import { SvgSpinner } from 'app/icons/icons';
import { WareHouse, WareHouseDetail } from 'app/interfaces/WareHouse';
import { useSessionStore } from 'app/stores/globalStore';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import { Button } from 'designSystem/Button/Buttons';
import { Box, PackageCheck, PackageOpen, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

import WarehouseStock from './Components/WareHouseStock';
import WareHouseStockMovements from './Components/WareHouseStockMovements';

export default function wareHouseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [wareHouse, setWareHouse] = useState<WareHouseDetail>();

  const router = useRouter();
  const { operatorLogged } = useSessionStore();
  const {
    getWareHouse,
    updateWareHouse,
    isLoadingWareHouse,
    isWareHouseSuccessFull,
    warehouses,
  } = useWareHouses(true);

  async function fetch() {
    const wareHouseData = await getWareHouse(params.id);
    setWareHouse(wareHouseData);
  }
  useEffect(() => {
    fetch();
  }, []);

  function handleUpdate() {
    if (
      warehouses.find(
        x =>
          x.code.toLocaleUpperCase() == wareHouse?.code.toLocaleUpperCase() &&
          x.id != params.id
      )
    ) {
      alert('El codi ja existeix');
      return;
    }
    updateWareHouse({
      id: params.id,
      code: wareHouse!.code,
      description: wareHouse!.description,
      active: wareHouse!.active,
    });
  }

  return (
    <MainLayout>
      <Container className="flex flex-col">
        {wareHouse && (
          <>
            <HeaderForm
              isCreate={false}
              header={`${wareHouse?.code} - ${wareHouse?.description}`}
            />
            <div className="flex flex-col w-full bg-white p-6 rounded-md shadow-md my-4 gap-6 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <div className="flex flex-col gap-2 border p-4 rounded-md">
                  <label className="font-semibold">Codi</label>
                  <input
                    className="border p-2 rounded-md"
                    type="text"
                    value={wareHouse?.code}
                    onChange={e =>
                      setWareHouse({ ...wareHouse, code: e.target.value })
                    }
                  />
                  <label className="font-semibold mt-2">Descripció</label>
                  <input
                    className="border p-2 rounded-md"
                    type="text"
                    value={wareHouse?.description}
                    onChange={e =>
                      setWareHouse({
                        ...wareHouse,
                        description: e.target.value,
                      })
                    }
                  />
                  <div className="flex flex-row gap-2 items-center mt-2">
                    <label className="font-semibold">Actiu</label>
                    <input
                      type="checkbox"
                      checked={wareHouse?.active}
                      onChange={e =>
                        setWareHouse({ ...wareHouse, active: e.target.checked })
                      }
                      className="border rounded p-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <div className="flex justify-center mb-1">
                        <PackageCheck size={18} className="text-green-600" />
                      </div>
                      <div className="text-2xl font-semibold">
                        {wareHouse.totalStock}
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>

                    <div className="rounded-lg bg-gray-100 p-2">
                      <div className="flex justify-center mb-1">
                        <PackageOpen size={18} className="text-amber-600" />
                      </div>
                      <div className="text-2xl font-semibold">
                        {wareHouse.lowStock}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sota Stock
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-100 p-2">
                      <div className="flex justify-center mb-1">
                        <Box size={18} className="text-red-600" />
                      </div>
                      <div className="text-2xl font-semibold">
                        {wareHouse.highStock}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sobre Stock
                      </div>
                    </div>
                  </div>
                </div>
                {wareHouse.stock && <WarehouseStock stock={wareHouse.stock} />}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="create"
                  customStyles={`flex items-center gap-2 ${
                    isWareHouseSuccessFull && 'bg-green-500'
                  }`}
                  onClick={handleUpdate}
                >
                  Guardar
                  {isLoadingWareHouse && <SvgSpinner className="ml-2" />}
                </Button>
                <Button
                  onClick={() => router.back()}
                  type="cancel"
                  customStyles="gap-2 flex"
                >
                  Cancelar
                </Button>
              </div>
            </div>

            <WareHouseStockMovements wareHouseId={params.id} />
          </>
        )}
      </Container>
    </MainLayout>
  );
}
