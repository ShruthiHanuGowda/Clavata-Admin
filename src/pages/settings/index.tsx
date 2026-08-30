
import { useState } from 'react';

// material-ui
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography
} from '@mui/material';

// ant design icons
import {
    BellOutlined,
    GlobalOutlined,
    LockOutlined,
    MailOutlined,
    MobileOutlined,
    SaveOutlined,
    SettingOutlined
} from '@ant-design/icons';

// ==============================|| SETTINGS ||============================== //

export default function Settings() {
    const [platformName, setPlatformName] = useState('Clavata');
    const [supportEmail, setSupportEmail] = useState('support@clavata.com');
    const [supportPhone, setSupportPhone] = useState('+91 00000 00000');
    const [currency, setCurrency] = useState('INR');
    const [timezone, setTimezone] = useState('Asia/Kolkata');

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(true);
    const [bookingNotifications, setBookingNotifications] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // Later this will be connected to your backend/API.
        console.log({
            platformName,
            supportEmail,
            supportPhone,
            currency,
            timezone,
            emailNotifications,
            smsNotifications,
            bookingNotifications,
            maintenanceMode
        });

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 3000);
    };

    return (
        <Box>
            {/* Page Header */}
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
                    <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Settings
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Manage global Clavata platform configuration and preferences.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<SaveOutlined />}
                    onClick={handleSave}
                    sx={{
                        minWidth: 130,
                        borderRadius: 2
                    }}
                >
                    Save Changes
                </Button>
            </Box>

            {saved && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Settings saved successfully.
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* ====================================================== */}
                {/* PLATFORM SETTINGS */}
                {/* ====================================================== */}

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <SettingOutlined
                                    style={{
                                        fontSize: 22,
                                        marginRight: 10
                                    }}
                                />

                                <Box>
                                    <Typography variant="h6">
                                        Platform Settings
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        General configuration for the Clavata platform.
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
                                        onChange={(e) => setPlatformName(e.target.value)}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Default Currency"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        helperText="Example: INR"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Timezone"
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        helperText="Example: Asia/Kolkata"
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
                {/* CONTACT SETTINGS */}
                {/* ====================================================== */}

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <MailOutlined
                                    style={{
                                        fontSize: 22,
                                        marginRight: 10
                                    }}
                                />

                                <Box>
                                    <Typography variant="h6">
                                        Contact Information
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Platform support contact details.
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={2.5}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Support Email"
                                        type="email"
                                        value={supportEmail}
                                        onChange={(e) => setSupportEmail(e.target.value)}
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
                                        label="Support Phone"
                                        value={supportPhone}
                                        onChange={(e) => setSupportPhone(e.target.value)}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <GlobalOutlined
                                    style={{
                                        fontSize: 22,
                                        marginRight: 10
                                    }}
                                />

                                <Box>
                                    <Typography variant="h6">
                                        Regional Settings
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Default regional configuration.
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={2.5}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Country"
                                        value="India"
                                        disabled
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Currency"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Timezone"
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ====================================================== */}
                {/* NOTIFICATION SETTINGS */}
                {/* ====================================================== */}

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <BellOutlined
                                    style={{
                                        fontSize: 22,
                                        marginRight: 10
                                    }}
                                />

                                <Box>
                                    <Typography variant="h6">
                                        Notification Settings
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Control platform-wide notification behaviour.
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 1 }} />

                            <Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={emailNotifications}
                                            onChange={(e) =>
                                                setEmailNotifications(e.target.checked)
                                            }
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">
                                                Email Notifications
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Send important platform notifications by email.
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            <Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={smsNotifications}
                                            onChange={(e) =>
                                                setSmsNotifications(e.target.checked)
                                            }
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">
                                                SMS Notifications
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Enable SMS notifications for supported events.
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            <Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={bookingNotifications}
                                            onChange={(e) =>
                                                setBookingNotifications(e.target.checked)
                                            }
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">
                                                Booking Notifications
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Enable notifications for booking activity.
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ====================================================== */}
                {/* SECURITY */}
                {/* ====================================================== */}

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <LockOutlined
                                    style={{
                                        fontSize: 22,
                                        marginRight: 10
                                    }}
                                />

                                <Box>
                                    <Typography variant="h6">
                                        Security
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Platform security configuration.
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={true}
                                        disabled
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">
                                            Secure Authentication
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Authentication is managed through the configured
                                            identity provider.
                                        </Typography>
                                    </Box>
                                }
                            />

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="body2" color="text.secondary">
                                Admin access, roles, permissions and authentication
                                policies should be managed from the System section.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ====================================================== */}
                {/* MAINTENANCE */}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <SettingOutlined
                                    style={{
                                        fontSize: 22,
                                        marginRight: 10
                                    }}
                                />

                                <Box>
                                    <Typography variant="h6">
                                        Maintenance
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Control platform availability.
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={maintenanceMode}
                                        onChange={(e) =>
                                            setMaintenanceMode(e.target.checked)
                                        }
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">
                                            Maintenance Mode
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Temporarily restrict access while platform
                                            maintenance is being performed.
                                        </Typography>
                                    </Box>
                                }
                            />

                            {maintenanceMode && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Maintenance mode is currently enabled.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* ====================================================== */}
                {/* SAVE BUTTON */}
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
                            Save Changes
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

