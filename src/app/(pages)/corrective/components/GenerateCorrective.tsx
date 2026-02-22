'use client';

import react from 'react';
import DatePicker from 'react-datepicker';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgMachines, SvgSpinner } from 'app/icons/icons';
import { Asset } from 'app/interfaces/Asset';
import { Corrective } from 'app/interfaces/Corrective';
import { OperatorType } from 'app/interfaces/Operator';
import { DowntimesReasons } from 'app/interfaces/Production/Downtimes';
import { UserType } from 'app/interfaces/User';
import { StateWorkOrder, WorkOrderType } from 'app/interfaces/workOrder';
import AssetService from 'app/services/assetService';
import { workOrderService } from 'app/services/workOrderService';
import { useGlobalStore, useSessionStore } from 'app/stores/globalStore';
import { translateStateWorkOrder } from 'app/utils/utils';
import ChooseElement from 'components/ChooseElement';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { ElementList } from 'components/selector/ElementList';
import { ca } from 'date-fns/locale';
import { Button } from 'designSystem/Button/Buttons';
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
  onCancel?: () => void;
}
const GenerateCorrective: React.FC<GenerateCorrectiveProps> = ({
  assetId,
  description,
  stateWorkOrder,
  operatorIds,
  showReasons = true,
  originalWorkOrderId,
  originalWorkOrderCode,
  onCancel,
}) => {
  const { t } = useTranslations();
  const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);
  const [selectedOperator, setSelectedOperator] = react.useState<string[]>([]);
  const [selectedId, setSelectedId] = react.useState<string>('');
  const [selectedDowntimeReasons, setSelectedDowntimeReasons] = react.useState<
    DowntimesReasons | undefined
  >(undefined);
  const [assets, setAssets] = react.useState<ElementList[]>([]);

  const [isLoading, setIsLoading] = react.useState(false);
  const { register, handleSubmit, setValue } = useForm<Corrective>();

  const router = useRouter();

  const [startDate, setStartDate] = react.useState<Date | null>(new Date());
  const [showSuccessMessage, setShowSuccessMessage] = react.useState(false);
  const [showErrorMessage, setShowErrorMessage] = react.useState(false);
  const { loginUser, operatorLogged } = useSessionStore(state => state);
  const [descriptionCorrective, setDescriptionCorrective] =
    react.useState(description);
  const [stateCorrective, setStateCorrective] = react.useState<StateWorkOrder>(
    stateWorkOrder ?? StateWorkOrder.Waiting
  );
  const [showDowntimeReasonsModal, setShowDowntimeReasonsModal] =
    react.useState(false);
  const { operators } = useOperatorHook();
  const { isModalOpen } = useGlobalStore();
  const [code, setCode] = react.useState<string>('');

  async function fetchFormData() {
    await createCode();
    await fetchAssets();
    if (operatorIds != undefined) {
      //setSelectedOperator(operatorIds);
    }
  }

  async function createCode() {
    await workOrderService
      .generateWorkOrderCode(
        loginUser?.userType == UserType.Production
          ? WorkOrderType.Ticket
          : WorkOrderType.Corrective
      )
      .then(newCode => {
        setCode(newCode);
        setValue('code', newCode);
      })
      .catch(() => {
        setShowErrorMessage(true);
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
            description: asset.description + ' - ' + (asset.brand ?? ''),
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

  react.useEffect(() => {
    fetchFormData();
  }, []);

  react.useEffect(() => {
    if (loginUser?.userType === UserType.Production && selectedId.length > 0) {
      setShowDowntimeReasonsModal(true);
    }
  }, [selectedId]);

  react.useEffect(() => {
    setValue('stateWorkOrder', stateCorrective);
  }, [setValue, stateCorrective]);

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
      alert(t('missing.data.complete'));
      return;
    }
    if (operatorLogged == undefined) {
      setIsLoading(false);
      alert(t('need.clocked.operator.action'));
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
      .then(() => {
        setShowSuccessMessage(true);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch(() => {
        setIsLoading(false);
        setShowErrorMessage(true);
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

  react.useEffect(() => {
    setShowDowntimeReasonsModal(isModalOpen);
  }, [isModalOpen]);

  const onSelectedDowntimeReasons = (downtimeReasons: DowntimesReasons) => {
    setShowDowntimeReasonsModal(false);
    setSelectedDowntimeReasons(downtimeReasons);
  };


  return (
    <>
      {showDowntimeReasonsModal && showReasons && (
        <ModalDowntimeReasons
          selectedId={selectedId}
          onSelectedDowntimeReasons={onSelectedDowntimeReasons}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <SvgMachines />
            {loginUser?.userType === UserType.Maintenance
              ? t('new.breakdown')
              : t('new.ticket')}
          </h2>
          <p className="text-sm text-gray-600">
            {loginUser?.userType === UserType.Maintenance
              ? t('breakdown.create.description')
              : t('ticket.create.description')}
          </p>
        </div>

        <div className="flex-1 p-6">
          <form
            id="corrective-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('serial.number')}
                </label>
                <input
                  {...register('code')}
                  type="text"
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('description')}
                </label>
                <input
                  {...register('description')}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('description')}
                  onChange={e => setDescriptionCorrective(e.target.value)}
                  value={descriptionCorrective!}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {loginUser?.userType === UserType.Maintenance
                    ? t('equipment')
                    : t('machine')}
                </label>
                <AutocompleteSearchBar
                  elements={assets}
                  setCurrentId={setSelectedId}
                  placeholder={
                    loginUser?.userType === UserType.Maintenance
                      ? t('search.equipment')
                      : t('search.machine')
                  }
                  selectedId={assetId != undefined ? assetId : null}
                />
                {selectedId.length > 0 && (
                  <div className="flex gap-3 items-center mt-3 p-3 bg-blue-50 rounded-lg">
                    {assets
                      .filter(x => x.id === selectedId)
                      .map(machine => (
                        <span
                          key={machine.id}
                          className="text-sm text-gray-700"
                        >
                          {t('selected.equipment')}:{' '}
                          <strong>{machine.description}</strong>
                        </span>
                      ))}
                    <Button
                      type="delete"
                      size="sm"
                      onClick={() => {
                        setSelectedId('');
                        setSelectedDowntimeReasons(undefined);
                      }}
                    >
                      {t('delete')}
                    </Button>
                  </div>
                )}
              </div>

              <div>
                {loginUser?.userType === UserType.Maintenance ? (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('state')}
                    </label>
                    <select
                      {...register('stateWorkOrder', { valueAsNumber: true })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      onChange={e =>
                        setStateCorrective(
                          Number(e.target.value) as StateWorkOrder
                        )
                      }
                      value={stateCorrective}
                    >
                      <option
                        className="bg-white text-gray-900"
                        value={StateWorkOrder.OnGoing}
                      >
                        {translateStateWorkOrder(StateWorkOrder.OnGoing, t)}
                      </option>
                      <option
                        className="bg-white text-gray-900"
                        value={StateWorkOrder.Waiting}
                      >
                        {translateStateWorkOrder(StateWorkOrder.Waiting, t)}
                      </option>
                    </select>
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('reason')}
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      readOnly
                      value={
                        selectedDowntimeReasons != undefined
                          ? selectedDowntimeReasons?.description
                          : ''
                      }
                      onClick={() =>
                        selectedId.length > 0 &&
                        setShowDowntimeReasonsModal(true)
                      }
                    />
                  </>
                )}
              </div>
            </div>

            {loginUser?.userType === UserType.Maintenance && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('start.date')}
                  </label>
                  <DatePicker
                    id="startDate"
                    selected={startDate}
                    onChange={(date: Date) => setStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    locale={ca}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('operators')}
                  </label>
                  {operators !== undefined && operators.length > 0 && (
                    <ChooseElement
                      elements={operators.filter(
                        x =>
                          x.active == true &&
                          x.operatorType == OperatorType.Maintenance
                      )}
                      selectedElements={selectedOperator}
                      onElementSelected={handleSelectedOperator}
                      onDeleteElementSelected={handleDeleteSelectedOperator}
                      placeholder={t('search.operators')}
                      mapElement={operator => ({
                        id: operator.id,
                        description: operator.name,
                      })}
                    />
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="flex justify-between items-center gap-3 px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 text-sm">
            {showSuccessMessage && (
              <span className="text-green-600 font-medium">
                {loginUser?.userType === UserType.Production
                  ? t('ticket.created') + ' ' + code
                  : t('breakdown.created') + ' ' + code}
              </span>
            )}
            {showErrorMessage && (
              <span className="text-red-600 font-medium">
                {t('error.creating.breakdown')}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {assetId == undefined && (
              <Button
                type="cancel"
                customStyles="px-5 py-2.5"
                disabled={isLoading}
                onClick={() => (onCancel ? onCancel() : router.back())}
              >
                {t('cancel')}
              </Button>
            )}
            <Button
              type="create"
              onClick={handleSubmit(onSubmit)}
              customStyles="px-5 py-2.5 gap-2 flex items-center"
              disabled={isLoading}
            >
              {t('create')}{' '}
              {loginUser?.userType === UserType.Maintenance
                ? t('breakdown')
                : t('ticket')}
              {isLoading && <SvgSpinner className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GenerateCorrective;
