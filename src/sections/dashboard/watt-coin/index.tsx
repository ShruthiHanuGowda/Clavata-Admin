// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import AnalyticCard from 'components/dashboard/AnalyticCard';
import LineChartCard from 'components/dashboard/LineChartCard';

export default function WattCoin() {
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h3">$Watt Coin</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticCard title="$Watt coin price" count="4,42,236" percentage={59.3} extra="35,000" />
        </Grid>
        <Grid item xs={12}>
          <LineChartCard title="$Watt Coin Price" />
        </Grid>
      </Grid>
    </MainCard>
  );
}
