import { Order } from 'app/interfaces/Order';

export const OrderFooter = ({ order }: { order: Order }) => {
  return (
    <div className="flex mt-auto w-full justify-end">
      <div className="flex flex-col  w-full p-4 border-t border-b my-8 px-7 mx-8">
        <div className="flex flex-row justify-between">
          <div className="font-bold">Total:</div>
          <div className="font-bold">
            {order.items
              .reduce(
                (acc, item) =>
                  acc +
                  Number(item.unitPrice) *
                    item.quantity *
                    (1 - item.discount / 100),
                0
              )
              .toFixed(2)}
            €
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="font-bold">Total (IVA Inclòs):</div>
          <div className="font-bold">
            {(
              order.items.reduce(
                (acc, item) =>
                  acc +
                  Number(item.unitPrice) *
                    item.quantity *
                    (1 - item.discount / 100),
                0
              ) * 1.21
            ).toFixed(2)}
            €
          </div>
        </div>
      </div>
    </div>
  );
};
