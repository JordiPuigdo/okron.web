import 'react-datepicker/dist/react-datepicker.css';

import DatePicker from 'react-datepicker';
import {
  Order,
  OrderCreationRequest,
  OrderStatus,
  OrderType,
} from 'app/interfaces/Order';
import { Provider } from 'app/interfaces/Provider';
import { translateOrderStatus } from 'app/utils/utilsOrder';
import ca from 'date-fns/locale/ca';
import dayjs from 'dayjs';

import SearchOrderComponent from './SearchOrderComponent';
import SearchProviderComponent from './SearchProviderComponent';

export interface HeaderOrderFormProps {
  order: OrderCreationRequest;
  setOrder: (order: OrderCreationRequest) => void;
  handleChangeProvider: (provider: Provider) => void;
  isEditing: boolean;
  loadOrderFromScratch: (order: Order) => void;
  disabledSearchPurchaseOrder?: boolean;
}

export default function HeaderOrderForm({
  order,
  setOrder,
  handleChangeProvider,
  isEditing,
  loadOrderFromScratch,
  disabledSearchPurchaseOrder = false,
}: HeaderOrderFormProps) {
  const handleDateChange = (date: any, isProvider: boolean) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';
    if (isProvider) {
      setOrder({
        ...order,
        deliveryProviderDate: formattedDate,
      });
    } else {
      setOrder({
        ...order,
        date: formattedDate,
      });
    }
  };
  return (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-semibold">Codi:</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={order.code}
          />
        </div>
        <div className="flex flex-col gap-2">
          {!isEditing && !disabledSearchPurchaseOrder && (
            <>
              <label className="block text-sm font-semibold">
                {order.type == OrderType.Purchase
                  ? 'Proveeïdor'
                  : 'Ordre Compra:'}
              </label>
              {order.type == OrderType.Purchase ? (
                <SearchProviderComponent
                  onSelectedProvider={handleChangeProvider}
                />
              ) : (
                <SearchOrderComponent onSelectedOrder={loadOrderFromScratch} />
              )}
            </>
          )}
        </div>
        {isEditing && (
          <div className="mt-4">
            <label className="block text-sm font-semibold">Actiu:</label>
            <input
              type="checkbox"
              className="p-2 border rounded-md"
              checked={order.active}
              onChange={e => setOrder({ ...order, active: e.target.checked })}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-semibold">Data:</label>
          <DatePicker
            dateFormat="dd/MM/yyyy"
            locale={ca}
            className="rounded-md"
            selected={dayjs(order.date).toDate()}
            onChange={date => {
              handleDateChange(date, false);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-semibold">Estat:</label>
          <select
            className="w-full p-2 border rounded-md"
            value={order.status}
            onChange={e =>
              setOrder({
                ...order,
                status: Number(e.target.value) as OrderStatus,
              })
            }
          >
            {Object.values(OrderStatus)
              .filter(value => typeof value === 'number')
              .map(status => (
                <option key={status} value={status}>
                  {translateOrderStatus(status as OrderStatus)}
                </option>
              ))}
          </select>
        </div>
      </div>
      {order.type == OrderType.Delivery && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-semibold">
              Data Albarà Proveeïdor:
            </label>
            <DatePicker
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="rounded-md"
              selected={dayjs(order.deliveryProviderDate).toDate()}
              onChange={date => {
                handleDateChange(date, true);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-semibold">
              Albarà Proveeïdor:
            </label>
            <input
              type="text"
              className="p-2 border rounded-md"
              value={order.deliveryProviderCode}
              onChange={e =>
                setOrder({
                  ...order,
                  deliveryProviderCode: e.target.value,
                })
              }
            />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1">
        <div className="flex flex-col flex-1">
          <label className="text-sm font-semibold">Comentari:</label>
          <textarea
            className="flex flex-grow my-2 border rounded-md"
            value={order.comment}
            onChange={e => setOrder({ ...order, comment: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
