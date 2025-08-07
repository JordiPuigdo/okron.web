import 'react-datepicker/dist/react-datepicker.css';

import DatePicker from 'react-datepicker';
import { SvgProvider } from 'app/icons/designSystem/SvgProvider';
import { Account } from 'app/interfaces/Account';
import {
  Order,
  OrderCreationRequest,
  OrderStatus,
  OrderType,
} from 'app/interfaces/Order';
import { Provider } from 'app/interfaces/Provider';
import { translateOrderStatus } from 'app/utils/utilsOrder';
import { ProgressBar } from 'components/ProgressBar';
import ca from 'date-fns/locale/ca';
import dayjs from 'dayjs';

import AccountSelection from './AccountSelection';
import SearchOrderComponent from './SearchOrderComponent';
import SearchProviderComponent from './SearchProviderComponent';

export interface HeaderOrderFormProps {
  order: OrderCreationRequest;
  setOrder: (order: OrderCreationRequest) => void;
  handleChangeProvider: (provider: Provider) => void;
  isEditing: boolean;
  loadOrderFromScratch: (order: Order) => void;
  disabledSearchPurchaseOrder?: boolean;
  setSelectedAccount: (Account: Account) => void;
  valueProgressBar?: number;
}

export default function HeaderOrderForm({
  order,
  setOrder,
  handleChangeProvider,
  isEditing,
  loadOrderFromScratch,
  disabledSearchPurchaseOrder = false,
  setSelectedAccount,
  valueProgressBar,
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
    <div className="gap-2 p-4">
      <div className="flex flex-row gap-4">
        <div className="flex flex-col flex-1 gap-2">
          {isEditing && (
            <div className="flex gap-2 mt-7">
              <SvgProvider className="w-8 h-8" />
              <label className="w-full p-2 border-black/60 border-2 rounded-md">
                {order.providerName}
              </label>
            </div>
          )}
          {!isEditing && !disabledSearchPurchaseOrder && (
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold">
                {order.type == OrderType.Purchase ? 'Proveeïdor' : 'Comanada:'}
              </label>
              {order.type == OrderType.Purchase ? (
                <SearchProviderComponent
                  onSelectedProvider={handleChangeProvider}
                />
              ) : (
                <SearchOrderComponent onSelectedOrder={loadOrderFromScratch} />
              )}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-semibold">Data:</label>
            <DatePicker
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="rounded-md w-full"
              selected={dayjs(order.date).toDate()}
              onChange={date => {
                handleDateChange(date, false);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-2">
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
          <div className="flex flex-col flex-1 gap-2">
            <AccountSelection
              onSelectedAccount={setSelectedAccount}
              selectedId={order.accountId}
            />
          </div>
        </div>

        {order.type == OrderType.Delivery && (
          <div className="flex flex-col flex-1 gap-2">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold">
                Data Albarà Proveeïdor:
              </label>
              <DatePicker
                dateFormat="dd/MM/yyyy"
                locale={ca}
                className="w-full"
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
          <div className="flex flex-col flex-1 gap-2">
            <label className="text-sm font-semibold">Comentari:</label>
            <textarea
              className="flex flex-grow border rounded-md"
              value={order.comment}
              onChange={e => setOrder({ ...order, comment: e.target.value })}
            />
          </div>
        </div>
      </div>
      {isEditing && (
        <div className="mt-4 flex w-full gap-4">
          <div>
            <label className="block text-sm font-semibold">Actiu:</label>
            <input
              type="checkbox"
              className="p-2 border rounded-md"
              checked={order.active}
              onChange={e => setOrder({ ...order, active: e.target.checked })}
            />
          </div>
          {valueProgressBar !== undefined && valueProgressBar > 0 && (
            <div className="flex flex-col w-full">
              <label className="block text-sm font-semibold">Progrés:</label>
              <ProgressBar value={valueProgressBar} showLabel size="lg" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
