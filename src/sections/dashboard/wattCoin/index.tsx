// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import useLineChart from '../../../hooks/useLineChart';
import MainCard from 'components/MainCard';
import AnalyticCard from 'components/dashboard/AnalyticCard';
import LineChartCard from 'components/dashboard/LineChartCard';

export default function WattCoin({ coinPrice }: { coinPrice: string }) {
  const { slot: coinSlot, data: coinData, handleSlotChange: handleCoinSlotChange } = useLineChart();

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h3">$Watt Coin</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticCard title="$Watt coin price" count={coinPrice} />
        </Grid>
        <Grid item xs={12}>
          <LineChartCard title="$Watt Coin Price" slot={coinSlot} data={coinData} handleSlotChange={handleCoinSlotChange} />
        </Grid>
      </Grid>
    </MainCard>
  );
}
