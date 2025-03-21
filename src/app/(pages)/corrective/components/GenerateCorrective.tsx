'use client';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { SvgMachines, SvgSpinner } from 'app/icons/icons';
import { Asset } from 'app/interfaces/Asset';
import { Corrective } from 'app/interfaces/Corrective';
import { DowntimesReasons } from 'app/interfaces/Production/Downtimes';
import { UserType } from 'app/interfaces/User';
import { StateWorkOrder, WorkOrderType } from 'app/interfaces/workOrder';
import AssetService from 'app/services/assetService';
import WorkOrderService from 'app/services/workOrderService';
import { useGlobalStore, useSessionStore } from 'app/stores/globalStore';
import { translateStateWorkOrder } from 'app/utils/utils';
import { ErrorMessage } from 'components/Alerts/ErrorMessage';
import { SuccessfulMessage } from 'components/Alerts/SuccesfullMessage';
import ChooseElement from 'components/ChooseElement';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { ElementList } from 'components/selector/ElementList';
import { ca } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

import ModalDowntimeReasons from './ModalDowntimeReasons';
import {
  convertToCreateWorkOrderRequest,
  isValidData,
} from './utilsGenerateCorrective';

interface GenerateCorrectiveProps {
  assetId?: string | null;
  description?: string | null;
  stateWorkOrder?: StateWorkOrder | null;
  operatorIds?: string[];
  showReasons?: boolean;
  originalWorkOrderId?: string;
  originalWorkOrderCode?: string;
}
const GenerateCorrective: React.FC<GenerateCorrectiveProps> = ({
  assetId,
  description,
  stateWorkOrder,
  operatorIds,
  showReasons = true,
  originalWorkOrderId,
  originalWorkOrderCode,
}) => {
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);
  const [selectedOperator, setSelectedOperator] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedDowntimeReasons, setSelectedDowntimeReasons] = useState<
    DowntimesReasons | undefined
  >(undefined);
  const [assets, setAssets] = useState<ElementList[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue } = useForm<Corrective>();

  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const { loginUser, operatorLogged } = useSessionStore(state => state);
  const [descriptionCorrective, setDescriptionCorrective] =
    useState(description);
  const [stateCorrective, setStateCorrective] = useState<StateWorkOrder>(
    stateWorkOrder ?? StateWorkOrder.Waiting
  );
  const [showDowntimeReasonsModal, setShowDowntimeReasonsModal] =
    useState(false);
  const { operators } = useOperatorHook();
  const { isModalOpen } = useGlobalStore();
  const [code, setCode] = useState<string>('');

  async function fetchFormData() {
    await createCode();
    await fetchAssets();
    if (operatorIds != undefined) {
      setSelectedOperator(operatorIds);
    }
  }

  async function createCode() {
    await workOrderService
      .countByWorkOrderType(
        loginUser?.userType == UserType.Production
          ? WorkOrderType.Ticket
          : WorkOrderType.Corrective
      )
      .then(numberCorrectives => {
        numberCorrectives = numberCorrectives += 1;
        const paddedCounter = numberCorrectives
          ? numberCorrectives.toString().padStart(4, '0')
          : '0000';
        let code = loginUser?.userType == UserType.Production ? 'TICK' : 'COR';
        code = code + paddedCounter;
        setCode(code);
        setValue('code', code);
      })
      .catch(error => {
        // setErrorMessage('Error Operaris: ' + error);  TODO-ERROR
      });
  }

  async function fetchAssets() {
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

      if (assetId != undefined) {
        setSelectedId(assetId);
      }
    } catch (error) {
      console.error('Error al obtener activos:', error);
    }
  }

  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    if (loginUser?.userType === UserType.Production && selectedId.length > 0) {
      setShowDowntimeReasonsModal(true);
    }
  }, [selectedId]);

  useEffect(() => {
    setValue('stateWorkOrder', StateWorkOrder.Waiting);
  }, [setValue]);

  const onSubmit: SubmitHandler<Corrective> = async data => {
    setIsLoading(true);
    if (
      !isValidData(
        data,
        selectedId,
        loginUser!,
        selectedOperator,
        selectedDowntimeReasons
      )
    ) {
      setIsLoading(false);
      alert('Falten dades per completar');
      return;
    }
    if (operatorLogged == undefined) {
      setIsLoading(false);
      alert('Has de tenir un operari fitxat per fer aquesta acció');
      return;
    }
    data.startTime = startDate || new Date();
    await workOrderService
      .createWorkOrder(
        convertToCreateWorkOrderRequest(
          data,
          selectedId,
          loginUser!,
          selectedOperator,
          selectedDowntimeReasons,
          operatorLogged,
          originalWorkOrderId || '',
          originalWorkOrderCode || ''
        ),
        data.machineId
      )
      .then(aviableMachines => {
        setShowSuccessMessage(true);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch(error => {
        setIsLoading(false);
        // setErrorMessage('Error Màquines: ' + error); TODO-ERROR
      });
  };

  const handleSelectedOperator = (id: string) => {
    setSelectedOperator([...selectedOperator, id]);
  };
  const handleDeleteSelectedOperator = (operatorId: string) => {
    setSelectedOperator(prevSelected =>
      prevSelected.filter(id => id !== operatorId)
    );
  };

  useEffect(() => {
    setShowDowntimeReasonsModal(isModalOpen);
  }, [isModalOpen]);

  const onSelectedDowntimeReasons = (downtimeReasons: DowntimesReasons) => {
    setShowDowntimeReasonsModal(false);
    setSelectedDowntimeReasons(downtimeReasons);
  };

  const renderHeader = () => {
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            {loginUser?.userType === UserType.Maintenance
              ? 'Nova Avaria'
              : 'Nou Tiquet'}
          </h2>
        </div>
      </div>
    );
  };
  return (
    <>
      {showDowntimeReasonsModal && showReasons && (
        <ModalDowntimeReasons
          selectedId={selectedId}
          onSelectedDowntimeReasons={onSelectedDowntimeReasons}
        />
      )}
      {renderHeader()}
      <div className=" bg-white rounded-xl p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="flex flex-col sm:flex-row">
            <div className="mb-6 sm:w-1/2">
              <label
                htmlFor="code"
                className="block text-xl font-medium text-gray-700 mb-2"
              >
                Núm. Sèrie
              </label>
              <input
                {...register('code')}
                type="text"
                id="code"
                name="code"
                readOnly
                className="p-3 border border-gray-300 rounded-md w-full"
              />
            </div>
            <div className="mb-6 sm:w-1/2 sm:ml-6">
              <label
                htmlFor="description"
                className="block text-xl font-medium text-gray-700 mb-2"
              >
                Descripció
              </label>
              <input
                {...register('description')}
                type="text"
                id="description"
                name="description"
                className="p-3 border border-gray-300 rounded-md w-full"
                placeholder="Descripció"
                onChange={e => setDescriptionCorrective(e.target.value)}
                value={descriptionCorrective!}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            <div className="mb-6 sm:w-1/2">
              <label
                htmlFor="machine"
                className="block text-xl font-medium text-gray-700 mb-2"
              >
                {loginUser?.userType === UserType.Maintenance
                  ? 'Equip'
                  : 'Màquina'}
              </label>
              <AutocompleteSearchBar
                elements={assets}
                setCurrentId={setSelectedId}
                placeholder={
                  loginUser?.userType === UserType.Maintenance
                    ? 'Buscar Equip'
                    : 'Buscar Màquina'
                }
                selectedId={assetId != undefined ? assetId : null}
              />
              {selectedId.length > 0 && (
                <div className="flex gap-4 items-center mt-4">
                  {assets
                    .filter(x => x.id === selectedId)
                    .map(machine => (
                      <div key={machine.id}>
                        <p>Equip Seleccionat: {machine.description}</p>
                      </div>
                    ))}
                  <div>
                    <button
                      className="bg-okron-btDelete hover:bg-okron-btDeleteHover text-white rounded-xl py-2 px-4 text-sm"
                      onClick={e => {
                        setSelectedId('');
                        setSelectedDowntimeReasons(undefined);
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mb-6 sm:w-1/2 sm:ml-6">
              {loginUser?.userType === UserType.Maintenance ? (
                <>
                  <label
                    htmlFor="stateWorkOrder"
                    className="block text-xl font-medium text-gray-700 mb-2"
                  >
                    Estat
                  </label>
                  <select
                    {...register('stateWorkOrder', { valueAsNumber: true })}
                    id="stateWorkOrder"
                    name="stateWorkOrder"
                    className="p-3 border border-gray-300 rounded-md w-full"
                    onChange={e =>
                      setStateCorrective(
                        e.target.value as unknown as StateWorkOrder
                      )
                    }
                    value={stateCorrective}
                  >
                    <option value={StateWorkOrder.OnGoing}>
                      {translateStateWorkOrder(StateWorkOrder.OnGoing)}
                    </option>
                    <option value={StateWorkOrder.Waiting}>
                      {translateStateWorkOrder(StateWorkOrder.Waiting)}
                    </option>
                  </select>
                </>
              ) : (
                <>
                  <label
                    htmlFor="stateWorkOrder"
                    className="block text-xl font-medium text-gray-700 mb-2"
                  >
                    Motiu
                  </label>
                  <input
                    className="p-3 border border-gray-300 rounded-md w-full"
                    readOnly
                    value={
                      selectedDowntimeReasons != undefined
                        ? selectedDowntimeReasons?.description
                        : ''
                    }
                    onClick={() =>
                      selectedId.length > 0 && setShowDowntimeReasonsModal(true)
                    }
                  />
                </>
              )}
            </div>
          </div>
          {loginUser?.userType === UserType.Maintenance && (
            <div className="flex flex-col sm:flex-row">
              <div className="mb-6 sm:mr-6">
                <label
                  htmlFor="startDate"
                  className="block text-xl font-medium text-gray-700 mb-2"
                >
                  Data Inici
                </label>
                <DatePicker
                  id="startDate"
                  selected={startDate}
                  onChange={(date: Date) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  locale={ca}
                  className="p-3 border border-gray-300 rounded-md text-lg"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xl font-medium text-gray-700 mb-2">
                  Operaris
                </label>
                {operators !== undefined && operators.length > 0 && (
                  <ChooseElement
                    elements={operators.filter(x => x.active == true)}
                    selectedElements={selectedOperator}
                    onElementSelected={handleSelectedOperator}
                    onDeleteElementSelected={handleDeleteSelectedOperator}
                    placeholder="Buscar Operaris"
                    mapElement={operator => ({
                      id: operator.id,
                      description: operator.name,
                    })}
                  />
                )}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row mb-8">
            <button
              type="submit"
              disabled={isLoading}
              className={`${
                showSuccessMessage
                  ? 'bg-green-500'
                  : showErrorMessage
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              } hover:${
                showSuccessMessage
                  ? 'bg-green-700'
                  : showErrorMessage
                  ? 'bg-red-700'
                  : 'bg-blue-700'
              } text-white font-bold py-2 px-4 rounded mt-6 mb-4 sm:mb-0 sm:mr-2 flex items-center justify-center`}
            >
              Crear{' '}
              {loginUser?.userType === UserType.Maintenance
                ? 'Avaria'
                : 'Tiquet'}
              {isLoading && <SvgSpinner style={{ marginLeft: '0.5rem' }} />}
            </button>
            {assetId == undefined && (
              <button
                type="button"
                disabled={isLoading}
                onClick={e => router.back()}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-6 sm:ml-2"
              >
                Cancelar
              </button>
            )}
          </div>

          {showSuccessMessage && (
            <SuccessfulMessage
              title={
                loginUser?.userType == UserType.Production
                  ? 'Tiquet Creat ' + code
                  : 'Averia Creada ' + code
              }
              message={
                descriptionCorrective !== undefined
                  ? descriptionCorrective!
                  : ''
              }
            />
          )}

          {showErrorMessage && (
            <ErrorMessage
              title={'Error al crear avaría'}
              message="Contacte amb el teu responsable"
            />
          )}
        </form>
      </div>
    </>
  );
};

export default GenerateCorrective;
