import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

// project import
import MainCard from 'components/MainCard';
import AnalyticCard from 'components/dashboard/AnalyticCard';
import LineChartCard from 'components/dashboard/LineChartCard';
import { useDashboardData } from 'pages/dashboard/useDashboardData';

function DWallet() {
  const { analytics, chartData, loading, error, timeSlot, handleTimeSlotChange, refetch } = useDashboardData('D_WALLET_API_BASE_URL');

  if (loading) {
    return (
      <MainCard>
        <Grid container spacing={2} justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
          <Grid item>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary">
                Loading dashboard data...
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard>
        <Alert
          severity="error"
          action={
            <button
              onClick={refetch}
              style={{
                background: 'none',
                border: '1px solid #f44336',
                color: '#f44336',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          }
        >
          Error loading dashboard data: {error}
        </Alert>
      </MainCard>
    );
  }

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h3">D Wallet</Typography>
        </Grid>

        {analytics && (
          <>
            <Grid item xs={12} sm={6} md={6}>
              <AnalyticCard title={analytics.totalUsers.title} count={analytics.totalUsers.count} isLoss={analytics.totalUsers.isLoss} />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <AnalyticCard title={analytics.dailyUsers.title} count={analytics.dailyUsers.count} isLoss={analytics.dailyUsers.isLoss} />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <LineChartCard title="Daily New User Accounts" slot={timeSlot} data={chartData} handleSlotChange={handleTimeSlotChange} />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default DWallet;
