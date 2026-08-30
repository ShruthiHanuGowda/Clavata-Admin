
import { useMemo, useState } from 'react';

// material-ui
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material';

// icons
import {
  CheckCircleOutlined,
  EditOutlined,
  MailOutlined,
  MobileOutlined,
  SaveOutlined,
  SafetyOutlined,
  UserOutlined
} from '@ant-design/icons';

// project import
import useAuth from 'hooks/useAuth';

// ==============================|| SETTINGS - ACCOUNT ||============================== //

export default function AccountSettings() {
  const { user } = useAuth();

  /*
   * UserProfile can differ depending on the authentication provider.
   * We therefore safely read the available properties instead of
   * assuming username / phoneNumber / email always exist.
   */
  const userData = user as Record<string, unknown> | null | undefined;

  const initialName = useMemo(() => {
    if (typeof userData?.name === 'string' && userData.name.trim()) {
      return userData.name;
    }

    if (typeof userData?.fullName === 'string' && userData.fullName.trim()) {
      return userData.fullName;
    }

    return 'Clavata Admin';
  }, [userData]);

  const email = useMemo(() => {
    if (typeof userData?.email === 'string' && userData.email.trim()) {
      return userData.email;
    }

    return 'Not available';
  }, [userData]);

  const phoneNumber = useMemo(() => {
    if (
      typeof userData?.phoneNumber === 'string' &&
      userData.phoneNumber.trim()
    ) {
      return userData.phoneNumber;
    }

    if (
      typeof userData?.phone === 'string' &&
      userData.phone.trim()
    ) {
      return userData.phone;
    }

    return 'Not available';
  }, [userData]);

  const role = useMemo(() => {
    if (typeof userData?.role === 'string' && userData.role.trim()) {
      return userData.role;
    }

    if (
      typeof userData?.activeRole === 'string' &&
      userData.activeRole.trim()
    ) {
      return userData.activeRole;
    }

    return 'Administrator';
  }, [userData]);

  const initials = initialName
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Editable fields
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);

      /*
       * TODO:
       * Connect this to your backend/Cognito/API later.
       *
       * Example:
       *
       * await updateAdminProfile({
       *   name
       * });
       */

      console.log('Account settings:', {
        name
      });

      // Dummy save for now
      await new Promise((resolve) => setTimeout(resolve, 700));

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save account settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {/* ============================================================ */}
      {/* PAGE HEADER */}
      {/* ============================================================ */}

      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            sm: 'center'
          },
          flexDirection: {
            xs: 'column',
            sm: 'row'
          },
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Account Settings
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage your Clavata administrator account information.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            minWidth: 150,
            borderRadius: 2
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* ============================================================ */}
      {/* SUCCESS MESSAGE */}
      {/* ============================================================ */}

      {saved && (
        <Alert
          severity="success"
          icon={<CheckCircleOutlined />}
          sx={{ mb: 3 }}
        >
          Account settings saved successfully.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ============================================================ */}
        {/* PROFILE SUMMARY */}
        {/* ============================================================ */}

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack
                alignItems="center"
                spacing={2}
                sx={{ py: 2 }}
              >
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: 32,
                    fontWeight: 600
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

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }}
                >
                  <SafetyOutlined />

                  <Typography
                    variant="body2"
                    fontWeight={600}
                  >
                    {role}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      color: '#2e7d32'
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="success.main"
                    fontWeight={600}
                  >
                    Active Account
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ============================================================ */}
        {/* ACCOUNT INFORMATION */}
        {/* ============================================================ */}

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2
                }}
              >
                <UserOutlined
                  style={{
                    fontSize: 22
                  }}
                />

                <Box>
                  <Typography variant="h6">
                    Personal Information
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Update the information associated with your
                    administrator account.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* NAME */}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setSaved(false);
                    }}
                    InputProps={{
                      startAdornment: (
                        <UserOutlined
                          style={{
                            marginRight: 10,
                            color: '#999'
                          }}
                        />
                      )
                    }}
                  />
                </Grid>

                {/* EMAIL */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={email}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <MailOutlined
                          style={{
                            marginRight: 10,
                            color: '#999'
                          }}
                        />
                      )
                    }}
                    helperText="Email is managed by the authentication system."
                  />
                </Grid>

                {/* PHONE */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phoneNumber}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <MobileOutlined
                          style={{
                            marginRight: 10,
                            color: '#999'
                          }}
                        />
                      )
                    }}
                    helperText="Phone number is managed by the authentication system."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ============================================================ */}
        {/* ADMIN ROLE */}
        {/* ============================================================ */}

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2
                }}
              >
                <SafetyOutlined
                  style={{
                    fontSize: 22
                  }}
                />

                <Box>
                  <Typography variant="h6">
                    Administrator Role
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Your current access level on the Clavata
                    administration platform.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover'
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Current Role
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ mt: 0.5 }}
                >
                  {role}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Administrator roles and permissions are managed
                through the System & Access Management section.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* ============================================================ */}
        {/* ACCOUNT STATUS */}
        {/* ============================================================ */}

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2
                }}
              >
                <CheckCircleOutlined
                  style={{
                    fontSize: 22
                  }}
                />

                <Box>
                  <Typography variant="h6">
                    Account Status
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Current status of your administrator account.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'success.lighter'
                  }}
                >
                  <Box>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                    >
                      Account Active
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Your administrator account is active.
                    </Typography>
                  </Box>

                  <CheckCircleOutlined
                    style={{
                      fontSize: 24,
                      color: '#2e7d32'
                    }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Authentication, password management and
                  security policies are handled by the configured
                  identity provider.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ============================================================ */}
        {/* SECURITY INFORMATION */}
        {/* ============================================================ */}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2
                }}
              >
                <EditOutlined
                  style={{
                    fontSize: 22
                  }}
                />

                <Box>
                  <Typography variant="h6">
                    Account Management
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Additional account actions will be connected
                    here as the administration platform grows.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight={600}
                    >
                      Profile Information
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Manage your name and basic profile details.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight={600}
                    >
                      Authentication
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Authentication is managed through the
                      configured identity provider.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight={600}
                    >
                      Permissions
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Access is controlled through roles and
                      permissions.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ============================================================ */}
        {/* BOTTOM SAVE */}
        {/* ============================================================ */}

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Button
              variant="contained"
              startIcon={<SaveOutlined />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                borderRadius: 2,
                px: 4
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

