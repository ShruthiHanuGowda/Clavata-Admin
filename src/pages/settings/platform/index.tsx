
import { useState } from 'react';

// material-ui
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';

// icons
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  GlobalOutlined,
  MailOutlined,
  MobileOutlined,
  SaveOutlined,
  SettingOutlined,
  ShopOutlined,
  SafetyOutlined
} from '@ant-design/icons';

// ==============================|| PLATFORM SETTINGS ||============================== //

export default function PlatformSettings() {
  // ============================================================
  // GENERAL PLATFORM
  // ============================================================

  const [platformName, setPlatformName] = useState('Clavata');

  const [platformDescription, setPlatformDescription] = useState(
    'Clavata salon and beauty services platform'
  );

  const [platformEmail, setPlatformEmail] = useState(
    'support@clavata.com'
  );

  const [platformPhone, setPlatformPhone] = useState(
    '+91 00000 00000'
  );

  // ============================================================
  // REGIONAL SETTINGS
  // ============================================================

  const [country, setCountry] = useState('India');

  const [currency, setCurrency] = useState('INR');

  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // ============================================================
  // BOOKING SETTINGS
  // ============================================================

  const [bookingEnabled, setBookingEnabled] = useState(true);

  const [allowOnlineBooking, setAllowOnlineBooking] = useState(true);

  const [allowPayAtSalon, setAllowPayAtSalon] = useState(true);

  const [bookingFeeEnabled, setBookingFeeEnabled] = useState(true);

  const [bookingFee, setBookingFee] = useState('25');

  // ============================================================
  // SALON SETTINGS
  // ============================================================

  const [salonRegistrationEnabled, setSalonRegistrationEnabled] =
    useState(true);

  const [requireKycApproval, setRequireKycApproval] =
    useState(true);

  const [requireAdminApproval, setRequireAdminApproval] =
    useState(true);

  const [allowSalonVisibility, setAllowSalonVisibility] =
    useState(true);

  // ============================================================
  // NOTIFICATION SETTINGS
  // ============================================================

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [smsNotifications, setSmsNotifications] =
    useState(true);

  const [pushNotifications, setPushNotifications] =
    useState(true);

  const [bookingNotifications, setBookingNotifications] =
    useState(true);

  const [adminNotifications, setAdminNotifications] =
    useState(true);

  // ============================================================
  // PLATFORM SECURITY
  // ============================================================

  const [maintenanceMode, setMaintenanceMode] =
    useState(false);

  const [newRegistrationsEnabled, setNewRegistrationsEnabled] =
    useState(true);

  // ============================================================
  // SAVE STATE
  // ============================================================

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleCurrencyChange = (
    event: SelectChangeEvent<string>
  ) => {
    setCurrency(event.target.value);
  };

  const handleTimezoneChange = (
    event: SelectChangeEvent<string>
  ) => {
    setTimezone(event.target.value);
  };

  const handleDateFormatChange = (
    event: SelectChangeEvent<string>
  ) => {
    setDateFormat(event.target.value);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);

      /*
       * TODO:
       *
       * Connect this object to your backend/API later.
       *
       * Example:
       *
       * await updatePlatformSettings({
       *   platformName,
       *   platformDescription,
       *   platformEmail,
       *   platformPhone,
       *   country,
       *   currency,
       *   timezone,
       *   dateFormat,
       *   bookingEnabled,
       *   allowOnlineBooking,
       *   allowPayAtSalon,
       *   bookingFeeEnabled,
       *   bookingFee,
       *   salonRegistrationEnabled,
       *   requireKycApproval,
       *   requireAdminApproval,
       *   allowSalonVisibility,
       *   emailNotifications,
       *   smsNotifications,
       *   pushNotifications,
       *   bookingNotifications,
       *   adminNotifications,
       *   maintenanceMode,
       *   newRegistrationsEnabled
       * });
       */

      console.log('Platform settings:', {
        platformName,
        platformDescription,
        platformEmail,
        platformPhone,

        country,
        currency,
        timezone,
        dateFormat,

        bookingEnabled,
        allowOnlineBooking,
        allowPayAtSalon,
        bookingFeeEnabled,
        bookingFee,

        salonRegistrationEnabled,
        requireKycApproval,
        requireAdminApproval,
        allowSalonVisibility,

        emailNotifications,
        smsNotifications,
        pushNotifications,
        bookingNotifications,
        adminNotifications,

        maintenanceMode,
        newRegistrationsEnabled
      });

      // Temporary dummy save
      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        'Failed to save platform settings:',
        error
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {/* ======================================================== */}
      {/* PAGE HEADER */}
      {/* ======================================================== */}

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
            Platform Settings
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Manage global Clavata platform configuration,
            booking rules, notifications and availability.
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

      {/* ======================================================== */}
      {/* SUCCESS MESSAGE */}
      {/* ======================================================== */}

      {saved && (
        <Alert
          severity="success"
          icon={<CheckCircleOutlined />}
          sx={{ mb: 3 }}
        >
          Platform settings saved successfully.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ====================================================== */}
        {/* GENERAL PLATFORM SETTINGS */}
        {/* ====================================================== */}

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
                <SettingOutlined
                  style={{ fontSize: 22 }}
                />

                <Box>
                  <Typography variant="h6">
                    General Platform
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Basic information about the Clavata
                    platform.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Platform Name"
                    value={platformName}
                    onChange={(event) =>
                      setPlatformName(event.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Platform Support Email"
                    type="email"
                    value={platformEmail}
                    onChange={(event) =>
                      setPlatformEmail(event.target.value)
                    }
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Platform Description"
                    multiline
                    rows={2}
                    value={platformDescription}
                    onChange={(event) =>
                      setPlatformDescription(
                        event.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Support Phone"
                    value={platformPhone}
                    onChange={(event) =>
                      setPlatformPhone(event.target.value)
                    }
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
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Platform Version"
                    value="1.0.0"
                    disabled
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* REGIONAL SETTINGS */}
        {/* ====================================================== */}

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
                <GlobalOutlined
                  style={{ fontSize: 22 }}
                />

                <Box>
                  <Typography variant="h6">
                    Regional Settings
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Default regional configuration for
                    Clavata.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Country"
                  value={country}
                  disabled
                />

                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>

                  <Select
                    value={currency}
                    label="Currency"
                    onChange={handleCurrencyChange}
                  >
                    <MenuItem value="INR">
                      INR - Indian Rupee
                    </MenuItem>

                    <MenuItem value="USD">
                      USD - US Dollar
                    </MenuItem>

                    <MenuItem value="EUR">
                      EUR - Euro
                    </MenuItem>

                    <MenuItem value="GBP">
                      GBP - British Pound
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>

                  <Select
                    value={timezone}
                    label="Timezone"
                    onChange={handleTimezoneChange}
                  >
                    <MenuItem value="Asia/Kolkata">
                      Asia/Kolkata
                    </MenuItem>

                    <MenuItem value="UTC">
                      UTC
                    </MenuItem>

                    <MenuItem value="Europe/Berlin">
                      Europe/Berlin
                    </MenuItem>

                    <MenuItem value="America/New_York">
                      America/New_York
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>

                  <Select
                    value={dateFormat}
                    label="Date Format"
                    onChange={handleDateFormatChange}
                  >
                    <MenuItem value="DD/MM/YYYY">
                      DD/MM/YYYY
                    </MenuItem>

                    <MenuItem value="MM/DD/YYYY">
                      MM/DD/YYYY
                    </MenuItem>

                    <MenuItem value="YYYY-MM-DD">
                      YYYY-MM-DD
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* BOOKING SETTINGS */}
        {/* ====================================================== */}

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
                <ClockCircleOutlined
                  style={{ fontSize: 22 }}
                />

                <Box>
                  <Typography variant="h6">
                    Booking Settings
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Control how customer bookings operate
                    across Clavata.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 1 }} />

              <SettingSwitch
                checked={bookingEnabled}
                onChange={setBookingEnabled}
                title="Bookings Enabled"
                description="Allow customers to create new bookings."
              />

              <Divider />

              <SettingSwitch
                checked={allowOnlineBooking}
                onChange={setAllowOnlineBooking}
                title="Online Payments"
                description="Allow customers to pay booking fees or bookings online."
              />

              <Divider />

              <SettingSwitch
                checked={allowPayAtSalon}
                onChange={setAllowPayAtSalon}
                title="Pay at Salon"
                description="Allow customers to pay directly at the salon."
              />

              <Divider />

              <SettingSwitch
                checked={bookingFeeEnabled}
                onChange={setBookingFeeEnabled}
                title="Booking Fee"
                description="Require a booking fee when applicable."
              />

              {bookingFeeEnabled && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Default Booking Fee"
                    type="number"
                    value={bookingFee}
                    onChange={(event) =>
                      setBookingFee(event.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <DollarOutlined
                          style={{
                            marginRight: 10,
                            color: '#999'
                          }}
                        />
                      )
                    }}
                    helperText="Default booking fee amount in the selected currency."
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* SALON MANAGEMENT */}
        {/* ====================================================== */}

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
                <ShopOutlined
                  style={{ fontSize: 22 }}
                />

                <Box>
                  <Typography variant="h6">
                    Salon Management
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Control salon onboarding, verification
                    and platform visibility.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 1 }} />

              <SettingSwitch
                checked={salonRegistrationEnabled}
                onChange={setSalonRegistrationEnabled}
                title="Salon Registration"
                description="Allow new salon owners to register their business on Clavata."
              />

              <Divider />

              <SettingSwitch
                checked={requireKycApproval}
                onChange={setRequireKycApproval}
                title="Require KYC Verification"
                description="Require salon owners to submit KYC documents before approval."
              />

              <Divider />

              <SettingSwitch
                checked={requireAdminApproval}
                onChange={setRequireAdminApproval}
                title="Require Admin Approval"
                description="Require Clavata administrators to approve salon applications."
              />

              <Divider />

              <SettingSwitch
                checked={allowSalonVisibility}
                onChange={setAllowSalonVisibility}
                title="Salon Visibility"
                description="Allow approved salons to appear in customer discovery and search."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* NOTIFICATION SETTINGS */}
        {/* ====================================================== */}

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
                <BellOutlined
                  style={{ fontSize: 22 }}
                />

                <Box>
                  <Typography variant="h6">
                    Notification Settings
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Control platform-wide notification channels.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 1 }} />

              <SettingSwitch
                checked={emailNotifications}
                onChange={setEmailNotifications}
                title="Email Notifications"
                description="Enable email notifications for supported platform events."
              />

              <Divider />

              <SettingSwitch
                checked={smsNotifications}
                onChange={setSmsNotifications}
                title="SMS Notifications"
                description="Enable SMS notifications for supported platform events."
              />

              <Divider />

              <SettingSwitch
                checked={pushNotifications}
                onChange={setPushNotifications}
                title="Push Notifications"
                description="Enable mobile push notifications."
              />

              <Divider />

              <SettingSwitch
                checked={bookingNotifications}
                onChange={setBookingNotifications}
                title="Booking Notifications"
                description="Send notifications when bookings are created, updated or cancelled."
              />

              <Divider />

              <SettingSwitch
                checked={adminNotifications}
                onChange={setAdminNotifications}
                title="Admin Notifications"
                description="Notify administrators about important platform events."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* PLATFORM AVAILABILITY */}
        {/* ====================================================== */}

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              border: maintenanceMode
                ? '1px solid'
                : undefined,
              borderColor: maintenanceMode
                ? 'warning.main'
                : undefined
            }}
          >
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
                  style={{ fontSize: 22 }}
                />

                <Box>
                  <Typography variant="h6">
                    Platform Availability
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Control access to Clavata services.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 1 }} />

              <SettingSwitch
                checked={newRegistrationsEnabled}
                onChange={setNewRegistrationsEnabled}
                title="New Registrations"
                description="Allow new customers and salon partners to register."
              />

              <Divider />

              <SettingSwitch
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
                title="Maintenance Mode"
                description="Temporarily restrict platform access during maintenance."
              />

              {maintenanceMode && (
                <Alert
                  severity="warning"
                  sx={{ mt: 2 }}
                >
                  Maintenance mode is currently enabled.
                  Customer and salon access may be restricted
                  once this setting is connected to the backend.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* PLATFORM INFORMATION */}
        {/* ====================================================== */}

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
                <GlobalOutlined
                  style={{ fontSize: 22 }}
                />

                <Box>
                  <Typography variant="h6">
                    Platform Information
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Current Clavata platform configuration.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <InfoRow
                  label="Platform"
                  value={platformName}
                />

                <InfoRow
                  label="Country"
                  value={country}
                />

                <InfoRow
                  label="Currency"
                  value={currency}
                />

                <InfoRow
                  label="Timezone"
                  value={timezone}
                />

                <InfoRow
                  label="Version"
                  value="1.0.0"
                />

                <InfoRow
                  label="Environment"
                  value="Production"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* SAVE */}
        {/* ====================================================== */}

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
              {saving
                ? 'Saving...'
                : 'Save Platform Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

// ================================================================
// REUSABLE SETTING SWITCH
// ================================================================

interface SettingSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
}

function SettingSwitch({
  checked,
  onChange,
  title,
  description
}: SettingSwitchProps) {
  return (
    <Box sx={{ py: 1.5 }}>
      <FormControlLabel
        sx={{
          width: '100%',
          m: 0,
          alignItems: 'flex-start'
        }}
        control={
          <Switch
            checked={checked}
            onChange={(event) =>
              onChange(event.target.checked)
            }
            sx={{ mt: 0.25, mr: 1 }}
          />
        }
        label={
          <Box>
            <Typography
              variant="body1"
              fontWeight={600}
            >
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              {description}
            </Typography>
          </Box>
        }
      />
    </Box>
  );
}

// ================================================================
// INFO ROW
// ================================================================

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({
  label,
  value
}: InfoRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
      >
        {value}
      </Typography>
    </Box>
  );
}

