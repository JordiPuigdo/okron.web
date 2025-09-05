import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { useAssetHook } from 'app/hooks/useAssetHook';
import { useCustomers } from 'app/hooks/useCustomers';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { useWorkOrders } from 'app/hooks/useWorkOrders';
import { SvgSpinner } from 'app/icons/icons';
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
import { Input } from 'components/input/Input';
import { Textarea } from 'components/textarea';
import { ca } from 'date-fns/locale';
import { Button } from 'designSystem/Button/Buttons';
import { Save, X } from 'lucide-react';
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
    setIsLoading(true);

    const response = await createRepairWorkOrder(formData);
    router.push(ROUTES.workOrders + '/' + response.id);
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
      newErrors.code = 'El codi es obligatori';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'La descripció es obligatoria';
    }

    if (!formData.initialDateTime) {
      newErrors.initialDateTime = 'La data es obligatoria';
    }

    if (!formData.operatorId || formData.operatorId.length === 0) {
      newErrors.operatorId = 'Falta treballador';
    }

    if (!formData.customerId) {
      newErrors.customerId = 'Falta el client';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Card className="mx-auto bg-white rounded-xl p-6 shadow-lg">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        onKeyDown={e => {
          const tag = (e.target as HTMLElement).tagName.toLowerCase();
          if (e.key === 'Enter' && (tag === 'input' || tag === 'textarea')) {
            e.preventDefault();
          }
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="font-semibold">Num Ordre</label>
            <Input
              id="code"
              value={formData.code || ''}
              onChange={e =>
                setFormData(prev => ({ ...prev, code: e.target.value }))
              }
              className={errors.code ? 'border-destructive' : ''}
            />
          </div>

          <div className="space-y-2">
            <label className="font-semibold">Referència Client</label>
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
          <div className="space-y-2 flex flex-col">
            <label className="font-semibold">Data</label>
            <DatePicker
              id="startDate"
              selected={formData.initialDateTime}
              onChange={(date: Date) =>
                setFormData(prev => ({ ...prev, initialDateTime: date }))
              }
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="flex h-10 w-full rounded-md border border-input text-lg"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="font-semibold">
            Descripció
          </label>
          <Textarea
            id="description"
            placeholder="Descriu breument el problema"
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
            <p className="text-destructive text-sm text-red-500">
              {errors.description}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="space-y-2">
            <label className="font-semibold">Objecte</label>
            <ChooseElement
              elements={assets ?? []}
              selectedElements={selectedAssets}
              onElementSelected={handleAssetSelected}
              onDeleteElementSelected={handleDeleteSelectedAsset}
              placeholder="Buscar Equip"
              mapElement={asset => ({
                id: asset.id,
                code: asset.code,
                description: asset.code + ' - ' + asset.description,
              })}
            />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="font-semibold">Operaris</label>
            <ChooseElement
              elements={
                operators ? operators.filter(x => x.active == true) : []
              }
              selectedElements={selectedOperator}
              onElementSelected={handleSelectedOperator}
              onDeleteElementSelected={handleDeleteSelectedOperator}
              placeholder="Buscar Operaris"
              mapElement={operator => ({
                id: operator.id,
                description: operator.name,
              })}
            />
            {errors.operatorId && (
              <p className="text-destructive text-sm text-red-500">
                {errors.operatorId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="font-semibold">Client</label>
            <ChooseElement
              elements={
                customers ? customers.filter(x => x.active == true) : []
              }
              selectedElements={selectedCustomerId ? [selectedCustomerId] : []}
              onElementSelected={handleSelectedCustomer}
              onDeleteElementSelected={handleDeleteSelectedCustomer}
              placeholder="Buscar Client"
              mapElement={customer => ({
                id: customer.id,
                description: `${customer.name} - ${customer.taxId}`,
              })}
            />
            {errors.customerId && (
              <p className="text-destructive text-sm text-red-500">
                {errors.customerId}
              </p>
            )}
          </div>

          {selectedCustomer &&
            selectedCustomer.installations &&
            selectedCustomer.installations.length > 0 && (
              <div className="space-y-2">
                <label className="font-semibold">Botigues</label>
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
                  placeholder="Buscar Botiga"
                  mapElement={installation => ({
                    id: installation.id,
                    description: `${installation.code} - ${installation.address.address}`,
                  })}
                />
              </div>
            )}
        </div>
        <div className="flex gap-3 pt-6 border-t">
          <Button
            type="create"
            isSubmit
            className="w-full"
            customStyles="flex justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <SvgSpinner className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            <p>Guardar</p>
          </Button>
          <Button
            type="cancel"
            variant="outline"
            onClick={() => {}}
            className="w-full"
            customStyles="flex justify-center"
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            <p>Cancelar</p>
          </Button>
        </div>
      </form>
    </Card>
  );
}
