import React from 'react';
import { WorkOrderTypeChartProps } from 'app/(pages)/menu/dashboard/DashboardMM/DashboardMM';
import { Cell, Pie, PieChart } from 'recharts';

export interface DonutChartComponentProps {
  chartData: WorkOrderTypeChartProps[];
}

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  index: number;
}

const CustomLabel: React.FC<CustomLabelProps> = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 10;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const labelWidth = 40;
  const labelHeight = 20;
  return (
    <g>
      <rect
        x={x - labelWidth / 2}
        y={y - labelHeight / 2}
        width={labelWidth}
        height={labelHeight}
        rx={5}
        ry={5}
        fill="white"
      />

      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12px"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

const DonutChart = ({ chartData }: DonutChartComponentProps) => {
  const data = [
    { name: 'Preventiu', value: 0, color: '#4285F4', strokeWidth: 6 },
    { name: 'Correctiu', value: 0, color: '#E14F62', strokeWidth: 15 },
  ];

  const updatedData = data.map(item => ({
    ...item,
    value:
      chartData.find(chart => chart.index === item.name)?.value || item.value,
  }));

  const sum = updatedData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="relative flex flex-col items-center w-full">
      <div
        style={{
          width: '100%',
          height: '350px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: 'scale(1.3)',
            transformOrigin: 'center',
          }}
        >
          <PieChart width={500} height={500}>
            <Pie
              data={updatedData}
              dataKey="value"
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
              label={props => <CustomLabel {...(props as CustomLabelProps)} />}
              labelLine={false}
            >
              {updatedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={entry.color}
                  strokeWidth={entry.strokeWidth}
                />
              ))}
            </Pie>
          </PieChart>
        </div>
      </div>
      <p className="text-gray-600 text-sm">Total de {sum}</p>
    </div>
  );
};

export default DonutChart;
