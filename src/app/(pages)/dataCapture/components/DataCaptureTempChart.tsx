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

interface DataCaptureTempChartProps {
  telemetry: DeviceTelemetry[];
}

function DataCaptureTempChart({ telemetry }: DataCaptureTempChartProps) {
  const { t } = useTranslations();

  const data = telemetry
    .filter(
      item =>
        item.measurements?.heatsinkTempC !== undefined ||
        item.measurements?.internalTempC !== undefined
    )
    .map(item => ({
      time: new Date(item.timestamp).toLocaleString(),
      heatsink: item.measurements?.heatsinkTempC,
      internal: item.measurements?.internalTempC,
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
        <YAxis tick={{ fontSize: 11 }} unit="°C" />
        <Tooltip />
        <Legend />
        <Brush dataKey="time" height={28} stroke="#dc2626" travellerWidth={6} />
        <Line
          type="monotone"
          dataKey="heatsink"
          stroke="#dc2626"
          dot={false}
          strokeWidth={2}
          name="Heatsink"
        />
        <Line
          type="monotone"
          dataKey="internal"
          stroke="#7c3aed"
          dot={false}
          strokeWidth={2}
          name="Internal"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DataCaptureTempChart;
