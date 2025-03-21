'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SvgMachines, SvgSpinner } from 'app/icons/icons';
import { Asset } from 'app/interfaces/Asset';
import InspectionPoint from 'app/interfaces/inspectionPoint';
import Operator from 'app/interfaces/Operator';
import { CreatePreventiveRequest, Preventive } from 'app/interfaces/Preventive';
import AssetService from 'app/services/assetService';
import InspectionPointService from 'app/services/inspectionPointService';
import MachineService from 'app/services/machineService';
import OperatorService from 'app/services/operatorService';
import PreventiveService from 'app/services/preventiveService';
import ChooseElement from 'components/ChooseElement';
import ChooseInspectionPoint from 'components/inspectionPoint/ChooseInspectionPoint';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import ChooseOperatorV2 from 'components/operator/ChooseOperatorV2';
import { ElementList } from 'components/selector/ElementList';
import ca from 'date-fns/locale/ca';
import { Button } from 'designSystem/Button/Buttons';
import OkronTimePicker from 'designSystem/TimePicker/OkronTimePicker';
import { useRouter } from 'next/navigation';

const PreventiveForm = () => {
  const router = useRouter();
  const apiURL = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const [availableInspectionPoints, setAvailableInspectionPoints] = useState<
    InspectionPoint[]
  >([]);
  const [selectedInspectionPoints, setSelectedInspectionPoints] = useState<
    string[]
  >([]);
  const assetService = new AssetService(apiURL);
  const preventiveService = new PreventiveService(apiURL);
  const inspectionPointService = new InspectionPointService(apiURL);
  const operatorService = new OperatorService(apiURL);
  const machineService = new MachineService(apiURL);
  const { register, handleSubmit, setValue } = useForm<Preventive>();
  const [filterText, setFilterText] = useState<string>('');
  const filteredInspectionPoints = availableInspectionPoints.filter(point =>
    point.description.toLowerCase().includes(filterText.toLowerCase())
  );
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [preventiveDays, setPreventiveDays] = useState(0);
  const [assets, setAssets] = useState<ElementList[]>([]);
  const [selectedAssets, setSelectedAsset] = useState<string[]>([]);
  const [timeExecution, setTimeExecution] = useState<Date | null>(null);

  useEffect(() => {
    const fetchInspectionPoints = async () => {
      try {
        const points = await inspectionPointService.getAllInspectionPoints();
        setAvailableInspectionPoints(points.filter(x => x.active == true));
      } catch (error) {
        console.error('Error fetching inspection points:', error);
      }
    };

    const fetchOperators = async () => {
      await operatorService.getOperators().then(workOperator => {
        setOperators(workOperator);
      });
    };

    const fetchAssets = async () => {
      try {
        const assets = await assetService.getAll();
        const elements: ElementList[] = [];

        const addAssetAndChildren = (asset: Asset) => {
          if (asset.createWorkOrder) {
            elements.push({
              id: asset.id,
              description: asset.description,
            });
          }
          asset.childs.forEach(childAsset => {
            addAssetAndChildren(childAsset);
          });
        };

        assets.forEach(asset => {
          addAssetAndChildren(asset);
        });

        setAssets(elements);
      } catch (error) {
        console.error('Error al obtener activos:', error);
      }
    };

    fetchInspectionPoints();
    fetchOperators();
    fetchAssets();
    let counter = 1;
    const params = new URLSearchParams(window.location.search);
    const numberPreventive = params.get('counter');
    if (numberPreventive || 0 > 0) {
      counter = 1;
    }
  }, []);

  const handleDeleteInspectionPointSelected = (inspectionPointId: string) => {
    setSelectedInspectionPoints(prevSelected =>
      prevSelected.filter(id => id !== inspectionPointId)
    );
  };

  const handleInspectionPointSelected = (inspectionPointId: string) => {
    if (inspectionPointId == '') return;
    setSelectedInspectionPoints(prevSelected => [
      ...prevSelected,
      inspectionPointId,
    ]);
  };

  function convertToCreateWorkOrderRequest(
    preventive: Preventive
  ): CreatePreventiveRequest {
    const createPreventiveRequest: CreatePreventiveRequest = {
      code: preventive.code,
      description: preventive.description,
      startExecution: startDate!,
      days: preventiveDays,
      counter: 0,
      assetId: selectedAssets.map(asset => asset),
      inspectionPointId: selectedInspectionPoints.map(point => point),
      operatorId: selectedOperator.map(operator => operator),
      plannedDuration: '00:00',
    };
    return createPreventiveRequest;
  }

  function getTimeDuration(timeStr: string): Duration {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  }

  const handleSubmitForm = async () => {
    handleSubmit(onSubmit)();
  };

  const onSubmit: SubmitHandler<Preventive> = async data => {
    setIsLoading(true);
    try {
      if (!notValidForm(data)) {
        setIsLoading(false);
        return;
      }
      const response = await preventiveService.createPreventive(
        convertToCreateWorkOrderRequest(data)
      );

      if (response) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          history.back();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowErrorMessage(false);
          setIsLoading(false);
        }, 2000);
      }
    } catch (error) {
      setIsLoading(false);
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 2000);
    }
  };

  function notValidForm(preventive: Preventive) {
    const invalidFields = [];

    if (!preventive.code || preventive.code.trim().length === 0) {
      invalidFields.push('Code');
    }

    if (!preventive.description || preventive.description.trim().length === 0) {
      invalidFields.push('Description');
    }

    if (!startDate) {
      invalidFields.push('StartDate');
    }

    if (preventiveDays === 0) {
      invalidFields.push('PreventiveDays');
    }

    if (selectedInspectionPoints.length === 0) {
      invalidFields.push('SelectedInspectionPoints');
    }

    if (selectedOperator.length === 0) {
      invalidFields.push('SelectedOperator');
    }

    if (selectedAssets.length === 0) {
      invalidFields.push('SelectedAssets');
    }

    if (invalidFields.length > 0) {
      console.log('Invalid fields:', invalidFields);
      alert('Falten dades per assignar al preventiu');
      return false;
    }

    return true;
  }

  const handleDeleteSelectedOperator = (operatorId: string) => {
    setSelectedOperator(prevSelected =>
      prevSelected.filter(id => id !== operatorId)
    );
  };

  const handleSelectedOperator = (operatorId: string) => {
    if (operatorId == '') return;
    setSelectedOperator(prevSelected => [...prevSelected, operatorId]);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleAssetSelected = (assetId: string) => {
    if (assetId == '') return;
    setSelectedAsset(prevSelected => [...prevSelected, assetId]);
  };

  const handleDeleteSelectedAsset = (assetId: string) => {
    setSelectedAsset(prevSelected => prevSelected.filter(id => id !== assetId));
  };

  const handleTimePickerChange = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const currentTimeExecution = new Date();
    currentTimeExecution.setHours(hours, minutes, 0, 0);
    setTimeExecution(currentTimeExecution);
  };
  const renderHeader = () => {
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            Nova Revisió
          </h2>
        </div>
      </div>
    );
  };
  return (
    <MainLayout>
      <Container>
        <div className="w-full">
          {renderHeader()}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto bg-white p-8 rounded shadow-md"
            style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
          >
            <div className="grid grid-cols-4 w-full gap-4 py-4">
              <div className="col-span-2">
                <label
                  className="text-gray-700 font-bold text-lg"
                  htmlFor="code"
                >
                  Codi
                </label>
                <input
                  {...register('code')}
                  id="code"
                  type="text"
                  className="form-input border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="col-span-2">
                <label
                  className="text-gray-700 font-bold mb-2 text-lg"
                  htmlFor="description"
                >
                  Descripció
                </label>
                <input
                  {...register('description')}
                  id="description"
                  type="text"
                  className="form-input border border-gray-300 rounded-md w-full"
                />
              </div>
            </div>
            <div className="flex w-full gap-4 py-4">
              <div className="col-span-2 w-full">
                <label
                  className="block text-gray-700 font-bold mb-2 text-lg"
                  htmlFor="days"
                >
                  Freqüència Dies
                </label>
                <input
                  value={preventiveDays}
                  onChange={e => setPreventiveDays(parseInt(e.target.value))}
                  id="days"
                  type="number"
                  className="form-input border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="flex flex-row  col-span-2 w-full">
                <div className="flex flex-row gap-4 items-center">
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2 text-lg"
                      htmlFor="startExecution"
                    >
                      Primera Execució
                    </label>
                    <DatePicker
                      id="startDate"
                      selected={startDate}
                      onChange={(date: Date) => setStartDate(date)}
                      dateFormat="dd/MM/yyyy"
                      locale={ca}
                      className="border border-gray-300 p-2 rounded-md mr-4 w-full"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2 text-lg"
                      htmlFor="timeExecution"
                    >
                      Temps d'execució
                    </label>
                    <OkronTimePicker
                      selectedTime={
                        timeExecution?.toLocaleTimeString('ca-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) || '00:00'
                      }
                      onTimeChange={handleTimePickerChange}
                      startTme={0}
                      endTime={9}
                      interval={30}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="flex flex-row gap-4 py-4 w-full">
              <ChooseInspectionPoint
                preventiveInspectionPoints={availableInspectionPoints}
                onInspectionPointSelected={handleInspectionPointSelected}
                onDeleteInspectionPointSelected={
                  handleDeleteInspectionPointSelected
                }
                preventiveSelectedInspectionPoints={selectedInspectionPoints}
              />
              <ChooseOperatorV2
                availableOperators={operators}
                preventiveSelectedOperators={selectedOperator}
                onDeleteSelectedOperator={handleDeleteSelectedOperator}
                onSelectedOperator={handleSelectedOperator}
              />
              <ChooseElement
                elements={assets}
                selectedElements={selectedAssets}
                onElementSelected={handleAssetSelected}
                onDeleteElementSelected={handleDeleteSelectedAsset}
                placeholder="Buscar Equip"
                mapElement={asset => ({
                  id: asset.id,
                  description: asset.description,
                })}
                labelText="Equips"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="create"
                onClick={handleSubmitForm}
                disabled={isLoading}
                customStyles="flex gap-2"
              >
                Crear Revisió
                {isLoading && <SvgSpinner className="w-6 h-6" />}
              </Button>
              <Button
                type="cancel"
                onClick={handleCancel}
                disabled={isLoading}
                customStyles="flex gap-2"
              >
                Cancelar
                {isLoading && <SvgSpinner className="w-6 h-6" />}
              </Button>
            </div>
            <div className="flex flex-row py-4 w-full">
              {showSuccessMessage && (
                <div className="bg-green-200 text-green-800 p-4 rounded mb-4 w-1/4">
                  Revisió creada correctament
                </div>
              )}

              {showErrorMessage && (
                <div className="  bg-red-200 text-red-800 p-4 rounded mb-4 w-1/4">
                  Error al crear revisió
                </div>
              )}
            </div>
          </form>
        </div>
      </Container>
    </MainLayout>
  );
};

export default PreventiveForm;
