'use client';

import { useEffect } from 'react';
import { FieldErrors,UseFormRegister } from 'react-hook-form';
import WorkOrder from 'app/interfaces/workOrder';

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

interface CustomerInfoFormProps {
  register: UseFormRegister<InvoiceFormData>;
  errors: FieldErrors<InvoiceFormData>;
  selectedWorkOrders: WorkOrder[];
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
                                                             register,
                                                             errors,
                                                             selectedWorkOrders
                                                           }) => {
  // Auto-fill customer info from first selected work order if available
  useEffect(() => {
    if (selectedWorkOrders.length > 0) {
      const firstWorkOrder = selectedWorkOrders[0];
      if (firstWorkOrder.customerWorkOrder) {
        // You can auto-populate fields here if customer data is available in work orders
        // setValue('companyName', firstWorkOrder.customerWorkOrder.customerName);
      }
    }
  }, [selectedWorkOrders]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'Empresa *
        </label>
        <input
          {...register('companyName', { required: 'El nom de l\'empresa és obligatori' })}
          type="text"
          className={`w-full p-3 border rounded-md ${
            errors.companyName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nom de l'empresa del client"
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adreça *
        </label>
        <input
          {...register('companyAddress', { required: 'L\'adreça és obligatòria' })}
          type="text"
          className={`w-full p-3 border rounded-md ${
            errors.companyAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Adreça completa"
        />
        {errors.companyAddress && (
          <p className="mt-1 text-sm text-red-500">{errors.companyAddress.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ciutat *
        </label>
        <input
          {...register('companyCity', { required: 'La ciutat és obligatòria' })}
          type="text"
          className={`w-full p-3 border rounded-md ${
            errors.companyCity ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ciutat"
        />
        {errors.companyCity && (
          <p className="mt-1 text-sm text-red-500">{errors.companyCity.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Codi Postal *
        </label>
        <input
          {...register('companyPostalCode', { required: 'El codi postal és obligatori' })}
          type="text"
          className={`w-full p-3 border rounded-md ${
            errors.companyPostalCode ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Codi postal"
        />
        {errors.companyPostalCode && (
          <p className="mt-1 text-sm text-red-500">{errors.companyPostalCode.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Província *
        </label>
        <input
          {...register('companyProvince', { required: 'La província és obligatòria' })}
          type="text"
          className={`w-full p-3 border rounded-md ${
            errors.companyProvince ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Província"
        />
        {errors.companyProvince && (
          <p className="mt-1 text-sm text-red-500">{errors.companyProvince.message}</p>
        )}
      </div>
    </div>
  );
};

export default CustomerInfoForm;