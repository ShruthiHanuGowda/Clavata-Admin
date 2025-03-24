import { useState, useEffect } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts';

interface ChartProps {
  slot: 'week' | 'month';
  data: number[];
}

const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Format large numbers with K, M, etc. suffix
const formatYAxisLabel = (value: number): string => {
  // Make sure we have a number
  if (value === undefined || value === null || isNaN(value)) {
    return '';
  }

  // Handle zero case
  if (value === 0) {
    return '0';
  }

  // Format based on magnitude
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }

  return value.toString();
};

export default function Chart({ slot, data = [] }: ChartProps) {
  const theme = useTheme();

  const [labels, setLabels] = useState<string[]>(monthLabels);

  useEffect(() => {
    switch (slot) {
      case 'week':
        setLabels(weekLabels);
        break;
      case 'month':
        setLabels(monthLabels);
        break;
    }
  }, [slot]);

  const axisFonstyle = { fontSize: 10, fill: theme.palette.text.secondary };
  const line = theme.palette.divider;

  // Calculate chart parameters
  const maxValue = Math.max(...data, 1); // Ensure at least 1 to avoid division by zero
  const chartMax = maxValue * 1.1; // Add 10% padding

  return (
    <LineChart
      grid={{ horizontal: true, vertical: true }}
      xAxis={[
        {
          data: labels,
          scaleType: 'point',
          disableLine: true,
          tickLabelStyle: { ...axisFonstyle, fontSize: 12 }
        }
      ]}
      yAxis={[
        {
          disableLine: true,
          disableTicks: true,
          tickLabelStyle: axisFonstyle,
          min: 0,
          max: chartMax,
          scaleType: 'linear',
          valueFormatter: (value) => formatYAxisLabel(value)
        }
      ]}
      series={[
        {
          curve: 'linear',
          data,
          showMark: false,
          area: true,
          id: 'chart',
          color: theme.palette.primary.main,
          label: 'No. Data',
          valueFormatter: (value: number | null) => (value !== null ? formatYAxisLabel(value) : '')
        }
      ]}
      slotProps={{ legend: { hidden: true } }}
      height={355}
      margin={{ top: 30, bottom: 50, left: 45, right: 22 }}
      sx={{
        '& .MuiLineElement-root': { strokeDasharray: '0', strokeWidth: 1 },
        '& .MuiAreaElement-series-chart': { fill: `url('#myGradient3')`, paintOrder: 'stroke' },
        '& .MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: line }
      }}
    >
      <defs>
        <linearGradient id="myGradient3" gradientTransform="rotate(90)">
          <stop offset="10%" stopColor={alpha(theme.palette.primary.main, 0.2)} />
          <stop offset="80%" stopColor={alpha(theme.palette.background.default, 0.4)} />
        </linearGradient>
      </defs>
    </LineChart>
  );
}
