// material-ui
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';

// project import
import { DRAWER_WIDTH, ThemeMode } from 'config';

// ==============================|| OPENED MIXIN ||============================== //

const openedMixin = (theme: Theme) =>
  ({
    width: DRAWER_WIDTH,

    height: '100vh',

    borderRight: '1px solid',
    borderRightColor: theme.palette.divider,

    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),

    overflowX: 'hidden',
    overflowY: 'hidden',

    display: 'flex',
    flexDirection: 'column',

    boxSizing: 'border-box',

    boxShadow:
      theme.palette.mode === ThemeMode.DARK
        ? theme.customShadows.z1
        : 'none'
  }) as CSSObject;

// ==============================|| CLOSED MIXIN ||============================== //

const closedMixin = (theme: Theme) =>
  ({
    height: '100vh',

    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),

    overflowX: 'hidden',
    overflowY: 'hidden',

    display: 'flex',
    flexDirection: 'column',

    width: theme.spacing(7.5),

    borderRight: 'none',

    boxSizing: 'border-box',

    boxShadow: theme.customShadows.z1
  }) as CSSObject;

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  width: DRAWER_WIDTH,

  height: '100vh',

  flexShrink: 0,

  whiteSpace: 'nowrap',

  boxSizing: 'border-box',

  ...(open && {
    ...openedMixin(theme),

    '& .MuiDrawer-paper': {
      ...openedMixin(theme),

      height: '100vh',

      display: 'flex',
      flexDirection: 'column',

      overflowX: 'hidden',
      overflowY: 'hidden',

      boxSizing: 'border-box'
    }
  }),

  ...(!open && {
    ...closedMixin(theme),

    '& .MuiDrawer-paper': {
      ...closedMixin(theme),

      height: '100vh',

      display: 'flex',
      flexDirection: 'column',

      overflowX: 'hidden',
      overflowY: 'hidden',

      boxSizing: 'border-box'
    }
  })
}));

export default MiniDrawerStyled;