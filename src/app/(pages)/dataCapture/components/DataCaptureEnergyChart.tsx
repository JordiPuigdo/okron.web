import { useTranslations } from 'app/hooks/useTranslations';
import DeviceTelemetry from 'app/interfaces/DeviceTelemetry';
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DataCaptureEnergyChartProps {
  telemetry: DeviceTelemetry[];
}

function DataCaptureEnergyChart({ telemetry }: DataCaptureEnergyChartProps) {
  const { t } = useTranslations();

  const data = telemetry
    .filter(item => item.energyKwh !== undefined)
    .map(item => ({
      time: new Date(item.timestamp).toLocaleString(),
      energy: item.energyKwh,
    }));

  if (data.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        {t('datacapture.noData')}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={270}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Brush dataKey="time" height={28} stroke="#2563eb" travellerWidth={6} />
        <Line
          type="monotone"
          dataKey="energy"
          stroke="#2563eb"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DataCaptureEnergyChart;
