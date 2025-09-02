// material-ui
import Box from '@mui/material/Box';
import Chip, { ChipProps } from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import

// assets
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import Tooltip from '@mui/material/Tooltip';
import MainCard from 'components/MainCard';

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

// ==============================|| STATISTICS - ECOMMERCE CARD ||============================== //

interface Props {
  title: string | undefined;
  count: string | number | undefined;
  percentage?: number;
  isLoss?: boolean;
  color?: ChipProps['color'];
  extra?: string;
  info?: string;
  description?: string;
}

export default function AnalyticCard({ color = 'primary', title, count, percentage, isLoss, extra, info, description }: Props) {
  return (
    <MainCard contentSX={{ p: 2.25 }}>
      <Stack spacing={0.5}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h4" color="inherit">
                {count ?? 0}
              </Typography>
              {info && (
                <Tooltip title={info} arrow>
                  <InfoCircleOutlined />
                </Tooltip>
              )}
            </Box>
          </Grid>
          {percentage && (
            <Grid item>
              <Chip
                variant="combined"
                color={color}
                icon={isLoss ? <FallOutlined style={iconSX} /> : <RiseOutlined style={iconSX} />}
                label={`${percentage}%`}
                sx={{ ml: 1.25, pl: 1 }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Stack>
      {extra && (
        <Box sx={{ pt: 2.25 }}>
          <Typography variant="caption" color="text.secondary">
            You made an extra{' '}
            <Typography variant="caption" sx={{ color: `${color || 'primary'}.main` }}>
              {extra}
            </Typography>{' '}
            this year
          </Typography>
        </Box>
      )}
      {description && (
        <Box sx={{ pt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Box>
      )}
    </MainCard>
  );
}
