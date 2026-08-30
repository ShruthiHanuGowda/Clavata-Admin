
import { useMemo } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

// icons
import UserOutlined from '@ant-design/icons/UserOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

// project import
import useAuth from 'hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  const userData = user as Record<string, unknown> | null | undefined;

  const name = useMemo(() => {
    if (typeof userData?.name === 'string') return userData.name;
    if (typeof userData?.fullName === 'string') return userData.fullName;

    return 'Clavata Admin';
  }, [userData]);

  const role = useMemo(() => {
    if (typeof userData?.role === 'string') return userData.role;
    if (typeof userData?.activeRole === 'string') return userData.activeRole;

    return 'Administrator';
  }, [userData]);

  const email =
    typeof userData?.email === 'string'
      ? userData.email
      : 'Not available';

  const initials = name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5">Profile</Typography>
        <Typography variant="body2" color="text.secondary">
          View your administrator profile information.
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  fontSize: 32
                }}
              >
                {initials}
              </Avatar>

              <Box textAlign="center">
                <Typography variant="h5">
                  {name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {email}
                </Typography>
              </Box>

              <Chip
                icon={<SafetyOutlined />}
                label={role}
                color="primary"
                variant="outlined"
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h6">
                  Administrator Information
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Basic information about your Clavata administrator account.
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <UserOutlined
                  style={{
                    fontSize: 22
                  }}
                />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>

                  <Typography variant="body1" fontWeight={600}>
                    {name}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <SafetyOutlined
                  style={{
                    fontSize: 22
                  }}
                />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>

                  <Typography variant="body1" fontWeight={600}>
                    {role}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <CheckCircleOutlined
                  style={{
                    fontSize: 22
                  }}
                />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Account Status
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="success.main"
                  >
                    Active
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

