'use client';
import { useEffect, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import { useTranslations } from 'app/hooks/useTranslations';
import {
  PurchaseProposal,
  PurchaseProposalItem,
} from 'app/interfaces/PurchaseProposal';
import SparePartDetailModal from 'components/sparePart/SparePartDetailModal';
import { Button } from 'designSystem/Button/Buttons';

export default function LowStockPurchase() {
  const { t } = useTranslations();
  const { fetchLowStockOrders, createLowStockOrders } = useOrder();
  const [lowStockOrders, setLowStockOrders] = useState<PurchaseProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [purchaseProposal, setPurchaseProposal] = useState<PurchaseProposal[]>(
    []
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedSparePartId, setSelectedSparePartId] = useState<string | null>(
    null
  );
  const [showSparePartModal, setShowSparePartModal] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const orders = await fetchLowStockOrders();
      setLowStockOrders(orders);
    } catch (err) {
      setError(t('error.loading.orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const onCreate = async () => {
    setCreating(true);
    setSuccessMessage(null);
    setError(null);
    try {
      const result = await createLowStockOrders(purchaseProposal);
      console.log('Order creation result:', result);
      setSelectedOrders(new Set());
      setPurchaseProposal([]);
      setSelectAll(false);
      await loadOrders();
      setSuccessMessage(t('order.created.successfully'));
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error creating order:', err);
      setError(t('error.creating.order'));
    } finally {
      setCreating(false);
    }
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
              {t('select.all')}
            </label>
          </div>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder={t('search.by.provider')}
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

      {successMessage && (
        <div className="mx-4 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-700 hover:text-green-900"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

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
                  <div className="grid grid-cols-11 gap-4 font-semibold text-gray-500 border-b border-gray-200">
                    <span className="col-span-4 flex w-full text-left">
                      {t('spare.parts')}
                    </span>
                    <span className="col-span-1 flex w-full text-left">
                      {t('warehouse')}
                    </span>
                    <span className="col-span-1 flex w-full text-left">
                      {t('stock.max')}
                    </span>
                    <span className="col-span-1 flex w-full text-left">
                      {t('stock.min')}
                    </span>
                    <span className="col-span-1 flex w-full text-left">
                      {t('stock.real')}
                    </span>
                    <span className="col-span-1 flex w-full text-left">
                      {t('pending')}
                    </span>
                    <span className="col-span-1 text-right mr-6">
                      {t('price')}
                    </span>
                    <span className="col-span-1 text-center">
                      {t('actions')}
                    </span>
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
                        className={`grid grid-cols-11 gap-4 py-2 ${
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
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedSparePartId(item.sparePartId);
                              setShowSparePartModal(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title={t('view.detail')}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Total price displayed below the items */}
                <div className="mt-4 text-right">
                  <span className="text-lg font-semibold text-blue-600 mr-3">
                    {t('total')}:{' '}
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
              {selectedOrders.size} {t('selected.elements')}
            </span>
          </div>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setSelectedOrders(new Set())}
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={purchaseProposal.length === 0 || creating}
              onClick={onCreate}
            >
              {creating ? t('creating') + '...' : t('generate.order')}
            </Button>
          </div>
        </div>
      </div>

      <SparePartDetailModal
        sparePartId={selectedSparePartId}
        isVisible={showSparePartModal}
        onClose={() => {
          setShowSparePartModal(false);
          setSelectedSparePartId(null);
        }}
      />
    </div>
  );
}
