import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { WareHouseStock } from 'app/interfaces/WareHouse';

interface WarehouseStockProps {
  stock: WareHouseStock[];
}

const WarehouseStock: React.FC<WarehouseStockProps> = ({ stock }) => {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStock = stock.filter(
    stock =>
      stock.sparePart?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.sparePart?.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );
  return (
    <div className="w-full border rounded-md p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('warehouse.searchByCodeOrDescription')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 uppercase">
                {t('code')}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 uppercase">
                {t('description')}
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-600 uppercase">
                {t('quantity')}
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-600 uppercase">
                {t('price')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStock.map((stock, index) => (
              <tr
                key={index}
                className={`${
                  stock.isBelowMinimum ? 'bg-red-200' : 'hover:bg-gray-50 '
                } transition-colors`}
              >
                <td className="px-4 py-2 text-sm text-gray-700">
                  {stock.sparePart.code}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {stock.sparePart.description}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 text-right">
                  {stock.quantity}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 text-right">
                  {Number(stock.sparePart.price).toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStock.length === 0 && (
        <p className="mt-4 text-gray-500">{t('warehouse.noResults')}</p>
      )}
    </div>
  );
};
export default WarehouseStock;
