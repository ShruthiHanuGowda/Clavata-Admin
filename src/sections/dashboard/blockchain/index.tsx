import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

// project import
import MainCard from 'components/MainCard';
import AnalyticCard from 'components/dashboard/AnalyticCard';
import LineChartCard from 'components/dashboard/LineChartCard';

import useLineChart from 'hooks/useLineChart';
import { getTransactionChartData, getWalletChartData } from 'utils/api/denergytestnet';

export default function Blockchain({
  totalTransaction,
  totalTransaction24,
  totalWallets,
  totalWallets24
}: {
  totalTransaction: string;
  totalTransaction24: string;
  totalWallets: string;
  totalWallets24: string;
}) {
  const { slot: txnSlot, data: txnData, setData: setTxnData, handleSlotChange: handleTxnSlotChange } = useLineChart();
  const { slot: walletSlot, data: walletData, setData: setWalletData, handleSlotChange: handleWalletSlotChange } = useLineChart();
  
  const [txnLoading, setTxnLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [txnError, setTxnError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactionData = async () => {
      try {
        setTxnLoading(true);
        setTxnError(null);
        const data = await getTransactionChartData(txnSlot);
        setTxnData(data.chart.map(({ value }: { value: string }) => value));
      } catch (error) {
        console.error('Error loading transaction data:', error);
        setTxnError(error instanceof Error ? error.message : 'Failed to load transaction data');
      } finally {
        setTxnLoading(false);
      }
    };

    loadTransactionData();
  }, [txnSlot, setTxnData]);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setWalletLoading(true);
        setWalletError(null);
        const data = await getWalletChartData(walletSlot);
        setWalletData(data.chart.map(({ value }: { value: string }) => value));
      } catch (error) {
        console.error('Error loading wallet data:', error);
        setWalletError(error instanceof Error ? error.message : 'Failed to load wallet data');
      } finally {
        setWalletLoading(false);
      }
    };

    loadWalletData();
  }, [walletSlot, setWalletData]);

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h3">Blockchain</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticCard title="Total transaction" count={totalTransaction} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticCard title="Transactions in last 24 hours" count={totalTransaction24} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticCard title="Total Wallets" count={totalWallets} isLoss color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticCard title="New Wallets in last 24 hours" count={totalWallets24} isLoss color="warning" />
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          {txnError ? (
            <Alert severity="error">
              Error loading transaction data: {txnError}
            </Alert>
          ) : (
            <LineChartCard 
              title="Daily transactions" 
              slot={txnSlot} 
              data={txnData} 
              handleSlotChange={handleTxnSlotChange}
              loading={txnLoading}
            />
          )}
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          {walletError ? (
            <Alert severity="error">
              Error loading wallet data: {walletError}
            </Alert>
          ) : (
            <LineChartCard 
              title="Daily New Wallets" 
              slot={walletSlot} 
              data={walletData} 
              handleSlotChange={handleWalletSlotChange}
              loading={walletLoading}
            />
          )}
        </Grid>
      </Grid>
    </MainCard>
  );
}
