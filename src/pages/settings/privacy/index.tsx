import { useState } from 'react';

// material-ui
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  Typography
} from '@mui/material';

// ant design icons
import {
  AuditOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileProtectOutlined,
  LockOutlined,
  SafetyOutlined,
  SaveOutlined,
  SecurityScanOutlined,
  UserOutlined
} from '@ant-design/icons';

// ==============================|| PRIVACY CENTER ||============================== //

export default function PrivacyCenter() {
  const [saved, setSaved] = useState(false);

  const [activityLogging, setActivityLogging] = useState(true);
  const [loginHistory, setLoginHistory] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [dataRetention, setDataRetention] = useState(true);
  const [adminAuditLogging, setAdminAuditLogging] = useState(true);

  const handleSave = () => {
    // TODO:
    // Connect these settings to backend/API later.
    console.log({
      activityLogging,
      loginHistory,
      securityAlerts,
      dataRetention,
      adminAuditLogging
    });

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <Box>
      {/* ====================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================== */}

      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}
      >
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <SafetyOutlined style={{ fontSize: 25 }} />

            <Typography variant="h4">
              Privacy Center
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage Clavata privacy, data protection, audit and security
            preferences.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
          sx={{
            minWidth: 140,
            borderRadius: 2
          }}
        >
          Save Changes
        </Button>
      </Box>

      {/* ====================================================== */}
      {/* SUCCESS MESSAGE */}
      {/* ====================================================== */}

      {saved && (
        <Alert
          severity="success"
          icon={<CheckCircleOutlined />}
          sx={{ mb: 3 }}
        >
          Privacy settings saved successfully.
        </Alert>
      )}

      <Grid container spacing={3}>

        {/* ====================================================== */}
        {/* PRIVACY OVERVIEW */}
        {/* ====================================================== */}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.lighter'
                    }}
                  >
                    <SecurityScanOutlined
                      style={{ fontSize: 24 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="h6">
                      Privacy & Security Overview
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Current privacy controls for the Clavata platform.
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  icon={<CheckCircleOutlined />}
                  label="Protection Active"
                  color="success"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <PrivacyStatusCard
                    icon={<LockOutlined />}
                    title="Authentication"
                    status="Protected"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <PrivacyStatusCard
                    icon={<AuditOutlined />}
                    title="Audit Logging"
                    status="Enabled"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <PrivacyStatusCard
                    icon={<FileProtectOutlined />}
                    title="Data Protection"
                    status="Active"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <PrivacyStatusCard
                    icon={<SafetyOutlined />}
                    title="Security Alerts"
                    status="Enabled"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* DATA PRIVACY CONTROLS */}
        {/* ====================================================== */}

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <SectionHeader
                icon={<FileProtectOutlined />}
                title="Data Privacy"
                description="Control how platform data is handled and monitored."
              />

              <Divider sx={{ mb: 1 }} />

              <PrivacySwitch
                checked={dataRetention}
                onChange={setDataRetention}
                title="Data Retention"
                description="Retain platform records according to configured retention policies."
              />

              <Divider sx={{ my: 1 }} />

              <PrivacySwitch
                checked={activityLogging}
                onChange={setActivityLogging}
                title="Activity Logging"
                description="Record important administrative and platform activities."
              />

              <Divider sx={{ my: 1 }} />

              <PrivacySwitch
                checked={adminAuditLogging}
                onChange={setAdminAuditLogging}
                title="Administrator Audit Logs"
                description="Maintain an audit trail of administrator actions."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* SECURITY CONTROLS */}
        {/* ====================================================== */}

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <SectionHeader
                icon={<SecurityScanOutlined />}
                title="Security Controls"
                description="Configure security-related privacy monitoring."
              />

              <Divider sx={{ mb: 1 }} />

              <PrivacySwitch
                checked={loginHistory}
                onChange={setLoginHistory}
                title="Login History"
                description="Record administrator login and authentication activity."
              />

              <Divider sx={{ my: 1 }} />

              <PrivacySwitch
                checked={securityAlerts}
                onChange={setSecurityAlerts}
                title="Security Alerts"
                description="Notify administrators about important security events."
              />

              <Divider sx={{ my: 1 }} />

              <Box sx={{ py: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Authentication Provider
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Identity and authentication are managed through the
                      configured authentication provider.
                    </Typography>
                  </Box>

                  <Chip
                    label="Managed"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* DATA ACCESS */}
        {/* ====================================================== */}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <SectionHeader
                icon={<EyeOutlined />}
                title="Data Access & Visibility"
                description="Understand what information administrators can access."
              />

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <AccessCard
                    icon={<UserOutlined />}
                    title="Customer Data"
                    description="Customer profiles, bookings, reviews and related account information."
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <AccessCard
                    icon={<SafetyOutlined />}
                    title="Salon Data"
                    description="Salon profiles, business information, services, staff and verification records."
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <AccessCard
                    icon={<AuditOutlined />}
                    title="Administrative Data"
                    description="Administrator actions, access history, permissions and audit records."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* DATA REQUESTS */}
        {/* ====================================================== */}

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <SectionHeader
                icon={<UserOutlined />}
                title="Data Requests"
                description="Manage future privacy-related requests."
              />

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ mb: 0.5 }}
                >
                  Customer & Provider Data Requests
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Requests for data access, correction, export or deletion
                  can be managed from the privacy operations workflow.
                </Typography>

                <Button
                  variant="outlined"
                  disabled
                  sx={{ mt: 2 }}
                >
                  View Requests
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 2
                }}
              >
                Data request management will be connected to the backend
                privacy workflow later.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* DATA DELETION */}
        {/* ====================================================== */}

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              border: '1px solid',
              borderColor: 'warning.main'
            }}
          >
            <CardContent>
              <SectionHeader
                icon={<DeleteOutlined />}
                title="Data Deletion"
                description="Manage permanent deletion workflows."
              />

              <Divider sx={{ mb: 2 }} />

              <Alert severity="warning">
                Data deletion is a sensitive administrative operation.
                Permanent deletion should require appropriate permissions and
                confirmation.
              </Alert>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlined />}
                disabled
                sx={{
                  mt: 2,
                  borderRadius: 2
                }}
              >
                Manage Deletion Requests
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 2
                }}
              >
                This action will be enabled once the privacy and data
                management backend is implemented.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================================================== */}
        {/* AUDIT INFORMATION */}
        {/* ====================================================== */}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <SectionHeader
                icon={<AuditOutlined />}
                title="Privacy Audit"
                description="Monitor privacy-related administrative activity."
              />

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <AuditMetric
                    title="Audit Logging"
                    value="Enabled"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <AuditMetric
                    title="Data Retention"
                    value={dataRetention ? 'Enabled' : 'Disabled'}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <AuditMetric
                    title="Login Tracking"
                    value={loginHistory ? 'Enabled' : 'Disabled'}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <AuditMetric
                    title="Security Alerts"
                    value={securityAlerts ? 'Enabled' : 'Disabled'}
                  />
                </Grid>
              </Grid>
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
              justifyContent: 'flex-end',
              gap: 2
            }}
          >
            <Button
              variant="contained"
              startIcon={<SaveOutlined />}
              onClick={handleSave}
              sx={{
                borderRadius: 2,
                px: 4
              }}
            >
              Save Privacy Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

