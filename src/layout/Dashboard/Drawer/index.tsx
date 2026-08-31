import { useMemo } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';

// project import
import DrawerHeader from './DrawerHeader';
import DrawerContent from './DrawerContent';
import MiniDrawerStyled from './MiniDrawerStyled';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { DRAWER_WIDTH } from 'config';

interface Props {
  window?: () => Window;
}

// ==============================|| MAIN LAYOUT - DRAWER ||============================== //

export default function MainDrawer({ window }: Props) {
  const { menuMaster } = useGetMenuMaster();

  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const downLG = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('lg')
  );

  // responsive drawer container
  const container =
    window !== undefined
      ? () => window().document.body
      : undefined;

  // header content
  const drawerContent = useMemo(
    () => <DrawerContent />,
    []
  );

  const drawerHeader = useMemo(
    () => <DrawerHeader open={drawerOpen} />,
    [drawerOpen]
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { md: 0 },
        zIndex: 1200,
        height: '100vh'
      }}
      aria-label="mailbox folders"
    >
      {/* =====================================================
          DESKTOP DRAWER
          ===================================================== */}
      {!downLG ? (
        <MiniDrawerStyled
          variant="permanent"
          open={drawerOpen}
          sx={{
            height: '100vh',

            '& .MuiDrawer-paper': {
              height: '100vh',
              overflow: 'hidden',

              display: 'flex',
              flexDirection: 'column',

              boxSizing: 'border-box'
            }
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              flex: '0 0 auto'
            }}
          >
            {drawerHeader}
          </Box>

          {/* CONTENT */}
          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              overflow: 'hidden',

              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {drawerContent}
          </Box>
        </MiniDrawerStyled>
      ) : (
        /* =====================================================
           MOBILE / TABLET DRAWER
           ===================================================== */
        <Drawer
          container={container}
          variant="temporary"
          open={drawerOpen}
          onClose={() => handlerDrawerOpen(!drawerOpen)}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: {
              xs: drawerOpen ? 'block' : 'none',
              lg: 'none'
            },

            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',

              width: DRAWER_WIDTH,

              borderRight: '1px solid',
              borderRightColor: 'divider',

              backgroundImage: 'none',

              boxShadow: 'inherit',

              height: '100vh',

              overflow: 'hidden',

              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              flex: '0 0 auto'
            }}
          >
            {drawerHeader}
          </Box>

          {/* CONTENT */}
          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              overflow: 'hidden',

              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {drawerContent}
          </Box>
        </Drawer>
      )}
    </Box>
  );
}