// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project import
import Search from './Search';
import Message from './Message';
import Profile from './Profile';
import Notification from './Notification';
import FullScreen from './FullScreen';
import MobileSection from './MobileSection';

import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
import DrawerHeader from 'layout/Dashboard/Drawer/DrawerHeader';
import { BookOutlined } from '@ant-design/icons';
import { Button, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// import { Tooltip } from 'antd';
// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
   const navigate = useNavigate();
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
          onClick={() => navigate('/blog')}
        >
          Blog
        </Button>
      </Tooltip> */}
      <Notification />
      <Message />
      {!downLG && <FullScreen />}
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
