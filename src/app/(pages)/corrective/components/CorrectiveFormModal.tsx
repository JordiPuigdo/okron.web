'use client';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAssetHook } from 'app/hooks/useAssetHook';
import { useCustomers } from 'app/hooks/useCustomers';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { useTranslations } from 'app/hooks/useTranslations';
import { useWorkOrders } from 'app/hooks/useWorkOrders';
import { SvgSpinner } from 'app/icons/icons';
import { Corrective } from 'app/interfaces/Corrective';
import { Customer } from 'app/interfaces/Customer';
import { OperatorType } from 'app/interfaces/Operator';
import { DowntimesReasons } from 'app/interfaces/Production/Downtimes';
import { UserType } from 'app/interfaces/User';
import {
  OriginWorkOrder,
  StateWorkOrder,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import { workOrderService } from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import { translateStateWorkOrder } from 'app/utils/utils';
import ChooseElement from 'components/ChooseElement';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { Textarea } from 'components/textarea';
import { Input } from 'components/ui/input';
import { ca } from 'date-fns/locale';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import { AlertCircle, Users, Wrench } from 'lucide-react';

import ModalDowntimeReasons from './ModalDowntimeReasons';
import {
  convertToCreateWorkOrderRequest,
  isValidData,
} from './utilsGenerateCorrective';

interface CorrectiveFormModalProps {
  isVisible: boolean;
  onSuccess?: (workOrderId?: string) => void;
  onCancel: () => void;
}

type TabType = 'basic' | 'operators' | 'downtimeReasons';

export function CorrectiveFormModal({
  isVisible,
  onSuccess,
  onCancel,
}: CorrectiveFormModalProps) {
  const { t } = useTranslations();
  const { loginUser, operatorLogged, config } = useSessionStore();
  const isCRM = config?.isCRM;
  const isProduction = loginUser?.userType === UserType.Production;
  const isMaintenance = loginUser?.userType === UserType.Maintenance;

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const { register, handleSubmit, setValue, reset } = useForm<Corrective>();
  const { operators } = useOperatorHook();
  const { customers, getById } = useCustomers();
  const { assets } = useAssetHook();
  const { createRepairWorkOrder, generateWorkOrderCode } = useWorkOrders();

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [selectedId, setSelectedId] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<string[]>([]);
  const [stateCorrective, setStateCorrective] = useState<StateWorkOrder>(
    StateWorkOrder.Waiting
  );
  const [selectedDowntimeReasons, setSelectedDowntimeReasons] = useState<
    DowntimesReasons | undefined
  >(undefined);
  const [showDowntimeReasonsModal, setShowDowntimeReasonsModal] =
    useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >(undefined);
  const [selectedInstallationId, setSelectedInstallationId] = useState<
    string | undefined
  >(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!isVisible) return;

    resetForm();
    generateCode();
    setActiveTab('basic');
  }, [isVisible]);

  const resetForm = () => {
    reset();
    setDescription('');
    setStartDate(new Date());
    setSelectedId('');
    setSelectedOperator([]);
    setStateCorrective(StateWorkOrder.Waiting);
    setSelectedDowntimeReasons(undefined);
    setSelectedCustomerId(undefined);
    setSelectedCustomer(undefined);
    setSelectedInstallationId(undefined);
    setSuccessMessage(undefined);
    setErrorMessage(undefined);
  };

  const generateCode = async () => {
    try {
      const workOrderType = isProduction
        ? WorkOrderType.Ticket
        : WorkOrderType.Corrective;
      const newCode = await generateWorkOrderCode(workOrderType);
      setCode(newCode);
      setValue('code', newCode);
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  useEffect(() => {
    if (isProduction && selectedId.length > 0) {
      setShowDowntimeReasonsModal(true);
    }
  }, [selectedId, isProduction]);

  const onSubmit: SubmitHandler<Corrective> = async data => {
    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      if (isCRM) {
        const formData = {
          code,
          description,
          initialDateTime: startDate || new Date(),
          customerId: selectedCustomerId,
          installationId: selectedInstallationId,
          stateWorkOrder: StateWorkOrder.Waiting,
          workOrderType: WorkOrderType.Corrective,
          originWorkOrder: OriginWorkOrder.Maintenance,
          operatorId: selectedOperator,
          userId: loginUser?.agentId,
          assetId: selectedId,
        };

        if (!formData.customerId) {
          setErrorMessage(t('validation.customer.required'));
          setIsLoading(false);
          return;
        }

        const response = await createRepairWorkOrder(formData);
        setSuccessMessage(t('breakdown.created') + ' ' + code);
        setTimeout(() => {
          onSuccess?.(response.id);
        }, 1500);
      } else {
        if (
          !isValidData(
            data,
            selectedId,
            loginUser!,
            selectedOperator,
            selectedDowntimeReasons
          )
        ) {
          setErrorMessage(t('missing.data.complete'));
          setIsLoading(false);
          return;
        }

        if (!operatorLogged) {
          setErrorMessage(t('need.clocked.operator.action'));
          setIsLoading(false);
          return;
        }

        data.startTime = startDate || new Date();
        const workOrderData = convertToCreateWorkOrderRequest(
          data,
          selectedId,
          loginUser!,
          selectedOperator,
          selectedDowntimeReasons,
          operatorLogged,
          '',
          ''
        );

        await workOrderService.createWorkOrder(workOrderData, data.machineId);
        setSuccessMessage(t('breakdown.created') + ' ' + code);
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating work order:', error);
      setErrorMessage(
        error instanceof Error ? error.message : t('error.creating.breakdown')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectedOperator = (id: string) => {
    setSelectedOperator(prev => [...prev, id]);
  };

  const handleDeleteSelectedOperator = (operatorId: string) => {
    setSelectedOperator(prev => prev.filter(id => id !== operatorId));
  };

  const handleSelectedCustomer = async (id: string) => {
    setSelectedCustomerId(id);
    const customer = await getById(id);
    setSelectedCustomer(customer);
  };

  const handleAssetSelected = (assetId: string) => {
    if (!assetId) return;
    setSelectedId(assetId);
  };

  const handleDeleteSelectedAsset = () => {
    setSelectedId('');
    setSelectedDowntimeReasons(undefined);
  };

  const getTabs = () => {
    const tabs = [
      { id: 'basic' as TabType, label: t('basic.info'), icon: Wrench },
      { id: 'operators' as TabType, label: t('operators'), icon: Users },
    ];

    if (isProduction) {
      tabs.push({
        id: 'downtimeReasons' as TabType,
        label: t('downtime.reasons'),
        icon: AlertCircle,
      });
    }

    return tabs;
  };

  const tabs = getTabs();

  return (
    <>
      <Modal2
        isVisible={isVisible}
        setIsVisible={onCancel}
        type="center"
        width="w-full max-w-4xl"
        height="h-[85vh]"
        className="overflow-hidden flex flex-col shadow-2xl"
        closeOnEsc
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 p-6 pb-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {isCRM
                    ? t('incident.management')
                    : isMaintenance
                    ? t('new.breakdown')
                    : t('new.ticket')}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('create.corrective.description')} - {code}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <Wrench className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-gray-700">
                  {isMaintenance ? t('breakdown') : t('ticket')}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-shrink-0 flex gap-1 px-6 border-b bg-gray-50">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('serial.number')}
                      </label>
                      <Input
                        {...register('code')}
                        value={code}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('start.date')}
                      </label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date: Date) => setStartDate(date)}
                        dateFormat="dd/MM/yyyy"
                        locale={ca}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('description')}
                    </label>
                    <Textarea
                      {...register('description')}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={t('description')}
                      rows={3}
                    />
                  </div>

                  {isCRM && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('customer')}
                        </label>
                        <ChooseElement
                          elements={customers}
                          selectedElements={
                            selectedCustomerId ? [selectedCustomerId] : []
                          }
                          onElementSelected={handleSelectedCustomer}
                          onDeleteElementSelected={() => {
                            setSelectedCustomerId(undefined);
                            setSelectedCustomer(undefined);
                          }}
                          placeholder={t('search.customer')}
                          mapElement={customer => ({
                            id: customer.id,
                            description: customer.name || customer.id,
                          })}
                        />
                      </div>

                      {selectedCustomer?.installations &&
                        selectedCustomer.installations.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('installation')}
                            </label>
                            <select
                              value={selectedInstallationId || ''}
                              onChange={e =>
                                setSelectedInstallationId(e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="">
                                {t('select.installation')}
                              </option>
                              {selectedCustomer.installations.map(inst => (
                                <option key={inst.id} value={inst.id}>
                                  {inst.code || inst.id}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isMaintenance ? t('equipment') : t('machine')}
                    </label>
                    <AutocompleteSearchBar
                      elements={
                        assets?.filter(a => a.createWorkOrder).map(a => ({
                          id: a.id,
                          description: `${a.description} - ${a.brand || ''}`,
                        })) || []
                      }
                      setCurrentId={handleAssetSelected}
                      placeholder={
                        isMaintenance
                          ? t('search.equipment')
                          : t('search.machine')
                      }
                      selectedId={selectedId || null}
                    />
                    {selectedId && (
                      <div className="mt-2 flex items-center justify-between p-2 bg-blue-50 rounded-md">
                        <span className="text-sm text-gray-700">
                          {t('selected.equipment')}:{' '}
                          {
                            assets?.find(a => a.id === selectedId)
                              ?.description
                          }
                        </span>
                        <button
                          type="button"
                          onClick={handleDeleteSelectedAsset}
                          className="text-red-600 hover:text-red-800"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    )}
                  </div>

                  {isMaintenance && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('state')}
                      </label>
                      <select
                        {...register('stateWorkOrder', {
                          valueAsNumber: true,
                        })}
                        value={stateCorrective}
                        onChange={e =>
                          setStateCorrective(
                            e.target.value as unknown as StateWorkOrder
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value={StateWorkOrder.OnGoing}>
                          {translateStateWorkOrder(StateWorkOrder.OnGoing, t)}
                        </option>
                        <option value={StateWorkOrder.Waiting}>
                          {translateStateWorkOrder(StateWorkOrder.Waiting, t)}
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'operators' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {t('select.operators.work.order')}
                  </p>
                  <ChooseElement
                    elements={
                      operators?.filter(
                        x =>
                          x.active === true &&
                          (isCRM || x.operatorType === OperatorType.Maintenance)
                      ) || []
                    }
                    selectedElements={selectedOperator}
                    onElementSelected={handleSelectedOperator}
                    onDeleteElementSelected={handleDeleteSelectedOperator}
                    placeholder={t('search.operators')}
                    mapElement={operator => ({
                      id: operator.id,
                      description: operator.name,
                    })}
                  />
                </div>
              )}

              {activeTab === 'downtimeReasons' && isProduction && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {t('select.downtime.reason')}
                  </p>
                  <div
                    className="p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      selectedId && setShowDowntimeReasonsModal(true)
                    }
                  >
                    {selectedDowntimeReasons ? (
                      <div className="flex items-center justify-between">
                        <span>{selectedDowntimeReasons.description}</span>
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                    ) : (
                      <span className="text-gray-400">
                        {t('click.to.select.reason')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-between items-center gap-3 px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center gap-3 text-sm">
              {successMessage && (
                <span className="text-green-600 font-medium">
                  {successMessage}
                </span>
              )}
              {errorMessage && (
                <span className="text-red-600 font-medium">{errorMessage}</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="cancel"
                onClick={onCancel}
                customStyles="px-5 py-2.5"
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="create"
                onClick={handleSubmit(onSubmit)}
                customStyles="px-5 py-2.5 gap-2 flex items-center"
                disabled={isLoading}
              >
                {t('create')} {isMaintenance ? t('breakdown') : t('ticket')}
                {isLoading && <SvgSpinner className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Modal2>

      {showDowntimeReasonsModal && (
        <ModalDowntimeReasons
          selectedId={selectedId}
          onSelectedDowntimeReasons={reason => {
            setSelectedDowntimeReasons(reason);
            setShowDowntimeReasonsModal(false);
          }}
        />
      )}
    </>
  );
}
