import { useTranslations } from 'app/hooks/useTranslations';
import DeviceTelemetry from 'app/interfaces/DeviceTelemetry';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DataCaptureFaultChartProps {
  telemetry: DeviceTelemetry[];
}

function DataCaptureFaultChart({ telemetry }: DataCaptureFaultChartProps) {
  const { t } = useTranslations();

  const faultCounts = telemetry.reduce<Record<number, number>>((acc, item) => {
    const code = item.measurements?.faultCode;
    if (code === undefined || code === 0) return acc;
    acc[code] = (acc[code] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(faultCounts).map(([code, count]) => ({
    code: `E${code}`,
    count,
  }));

  if (data.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        {t('datacapture.noFaults')}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={270}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="code" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Brush dataKey="code" height={28} stroke="#dc2626" travellerWidth={6} />
        <Bar dataKey="count" name={t('datacapture.faultCount')} radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill="#dc2626" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default DataCaptureFaultChart;
