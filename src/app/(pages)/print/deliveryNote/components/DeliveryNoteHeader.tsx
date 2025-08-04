import { DeliveryNote } from 'app/interfaces/DeliveryNote';
import dayjs from 'dayjs';

import companyData from '../../order/company.json';

interface CompanyInfo {
  name: string;
  cif: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

export const DeliveryNoteHeader = ({ deliveryNote }: { deliveryNote: DeliveryNote }) => {
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL!;
  const company: CompanyInfo = companyData;

  return (
    <div>
      <div className="flex justify-between">
        <img
          src={logoUrl}
          alt="Components Mecànics Logo"
          className="h-[150px] w-[150px] p-2"
        />
        <div className="flex">
          <div className="border p-2 my-6">
            <p className="relative">Albarà</p>
            <div className="p-4">
              <p className="font-semibold">{deliveryNote.code}</p>
            </div>
          </div>
          <div className="border p-2 my-6">
            <p className="relative">Data</p>
            <div className="p-4">
              <p className="font-semibold">
                {dayjs(deliveryNote.deliveryNoteDate).format('DD/MM/YYYY')}
              </p>
            </div>
          </div>
          <div className="border p-2 my-6">
            <p className="relative">Venciment</p>
            <div className="p-4">
              <p className="font-semibold">
                {dayjs(deliveryNote.dueDate).format('DD/MM/YYYY')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between items-start">
        <div>
          <p className="font-semibold">{company.name}</p>
          <p>{company.cif}</p>
          <p className="font-semibold">{company.address}</p>
          <p>{company.city}</p>
          <p>Tel: {company.phone}</p>
          <p>{company.email}</p>
        </div>
        <div className="flex flex-col justify-center items-end">
          <p className="font-semibold">{deliveryNote.companyName}</p>
          <p className="font-semibold">{deliveryNote.companyAddress}</p>
          <p>{deliveryNote.companyCity}</p>
          {deliveryNote.companyPostalCode && (
            <p>{deliveryNote.companyPostalCode}</p>
          )}
          {deliveryNote.companyProvince && (
            <p>{deliveryNote.companyProvince}</p>
          )}
        </div>
      </div>

      {/* Work Orders Section */}
      {deliveryNote.workOrderIds && deliveryNote.workOrderIds.length > 0 && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Ordres de Treball:</h3>
          <div className="grid grid-cols-2 gap-2">
            {deliveryNote.workOrderIds.map((workOrderId, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">ID:</span> {workOrderId}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};