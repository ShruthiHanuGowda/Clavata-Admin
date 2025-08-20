import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import Blockchain from 'sections/dashboard/blockchain';
// import WattCoin from 'sections/dashboard/watt-coin';
import DWallet from 'sections/dashboard/dWallet';
import DTerminal from 'sections/dashboard/dTerminal';
import StatisticsCard from 'sections/dashboard';
import { getStats, getCounters, getCharts, getNewAccounts } from 'utils/api/denergytestnet';
import EnergyConsumption from 'sections/dashboard/energyConsumption';

const countersToAnalytics: any = {
  accounts: ['totalAccounts', 'totalAddresses'],
  transactions: ['totalTxns', 'pendingTxns30m', 'completedTxns', 'newTxns24h'],
  blocks: ['averageBlockTime', 'totalBlocks', 'totalTokens', ''],
  tokens: [],
  gas: ['averageTxnFee24h', 'txnsFee24h'],
  contracts: ['totalContracts', 'totalVerifiedContracts', 'lastNewVerifiedContracts'],
  wattCoin: ['totalNativeCoinTransfers']
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});
  const [counters, setCounters] = useState<any>([]);
  const [charts, setCharts] = useState<{ id: string; title: string; charts: Array<any> }[]>([]);

  useEffect(() => {
    getStats().then((data) => setStats(data));
    getCounters().then((data) =>
      setCounters(
        data.counters.map((counter: any) => ({
          id: counter.id,
          title: counter.title,
          info: counter.description,
          count: parseFloat(parseFloat(counter.value).toFixed(3))
        }))
      )
    );
    getCharts().then((data) => setCharts(data.sections));
    getNewAccounts().then((data) => {
      if (data?.chart && Array.isArray(data.chart) && data.chart.length > 0 && 'value' in data.chart[0]) {
        setStats({ ...stats, newAccountsIN24Hours: data.chart[0].value });
      }
    });
  }, []);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid>
      <Grid item xs={12} lg={12}>
        <Blockchain
          totalTransaction={stats?.total_transactions}
          totalTransaction24={stats?.transactions_today}
          totalWallets={stats?.total_addresses}
          totalWallets24={stats?.newAccountsIN24Hours ?? 0}
        />
      </Grid>
      {/* <Grid item xs={12} lg={12}>
        <WattCoin coinPrice={stats?.coin_price} />
      </Grid> */}
      <Grid item xs={12} lg={12}>
        <EnergyConsumption />
      </Grid>
      <Grid item xs={12} lg={12}>
        <DWallet />
      </Grid>
      <Grid item xs={12} lg={12}>
        <DTerminal />
      </Grid>
      {charts.map(({ id, title, charts }, index) => (
        <Grid key={`${id}-${index}`} item xs={12} lg={12}>
          <StatisticsCard
            title={title}
            charts={charts}
            analytics={
              countersToAnalytics[id]
                ?.map((counterId: string) => counters.find((counter: any) => counter.id === counterId))
                .filter(Boolean) || []
            }
          />
        </Grid>
      ))}
    </Grid>
  );
}
