'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SvgSpinner } from 'app/icons/icons';
import WorkOrder from 'app/interfaces/workOrder';
import InvoiceService from 'app/services/invoiceService';
import WorkOrderService from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import ca from 'date-fns/locale/ca';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

import {
  InvoiceCreationRequest,
  InvoiceItemCreationDto,
  InvoiceRateDto,
} from '../../../../interfaces/InvoiceInterfaces';
import CustomerInfoForm from './CustomerInfoForm';
import CustomRatesForm from './CustomRatesForm';
import InvoiceItemsForm from './InvoiceItemsForm';
import InvoiceSummary from './InvoiceSummary';
import WorkOrderSelector from './WorkOrderSelector';

interface InvoiceFormData {
  workOrderIds: string[];
  invoiceDate: Date;
  dueDate: Date;
  externalComments: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPostalCode: string;
  companyProvince: string;
}

const InvoiceCreateForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Services
  const invoiceService = new InvoiceService(process.env.NEXT_PUBLIC_API_BASE_URL!);

  // Form state
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<InvoiceFormData>({
    defaultValues: {
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      externalComments: '',
      workOrderIds: [],
      companyName: '',
      companyAddress: '',
      companyCity: '',
      companyPostalCode: '',
      companyProvince: ''
    }
  });

  // Component state
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<WorkOrder[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemCreationDto[]>([]);
  const [customRates, setCustomRates] = useState<InvoiceRateDto[]>([]);
  const [defaultRates, setDefaultRates] = useState<InvoiceRateDto[]>([]);
  const [suggestedItems, setSuggestedItems] = useState<InvoiceItemCreationDto[]>([]);

  // Calculated totals
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [total, setTotal] = useState(0);

  // Watch form values
  const watchedValues = watch();

  // Load default rates on component mount
  useEffect(() => {
    loadDefaultRates();
  }, []);

  // Update work order IDs when selected work orders change
  useEffect(() => {
    setValue('workOrderIds', selectedWorkOrders.map(wo => wo.id));
    if (selectedWorkOrders.length > 0) {
      loadSuggestedItems();
    }
  }, [selectedWorkOrders, setValue]);

  // Calculate totals when items change
  useEffect(() => {
    calculateTotals();
  }, [invoiceItems]);

  const loadDefaultRates = async () => {
    try {
      const rates = await invoiceService.getDefaultRates();
      setDefaultRates(rates);
      setCustomRates(rates.map(rate => ({ ...rate, id: '' }))); // Reset IDs for custom rates
    } catch (error) {
      console.error('Error loading default rates:', error);
      setErrorMessage('Error carregant les tarifes per defecte');
    }
  };

  const loadSuggestedItems = async () => {
    try {
      const workOrderIds = selectedWorkOrders.map(wo => wo.id);
      const suggested = await invoiceService.getSuggestedItems(workOrderIds);
      setSuggestedItems(suggested);

      // Auto-add suggested items if no items exist
      if (invoiceItems.length === 0) {
        setInvoiceItems(suggested);
      }
    } catch (error) {
      console.error('Error loading suggested items:', error);
    }
  };

  const calculateTotals = () => {
    const newSubtotal = invoiceItems.reduce((acc, item) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const totalDiscount = item.discountAmount + (lineSubtotal * item.discountPercentage / 100);
      return acc + (lineSubtotal - totalDiscount);
    }, 0);

    const newTotalTax = newSubtotal * 0.21; // 21% IVA
    const newTotal = newSubtotal + newTotalTax;

    setSubtotal(parseFloat(newSubtotal.toFixed(2)));
    setTotalTax(parseFloat(newTotalTax.toFixed(2)));
    setTotal(parseFloat(newTotal.toFixed(2)));
  };

  const onSubmit: SubmitHandler<InvoiceFormData> = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const invoiceRequest: InvoiceCreationRequest = {
        workOrderIds: data.workOrderIds,
        invoiceDate: data.invoiceDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
        externalComments: data.externalComments,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyCity: data.companyCity,
        companyPostalCode: data.companyPostalCode,
        companyProvince: data.companyProvince,
        items: invoiceItems,
        customRates: customRates.filter(rate => rate.id !== '' || rate.hourlyRate !== defaultRates.find(dr => dr.operatorType === rate.operatorType)?.hourlyRate)
      };

      const createdInvoice = await invoiceService.createInvoice(invoiceRequest);

      setSuccessMessage('Factura creada correctament');
      setTimeout(() => {
        router.push(`/invoices/${createdInvoice.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating invoice:', error);
      setErrorMessage('Error creant la factura. Si us plau, revisa les dades.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedItems = () => {
    const newItems = suggestedItems.filter(suggested =>
      !invoiceItems.some(existing =>
        existing.workOrderId === suggested.workOrderId &&
        existing.operatorId === suggested.operatorId &&
        existing.sparePartId === suggested.sparePartId
      )
    );
    setInvoiceItems([...invoiceItems, ...newItems]);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Error/Success Messages */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {/* Work Order Selection */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Ordres de Treball</h3>
              <WorkOrderSelector
                selectedWorkOrders={selectedWorkOrders}
                onWorkOrdersChange={setSelectedWorkOrders}
              />
              {suggestedItems.length > 0 && (
                <div className="mt-4">
                  <Button
                    type={"create"}
                    onClick={handleAddSuggestedItems}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Afegir Items Suggerits ({suggestedItems.length})
                  </Button>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Informació del Client</h3>
              <CustomerInfoForm
                register={register}
                errors={errors}
                selectedWorkOrders={selectedWorkOrders}
              />
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Detalls de la Factura</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Factura
                  </label>
                  <DatePicker
                    selected={watchedValues.invoiceDate}
                    onChange={(date: Date) => setValue('invoiceDate', date)}
                    dateFormat="dd/MM/yyyy"
                    locale={ca}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Venciment
                  </label>
                  <DatePicker
                    selected={watchedValues.dueDate}
                    onChange={(date: Date) => setValue('dueDate', date)}
                    dateFormat="dd/MM/yyyy"
                    locale={ca}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentaris Externs
                </label>
                <textarea
                  {...register('externalComments')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Comentaris que apareixeran a la factura..."
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {/* Custom Rates */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Tarifes Personalitzades</h3>
              <CustomRatesForm
                customRates={customRates}
                onRatesChange={setCustomRates}
                defaultRates={defaultRates}
              />
            </div>

            {/* Invoice Summary */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Resum</h3>
              <InvoiceSummary
                subtotal={subtotal}
                totalTax={totalTax}
                total={total}
                itemCount={invoiceItems.length}
              />
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Items de Factura</h3>
          <InvoiceItemsForm
            items={invoiceItems}
            onItemsChange={setInvoiceItems}
            selectedWorkOrders={selectedWorkOrders}
            customRates={customRates}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type={"cancel"}
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
          >
            Cancel·lar
          </Button>
          <Button
            type={"create"}
            disabled={isLoading || invoiceItems.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <SvgSpinner className="text-white" />
                Creant...
              </>
            ) : (
              'Crear Factura'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreateForm;