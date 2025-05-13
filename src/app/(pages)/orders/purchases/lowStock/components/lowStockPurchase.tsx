'use client';
import { useEffect, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import {
  PurchaseProposal,
  PurchaseProposalItem,
} from 'app/interfaces/PurchaseProposal';
import { Button } from 'designSystem/Button/Buttons';

export default function LowStockPurchase() {
  const { fetchLowStockOrders, createLowStockOrders } = useOrder();
  const [lowStockOrders, setLowStockOrders] = useState<PurchaseProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [purchaseProposal, setPurchaseProposal] = useState<PurchaseProposal[]>(
    []
  );

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const orders = await fetchLowStockOrders();
        setLowStockOrders(orders);
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const [search, setSearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (selectAll) {
      const allProviderIds = lowStockOrders.map(order => order.providerId);
      setSelectedOrders(new Set(allProviderIds));
      setPurchaseProposal(lowStockOrders);
    } else {
      setSelectedOrders(new Set());
      setPurchaseProposal([]);
    }
  }, [selectAll, lowStockOrders]);

  const filteredOrders = lowStockOrders.filter(order =>
    order.providerName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOrderSelect = (providerId: string) => {
    setSelectedOrders(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(providerId)) {
        newSelected.delete(providerId);

        setPurchaseProposal(prevProposals =>
          prevProposals.filter(proposal => proposal.providerId !== providerId)
        );
      } else {
        newSelected.add(providerId);

        const providerOrder = lowStockOrders.find(
          order => order.providerId === providerId
        );
        if (providerOrder) {
          setPurchaseProposal(prevProposals => {
            const existingProposal = prevProposals.find(
              p => p.providerId === providerId
            );
            if (existingProposal) {
              return prevProposals.map(p =>
                p.providerId === providerId
                  ? { ...p, items: providerOrder.items }
                  : p
              );
            }
            return [
              ...prevProposals,
              {
                providerId,
                providerName: providerOrder.providerName,
                items: providerOrder.items,
              },
            ];
          });
        }
      }
      return newSelected;
    });
  };

  const handleItemSelect = (item: PurchaseProposalItem, providerId: string) => {
    const existingItem = existsItem(
      providerId,
      item.sparePartId,
      item.warehouseId
    );

    if (existingItem) {
      // Remove the item if it exists
      setPurchaseProposal(prev =>
        prev
          .map(proposal => {
            if (proposal.providerId === providerId) {
              return {
                ...proposal,
                items: proposal.items.filter(
                  i =>
                    !(
                      i.sparePartId === item.sparePartId &&
                      i.warehouseId === item.warehouseId
                    )
                ),
              };
            }
            return proposal;
          })
          .filter(proposal => proposal.items.length > 0)
      );
    } else {
      setPurchaseProposal(prev => {
        const existingProvider = prev.find(p => p.providerId === providerId);
        if (existingProvider) {
          return prev.map(p => {
            if (p.providerId === providerId) {
              return {
                ...p,
                items: [...p.items, item],
              };
            }
            return p;
          });
        }
        return [
          ...prev,
          {
            providerId,
            providerName:
              lowStockOrders.find(x => x.providerId == providerId)
                ?.providerName ?? 'unknown',
            items: [item],
          },
        ];
      });
    }
  };

  const existsItem = (
    providerId: string,
    sparePartId: string,
    warehouseId: string
  ) => {
    return purchaseProposal
      .find(x => x.providerId === providerId)
      ?.items.find(
        x => x.sparePartId === sparePartId && x.warehouseId === warehouseId
      );
  };

  const onCreate = () => {
    createLowStockOrders(purchaseProposal);
  };

  return (
    <div className="flex flex-col flex-1 bg-white shadow-lg rounded-xl">
      <div className="flex-none p-4 border-b border-gray-200">
        <div className="flex flex-row items-center gap-6 bg-white rounded-lg">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setSelectAll(prev => !prev)}
          >
            <input
              type="checkbox"
              checked={selectAll}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-colors"
            />
            <label className="text-gray-700 font-medium cursor-pointer">
              Seleccionar Tots
            </label>
          </div>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Buscar per proveidor"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="flex flex-col w-full p-4">
          {filteredOrders.map((order, index) => {
            return (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex flex-row gap-2 items-center p-1 py-1">
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.providerId)}
                    onChange={() => handleOrderSelect(order.providerId)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <h2
                    className="text-lg font-semibold text-gray-800 hover:cursor-pointer"
                    onClick={() => handleOrderSelect(order.providerId)}
                  >
                    {order.providerName}
                  </h2>
                </div>
                <div className="flex flex-col w-full bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-10 gap-4 font-semibold text-gray-500 border-b border-gray-200">
                    <span className="col-span-4 flex w-full text-left">
                      Rencavi
                    </span>
                    <span className="col-span-1 flex w-full text-left">
                      Magatzem
                    </span>
                    <span className="col-span-1 flex w-full text-left">
                      Stock Max
                    </span>
                    <span className="col-span-1 flex w-full text-left">
                      Stock Min
                    </span>
                    <span className="col-span-1 flex w-full text-left">
                      Stock Real
                    </span>
                    <span className="col-span-1 flex w-full text-left">
                      Pendent
                    </span>
                    <span className="col-span-1 text-right mr-6">Preu</span>
                  </div>
                  {order.items.map((item, index) => {
                    const exists = existsItem(
                      order.providerId,
                      item.sparePartId,
                      item.warehouseId
                    );
                    return (
                      <div
                        key={index}
                        className={`grid grid-cols-10 gap-4 py-2 ${
                          Number(item.unitPrice) <= 0
                            ? 'border-red-500 border-2 rounded'
                            : ' border-gray-200 last:border-b-0  border-b'
                        }`}
                      >
                        <div
                          className="flex col-span-4 hover:cursor-pointer"
                          onClick={() => {
                            handleItemSelect(item, order.providerId);
                          }}
                        >
                          <span
                            className="flex gap-2 text-gray-600 truncate items-center "
                            title={item.sparePartName}
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox text-blue-600 rounded focus:ring-blue-500 hover:cursor-pointer"
                              checked={exists ? true : false}
                            />
                            {item.sparePartName.slice(0, 40)}
                            {item.sparePartName.length > 40 && '...'}
                          </span>
                        </div>
                        <span className="col-span-1 text-sm text-gray-600">
                          {item.warehouse}
                        </span>
                        <span className="col-span-1 text-right mr-7 text-gray-600">
                          {item.stockMax}
                        </span>
                        <span className="col-span-1 text-right mr-7 text-gray-600">
                          {item.stockMin}
                        </span>
                        <span className="col-span-1 text-right mr-7 text-gray-600">
                          {item.realStock}
                        </span>
                        <span className="col-span-1 text-right mr-10 text-gray-600">
                          {item.quantity}
                        </span>
                        <span className="col-span-1 text-gray-600 text-right mr-6">
                          {item.unitPrice} €
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Total price displayed below the items */}
                <div className="mt-4 text-right">
                  <span className="text-lg font-semibold text-blue-600 mr-3">
                    Total:{' '}
                    {order.items
                      .reduce((acc, item) => {
                        const exists = existsItem(
                          order.providerId,
                          item.sparePartId,
                          item.warehouseId
                        );
                        return exists
                          ? acc + item.quantity * item.unitPrice
                          : acc;
                      }, 0)
                      .toFixed(2)}{' '}
                    €
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-none border-t border-gray-200 p-4 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-700">
              {selectedOrders.size} elements seleccionats
            </span>
          </div>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setSelectedOrders(new Set())}
            >
              Cancel·lar
            </Button>
            <Button disabled={purchaseProposal.length === 0} onClick={onCreate}>
              Generar Comanda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
