'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Asset } from 'app/interfaces/Asset';
import InspectionPoint from 'app/interfaces/inspectionPoint';
import Operator from 'app/interfaces/Operator';
import {
  Preventive,
  SparePartPreventive,
  UpdatePreventiveRequest,
} from 'app/interfaces/Preventive';
import SparePart from 'app/interfaces/SparePart';
import AssetService from 'app/services/assetService';
import InspectionPointService from 'app/services/inspectionPointService';
import OperatorService from 'app/services/operatorService';
import PreventiveService from 'app/services/preventiveService';
import { formatDate } from 'app/utils/utils';
import ChooseInspectionPoint from 'components/inspectionPoint/ChooseInspectionPoint';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import ChooseOperatorV2 from 'components/operator/ChooseOperatorV2';
import { ElementList } from 'components/selector/ElementList';
import ca from 'date-fns/locale/ca';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/navigation';
import { Button } from 'designSystem/Button/Buttons';

import { PreventiveSparePart } from '../preventiveForm/components/PreventiveSparePart';
import { WorkOrderPerPreventive } from './components/WorkOrderPerPreventive';
import { PreventiveHeader } from '../components/PreventiveHeader';
import {
  BasicInfoSection,
  ScheduleSection,
  AssignmentsSection,
  SparePartsSection,
} from '../components/PreventiveForm';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function EditPreventive({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [preventiveData, setPreventiveData] = useState<Preventive | null>(null);
  const { register, handleSubmit, setValue } = useForm<Preventive>();
  const [availableSpareParts, setAvailableSpareParts] = useState<SparePart[]>(
    []
  );
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string[]>([]);
  const [selectedInspectionPoints, setSelectedInspectionPoints] = useState<
    string[]
  >([]);
  const [availableInspectionPoints, setAvailableInspectionPoints] = useState<
    InspectionPoint[]
  >([]);
  const inspectionPointService = new InspectionPointService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const preventiveService = new PreventiveService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const operatorService = new OperatorService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [assets, setAssets] = useState<ElementList[]>([]);
  const [active, setActive] = useState<boolean>(true);
  const [selectedPreventiveSpareParts, setSelectedPreventiveSpareParts] =
    useState<SparePartPreventive[]>([]);
  const fetchPreventiveData = async (): Promise<Preventive> => {
    try {
      const preventiveData = await preventiveService.getPreventive(
        params.id as string
      );
      return preventiveData;
    } catch (error) {
      console.error('Error fetching machine data:', error);
      return {} as Preventive;
    }
  };

  const fetchInspectionPoints = async (preventive: Preventive) => {
    const inspectionPoints =
      await inspectionPointService.getAllInspectionPoints();
    setAvailableInspectionPoints(
      inspectionPoints.filter(x => x.active == true)
    );

    const selected = preventive?.inspectionPoints?.map(
      inspectionPoints => inspectionPoints.id
    );
    setSelectedInspectionPoints(selected ?? []);
  };

  const fetchAssets = async () => {
    try {
      const assets = await assetService.getAll();
      const elements: ElementList[] = [];

      const addAssetAndChildren = (asset: Asset) => {
        elements.push({
          id: asset.id,
          description: asset.description,
        });

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

  const fetchOperators = async (preventive: Preventive) => {
    await operatorService.getOperators().then(workOperator => {
      setOperators(workOperator);
      const selected = preventive?.operators?.map(operators => operators.id);
      setSelectedOperator(selected ?? []);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (params.id) {
        const data = await fetchPreventiveData();
        if (data) {
          setPreventiveData(data);
          setValue('code', data.code);
          setValue('description', data.description);
          setValue('hours', data.hours);
          setValue('days', data.days);
          setValue('startExecution', data.startExecution);
          const finalData = new Date(data.startExecution);
          setValue('asset', data.asset);
          setValue('active', data.active);
          setValue('lastExecution', data.lastExecution);
          setStartDate(finalData);
          setSelectedPreventiveSpareParts(data.spareParts);
          await fetchInspectionPoints(data);
          await fetchOperators(data);
        }
      }
    };
    fetchData();
  }, [params.id]);

  const handleCancel = () => {
    router.back();
  };

  const onSubmit: SubmitHandler<Preventive> = async (data: any) => {
    try {
      const response = await preventiveService.updatePreventive(
        convertToUpdateWorkOrderRequest(data)
      );

      if (response) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          history.back();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowErrorMessage(false);
        }, 2000);
      }
    } catch (error) {
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 2000);
    }
  };

  function convertToUpdateWorkOrderRequest(
    preventive: Preventive
  ): UpdatePreventiveRequest {
    const updatePreventiveRequest: UpdatePreventiveRequest = {
      id: params.id as string,
      code: preventive.code,
      description: preventive.description,
      startExecution: startDate!,
      days: preventive.days,
      counter: preventive.counter,
      assetId: [preventive.asset?.id],
      inspectionPointId: selectedInspectionPoints.map(point => point),
      operatorId: selectedOperator.map(sparePart => sparePart),
      active: preventive.active,
      plannedDuration: '',
    };
    return updatePreventiveRequest;
  }

  const handleInspectionPointSelected = (pointId: string) => {
    setSelectedInspectionPoints(prevSelected => [...prevSelected, pointId]);
  };
  const handleDeleteInspectionPointSelected = (pointId: string) => {
    setSelectedInspectionPoints(prevSelected =>
      prevSelected.filter(id => id !== pointId)
    );
  };
  const handleSelectedOperator = (id: string) => {
    setSelectedOperator(prevSelected => [...prevSelected, id]);
  };
  const handleDeleteSelectedOperator = (idOperator: string) => {
    setSelectedOperator(prevSelected =>
      prevSelected.filter(id => id !== idOperator)
    );
  };

  return (
    <MainLayout>
      <Container>
        <div className="min-h-screen bg-gray-50 pb-8">
          <PreventiveHeader
            preventive={preventiveData || undefined}
            isEditMode={true}
            errorMessage={error || undefined}
          />

          <div className="mt-4 space-y-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <BasicInfoSection register={register} />

                <ScheduleSection
                  preventiveDays={preventiveData?.days || 0}
                  startDate={startDate}
                  lastExecution={
                    preventiveData?.lastExecution
                      ? formatDate(preventiveData.lastExecution, false)
                      : undefined
                  }
                  onDaysChange={days => setValue('days', days)}
                  onStartDateChange={setStartDate}
                  showLastExecution={true}
                />

                <AssignmentsSection
                  availableInspectionPoints={availableInspectionPoints}
                  selectedInspectionPoints={selectedInspectionPoints}
                  onInspectionPointSelected={handleInspectionPointSelected}
                  onDeleteInspectionPointSelected={
                    handleDeleteInspectionPointSelected
                  }
                  availableOperators={operators.filter(x => x.active == true)}
                  selectedOperators={selectedOperator}
                  onSelectedOperator={handleSelectedOperator}
                  onDeleteSelectedOperator={handleDeleteSelectedOperator}
                />

                <SparePartsSection
                  selectedSpareParts={selectedPreventiveSpareParts}
                  onSparePartsChange={setSelectedPreventiveSpareParts}
                />

                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-gray-700 font-bold text-sm">
                      Activa:
                    </label>
                    <input
                      {...register('active')}
                      id="active"
                      type="checkbox"
                      className="w-4 h-4"
                    />
                  </div>

                  {preventiveData?.asset && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700">
                        Equip assignat: {preventiveData.asset.description}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button type="create" onClick={handleSubmit(onSubmit)}>
                      Actualitzar Revisió
                    </Button>
                    <Button type="cancel" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </div>

                  {showSuccessMessage && (
                    <div className="bg-green-200 text-green-800 p-4 rounded-lg mt-4">
                      Revisió actualitzada correctament
                    </div>
                  )}

                  {showErrorMessage && (
                    <div className="bg-red-200 text-red-800 p-4 rounded-lg mt-4">
                      Error al actualitzar revisió
                    </div>
                  )}
                </div>
              </div>
            </form>

            <WorkOrderPerPreventive id={params.id} />
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}
