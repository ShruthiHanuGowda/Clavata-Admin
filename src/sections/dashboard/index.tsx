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

const ChartCard = ({ id, chart }: { id: string; chart: any }) => {
  const { slot, data, setData, handleSlotChange: handleUserSlotChange } = useLineChart();

  useEffect(() => {
    if (id) getChartDataById(id, slot).then((data) => setData(data.chart.map(({ value }: { value: string }) => value)));
  }, [id, slot, setData]);

  return (
    <Grid item xs={12} md={6} lg={6}>
      <LineChartCard title={chart.title} description={chart.description} slot={slot} data={data} handleSlotChange={handleUserSlotChange} />
    </Grid>
  );
};

export default function StatisticsCard({ title, charts, analytics }: { title: string; charts: Array<any>; analytics: Array<any> }) {
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h3">{title}</Typography>
        </Grid>
        {analytics.length > 0 && (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {analytics.map((analytic: any, index) => (
                <Grid key={index} item xs={12} sm={6} md={3}>
                  <AnalyticCard {...analytic} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
        {charts.map(({ id, ...chart }: any, index) => (
          <ChartCard key={`${id}-${index}`} id={id} chart={chart} />
        ))}
      </Grid>
    </MainCard>
  );
}
