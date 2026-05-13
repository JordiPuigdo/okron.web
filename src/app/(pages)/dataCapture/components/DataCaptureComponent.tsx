import { useTranslations } from 'app/hooks/useTranslations';
import { useDeviceTelemetryHook } from 'app/hooks/useDeviceTelemetryHook';
import { Maximize2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import DataCaptureEnergyChart from './DataCaptureEnergyChart';
import DataCaptureFaultChart from './DataCaptureFaultChart';
import DataCaptureFilters from './DataCaptureFilters';
import DataCaptureFrequencyLoadChart from './DataCaptureFrequencyLoadChart';
import DataCapturePowerChart from './DataCapturePowerChart';
import DataCaptureStatusChart from './DataCaptureStatusChart';
import DataCaptureTempChart from './DataCaptureTempChart';
import DataCaptureVoltageChart from './DataCaptureVoltageChart';

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isExpanded]);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Expandir gràfic"
          >
            <Maximize2 size={15} />
          </button>
        </div>
        {children}
      </div>

      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col"
            style={{ height: '80vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 p-6">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}

function DataCaptureComponent() {
  const { t } = useTranslations();
  const { telemetry, loading, error, filters, setFilters } =
    useDeviceTelemetryHook();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-800">
        {t('datacapture.title')}
      </h1>

      <DataCaptureFilters filters={filters} onFiltersChange={setFilters} />

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-okron-main border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title={t('datacapture.energy')}>
            <DataCaptureEnergyChart telemetry={telemetry} />
          </ChartCard>

          <ChartCard title={t('datacapture.power')}>
            <DataCapturePowerChart telemetry={telemetry} />
          </ChartCard>

          <ChartCard title={t('datacapture.temperature')}>
            <DataCaptureTempChart telemetry={telemetry} />
          </ChartCard>

          <ChartCard title={t('datacapture.status')}>
            <DataCaptureStatusChart telemetry={telemetry} />
          </ChartCard>

          <ChartCard title={t('datacapture.frequencyload')}>
            <DataCaptureFrequencyLoadChart telemetry={telemetry} />
          </ChartCard>

          <ChartCard title={t('datacapture.voltage')}>
            <DataCaptureVoltageChart telemetry={telemetry} />
          </ChartCard>

          <div className="lg:col-span-2">
            <ChartCard title={t('datacapture.faults')}>
              <DataCaptureFaultChart telemetry={telemetry} />
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataCaptureComponent;
