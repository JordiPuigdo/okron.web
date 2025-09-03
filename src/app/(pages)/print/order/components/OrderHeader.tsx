import { Order } from 'app/interfaces/Order';
import { useSessionStore } from 'app/stores/globalStore';
import dayjs from 'dayjs';

export const OrderHeader = ({ order }: { order: Order }) => {
  //const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL!;
  const { config } = useSessionStore(state => state);
  const company = config?.company;
  if (!company) return null;
  return (
    <div>
      <div className="flex justify-between">
        <div className="flex">
          <div className="border p-2 my-6">
            <p className="relative">Comanda</p>
            <div className="p-4">
              <p className="font-semibold">{order.code}</p>
            </div>
          </div>
          <div className="border p-2 my-6">
            <p className="relative">Data</p>
            <div className="p-4">
              <p className="font-semibold">
                {dayjs(order.date).format('DD/MM/YYYY')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between items-start">
        <div>
          <p className="font-semibold">{company.name}</p>
          <p>{company.nif}</p>
          <p className="font-semibold">{company.address}</p>
          <p>Tel: {company.phone}</p>
          <p>{company.email}</p>
        </div>
        <div className="flex flex-col justify-center items-end">
          <p className="font-semibold">{order.provider?.name}</p>
          <p>{order.provider?.nie}</p>
          <p className="font-semibold">{order.provider?.address}</p>
        </div>
      </div>
    </div>
  );
};
