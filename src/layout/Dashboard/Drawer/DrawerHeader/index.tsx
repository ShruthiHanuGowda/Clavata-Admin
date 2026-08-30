import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// project import
import DrawerHeaderStyled from './DrawerHeaderStyled';

import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';

interface Props {
  open: boolean;
}

export default function DrawerHeader({ open }: Props) {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  return (
    <DrawerHeaderStyled
      theme={theme}
      open={open}
      sx={{
        minHeight: isHorizontal ? 'unset' : '60px',
        width: isHorizontal ? { xs: '100%', lg: '424px' } : 'initial',
        paddingTop: isHorizontal ? { xs: '10px', lg: '0' } : '8px',
        paddingBottom: isHorizontal ? { xs: '18px', lg: '0' } : '8px',
        paddingLeft: isHorizontal ? { xs: '24px', lg: '0' } : open ? '24px' : 0,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {open ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Logo mark */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Typography
              sx={{
                color: '#fff',
                fontSize: '20px',
                fontWeight: 800,
                lineHeight: 1
              }}
            >
              C
            </Typography>
          </Box>

          {/* Brand */}
          <Box>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                lineHeight: 1,
                color: theme.palette.text.primary
              }}
            >
              CLAVATA
            </Typography>

            <Typography
              sx={{
                fontSize: '8px',
                fontWeight: 500,
                letterSpacing: '1.8px',
                color: theme.palette.text.secondary,
                mt: '4px'
              }}
            >
              ADMIN PORTAL
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto'
          }}
        >
          <Typography
            sx={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: 800,
              lineHeight: 1
            }}
          >
            C
          </Typography>
        </Box>
      )}
    </DrawerHeaderStyled>
  );
}