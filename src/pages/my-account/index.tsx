import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';

// Icons
import LockOutlined from '@ant-design/icons/LockOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import LoginOutlined from '@ant-design/icons/LoginOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

import useAuth from 'hooks/useAuth';

export default function MyAccount() {
  const { user } = useAuth();

  const role = user?.role || 'Admin';

  return (
    <Grid container spacing={3}>
      {/* HEADER */}

      <Grid item xs={12}>
        <Typography variant="h5">
          My Account
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Manage your administrator account and security settings.
        </Typography>
      </Grid>

      {/* ACCOUNT OVERVIEW */}

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h5">
              Account Overview
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Information about your current administrator account.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <List disablePadding>
              <ListItem
                disableGutters
                secondaryAction={
                  <Chip
                    label="Active"
                    color="success"
                    size="small"
                  />
                }
              >
                <SettingOutlined
                  style={{
                    marginRight: 16,
                    fontSize: 20
                  }}
                />

                <ListItemText
                  primary="Account Status"
                  secondary="Your administrator account is currently active."
                />
              </ListItem>

              <ListItem
                disableGutters
                sx={{ mt: 2 }}
              >
                <SafetyOutlined
                  style={{
                    marginRight: 16,
                    fontSize: 20
                  }}
                />

                <ListItemText
                  primary="Role"
                  secondary={role}
                />
              </ListItem>

              <ListItem
                disableGutters
                sx={{ mt: 2 }}
              >
                <LoginOutlined
                  style={{
                    marginRight: 16,
                    fontSize: 20
                  }}
                />

                <ListItemText
                  primary="Authentication"
                  secondary="Authenticated administrator account"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* SECURITY */}

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <LockOutlined />

              <Typography variant="h5">
                Security
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                mb: 3
              }}
            >
              Manage authentication and security options.
            </Typography>

            <Divider />

            <List>
              <ListItem disableGutters>
                <ListItemText
                  primary="Password"
                  secondary="Change your administrator password."
                />
              </ListItem>

              <ListItem disableGutters>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary="Additional security for administrator access."
                />
              </ListItem>

              <ListItem disableGutters>
                <ListItemText
                  primary="Login Sessions"
                  secondary="View and manage active sessions."
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* PREFERENCES */}

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SettingOutlined />

              <Typography variant="h5">
                Preferences
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                mb: 3
              }}
            >
              Configure your personal admin preferences.
            </Typography>

            <Divider />

            <List>
              <ListItem disableGutters>
                <ListItemText
                  primary="Language"
                  secondary="English"
                />
              </ListItem>

              <ListItem disableGutters>
                <ListItemText
                  primary="Theme"
                  secondary="Use the application theme settings."
                />
              </ListItem>

              <ListItem disableGutters>
                <ListItemText
                  primary="Notifications"
                  secondary="Manage administrator notifications."
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
