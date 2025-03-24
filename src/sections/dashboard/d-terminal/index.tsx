// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import AnalyticCard from 'components/dashboard/AnalyticCard';
import LineChartCard from 'components/dashboard/LineChartCard';
import useLineChart from '../../../hooks/useLineChart';

export default function DTerminal() {
  const { slot: userSlot, data: userData, handleSlotChange: handleUserSlotChange } = useLineChart();

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h3">D Terminal</Typography>
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          <LineChartCard title="Daily New User Accounts" slot={userSlot} data={userData} handleSlotChange={handleUserSlotChange} />
        </Grid>
        <Grid item xs={12} md={7} lg={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <AnalyticCard title="Number user accounts" count="4,42,236" percentage={59.3} />
            </Grid>
            <Grid item xs={12}>
              <AnalyticCard title="New User accounts in 24 hours" count="4,42,236" percentage={59.3} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
}
