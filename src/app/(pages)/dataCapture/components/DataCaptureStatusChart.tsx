import { useTranslations } from 'app/hooks/useTranslations';
import DeviceTelemetry, { DeviceStatus } from 'app/interfaces/DeviceTelemetry';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  Running: '#16a34a',
  Stopped: '#6b7280',
  Fault: '#dc2626',
  Idle: '#2563eb',
  Unknown: '#9ca3af',
};

const DEFAULT_COLOR = '#9ca3af';

function resolveStatusLabel(status: DeviceStatus | undefined): string {
  if (!status) return 'Unknown';
  if (status.fault) return 'Fault';
  if (status.running) return 'Running';
  if (status.ready) return 'Idle';
  return 'Stopped';
}

interface DataCaptureStatusChartProps {
  telemetry: DeviceTelemetry[];
}

function DataCaptureStatusChart({ telemetry }: DataCaptureStatusChartProps) {
  const { t } = useTranslations();

  const statusCounts = telemetry.reduce<Record<string, number>>((acc, item) => {
    const status = resolveStatusLabel(item.status);
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  if (data.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        {t('datacapture.noData')}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={STATUS_COLORS[entry.name] ?? DEFAULT_COLOR}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default DataCaptureStatusChart;
