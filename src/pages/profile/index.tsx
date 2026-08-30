
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

// icons
import UserOutlined from '@ant-design/icons/UserOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import SaveOutlined from '@ant-design/icons/SaveOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';

// project import
import useAuth from 'hooks/useAuth';

// ==============================|| PROFILE ||============================== //

export default function Profile() {
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const isEditMode = searchParams.get('mode') === 'edit';

  /*
   * Your current UserProfile type does not expose
   * username / phoneNumber, so we only use fields
   * that may already exist in the authentication object.
   */
  const userData = user as Record<string, unknown> | null | undefined;

  const originalName = useMemo(() => {
    if (typeof userData?.name === 'string') {
      return userData.name;
    }

    if (typeof userData?.fullName === 'string') {
      return userData.fullName;
    }

    return 'Clavata Admin';
  }, [userData]);

  const originalEmail = useMemo(() => {
    if (typeof userData?.email === 'string') {
      return userData.email;
    }

    return '';
  }, [userData]);

  const role = useMemo(() => {
    if (typeof userData?.role === 'string') {
      return userData.role;
    }

    if (typeof userData?.activeRole === 'string') {
      return userData.activeRole;
    }

    return 'Administrator';
  }, [userData]);

  const [name, setName] = useState(originalName);
  const [email, setEmail] = useState(originalEmail);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(originalName);
    setEmail(originalEmail);
  }, [originalName, originalEmail]);

  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleEdit = () => {
    setSaved(false);

    setSearchParams({
      mode: 'edit'
    });
  };

  const handleCancel = () => {
    setName(originalName);
    setEmail(originalEmail);
    setSaved(false);

    setSearchParams({});
  };

  const handleSave = () => {
    /*
     * TODO:
     *
     * Later connect this to:
     * - Cognito
     * - GraphQL
     * - Admin user API
     *
     * For now this only updates the local page state.
     */

    setSaved(true);

    setSearchParams({});
  };

  return (
    <Grid container spacing={3}>
      {/* ===================================================== */}
      {/* PAGE HEADER */}
      {/* ===================================================== */}

      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            alignItems: {
              xs: 'flex-start',
              sm: 'center'
            },
            justifyContent: 'space-between',
            flexDirection: {
              xs: 'column',
              sm: 'row'
            },
            gap: 2
          }}
        >
          <Box>
            <Typography variant="h5">
              {isEditMode ? 'Edit Profile' : 'Profile'}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {isEditMode
                ? 'Update your administrator profile information.'
                : 'View your administrator profile information.'}
            </Typography>
          </Box>

          {!isEditMode && (
            <Button
              variant="contained"
              startIcon={<EditOutlined />}
              onClick={handleEdit}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Grid>

      {/* ===================================================== */}
      {/* SUCCESS MESSAGE */}
      {/* ===================================================== */}

      {saved && (
        <Grid item xs={12}>
          <Alert
            severity="success"
            onClose={() => setSaved(false)}
          >
            Profile changes have been saved locally. Backend
            integration can be added later.
          </Alert>
        </Grid>
      )}

      {/* ===================================================== */}
      {/* PROFILE CARD */}
      {/* ===================================================== */}

      <Grid item xs={12} md={4}>
        <Card
          sx={{
            height: '100%'
          }}
        >
          <CardContent>
            <Stack
              alignItems="center"
              spacing={2.5}
            >
              {/* Avatar */}

              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 34,
                  fontWeight: 600
                }}
              >
                {initials || 'CA'}
              </Avatar>

              {/* Name */}

              <Box textAlign="center">
                <Typography
                  variant="h5"
                  fontWeight={600}
                >
                  {name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    wordBreak: 'break-word'
                  }}
                >
                  {email || 'Email not available'}
                </Typography>
              </Box>

              {/* Role */}

              <Chip
                icon={<SafetyOutlined />}
                label={role}
                color="primary"
                variant="outlined"
              />

              {/* Status */}

              <Chip
                icon={<CheckCircleOutlined />}
                label="Active"
                color="success"
                variant="outlined"
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* ===================================================== */}
      {/* ADMINISTRATOR INFORMATION */}
      {/* ===================================================== */}

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              {/* Header */}

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2
                }}
              >
                <Box>
                  <Typography variant="h6">
                    Administrator Information
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {isEditMode
                      ? 'Update the information associated with your admin account.'
                      : 'Basic information associated with your Clavata administrator account.'}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* ================================================= */}
              {/* NAME */}
              {/* ================================================= */}

              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your name"
                />
              ) : (
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Name
                    </Typography>

                    <Typography
                      variant="body1"
                      fontWeight={600}
                    >
                      {name}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* ================================================= */}
              {/* EMAIL */}
              {/* ================================================= */}

              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email"
                />
              ) : (
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Email
                    </Typography>

                    <Typography
                      variant="body1"
                      fontWeight={600}
                    >
                      {email || 'Not available'}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* ================================================= */}
              {/* ROLE */}
              {/* ================================================= */}

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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Role
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight={600}
                  >
                    {role}
                  </Typography>
                </Box>
              </Box>

              {/* ================================================= */}
              {/* ACCOUNT STATUS */}
              {/* ================================================= */}

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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
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

              {/* ================================================= */}
              {/* EDIT ACTIONS */}
              {/* ================================================= */}

              {isEditMode && (
                <>
                  <Divider />

                  <Stack
                    direction={{
                      xs: 'column',
                      sm: 'row'
                    }}
                    spacing={1.5}
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<CloseOutlined />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<SaveOutlined />}
                      onClick={handleSave}
                      disabled={!name.trim()}
                    >
                      Save Changes
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

