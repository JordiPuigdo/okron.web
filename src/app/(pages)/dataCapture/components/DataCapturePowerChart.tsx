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

interface DataCapturePowerChartProps {
  telemetry: DeviceTelemetry[];
}

function DataCapturePowerChart({ telemetry }: DataCapturePowerChartProps) {
  const { t } = useTranslations();

  const data = telemetry
    .filter(
      item =>
        item.measurements?.powerKw !== undefined ||
        item.measurements?.currentAmps !== undefined
    )
    .map(item => ({
      time: new Date(item.timestamp).toLocaleString(),
      powerKw: item.measurements?.powerKw,
      currentAmps: item.measurements?.currentAmps,
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
        <Brush dataKey="time" height={28} stroke="#16a34a" travellerWidth={6} />
        <Line
          type="monotone"
          dataKey="powerKw"
          stroke="#16a34a"
          dot={false}
          strokeWidth={2}
          name="kW"
        />
        <Line
          type="monotone"
          dataKey="currentAmps"
          stroke="#ea580c"
          dot={false}
          strokeWidth={2}
          name="A"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DataCapturePowerChart;
