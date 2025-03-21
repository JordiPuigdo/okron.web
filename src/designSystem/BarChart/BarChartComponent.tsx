import { BarChart } from '@tremor/react';

interface BarChartComponentProps {
  chartData: any[];
  index: string;
  category: string[];
  title: string;
  showLegend?: boolean;
  yAxisWidth?: number;
}

const dataFormatter = (number: number) =>
  Intl.NumberFormat('us').format(number).toString();

export function BarChartComponent({
  chartData,
  index,
  category,
  title,
  showLegend = true,
  yAxisWidth = 90,
}: BarChartComponentProps) {
  return (
    <div className="w-full mx-auto">
      <p className="text-2xl p-2 mb-4 font-semibold text-left">{title}</p>
      <BarChart
        className={`${!showLegend && 'pt-8'}`}
        data={chartData}
        index={index}
        categories={category}
        colors={['blue', 'rose']}
        valueFormatter={dataFormatter}
        yAxisWidth={yAxisWidth} // Wider Y-axis
        showAnimation={true} // Smooth animation
        showTooltip={true} // Show tooltips on hover
        layout="vertical" // Optional: Vertical layout for bars
        showLegend={showLegend} // Show or hide legend
        noDataText="No hi ha resultats amb aquests filtres"
      />
    </div>
  );
}
