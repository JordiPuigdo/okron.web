'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import { formatEuropeanCurrency } from 'app/utils/utils';
import { DateFilters } from 'components/Filters/DateFilter';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Hook personalizado para detectar clics fuera de un elemento
const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

interface OrdersDashboardProps {
  dateRange: DateFilters;
}

interface SimpleProvider {
  id: string;
  name: string;
}

export default function OrdersDashboard({ dateRange }: OrdersDashboardProps) {
  const { orders, getOrderWithFilters } = useOrder();
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [providerSearch, setProviderSearch] = useState<string>('');
  const [providers, setProviders] = useState<SimpleProvider[]>([]);
  const [chartData, setChartData] = useState<
    { account: string; total: number }[]
  >([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Referencia para el dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useClickOutside(dropdownRef, () => {
    setDropdownOpen(false);
  });

  // Cargar órdenes según dateRange
  useEffect(() => {
    getOrderWithFilters({
      from: dateRange.startDate!,
      to: dateRange.endDate!,
    });
  }, [dateRange]);

  // Extraer proveedores únicos
  useEffect(() => {
    const uniqueProviders: SimpleProvider[] = [];
    orders.forEach(order => {
      if (
        order.providerId &&
        !uniqueProviders.some(p => p.id === order.providerId)
      ) {
        uniqueProviders.push({
          id: order.providerId,
          name: order.providerName || '',
        });
      }
    });
    setProviders(uniqueProviders);
  }, [orders]);

  // Filtrar proveedores según búsqueda
  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(providerSearch.toLowerCase())
  );

  // Agrupar por cuenta contable y sumar total
  useEffect(() => {
    const filteredOrders = selectedProvider
      ? orders.filter(order => order.providerId === selectedProvider)
      : orders;

    const accountMap = new Map<string, number>();
    let overallTotal = 0;

    filteredOrders.forEach(order => {
      const account = order.account || 'Sense Compte';
      const total = parseFloat(order.totalAmount || '0');
      const current = accountMap.get(account) || 0;
      accountMap.set(account, current + total);
      overallTotal += total;
    });

    const data = Array.from(accountMap.entries())
      .map(([account, total]) => ({ account, total }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);

    setChartData(data);
    setTotalAmount(overallTotal);
  }, [orders, selectedProvider]);

  return (
    <div className="flex flex-col gap-6 w-full p-4 rounded-xl flex-grow bg-white shadow">
      {/* Sección de total general */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Total general
            </h2>
            <p className="text-sm text-gray-500">
              {selectedProvider
                ? `Proveïdor seleccionat: ${
                    providers.find(p => p.id === selectedProvider)?.name || ''
                  }`
                : 'Tots els proveïdors'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-700">
              {formatEuropeanCurrency(totalAmount)}
            </div>
            <div className="text-sm text-gray-500">
              {chartData.length} {chartData.length === 1 ? 'compte' : 'comptes'}
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-md" ref={dropdownRef}>
        <label className="font-semibold text-gray-700 mb-1 block">
          Proveïdor
        </label>
        <input
          type="text"
          placeholder="Buscar proveïdor..."
          value={providerSearch}
          onChange={e => {
            setProviderSearch(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {dropdownOpen && (
          <ul
            className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto border border-gray-300 bg-white rounded shadow-lg"
            role="listbox"
          >
            <li>
              <button
                className={`w-full text-left p-2 hover:bg-blue-100 ${
                  selectedProvider === '' ? 'bg-blue-100' : ''
                }`}
                onClick={() => {
                  setSelectedProvider('');
                  setDropdownOpen(false);
                  setProviderSearch('');
                }}
              >
                Tots
              </button>
            </li>
            {filteredProviders.map(provider => (
              <li key={provider.id} role="option">
                <button
                  className={`w-full text-left p-2 hover:bg-blue-100 ${
                    selectedProvider === provider.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setDropdownOpen(false);
                    setProviderSearch(provider.name);
                  }}
                >
                  {provider.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Gráfico horizontal */}
      <div className="w-full h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 125, left: 25, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={formatEuropeanCurrency}
              width={90}
            />
            <YAxis
              dataKey="account"
              type="category"
              width={180}
              tick={{ fontSize: 14, fill: '#374151' }}
            />
            <Tooltip
              formatter={(value: number) => [
                formatEuropeanCurrency(value),
                'Total',
              ]}
              labelFormatter={(label: string) => `Compte: ${label}`}
            />
            <Bar
              dataKey="total"
              fill="#3b82f6"
              radius={[4, 4, 4, 4]}
              barSize={80}
            >
              <LabelList
                dataKey="total"
                position="right"
                formatter={formatEuropeanCurrency}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
