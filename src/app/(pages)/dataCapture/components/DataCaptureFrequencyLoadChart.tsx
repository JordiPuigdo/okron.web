import { useTranslations } from 'app/hooks/useTranslations';
import DeviceTelemetry from 'app/interfaces/DeviceTelemetry';
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DataCaptureFrequencyLoadChartProps {
  telemetry: DeviceTelemetry[];
}

function DataCaptureFrequencyLoadChart({
  telemetry,
}: DataCaptureFrequencyLoadChartProps) {
  const { t } = useTranslations();

  const data = telemetry
    .filter(
      item =>
        item.measurements?.frequencyHz !== undefined ||
        item.measurements?.loadPercent !== undefined
    )
    .map(item => ({
      time: new Date(item.timestamp).toLocaleString(),
      frequencyHz: item.measurements?.frequencyHz,
      loadPercent: item.measurements?.loadPercent,
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
        <Legend />
        <Brush dataKey="time" height={28} stroke="#2563eb" travellerWidth={6} />
        <Line
          type="monotone"
          dataKey="frequencyHz"
          stroke="#2563eb"
          dot={false}
          strokeWidth={2}
          name="Hz"
        />
        <Line
          type="monotone"
          dataKey="loadPercent"
          stroke="#d97706"
          dot={false}
          strokeWidth={2}
          name="%"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DataCaptureFrequencyLoadChart;
