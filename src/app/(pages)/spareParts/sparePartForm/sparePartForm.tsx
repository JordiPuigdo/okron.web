'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ProviderToSparePartRequest from 'app/(pages)/providers/[id]/Components/ProviderToSparePartRequest';
import { useWareHouses } from 'app/hooks/useWareHouses';
import SparePart from 'app/interfaces/SparePart';
import SparePartService from 'app/services/sparePartService';
import { HeaderForm } from 'components/layout/HeaderForm';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

import DocumentationSparePart from './Components/DocumentationSparePart';
import SparePartProvidersSelected from './Components/SparePartProvidersSelected';
import SparePartWareHouseSelected from './Components/SparePartWareHouseSelected';

interface SparePartForm {
  sparePartLoaded: SparePart | undefined;
}

const SparePartForm: React.FC<SparePartForm> = ({ sparePartLoaded }) => {
  const router = useRouter();
  const sparePartService = new SparePartService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<SparePart>({
    defaultValues: {},
  });
  const [sparePart, setSparePart] = useState<SparePart | null>(null);

  const { warehouses } = useWareHouses(true);

  function handleAssignWareHouse(wareHouseId: string) {
    setSparePart(prevSparePart => {
      if (!prevSparePart) return prevSparePart;
      const isAlreadyAssigned = prevSparePart.warehouses.find(
        x => x.warehouseId == wareHouseId
      );
      if (isAlreadyAssigned) return prevSparePart;

      const warehouseToAdd = {
        warehouseId: wareHouseId,
        warehouseName: warehouses.find(x => x.id == wareHouseId)!.description,
      };
      const newValue = prevSparePart.warehouses;
      newValue.push(warehouseToAdd);
      setValue('warehouses', newValue);
      return {
        ...prevSparePart,
        warehouses: newValue,
      };
    });
  }
  function handleRemoveWareHouse(wareHouseId: string) {
    setSparePart(prevSparePart => {
      if (!prevSparePart) return prevSparePart;

      const updatedWareHouseIds = prevSparePart.warehouses.filter(
        x => x.warehouseId !== wareHouseId
      );
      setValue('warehouses', updatedWareHouseIds);
      return {
        ...prevSparePart,
        warehouses: updatedWareHouseIds,
      };
    });
  }

  useEffect(() => {
    const fetchSparePart = async () => {
      try {
        setValue('id', sparePartLoaded!.id);
        setValue('code', sparePartLoaded!.code);
        setValue('description', sparePartLoaded!.description);
        setValue('ubication', sparePartLoaded!.ubication);
        setValue('family', sparePartLoaded!.family);
        setValue('brand', sparePartLoaded!.brand);
        setValue('stock', sparePartLoaded!.stock);
        setValue('price', sparePartLoaded!.price);
        setValue('minium', sparePartLoaded!.minium);
        setValue('maximum', sparePartLoaded!.maximum);
        setValue('active', sparePartLoaded!.active);

        setSparePart(sparePartLoaded!);
      } catch (error) {
        setShowErrorMessage('Error al carregar el recanvi');
        setTimeout(() => {
          setShowErrorMessage('');
        }, 5000);
      }
    };
    if (sparePartLoaded) {
      fetchSparePart();
    } else {
      if (sparePart == null) createSparePart();
    }
  }, [SparePartForm, setValue]);

  function createSparePart() {
    const newSparePart: SparePart = {
      id: '',
      code: '',
      description: '',
      family: '',
      ubication: '',
      stock: 0,
      brand: '',
      unitsConsum: 0,
      price: 0,
      active: true,
      documentation: [],
      minium: 0,
      maximum: 0,
      colorRow: '',
      lastMovementConsume: new Date(),
      lastMovement: new Date(),
      lastRestockDate: new Date(),
      warehouses: [],
      providers: [],
    };
    setSparePart(newSparePart);
  }

  function validateForm() {
    return (
      sparePart != null &&
      sparePart.code.length > 0 &&
      sparePart.description.length > 0 &&
      sparePart.providers.length > 0
    );
  }

  const onSubmit = async (sparePart: SparePart) => {
    const isValid = validateForm();
    if (!isValid) {
      alert('Falta informació per a crear el recanvi');
      return;
    }
    if (sparePartLoaded) {
      await sparePartService
        .updateSparePart(sparePart)
        .then(spare => {
          if (spare) {
            setShowSuccessMessage(true);
            setTimeout(() => {
              history.back();
            }, 2000);
          }
        })
        .catch(error => {
          setShowErrorMessage('Error al actualitzar el recanvi');
          setTimeout(() => {
            setShowErrorMessage('');
          }, 5000);
        });
    } else {
      await sparePartService
        .createSparePart(sparePart)
        .then(spare => {
          if (spare) {
            setShowSuccessMessage(true);
            setTimeout(() => {
              history.back();
            }, 2000);
          }
        })
        .catch(error => {
          setShowErrorMessage(
            'Error al crear el recanvi, comprova que el codi sigui únic, sinó contacta amb informàtica'
          );
          setTimeout(() => {
            setShowErrorMessage('');
          }, 5000);
        });
    }
  };

  function handleBack() {
    router.back();
  }

  function handleRemoveProvider(providerId: string) {
    setSparePart(prevSparePart => {
      if (!prevSparePart) return prevSparePart;
      const updatedProviders = prevSparePart.providers.filter(
        x => x.providerId !== providerId
      );
      return {
        ...prevSparePart,
        providers: updatedProviders,
      };
    });
  }
  function handleUpdatePrice(providerId: string, price: string) {
    setSparePart(prevSparePart => {
      if (!prevSparePart) return prevSparePart;
      const updatedProviders = prevSparePart.providers.map(x =>
        x.providerId === providerId ? { ...x, price } : x
      );
      return { ...prevSparePart, providers: updatedProviders };
    });
  }

  function handleUpdateIsDefault(providerId: string) {
    setSparePart(prevSparePart => {
      if (!prevSparePart) return prevSparePart;
      return {
        ...prevSparePart,
        providers: prevSparePart.providers.map(provider =>
          provider.providerId === providerId
            ? { ...provider, isDefault: !provider.isDefault }
            : provider
        ),
      };
    });
  }

  function handleUpdateDiscount(providerId: string, discount: string) {
    setSparePart(prevSparePart => {
      if (!prevSparePart) return prevSparePart;
      const updatedProviders = prevSparePart.providers.map(x =>
        x.providerId === providerId ? { ...x, discount: Number(discount) } : x
      );
      return { ...prevSparePart, providers: updatedProviders };
    });
  }

  function handleUpdateRefProvider(providerId: string, refProvider: string) {
    setSparePart(prevSparePart => {
      if (!prevSparePart) return prevSparePart;
      const updatedProviders = prevSparePart.providers.map(x =>
        x.providerId === providerId ? { ...x, refProvider } : x
      );
      return { ...prevSparePart, providers: updatedProviders };
    });
  }

  const headerText = sparePartLoaded ? 'Editar Recanvi' : 'Crear Recanvi';

  return (
    <>
      <HeaderForm
        header={headerText}
        isCreate={sparePartLoaded ? false : true}
      />
      <div className="flex flex-col flex-1 bg-white p-6 rounded-md shadow-md my-4 gap-6">
        <div className="flex flex-col md:flex-col xl:flex-row gap-6 h-full flex-1 min-h-0">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 p-4 border rounded-md md:w-[20%]"
          >
            <h2 className="font-semibold mb-2">
              {sparePartLoaded
                ? sparePartLoaded.code + ' - ' + sparePartLoaded.description
                : 'Nou Recanvi'}
            </h2>
            <div className="flex flex-row gap-4 items-start w-full">
              <div className="mb-4 w-full">
                <label className="block text-sm font-medium text-gray-600">
                  Codi
                </label>
                <input
                  {...register('code')}
                  id="code"
                  type="text"
                  className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  onChange={e =>
                    setSparePart({ ...sparePart!, code: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex-grow mb-4">
              <label className="block text-sm font-medium text-gray-600">
                Descripció
              </label>
              <input
                {...register('description')}
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                onChange={e =>
                  setSparePart({
                    ...sparePart!,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-row gap-4 items-start w-full">
              <div className="mb-4 w-full">
                <label className="block text-sm font-medium text-gray-600">
                  Ubicació
                </label>
                <input
                  {...register('ubication')}
                  className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  onChange={e =>
                    setSparePart({ ...sparePart!, ubication: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex flex-row gap-4 items-start w-full">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">
                  Stock Min
                </label>
                <input
                  {...register('minium')}
                  className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  onChange={e =>
                    setSparePart({
                      ...sparePart!,
                      minium: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">
                  Stock Max
                </label>
                <input
                  {...register('maximum')}
                  className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  onChange={e =>
                    setSparePart({
                      ...sparePart!,
                      maximum: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex flex-row gap-4 items-start w-full">
              <div className="flex-grow mb-4">
                <label className="block text-sm font-medium text-gray-600">
                  Família
                </label>
                <input
                  {...register('family')}
                  className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  onChange={e =>
                    setSparePart({ ...sparePart!, family: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">
                  Actiu
                </label>
                <input
                  type="checkbox"
                  {...register('active')}
                  checked={true}
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            </div>
          </form>
          <div className="flex flex-col flex-grow border rounded-md p-2 md:w-[40%]">
            <div className="flex flex-col flex-grow">
              <h2 className="font-semibold mb-2">Selecciona Magatzem</h2>
              <div>
                <SparePartWareHouseSelected
                  handleAssignWareHouse={handleAssignWareHouse}
                />
                {warehouses
                  .filter(warehouse =>
                    sparePart?.warehouses?.some(
                      spWarehouse => spWarehouse.warehouseId === warehouse.id
                    )
                  )
                  .map(warehouse => (
                    <div key={warehouse.id} className="border p-2 rounded-md">
                      {warehouse.code} - {warehouse.description}
                      <Button
                        type="delete"
                        className="ml-2"
                        onClick={() => handleRemoveWareHouse(warehouse.id)}
                      >
                        -
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex flex-col flex-grow">
              <h2 className="font-semibold mb-2">Selecciona Proveïdor</h2>
              <ProviderToSparePartRequest
                sparePart={sparePart!}
                setSparePart={setSparePart}
              />
              <SparePartProvidersSelected
                sparePart={sparePart!}
                handleRemoveProvider={handleRemoveProvider}
                handleUpdatePrice={handleUpdatePrice}
                handleUpdateIsDefault={handleUpdateIsDefault}
                handleUpdateDiscount={handleUpdateDiscount}
                handleUpdateRefProvider={handleUpdateRefProvider}
              />
            </div>
          </div>
          <div className="flex w-full md:w-[30%]">
            <DocumentationSparePart sparePart={sparePart!} />
          </div>
        </div>
        <div className="flex mt-auto bottom-0 items-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
            onClick={() => onSubmit(sparePart!)}
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="bg-gray-500 text-white ml-4 px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring focus:border-gray-300"
          >
            Cancelar
          </button>

          {showSuccessMessage && (
            <p className="mt-4 text-green-600">
              Recanvi actualitzat correctament!
            </p>
          )}
          {showErrorMessage && (
            <p className="mt-4 text-red-600">{showErrorMessage}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default SparePartForm;
