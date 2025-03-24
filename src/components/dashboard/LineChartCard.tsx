import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import LineChart from 'components/dashboard/LineChart';

export default function LineChartCard({ title, data = [] }: { title: string; data: number[] }) {
  const [slot, setSlot] = useState<'month' | 'week'>('week');

  const handleSlot = (e: SelectChangeEvent) => {
    setSlot(e.target.value as 'month' | 'week');
  };

  return (
    <MainCard content={false}>
      <Grid item>
        <Grid container>
          <Grid item xs={12} sm={6}>
            <Stack sx={{ ml: { xs: 0, sm: 2 }, mt: 2 }} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              <Typography variant="h5">{title}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: 'center', sm: 'flex-end' }}
              sx={{ mt: 2, mr: { xs: 0, sm: 2 } }}
            >
              <Select value={slot} onChange={handleSlot} size="small">
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </Select>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
      <Box width={1}>
        <LineChart slot={slot} data={data} />
      </Box>
    </MainCard>
  );
}
