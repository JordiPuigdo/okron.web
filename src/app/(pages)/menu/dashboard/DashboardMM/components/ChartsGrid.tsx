import { BarChart } from '@tremor/react';

import { ChartCard, ChartEmptyState } from './ChartCard';
import { GaugeChart } from './GaugeChart';

interface OperatorChartData {
  operator: string;
  Preventius: number;
  Correctius: number;
  Tickets: number;
}

interface ChartsGridProps {
  operatorData: OperatorChartData[];
  totalCorrective: number;
  totalPreventive: number;
  t: (key: string) => string;
}

// Formateador de números
const dataFormatter = (number: number) =>
  Intl.NumberFormat('es-ES').format(number).toString();

export const ChartsGrid: React.FC<ChartsGridProps> = ({
  operatorData,
  totalCorrective,
  totalPreventive,
  t,
}) => {
  // Total para calcular porcentajes
  const total = totalCorrective + totalPreventive;

  // Porcentaje de correctivo (lo que queremos minimizar)
  const correctivePercentage = total > 0 
    ? (totalCorrective / total) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      {/* Gauge Chart - Mantenimiento Correctivo vs Preventivo */}
      <ChartCard
        title={t('maintenance.corrective.vs.preventive')}
        subtitle={`${total} ${t('work.orders').toLowerCase()}`}
      >
        {total > 0 ? (
          <div className="flex flex-col items-center py-4">
            {/* Gauge */}
            <GaugeChart
              percentage={correctivePercentage}
              title={t('corrective.percentage')}
              size={220}
            />

            {/* Stats debajo del gauge */}
            <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-grey-30 w-full">
              <div className="text-center">
                <p className="text-2xl font-bold text-alert-success">
                  {totalPreventive}
                </p>
                <p className="text-xs text-grey-70">{t('preventive')}</p>
              </div>
              <div className="w-px bg-grey-30" />
              <div className="text-center">
                <p className="text-2xl font-bold text-alert-warning">
                  {totalCorrective}
                </p>
                <p className="text-xs text-grey-70">{t('corrective')}</p>
              </div>
            </div>
          </div>
        ) : (
          <ChartEmptyState message={t('no.results.filters')} />
        )}
      </ChartCard>

      {/* Bar Chart - Work Orders por Operador */}
      <ChartCard
        title={t('work.orders.per.operator')}
        subtitle={t('distribution.by.type')}
      >
        {operatorData.length > 0 ? (
          <div className="flex flex-col h-full">
            <BarChart
              data={operatorData}
              index="operator"
              categories={['Preventius', 'Correctius', 'Tickets']}
              colors={['blue', 'rose', 'emerald']}
              valueFormatter={dataFormatter}
              yAxisWidth={100}
              showAnimation={true}
              showTooltip={true}
              layout="vertical"
              showLegend={true}
              className="h-64"
              noDataText={t('no.results.filters')}
            />

            {/* Resumen de operadores */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-grey-30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-grey-10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-grey-70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-primary">
                    {operatorData.length} {t('operators')}
                  </p>
                  <p className="text-xs text-grey-70">{t('with.assigned.work.orders')}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ChartEmptyState message={t('no.results.filters')} />
        )}
      </ChartCard>
    </div>
  );
};

export default ChartsGrid;
