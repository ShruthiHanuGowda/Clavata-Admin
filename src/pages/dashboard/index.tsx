// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import Blockchain from 'sections/dashboard/blockchain';
import WattCoin from 'sections/dashboard/watt-coin';
import DWallet from 'sections/dashboard/d-wallet';
import DTerminal from 'sections/dashboard/d-terminal';

export default function Dashboard() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid>
      <Grid item xs={12} lg={12}>
        <Blockchain />
      </Grid>
      <Grid item xs={12} lg={12}>
        <WattCoin />
      </Grid>
      <Grid item xs={12} lg={12}>
        <DWallet />
      </Grid>
      <Grid item xs={12} lg={12}>
        <DTerminal />
      </Grid>
    </Grid>
  );
}
