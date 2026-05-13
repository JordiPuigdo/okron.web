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

interface DataCaptureVoltageChartProps {
  telemetry: DeviceTelemetry[];
}

function DataCaptureVoltageChart({ telemetry }: DataCaptureVoltageChartProps) {
  const { t } = useTranslations();

  const data = telemetry
    .filter(
      item =>
        item.measurements?.busVoltageVdc !== undefined ||
        item.measurements?.motorVoltageV !== undefined
    )
    .map(item => ({
      time: new Date(item.timestamp).toLocaleString(),
      busVoltageVdc: item.measurements?.busVoltageVdc,
      motorVoltageV: item.measurements?.motorVoltageV,
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
        <YAxis tick={{ fontSize: 11 }} unit="V" />
        <Tooltip />
        <Legend />
        <Brush dataKey="time" height={28} stroke="#0891b2" travellerWidth={6} />
        <Line
          type="monotone"
          dataKey="busVoltageVdc"
          stroke="#0891b2"
          dot={false}
          strokeWidth={2}
          name="Vdc (bus)"
        />
        <Line
          type="monotone"
          dataKey="motorVoltageV"
          stroke="#7c3aed"
          dot={false}
          strokeWidth={2}
          name="V (motor)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DataCaptureVoltageChart;
