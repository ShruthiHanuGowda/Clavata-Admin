// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project import
import Message from './Message';
import Profile from './Profile';
import Notification from './Notification';
import FullScreen from './FullScreen';
import MobileSection from './MobileSection';
import DrawerHeader from 'layout/Dashboard/Drawer/DrawerHeader';
import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';

// import { Tooltip } from 'antd';
// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { menuOrientation } = useConfig();
  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {!downLG && <Box sx={{ width: '100%', ml: { xs: 0, md: 1 } }} />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}
      {/* <Tooltip title="Go to Blog">
        <Button
          variant="contained"
          color="primary"
          style={{ marginRight: '16px' }}
          // onClick={() => navigate('/blog')}
          onClick={() => window.open('/blog', '_blank')}
        >
          Blog
        </Button>
      </Tooltip> */}
      {/* <Button variant="contained" color="primary" size="small">
        Connect Wallet
      </Button> */}
      <Box>
        <appkit-button label="Connect Wallet" />
      </Box>
      <Notification />
      <Message />
      {!downLG && <FullScreen />}
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
