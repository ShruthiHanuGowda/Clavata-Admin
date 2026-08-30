
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import EditOutlined from '@ant-design/icons/EditOutlined';
import ProfileOutlined from '@ant-design/icons/ProfileOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

interface Props {
  handleLogout: () => void;
}

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab({ handleLogout }: Props) {
  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] = useState<number>();

  const handleListItemClick = (
    index: number,
    path?: string
  ) => {
    setSelectedIndex(index);

    if (path) {
      navigate(path);
    }
  };

  return (
    <List
      component="nav"
      sx={{
        p: 0,
        '& .MuiListItemIcon-root': {
          minWidth: 32
        }
      }}
    >
      {/* ============================== */}
      {/* EDIT PROFILE */}
      {/* ============================== */}

      <ListItemButton
        selected={selectedIndex === 0}
        onClick={() =>
          handleListItemClick(0, '/profile?mode=edit')
        }
      >
        <ListItemIcon>
          <EditOutlined />
        </ListItemIcon>

        <ListItemText primary="Edit Profile" />
      </ListItemButton>

      {/* ============================== */}
      {/* VIEW PROFILE */}
      {/* ============================== */}

      <ListItemButton
        selected={selectedIndex === 1}
        onClick={() =>
          handleListItemClick(1, '/profile')
        }
      >
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>

        <ListItemText primary="View Profile" />
      </ListItemButton>

      {/* ============================== */}
      {/* ACCOUNT */}
      {/* ============================== */}

      <ListItemButton
        selected={selectedIndex === 3}
        onClick={() =>
          handleListItemClick(3, '/my-account')
        }
      >
        <ListItemIcon>
          <ProfileOutlined />
        </ListItemIcon>

        <ListItemText primary="My Account" />
      </ListItemButton>

      {/* ============================== */}
      {/* LOGOUT */}
      {/* ============================== */}

      <ListItemButton
        selected={selectedIndex === 2}
        onClick={handleLogout}
      >
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>

        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}

