import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useAssetHook } from 'app/hooks/useAssetHook';
import { useCustomers } from 'app/hooks/useCustomers';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { useTranslations } from 'app/hooks/useTranslations';
import { useWorkOrders } from 'app/hooks/useWorkOrders';
import { SvgMachines, SvgSpinner } from 'app/icons/icons';
import { Customer } from 'app/interfaces/Customer';
import {
  OriginWorkOrder,
  StateWorkOrder,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import { cn } from 'app/lib/utils';
import { useSessionStore } from 'app/stores/globalStore';
import useRoutes from 'app/utils/useRoutes';
import ChooseElement from 'components/ChooseElement';
import { Textarea } from 'components/textarea';
import { Input } from 'components/ui/input';
import { ca } from 'date-fns/locale';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

export interface RepairReport {
  code: string;
  description: string;
  initialDateTime: Date;
  customerId: string;
  installationId: string;
  refCustomerId: string;
  stateWorkOrder: StateWorkOrder;
  workOrderType: WorkOrderType;
  originWorkOrder: OriginWorkOrder;
  downtimeReasonId: string;
  operatorCreatorId: string;
  operatorId: string[];
  userId: string;
}

export function RepairReportForm() {
  const { t } = useTranslations();
  const { loginUser } = useSessionStore(state => state);
  const { operators } = useOperatorHook();
  const { customers, getById } = useCustomers();
  const { assets } = useAssetHook();
  const router = useRouter();
  const ROUTES = useRoutes();
  const { createRepairWorkOrder, generateWorkOrderCode } = useWorkOrders();

  const [selectedAssets, setSelectedAsset] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<RepairReport>>({
    code: '',
    description: '',
    initialDateTime: new Date(),
    installationId: '',
    customerId: undefined,
    refCustomerId: undefined,
    stateWorkOrder: StateWorkOrder.Waiting,
    workOrderType: WorkOrderType.Corrective,
    originWorkOrder: OriginWorkOrder.Maintenance,
    downtimeReasonId: '',
    operatorCreatorId: '686e4b24bf360fa1bbfe001e',
    operatorId: [],
    userId: loginUser?.agentId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >(undefined);

  const generateWorkOrderCodeForRepair = async () => {
    const workOrderCode = await generateWorkOrderCode(WorkOrderType.Corrective);

    setFormData(prev => ({ ...prev, code: workOrderCode }));
  };

  useEffect(() => {
    generateWorkOrderCodeForRepair();
  }, []);

  const handleSelectedOperator = (id: string) => {
    setSelectedOperator([...selectedOperator, id]);
    setFormData(prev => ({
      ...prev,
      operatorId: [...(prev.operatorId ?? []), id],
    }));
  };
  const handleDeleteSelectedOperator = (operatorId: string) => {
    setSelectedOperator(prevSelected =>
      prevSelected.filter(id => id !== operatorId)
    );
    setFormData(prev => ({
      ...prev,
      operatorId: (prev.operatorId ?? []).filter(id => id !== operatorId),
    }));
  };

  const handleSelectedCustomer = (id: string) => {
    setSelectedCustomerId(id);
    fetchCustomer(id);
    setFormData(prev => ({
      ...prev,
      customerId: id,
    }));
  };

  const fetchCustomer = async (id: string) => {
    const customer = await getById(id);
    setSelectedCustomer(customer);
  };

  const handleDeleteSelectedCustomer = () => {
    setSelectedCustomer(undefined);
    setSelectedCustomerId(undefined);
    setFormData(prev => ({ ...prev, customerId: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const response = await createRepairWorkOrder(formData);
      setSuccessMessage(`${t('breakdown.created')} ${formData.code || ''}`);
      setTimeout(() => {
        router.push(ROUTES.workOrders + '/' + response.id);
      }, 900);
    } catch (error) {
      setErrorMessage(t('error.creating.breakdown'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.workOrders);
  };

  const handleAssetSelected = (assetId: string) => {
    if (assetId == '') return;
    setFormData(prev => ({ ...prev, assetId }));
    setSelectedAsset(prevSelected => [...prevSelected, assetId]);
  };

  const handleDeleteSelectedAsset = (assetId: string) => {
    setFormData(prev => ({ ...prev, assetId: '' }));
    setSelectedAsset(prevSelected => prevSelected.filter(id => id !== assetId));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = t('validation.code.required');
    }

    if (!formData.description?.trim()) {
      newErrors.description = t('validation.description.required');
    }

    if (!formData.initialDateTime) {
      newErrors.initialDateTime = t('validation.date.required');
    }

    if (!formData.operatorId || formData.operatorId.length === 0) {
      newErrors.operatorId = t('validation.operator.required');
    }

    if (!formData.customerId) {
      newErrors.customerId = t('validation.customer.required');
    }

    if (
      selectedCustomer?.installations &&
      selectedCustomer.installations.length > 0 &&
      !formData.installationId
    ) {
      newErrors.installationId = t('validation.installation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      <div className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <SvgMachines />
          {t('incident.management')}
        </h2>
        <p className="text-sm text-gray-600">
          {t('create.corrective.description')} - {formData.code || ''}
        </p>
      </div>

      <div className="flex-1 p-6">
        <form
          id="repair-report-form"
          onSubmit={handleSubmit}
          className="space-y-5"
          onKeyDown={e => {
            const tag = (e.target as HTMLElement).tagName.toLowerCase();
            if (e.key === 'Enter' && (tag === 'input' || tag === 'textarea')) {
              e.preventDefault();
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('workorder.number')}
              </label>
              <Input
                id="code"
                value={formData.code || ''}
                onChange={e =>
                  setFormData(prev => ({ ...prev, code: e.target.value }))
                }
                className={`bg-gray-50 ${errors.code ? 'border-destructive' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('customer.reference')}
              </label>
              <Input
                id="refclientId"
                value={formData.refCustomerId || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    refCustomerId: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('common.date')}
              </label>
              <DatePicker
                id="startDate"
                selected={formData.initialDateTime}
                onChange={(date: Date) =>
                  setFormData(prev => ({ ...prev, initialDateTime: date }))
                }
                dateFormat="dd/MM/yyyy"
                locale={ca}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t('common.description')}
            </label>
            <Textarea
              id="description"
              placeholder={t('workorder.describe.problem')}
              value={formData.description || ''}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              className={cn(
                'min-h-[100px]',
                errors.description && 'border-destructive'
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('workorder.equipment')}
            </label>
            <ChooseElement
              elements={assets ?? []}
              selectedElements={selectedAssets}
              onElementSelected={handleAssetSelected}
              onDeleteElementSelected={handleDeleteSelectedAsset}
              placeholder={t('workorder.search.equipment')}
              mapElement={asset => ({
                id: asset.id,
                code: asset.code,
                description: asset.code + ' - ' + asset.description,
              })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('workorder.operators')}
              </label>
              <ChooseElement
                elements={
                  operators ? operators.filter(x => x.active == true) : []
                }
                selectedElements={selectedOperator}
                onElementSelected={handleSelectedOperator}
                onDeleteElementSelected={handleDeleteSelectedOperator}
                placeholder={t('workorder.search.operators')}
                mapElement={operator => ({
                  id: operator.id,
                  description: operator.name,
                })}
              />
              {errors.operatorId && (
                <p className="text-sm text-red-500 mt-1">{errors.operatorId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('customer.customer')}
              </label>
              <ChooseElement
                elements={
                  customers ? customers.filter(x => x.active == true) : []
                }
                selectedElements={selectedCustomerId ? [selectedCustomerId] : []}
                onElementSelected={handleSelectedCustomer}
                onDeleteElementSelected={handleDeleteSelectedCustomer}
                placeholder={t('customer.search.customer')}
                mapElement={customer => ({
                  id: customer.id,
                  description: `${customer.name} - ${customer.fiscalName} - ${customer.taxId}`,
                })}
              />
              {errors.customerId && (
                <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>
              )}
            </div>
          </div>

          {selectedCustomer &&
            selectedCustomer.installations &&
            selectedCustomer.installations.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('customer.stores')}
                </label>
                <ChooseElement
                  elements={selectedCustomer.installations}
                  selectedElements={
                    formData.installationId ? [formData.installationId] : []
                  }
                  onElementSelected={id =>
                    setFormData(prev => ({
                      ...prev,
                      installationId: id,
                    }))
                  }
                  onDeleteElementSelected={() =>
                    setFormData(prev => ({ ...prev, installationId: '' }))
                  }
                  placeholder={t('customer.search.store')}
                  mapElement={installation => ({
                    id: installation.id,
                    description: `${installation.code} - ${installation.address.address}`,
                  })}
                />
                {errors.installationId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.installationId}
                  </p>
                )}
              </div>
            )}
        </form>
      </div>

      <div className="flex justify-between items-center gap-3 px-6 py-4 border-t bg-gray-50">
        <div className="flex items-center gap-3 text-sm">
          {successMessage && (
            <span className="text-green-600 font-medium">{successMessage}</span>
          )}
          {errorMessage && (
            <span className="text-red-600 font-medium">{errorMessage}</span>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            type="cancel"
            onClick={handleCancel}
            customStyles="px-5 py-2.5"
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="create"
            onClick={() => {
              const form = document.getElementById('repair-report-form');
              if (form instanceof HTMLFormElement) {
                form.requestSubmit();
              }
            }}
            customStyles="px-5 py-2.5 gap-2 flex items-center"
            disabled={isLoading}
          >
            {t('common.save')}
            {isLoading && <SvgSpinner className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
