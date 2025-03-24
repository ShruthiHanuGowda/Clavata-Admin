import { useEffect } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

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

  useEffect(() => {
    getTransactionChartData(txnSlot).then((data) => setTxnData(data.chart.map(({ value }: { value: string }) => value)));
  }, [txnSlot, setTxnData]);

  useEffect(() => {
    getWalletChartData(walletSlot).then((data) => setWalletData(data.chart.map(({ value }: { value: string }) => value)));
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
          <LineChartCard title="Daily transactions" slot={txnSlot} data={txnData} handleSlotChange={handleTxnSlotChange} />
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          <LineChartCard title="Daily New Wallets" slot={walletSlot} data={walletData} handleSlotChange={handleWalletSlotChange} />
        </Grid>
      </Grid>
    </MainCard>
  );
}
