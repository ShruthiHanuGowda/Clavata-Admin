import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

// project import
import Blockchain from 'sections/dashboard/blockchain';
// import WattCoin from 'sections/dashboard/watt-coin';
import DWallet from 'sections/dashboard/dWallet';
import DTerminal from 'sections/dashboard/dTerminal';
import StatisticsCard from 'sections/dashboard';
import { getStats, getCounters, getCharts, getNewAccounts } from 'utils/api/denergytestnet';
import EnergyConsumption from 'sections/dashboard/energyConsumption';
import ErrorBoundary from 'components/ErrorBoundary';

interface CounterData {
  id: string;
  title: string;
  info?: string;
  count: number;
}

interface StatsData {
  total_transactions?: string | number;
  transactions_today?: string | number;
  total_addresses?: string | number;
  newAccountsIN24Hours?: string | number;
  coin_price?: string | number;
}

interface ChartSection {
  id: string;
  title: string;
  charts: Array<any>;
}

const countersToAnalytics: Record<string, string[]> = {
  accounts: ['totalAccounts', 'totalAddresses'],
  transactions: ['totalTxns', 'pendingTxns30m', 'completedTxns', 'newTxns24h'],
  blocks: ['averageBlockTime', 'totalBlocks', 'totalTokens', ''],
  tokens: [],
  gas: ['averageTxnFee24h', 'txnsFee24h'],
  contracts: ['totalContracts', 'totalVerifiedContracts', 'lastNewVerifiedContracts'],
  wattCoin: ['totalNativeCoinTransfers']
};

export default function Dashboard() {
  const [stats, setStats] = useState<StatsData>({});
  const [counters, setCounters] = useState<CounterData[]>([]);
  const [charts, setCharts] = useState<ChartSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, countersData, chartsData, newAccountsData] = await Promise.all([
          getStats(),
          getCounters(),
          getCharts(),
          getNewAccounts()
        ]);

        // Normalize stats data
        const normalizedStats: StatsData = {
          total_transactions: statsData?.total_transactions || 0,
          transactions_today: statsData?.transactions_today || 0,
          total_addresses: statsData?.total_addresses || 0,
          coin_price: statsData?.coin_price || 0
        };

        // Normalize counters data
        const normalizedCounters: CounterData[] =
          countersData?.counters?.map((counter: any) => ({
            id: counter.id || '',
            title: counter.title || 'Unknown',
            info: counter.description || '',
            count: isNaN(parseFloat(counter.value)) ? 0 : parseFloat(parseFloat(counter.value).toFixed(3))
          })) || [];

        // Normalize charts data
        const normalizedCharts: ChartSection[] =
          chartsData?.sections?.map((section: any) => ({
            id: section.id || '',
            title: section.title || 'Unknown',
            charts: Array.isArray(section.charts) ? section.charts : []
          })) || [];

        setStats(normalizedStats);
        setCounters(normalizedCounters);
        setCharts(normalizedCharts);

        // Handle new accounts data
        if (newAccountsData?.chart && Array.isArray(newAccountsData.chart) && newAccountsData.chart.length > 0) {
          const firstChartEntry = newAccountsData.chart[0];
          if (firstChartEntry && 'value' in firstChartEntry) {
            setStats((prev) => ({
              ...prev,
              newAccountsIN24Hours: isNaN(parseFloat(firstChartEntry.value)) ? 0 : parseFloat(firstChartEntry.value)
            }));
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        let errorMessage = 'Failed to load dashboard data';

        if (err instanceof Error) {
          if (err.message.includes('Network Error') || err.message.includes('CORS')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection or contact support.';
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
        <Grid item>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" color="text.secondary">
              Loading dashboard data...
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container>
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading dashboard: {error}
          </Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid>
      <Grid item xs={12} lg={12}>
        <ErrorBoundary>
          <Blockchain
            totalTransaction={String(stats?.total_transactions || 0)}
            totalTransaction24={String(stats?.transactions_today || 0)}
            totalWallets={String(stats?.total_addresses || 0)}
            totalWallets24={String(stats?.newAccountsIN24Hours || 0)}
          />
        </ErrorBoundary>
      </Grid>
      {/* <Grid item xs={12} lg={12}>
        <WattCoin coinPrice={stats?.coin_price} />
      </Grid> */}
      <Grid item xs={12} lg={12}>
        <ErrorBoundary>
          <EnergyConsumption />
        </ErrorBoundary>
      </Grid>
      <Grid item xs={12} lg={12}>
        <ErrorBoundary>
          <DWallet />
        </ErrorBoundary>
      </Grid>
      <Grid item xs={12} lg={12}>
        <ErrorBoundary>
          <DTerminal />
        </ErrorBoundary>
      </Grid>
      {charts.map(({ id, title, charts }, index) => (
        <Grid key={`${id}-${index}`} item xs={12} lg={12}>
          <ErrorBoundary>
            <StatisticsCard
              title={title}
              charts={charts}
              analytics={
                countersToAnalytics[id]
                  ?.map((counterId: string) => counters.find((counter) => counter.id === counterId))
                  .filter((counter): counter is CounterData => Boolean(counter)) || []
              }
            />
          </ErrorBoundary>
        </Grid>
      ))}
    </Grid>
  );
}
