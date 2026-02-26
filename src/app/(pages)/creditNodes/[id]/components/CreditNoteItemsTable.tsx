'use client';

import { CreditNoteItem } from 'app/interfaces/CreditNote';
import { formatCurrencyServerSider } from 'app/utils/utils';

interface CreditNoteItemsTableProps {
  items: CreditNoteItem[];
  isEditing: boolean;
  onItemChange: (
    index: number,
    field: keyof CreditNoteItem,
    value: number | string
  ) => void;
  t: (key: string) => string;
}

export function CreditNoteItemsTable({
  items,
  isEditing,
  onItemChange,
  t,
}: CreditNoteItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-sm">{t('creditNote.noItems')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {t('creditNote.items')} ({items.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('description')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                {t('quantity')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                {t('unitPrice')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                {t('discount')} %
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                {t('discount')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                {t('tax')} %
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                {t('subtotal')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                {t('total')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item, index) => (
              <tr
                key={item.id || index}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.description}
                      onChange={e =>
                        onItemChange(index, 'description', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-okron-primary focus:ring-1 focus:ring-okron-primary outline-none"
                    />
                  ) : (
                    <span className="text-sm text-gray-800">
                      {item.description}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e =>
                        onItemChange(
                          index,
                          'quantity',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-center focus:border-okron-primary focus:ring-1 focus:ring-okron-primary outline-none"
                      min={0}
                      step="any"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">
                      {item.quantity}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={e =>
                        onItemChange(
                          index,
                          'unitPrice',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-right focus:border-okron-primary focus:ring-1 focus:ring-okron-primary outline-none"
                      min={0}
                      step="any"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">
                      {formatCurrencyServerSider(item.unitPrice)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.discountPercentage}
                      onChange={e =>
                        onItemChange(
                          index,
                          'discountPercentage',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-center focus:border-okron-primary focus:ring-1 focus:ring-okron-primary outline-none"
                      min={0}
                      max={100}
                      step="any"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">
                      {item.discountPercentage > 0
                        ? `${item.discountPercentage.toFixed(2)}%`
                        : '-'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-500">
                    {item.discountAmount > 0
                      ? formatCurrencyServerSider(item.discountAmount)
                      : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.taxPercentage}
                      onChange={e =>
                        onItemChange(
                          index,
                          'taxPercentage',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-center focus:border-okron-primary focus:ring-1 focus:ring-okron-primary outline-none"
                      min={0}
                      max={100}
                      step="any"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">
                      {item.taxPercentage}%
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-700">
                    {formatCurrencyServerSider(item.subtotal)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrencyServerSider(item.total)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
