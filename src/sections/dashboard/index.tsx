import { useEffect } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import useLineChart from 'hooks/useLineChart';
import MainCard from 'components/MainCard';
import LineChartCard from 'components/dashboard/LineChartCard';
import { getChartDataById } from 'utils/api/denergytestnet';
import AnalyticCard from 'components/dashboard/AnalyticCard';
import { TimeSlot } from 'hooks/useLineChart';

interface Chart {
  id: string;
  title: string;
  description?: string;
  resolutions?: ('week' | 'month' | 'day' | 'YEAR' | 'WEEK' | 'MONTH' | 'DAY')[];
  [key: string]: unknown;
}

interface Analytic {
  title: string;
  count: string | number;
  percentage?: number;
  extra?: string;
  isLoss: boolean;
}

interface StatisticsCardProps {
  title: string;
  charts: Chart[];
  analytics: Analytic[];
}
interface ChartCardProps {
  id: string;
  chart: Omit<Chart, 'id'>;
}
const ChartCard = ({ id, chart }: ChartCardProps) => {
  const initialSlot =
    Array.isArray(chart?.resolutions) && chart.resolutions.length > 0 ? (chart.resolutions[0].toLowerCase() as TimeSlot) : 'week';
  const { slot, data, setData, handleSlotChange: handleUserSlotChange } = useLineChart(initialSlot);

  useEffect(() => {
    if (id) {
      const resolution = slot;
      getChartDataById(id, resolution).then((data) => {
        setData(data.chart.map(({ value }: { value: string }) => value));
      });
    }
  }, [id, slot, setData]);

  return (
    <Grid item xs={12} md={6} lg={6}>
      <LineChartCard
        title={chart.title as string}
        description={chart.description as string | undefined}
        slot={slot}
        data={data}
        handleSlotChange={handleUserSlotChange}
        resolutions={chart.resolutions as ('week' | 'month' | 'day' | 'year')[] | undefined}
      />
    </Grid>
  );
};

export default function StatisticsCard({ title, charts, analytics }: StatisticsCardProps) {
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h3">{title}</Typography>
        </Grid>
        {analytics.length > 0 && (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {analytics.map((analytic, index) => (
                <Grid key={index} item xs={12} sm={6} md={3}>
                  <AnalyticCard {...analytic} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
        {charts.map(({ id, ...chart }, index) => (
          <ChartCard key={`${id}-${index}`} id={id} chart={chart} />
        ))}
      </Grid>
    </MainCard>
  );
}
