import React from 'react';
import { formatEuropeanCurrency } from 'app/utils/utils';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useTranslations } from '../../app/hooks/useTranslations';

interface RechartsBarChartProps {
  chartData: { asset: string; total: number }[];
  title: string;
  showLegend?: boolean;
  barColor?: string;
}

const RechartsBarChart: React.FC<RechartsBarChartProps> = ({
  chartData,
  title,
  showLegend = false,
  barColor = '#3b82f6', // azul sólido por defecto
}) => {
  const { t } = useTranslations();

  const formatCurrency = (value: number | string | undefined | null) =>
    formatEuropeanCurrency(value, t);

  return (
    <div className="w-full mx-auto p-4">
      <p className="text-2xl font-semibold text-left">{title}</p>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 190 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="asset"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis tickFormatter={formatCurrency} width={90} />
          <Tooltip
            formatter={(value: number) => formatEuropeanCurrency(value, t)}
            labelFormatter={(label: string) => `Equip: ${label}`}
          />
          {showLegend && <Legend />}
          <Bar dataKey="total" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RechartsBarChart;
