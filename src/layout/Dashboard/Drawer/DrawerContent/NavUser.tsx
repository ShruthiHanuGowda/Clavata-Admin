
import { useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// Material UI
import { styled, useTheme, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

// Project imports
import RightOutlined from '@ant-design/icons/RightOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';

import Avatar from 'components/@extended/Avatar';
import useAuth from 'hooks/useAuth';
import { useGetMenuMaster } from 'api/menu';

// Assets
import avatar1 from 'assets/images/users/avatar-1.png';

interface ExpandMoreProps extends IconButtonProps {
  theme: Theme;
  expand: boolean;
  drawerOpen: boolean;
}

const ExpandMore = styled(IconButton, {
  shouldForwardProp: (prop) =>
    prop !== 'theme' &&
    prop !== 'expand' &&
    prop !== 'drawerOpen'
})(({ theme, expand, drawerOpen }: ExpandMoreProps) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(-90deg)',
  marginLeft: 'auto',
  color: theme.palette.secondary.dark,
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  }),

  ...(!drawerOpen && {
    opacity: 0,
    width: 50,
    height: 50
  })
}));

// ==============================|| DRAWER - USER ||============================== //

export default function NavUser() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const { logout, user } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  // ==============================|| USER INFORMATION ||============================== //

  const userName = user?.name || 'Administrator';

  const userRole = user?.role || 'Admin';

  // ==============================|| OPEN MENU ||============================== //

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // ==============================|| CLOSE MENU ||============================== //

  const handleClose = () => {
    setAnchorEl(null);
  };

  // ==============================|| PROFILE ||============================== //

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  // ==============================|| MY ACCOUNT ||============================== //

  const handleMyAccount = () => {
    handleClose();
    navigate('/my-account');
  };

  // ==============================|| LOGOUT ||============================== //

  const handleLogout = async () => {
    handleClose();

    try {
      await logout();

      navigate('/login', {
        state: {
          from: ''
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <Box
      sx={{
        p: 1.25,
        px: !drawerOpen ? 1.25 : 3,
        borderTop: '2px solid',
        borderTopColor: 'divider'
      }}
    >
      <List disablePadding>
        <ListItem
          disablePadding
          secondaryAction={
            <ExpandMore
              theme={theme}
              expand={open}
              drawerOpen={drawerOpen}
              id="user-menu-button"
              aria-controls={open ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              aria-label="Open user menu"
            >
              <RightOutlined
                style={{
                  fontSize: '0.625rem'
                }}
              />
            </ExpandMore>
          }
          sx={{
            '& .MuiListItemSecondaryAction-root': {
              right: !drawerOpen ? -20 : -16
            }
          }}
        >
          <ListItemAvatar>
            <Avatar
              alt={userName}
              src={avatar1}
              sx={{
                ...(drawerOpen && {
                  width: 46,
                  height: 46
                })
              }}
            />
          </ListItemAvatar>

          {drawerOpen && (
            <ListItemText
              primary={userName}
              secondary={userRole}
              primaryTypographyProps={{
                fontWeight: 600,
                noWrap: true
              }}
              secondaryTypographyProps={{
                noWrap: true
              }}
            />
          )}
        </ListItem>
      </List>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'user-menu-button'
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        PaperProps={{
          sx: {
            minWidth: 210,
            mt: -1
          }
        }}
      >
        <MenuItem onClick={handleProfile}>
          <UserOutlined
            style={{
              marginRight: 12
            }}
          />
          Profile
        </MenuItem>

        <MenuItem onClick={handleMyAccount}>
          <SettingOutlined
            style={{
              marginRight: 12
            }}
          />
          My account
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            color: 'error.main'
          }}
        >
          <LogoutOutlined
            style={{
              marginRight: 12
            }}
          />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}

