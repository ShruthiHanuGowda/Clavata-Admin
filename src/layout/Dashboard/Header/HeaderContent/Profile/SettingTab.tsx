
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import CommentOutlined from '@ant-design/icons/CommentOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import AuditOutlined from '@ant-design/icons/AuditOutlined';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

interface SettingItem {
  id: number;
  title: string;
  icon: React.ReactNode;
  route: string;
}

const settingItems: SettingItem[] = [
  {
    id: 0,
    title: 'Account Settings',
    icon: <UserOutlined />,
    route: '/settings/account'
  },
  {
    id: 1,
    title: 'Platform Settings',
    icon: <SettingOutlined />,
    route: '/settings/platform'
  },
  {
    id: 2,
    title: 'Privacy Center',
    icon: <LockOutlined />,
    route: '/settings/privacy'
  },
  {
    id: 3,
    title: 'Support',
    icon: <QuestionCircleOutlined />,
    route: '/support'
  },
  {
    id: 4,
    title: 'Feedback',
    icon: <CommentOutlined />,
    route: '/feedback'
  },
  {
    id: 5,
    title: 'Audit History',
    icon: <AuditOutlined />,
    route: '/audit-logs'
  }
];

export default function SettingTab() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedIndex, setSelectedIndex] = useState<number>();

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number,
    route: string
  ) => {
    event.preventDefault();

    setSelectedIndex(index);

    if (route) {
      navigate(route);
    }
  };

  const isRouteSelected = (route: string) => {
    return location.pathname === route || location.pathname.startsWith(`${route}/`);
  };

  return (
    <List
      component="nav"
      sx={{
        p: 0,

        '& .MuiListItemIcon-root': {
          minWidth: 32
        },

        '& .MuiListItemButton-root': {
          borderRadius: 1,
          mb: 0.5
        }
      }}
    >
      {settingItems.map((item) => {
        const selected =
          selectedIndex === item.id || isRouteSelected(item.route);

        return (
          <ListItemButton
            key={item.id}
            selected={selected}
            onClick={(event) =>
              handleListItemClick(event, item.id, item.route)
            }
          >
            <ListItemIcon>{item.icon}</ListItemIcon>

            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: selected ? 600 : 400
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}

