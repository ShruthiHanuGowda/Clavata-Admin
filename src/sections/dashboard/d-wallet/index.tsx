// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import AnalyticCard from 'components/dashboard/AnalyticCard';
import LineChartCard from 'components/dashboard/LineChartCard';
import useLineChart from '../../../hooks/useLineChart';

export default function DWallet() {
  const { slot: userSlot, data: userData, handleSlotChange: handleUserSlotChange } = useLineChart();
  const { slot: appSlot, data: appData, handleSlotChange: handleAppSlotChange } = useLineChart();

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h3">D Wallet</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticCard title="New User accounts" count="4,42,236" percentage={59.3} extra="35,000" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticCard title="New User accounts in 24 hours" count="78,250" percentage={70.5} extra="8,900" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticCard title="Total App Download" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          <LineChartCard title="Daily New User Accounts" slot={userSlot} data={userData} handleSlotChange={handleUserSlotChange} />
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          <LineChartCard title="Daily App Downloads" slot={appSlot} data={appData} handleSlotChange={handleAppSlotChange} />
        </Grid>
      </Grid>
    </MainCard>
  );
}
