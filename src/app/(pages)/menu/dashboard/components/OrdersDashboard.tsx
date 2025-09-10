'use client';
import React, { useEffect, useState } from 'react';
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
    filteredOrders.forEach(order => {
      const account = order.account || 'Sense Compte';
      const total = parseFloat(order.totalAmount || '0');
      const current = accountMap.get(account) || 0;
      accountMap.set(account, current + total);
    });

    const data = Array.from(accountMap.entries())
      .map(([account, total]) => ({ account, total }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);

    setChartData(data);
  }, [orders, selectedProvider]);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full p-4 rounded-xl flex-grow bg-white shadow">
      <div className="relative w-full max-w-md">
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
            margin={{ top: 20, right: 55, left: 25, bottom: 20 }}
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
              formatter={(value: number) => formatEuropeanCurrency(value)}
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
                formatter={(value: number) => formatEuropeanCurrency(value)}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
