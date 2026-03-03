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
      <div className="p-4 text-center">
        <p className="text-gray-400 text-sm">{t('creditNotes.noLinesYet')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{t('creditNotes.lines')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border text-left">
                {t('description')}
              </th>
              <th className="p-2 border text-center">
                {t('quantity')}
              </th>
              <th className="p-2 border text-center">
                {t('unitPrice')}
              </th>
              <th className="p-2 border text-center">
                % {t('discount')}
              </th>
              <th className="p-2 border text-center">
                {t('discount')}
              </th>
              <th className="p-2 border text-center">
                % {t('tax')}
              </th>
              <th className="p-2 border text-center">
                {t('subtotal')}
              </th>
              <th className="p-2 border text-center">
                {t('total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id || index}
                className="border-t"
              >
                <td className="p-2 border">
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
                    <span>{item.description}</span>
                  )}
                </td>
                <td className="p-2 border text-center">
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
                      step="any"
                    />
                  ) : (
                    <span>{item.quantity}</span>
                  )}
                </td>
                <td className="p-2 border text-center">
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
                      className="w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-center focus:border-okron-primary focus:ring-1 focus:ring-okron-primary outline-none"
                      step="any"
                    />
                  ) : (
                    <span>{formatCurrencyServerSider(item.unitPrice)}</span>
                  )}
                </td>
                <td className="p-2 border text-center">
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
                    <span>
                      {item.discountPercentage > 0
                        ? `${item.discountPercentage.toFixed(2)}%`
                        : '-'}
                    </span>
                  )}
                </td>
                <td className="p-2 border text-center">
                  {item.discountAmount > 0
                    ? formatCurrencyServerSider(item.discountAmount)
                    : '-'}
                </td>
                <td className="p-2 border text-center">
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
                    <span>{item.taxPercentage}%</span>
                  )}
                </td>
                <td className="p-2 border text-center">
                  {formatCurrencyServerSider(item.subtotal)}
                </td>
                <td className="p-2 border text-center">
                  {formatCurrencyServerSider(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
