'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import {
  Budget,
  BudgetItem,
  BudgetItemType,
  BudgetStatus,
  BudgetUpdateRequest,
  ConvertBudgetToDeliveryNoteRequest,
} from 'app/interfaces/Budget';
import { cn } from 'app/lib/utils';
import useRoutes from 'app/utils/useRoutes';
import { formatEuropeanCurrency } from 'app/utils/utils';
import { CustomerInformationComponent } from 'components/customer/CustomerInformationComponent';
import { InstallationComponent } from 'components/customer/InstallationComponent';
import { TotalComponent } from 'components/customer/TotalComponent';
import { HeaderForm } from 'components/layout/HeaderForm';
import { Textarea } from 'components/textarea';
import { ca } from 'date-fns/locale';
import dayjs from 'dayjs';
import { Button } from 'designSystem/Button/Buttons';
import {
  FileText,
  Package,
  Plus,
  Save,
  Trash2,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { EditableCell } from '../../machines/downtimes/components/EditingCell';

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<
  BudgetStatus,
  { label: string; className: string }
> = {
  [BudgetStatus.Draft]: {
    label: 'Esborrany',
    className: 'bg-gray-100 text-gray-700',
  },
  [BudgetStatus.Sent]: {
    label: 'Enviat',
    className: 'bg-blue-100 text-blue-700',
  },
  [BudgetStatus.Accepted]: {
    label: 'Acceptat',
    className: 'bg-green-100 text-green-700',
  },
  [BudgetStatus.Rejected]: {
    label: 'Rebutjat',
    className: 'bg-red-100 text-red-700',
  },
  [BudgetStatus.Expired]: {
    label: 'Caducat',
    className: 'bg-orange-100 text-orange-700',
  },
  [BudgetStatus.Cancelled]: {
    label: 'Cancel·lat',
    className: 'bg-gray-100 text-gray-500',
  },
  [BudgetStatus.Converted]: {
    label: 'Convertit',
    className: 'bg-purple-100 text-purple-700',
  },
};

const ITEM_TYPE_CONFIG: Record<
  BudgetItemType,
  { label: string; icon: React.ElementType; color: string }
> = {
  [BudgetItemType.Labor]: {
    label: "Mà d'obra",
    icon: User,
    color: 'text-blue-600 bg-blue-50',
  },
  [BudgetItemType.SparePart]: {
    label: 'Recanvi',
    icon: Package,
    color: 'text-green-600 bg-green-50',
  },
  [BudgetItemType.Other]: {
    label: 'Altre',
    icon: Wrench,
    color: 'text-gray-600 bg-gray-50',
  },
};

// ============================================================================
// INTERFACES
// ============================================================================

interface BudgetDetailFormProps {
  budget: Budget;
  onUpdate: (budget: BudgetUpdateRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onReactivate?: (id: string) => Promise<void>;
  onConvertToDeliveryNote?: (
    request: ConvertBudgetToDeliveryNoteRequest
  ) => Promise<void>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BudgetDetailForm({
  budget,
  onUpdate,
  onDelete,
  onReactivate,
  onConvertToDeliveryNote,
}: BudgetDetailFormProps) {
  const router = useRouter();
  const ROUTES = useRoutes();
  const { t } = useTranslations();

  const [formData, setFormData] = useState<Budget>(budget);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mode només lectura quan el pressupost està explícitament inactiu (active === false)
  const isReadOnly = budget.active === false;

  useEffect(() => {
    setFormData(budget);
  }, [budget]);

  // ============================================================================
  // ITEM MANAGEMENT
  // ============================================================================

  const handleAddItem = (type: BudgetItemType) => {
    const newItem: BudgetItem = {
      id: `temp-${Date.now()}`,
      creationDate: new Date(),
      active: true,
      type,
      description:
        type === BudgetItemType.Labor
          ? "Mà d'obra"
          : type === BudgetItemType.SparePart
          ? 'Recanvi'
          : 'Nou concepte',
      quantity: 1,
      unitPrice: 0,
      discountPercentage: 0,
      discountAmount: 0,
      lineTotal: 0,
      taxPercentage: 21,
    };

    const updatedItems = [...(formData.items || []), newItem];
    recalculateTotals(updatedItems);
  };

  const handleItemUpdate = (
    itemIndex: number,
    field: keyof BudgetItem,
    value: string | number | BudgetItemType
  ) => {
    const updatedItems = [...(formData.items || [])];
    const item = updatedItems[itemIndex];

    const updatedItem = {
      ...item,
      [field]: value,
    };

    // Recalcular línea si cambian campos que afectan el total
    if (
      field === 'quantity' ||
      field === 'unitPrice' ||
      field === 'discountPercentage' ||
      field === 'taxPercentage'
    ) {
      const subtotalBeforeDiscount =
        updatedItem.quantity * updatedItem.unitPrice;
      updatedItem.discountAmount =
        subtotalBeforeDiscount * (updatedItem.discountPercentage / 100);
      updatedItem.lineTotal =
        subtotalBeforeDiscount - updatedItem.discountAmount;
    }

    updatedItems[itemIndex] = updatedItem;
    recalculateTotals(updatedItems);
  };

  const handleRemoveItem = (itemIndex: number) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems.splice(itemIndex, 1);
    recalculateTotals(updatedItems);
  };

  const recalculateTotals = (updatedItems: BudgetItem[]) => {
    let subtotal = 0;
    let totalTax = 0;
    const taxMap = new Map<
      number,
      { taxableBase: number; taxAmount: number }
    >();

    updatedItems.forEach(item => {
      const lineTotal = item.lineTotal;
      const taxPercentage = item.taxPercentage || 21;
      const taxAmount = lineTotal * (taxPercentage / 100);

      subtotal += lineTotal;
      totalTax += taxAmount;

      const current = taxMap.get(taxPercentage) || {
        taxableBase: 0,
        taxAmount: 0,
      };
      taxMap.set(taxPercentage, {
        taxableBase: current.taxableBase + lineTotal,
        taxAmount: current.taxAmount + taxAmount,
      });
    });

    const taxBreakdowns = Array.from(taxMap.entries()).map(
      ([taxPercentage, values]) => ({
        taxPercentage,
        taxableBase: values.taxableBase,
        taxAmount: values.taxAmount,
      })
    );

    const total = subtotal + totalTax;

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      totalTax,
      total,
      taxBreakdowns,
    }));
  };

  // ============================================================================
  // FORM VALIDATION & SUBMIT
  // ============================================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.budgetDate?.trim()) {
      newErrors.budgetDate = 'La data és obligatòria';
    }
    if (!formData.validUntil?.trim()) {
      newErrors.validUntil = 'La data de validesa és obligatòria';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const updateRequest: BudgetUpdateRequest = {
        id: formData.id,
        status: formData.status,
        validUntil: formData.validUntil,
        externalComments: formData.externalComments,
        internalComments: formData.internalComments,
        items: formData.items,
      };

      await onUpdate(updateRequest);

      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error updating budget:', error);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Estàs segur que vols eliminar aquest pressupost?')) return;

    setIsLoading(true);
    try {
      await onDelete(formData.id);
      router.push(ROUTES.budget.list);
    } catch (error) {
      console.error('Error deleting budget:', error);
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!onReactivate) return;
    if (!confirm('Vols reactivar aquest pressupost?')) return;

    setIsLoading(true);
    try {
      await onReactivate(formData.id);
    } catch (error) {
      console.error('Error reactivating budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!onConvertToDeliveryNote) return;
    if (formData.status === BudgetStatus.Converted) {
      alert('Aquest pressupost ja ha estat convertit');
      return;
    }
    if (!confirm('Vols convertir aquest pressupost en un albarà?')) return;

    setIsLoading(true);
    try {
      const request: ConvertBudgetToDeliveryNoteRequest = {
        budgetId: formData.id,
        deliveryNoteDate: new Date().toISOString().split('T')[0],
      };
      await onConvertToDeliveryNote(request);
    } catch (error) {
      console.error('Error converting budget:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <HeaderForm
          header={formData.code}
          isCreate={false}
          canPrint={`budget?id=${formData.id}`}
        />

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="font-semibold">Codi</label>
                <div className="p-2 bg-gray-50 rounded border text-gray-700">
                  {formData.code}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Estat</label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border text-gray-700">
                    {STATUS_CONFIG[formData.status]?.label || formData.status}
                  </div>
                ) : (
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        status: Number(e.target.value) as BudgetStatus,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                  >
                    {Object.values(BudgetStatus)
                      .filter(value => typeof value === 'number')
                      .map(status => (
                        <option key={status} value={status}>
                          {STATUS_CONFIG[status as BudgetStatus]?.label ||
                            status}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="font-semibold">Data Pressupost</label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border text-gray-700">
                    {formData.budgetDate
                      ? dayjs(formData.budgetDate).format('DD/MM/YYYY')
                      : '-'}
                  </div>
                ) : (
                  <DatePicker
                    selected={
                      formData.budgetDate
                        ? new Date(formData.budgetDate)
                        : new Date()
                    }
                    onChange={(date: Date | null) =>
                      setFormData(prev => ({
                        ...prev,
                        budgetDate:
                          date?.toISOString().split('T')[0] ||
                          new Date().toISOString().split('T')[0],
                      }))
                    }
                    dateFormat="dd/MM/yyyy"
                    locale={ca}
                    className={cn(
                      'flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm',
                      errors.budgetDate && 'border-destructive'
                    )}
                  />
                )}
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="font-semibold">Vàlid fins</label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border text-gray-700">
                    {formData.validUntil
                      ? dayjs(formData.validUntil).format('DD/MM/YYYY')
                      : '-'}
                  </div>
                ) : (
                  <DatePicker
                    selected={
                      formData.validUntil
                        ? new Date(formData.validUntil)
                        : new Date()
                    }
                    onChange={(date: Date | null) =>
                      setFormData(prev => ({
                        ...prev,
                        validUntil:
                          date?.toISOString().split('T')[0] ||
                          new Date().toISOString().split('T')[0],
                      }))
                    }
                    dateFormat="dd/MM/yyyy"
                    locale={ca}
                    className={cn(
                      'flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm',
                      errors.validUntil && 'border-destructive'
                    )}
                  />
                )}
              </div>
            </div>

            {/* Customer and Installation */}
            <div className="flex gap-4 justify-between">
              {formData.customerAddress && (
                <CustomerInformationComponent
                  companyName={formData.companyName ?? ''}
                  customerAddress={formData.customerAddress}
                />
              )}
              {formData.installation && (
                <InstallationComponent installation={formData.installation} />
              )}
            </div>

            {/* Work Order Reference */}
            {formData.workOrderCode && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-700">
                  Ordre de treball: {formData.workOrderCode}
                </span>
              </div>
            )}

            {/* Budget Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-semibold">
                  Línies del pressupost ({formData.items?.length || 0})
                </h3>
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <Button
                      type="create"
                      onClick={() => handleAddItem(BudgetItemType.Labor)}
                      variant="outline"
                      customStyles="flex items-center gap-1 text-sm"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-white">Mà d'obra</span>
                    </Button>
                    <Button
                      type="create"
                      onClick={() => handleAddItem(BudgetItemType.SparePart)}
                      variant="outline"
                      customStyles="flex items-center gap-1 text-sm"
                    >
                      <Package className="h-4 w-4" />
                      <span className="text-white">Recanvi</span>
                    </Button>
                    <Button
                      type="create"
                      onClick={() => handleAddItem(BudgetItemType.Other)}
                      customStyles="flex items-center gap-1 text-sm "
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-white">Altre</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border text-left w-24">Tipus</th>
                      <th className="p-2 border text-left">Descripció</th>
                      <th className="p-2 border text-center w-20">Quantitat</th>
                      <th className="p-2 border text-center w-28">
                        Preu Unitari
                      </th>
                      <th className="p-2 border text-center w-20">% Dte.</th>
                      <th className="p-2 border text-center w-24">
                        Import Dte.
                      </th>
                      <th className="p-2 border text-center w-20">% IVA</th>
                      <th className="p-2 border text-center w-28">
                        Total Línia
                      </th>
                      <th className="p-2 border text-center w-20">Accions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items?.map((item, index) => (
                      <EditableItemRow
                        key={item.id || index}
                        item={item}
                        index={index}
                        onUpdate={handleItemUpdate}
                        onRemove={handleRemoveItem}
                        isReadOnly={isReadOnly}
                        t={t}
                      />
                    ))}
                    {(!formData.items || formData.items.length === 0) && (
                      <tr>
                        <td
                          colSpan={9}
                          className="p-4 text-center text-gray-500"
                        >
                          No hi ha línies en aquest pressupost. Utilitza els
                          botons de dalt per afegir-ne.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-semibold">
                  Comentari extern (visible al client)
                </label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border text-gray-700 min-h-[80px]">
                    {formData.externalComments || '-'}
                  </div>
                ) : (
                  <Textarea
                    value={formData.externalComments || ''}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        externalComments: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full"
                    placeholder="Comentaris visibles per al client..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Comentari intern</label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border text-gray-700 min-h-[80px]">
                    {formData.internalComments || '-'}
                  </div>
                ) : (
                  <Textarea
                    value={formData.internalComments || ''}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        internalComments: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full"
                    placeholder="Notes internes..."
                  />
                )}
              </div>
            </div>

            {/* Totals */}
            <TotalComponent
              subtotal={formData.subtotal}
              totalTax={formData.totalTax}
              total={formData.total}
              taxBreakdowns={formData.taxBreakdowns}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              {isReadOnly ? (
                // Mode només lectura: només botó de reactivar i tornar
                <>
                  <div className="flex-1 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-center">
                    Aquest pressupost està inactiu i no es pot editar.
                  </div>
                  {onReactivate && (
                    <Button
                      type="create"
                      onClick={handleReactivate}
                      className="flex-1"
                      customStyles="flex justify-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <SvgSpinner className="mr-2 h-4 w-4" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      <p>Reactivar</p>
                    </Button>
                  )}
                  <Button
                    type="cancel"
                    variant="outline"
                    onClick={() => router.push(ROUTES.budget.list)}
                    className="flex-1"
                    customStyles="flex justify-center"
                    disabled={isLoading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    <p>Tornar</p>
                  </Button>
                </>
              ) : (
                // Mode edició normal
                <>
                  <Button
                    type="create"
                    isSubmit
                    className="flex-1"
                    customStyles="flex justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <SvgSpinner className="mr-2 h-4 w-4" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    <p>Actualitzar</p>
                  </Button>

                  {onConvertToDeliveryNote &&
                    formData.status !== BudgetStatus.Converted && (
                      <Button
                        type="create"
                        variant="outline"
                        onClick={handleConvert}
                        className="flex-1"
                        customStyles="flex justify-center"
                        disabled={isLoading}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <p>Convertir a Albarà</p>
                      </Button>
                    )}

                  {onDelete && (
                    <Button
                      type="delete"
                      variant="outline"
                      onClick={handleDelete}
                      className="flex-1"
                      customStyles="flex justify-center"
                      disabled={isLoading}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <p>Eliminar</p>
                    </Button>
                  )}

                  <Button
                    type="cancel"
                    variant="outline"
                    onClick={() => router.push(ROUTES.budget.list)}
                    className="flex-1"
                    customStyles="flex justify-center"
                    disabled={isLoading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    <p>Cancel·lar</p>
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface EditableItemRowProps {
  item: BudgetItem;
  index: number;
  onUpdate: (
    index: number,
    field: keyof BudgetItem,
    value: string | number | BudgetItemType
  ) => void;
  onRemove: (index: number) => void;
  isReadOnly?: boolean;
  t: (key: string) => string;
}

function EditableItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  isReadOnly = false,
  t,
}: EditableItemRowProps) {
  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-2 border">
        {isReadOnly ? (
          <span className="text-xs">{ITEM_TYPE_CONFIG[item.type]?.label}</span>
        ) : (
          <select
            value={item.type}
            onChange={e =>
              onUpdate(index, 'type', Number(e.target.value) as BudgetItemType)
            }
            className="w-full text-xs border rounded px-1 py-1"
          >
            {Object.values(BudgetItemType)
              .filter(v => typeof v === 'number')
              .map(type => (
                <option key={type} value={type}>
                  {ITEM_TYPE_CONFIG[type as BudgetItemType]?.label}
                </option>
              ))}
          </select>
        )}
      </td>
      <td className="p-2 border">
        <EditableCell
          value={item.description}
          onUpdate={value => onUpdate(index, 'description', value)}
          canEdit={!isReadOnly}
        />
      </td>
      <td className="p-2 border text-center">
        <EditableCell
          value={item.quantity.toString()}
          onUpdate={value => onUpdate(index, 'quantity', Number(value))}
          canEdit={!isReadOnly}
        />
      </td>
      <td className="p-2 border text-center">
        <EditableCell
          value={item.unitPrice.toString()}
          onUpdate={value => onUpdate(index, 'unitPrice', Number(value))}
          canEdit={!isReadOnly}
        />
      </td>
      <td className="p-2 border text-center">
        <EditableCell
          value={item.discountPercentage?.toString() ?? '0'}
          onUpdate={value =>
            onUpdate(index, 'discountPercentage', Number(value))
          }
          canEdit={!isReadOnly}
        />
      </td>
      <td className="p-2 border text-center">
        {formatEuropeanCurrency(item.discountAmount, t)}
      </td>
      <td className="p-2 border text-center">
        <EditableCell
          value={item.taxPercentage?.toString() ?? '21'}
          onUpdate={value => onUpdate(index, 'taxPercentage', Number(value))}
          canEdit={!isReadOnly}
        />
      </td>
      <td className="p-2 border text-center font-medium">
        {formatEuropeanCurrency(item.lineTotal, t)}
      </td>
      <td className="p-2 border text-center">
        {!isReadOnly && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

export default BudgetDetailForm;