// ==============================|| SECTION HEADER ||============================== //

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SectionHeader({
  icon,
  title,
  description
}: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 2
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover'
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography variant="h6">
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

// ==============================|| PRIVACY SWITCH ||============================== //

interface PrivacySwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
}

function PrivacySwitch({
  checked,
  onChange,
  title,
  description
}: PrivacySwitchProps) {
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
            sx={{ mt: 0.5 }}
          />
        }
        label={
          <Box sx={{ ml: 1 }}>
            <Typography
              variant="body1"
              fontWeight={600}
            >
              {title}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {description}
            </Typography>
          </Box>
        }
      />
    </Box>
  );
}

// ==============================|| PRIVACY STATUS CARD ||============================== //

interface PrivacyStatusCardProps {
  icon: React.ReactNode;
  title: string;
  status: string;
}

function PrivacyStatusCard({
  icon,
  title,
  status
}: PrivacyStatusCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 1
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: 'action.hover'
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="body2"
          fontWeight={600}
        >
          {title}
        </Typography>
      </Box>

      <Typography
        variant="body2"
        color="success.main"
        fontWeight={600}
      >
        {status}
      </Typography>
    </Box>
  );
}

// ==============================|| ACCESS CARD ||============================== //

interface AccessCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function AccessCard({
  icon,
  title,
  description
}: AccessCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        height: '100%'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 1.5
        }}
      >
        {icon}

        <Typography
          variant="subtitle1"
          fontWeight={600}
        >
          {title}
        </Typography>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
      >
        {description}
      </Typography>
    </Box>
  );
}

// ==============================|| AUDIT METRIC ||============================== //

interface AuditMetricProps {
  title: string;
  value: string;
}

function AuditMetric({
  title,
  value
}: AuditMetricProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {title}
      </Typography>

      <Typography
        variant="h6"
        sx={{ mt: 0.5 }}
      >
        {value}
      </Typography>
    </Box>
  );
}