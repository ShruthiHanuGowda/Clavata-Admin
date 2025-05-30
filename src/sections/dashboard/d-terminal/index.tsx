// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import AnalyticCard from 'components/dashboard/AnalyticCard';
import LineChartCard from 'components/dashboard/LineChartCard';
import { useDashboardData } from '../../../pages/dashboard/useDashboardData';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import React from 'react';

export default function DTerminal() {
  const { analytics, chartData, loading, error, timeSlot, handleTimeSlotChange, refetch } = useDashboardData('D_TERMINAL_API_BASE_URL');

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
          <Typography variant="h3">D Terminal</Typography>
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          <LineChartCard title="Daily New User Accounts" slot={timeSlot} data={chartData} handleSlotChange={handleTimeSlotChange} />
        </Grid>
        <Grid item xs={12} md={7} lg={4}>
          <Grid container spacing={2}>
            {analytics && (
              <>
                <Grid item xs={12}>
                  <AnalyticCard
                    title={analytics.totalUsers.title}
                    count={analytics.totalUsers.count}
                    percentage={analytics.totalUsers.percentage}
                    extra={analytics.totalUsers.extra}
                    isLoss={analytics.totalUsers.isLoss}
                  />
                </Grid>
                <Grid item xs={12}>
                  <AnalyticCard
                    title={analytics.dailyUsers.title}
                    count={analytics.dailyUsers.count}
                    percentage={analytics.dailyUsers.percentage}
                    extra={analytics.dailyUsers.extra}
                    isLoss={analytics.dailyUsers.isLoss}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
}
