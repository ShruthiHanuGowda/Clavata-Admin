import React from 'react';

// material-ui
import {
    Avatar,
    Box,
    Chip,
    Divider,
    Drawer,
    Grid,
    IconButton,
    Paper,
    Stack,
    Typography
} from '@mui/material';

// icons
import {
    CalendarOutlined,
    CloseOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';

// project import
import {
    Customer,
    ProviderStatus
} from './index';

// ==============================|| PROPS ||============================== //

interface Props {
    customer: Customer | null;
    open: boolean;
    onClose: () => void;
}

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value || 0);
};

const formatDate = (date?: string | null) => {
    if (!date) return 'Never';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Never';
    }

    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(parsedDate);
};

const getInitials = (name: string) => {
    if (!name) return 'CU';

    return name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
};

const getProviderStatusColor = (
    status: ProviderStatus
) => {
    switch (status) {
        case 'APPROVED':
            return 'success';

        case 'PENDING':
            return 'warning';

        case 'REJECTED':
            return 'error';

        default:
            return 'default';
    }
};

const getProviderStatusIcon = (
    status: ProviderStatus
) => {
    switch (status) {
        case 'APPROVED':
            return <CheckCircleOutlined />;

        case 'PENDING':
            return <ClockCircleOutlined />;

        case 'REJECTED':
            return <CloseCircleOutlined />;

        default:
            return <UserOutlined />;
    }
};

// ==============================|| CUSTOMER DETAILS ||============================== //

export default function CustomerDetails({
    customer,
    open,
    onClose
}: Props) {
    if (!customer) {
        return null;
    }

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: {
                        xs: '100%',
                        sm: 460
                    }
                }
            }}
        >
            {/* ==============================|| HEADER ||============================== */}

            <Box
                sx={{
                    p: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700
                        }}
                    >
                        Customer Details
                    </Typography>

                    <IconButton onClick={onClose}>
                        <CloseOutlined />
                    </IconButton>
                </Stack>
            </Box>

            {/* ==============================|| CONTENT ||============================== */}

            <Box
                sx={{
                    p: 2.5,
                    overflowY: 'auto'
                }}
            >
                {/* ==============================|| PROFILE ||============================== */}

                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 3 }}
                >
                    <Avatar
                        sx={{
                            width: 68,
                            height: 68,
                            bgcolor:
                                'primary.lighter',
                            color:
                                'primary.main',
                            fontSize: 22,
                            fontWeight: 700
                        }}
                    >
                        {getInitials(
                            customer.fullName
                        )}
                    </Avatar>

                    <Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700
                            }}
                        >
                            {customer.fullName}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Customer ID:{' '}
                            {customer.userId}
                        </Typography>

                        <Chip
                            size="small"
                            label={customer.status}
                            color={
                                customer.status ===
                                'ACTIVE'
                                    ? 'success'
                                    : 'default'
                            }
                            variant="outlined"
                            sx={{
                                mt: 1,
                                fontWeight: 600
                            }}
                        />
                    </Box>
                </Stack>

                {/* ==============================|| CONTACT INFORMATION ||============================== */}

                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        mb: 1.5
                    }}
                >
                    Contact Information
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor:
                            'divider',
                        borderRadius: 2,
                        mb: 3
                    }}
                >
                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            <PhoneOutlined />

                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Phone
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600
                                    }}
                                >
                                    {
                                        customer.phoneNumber
                                    }
                                </Typography>
                            </Box>
                        </Stack>

                        {customer.email && (
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                            >
                                <MailOutlined />

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Email
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 600
                                        }}
                                    >
                                        {
                                            customer.email
                                        }
                                    </Typography>
                                </Box>
                            </Stack>
                        )}
                    </Stack>
                </Paper>

                {/* ==============================|| ACCOUNT INFORMATION ||============================== */}

                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        mb: 1.5
                    }}
                >
                    Account Information
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor:
                            'divider',
                        borderRadius: 2,
                        mb: 3
                    }}
                >
                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            <UserOutlined />

                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Account Role
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600
                                    }}
                                >
                                    Customer
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            <CalendarOutlined />

                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Registered On
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600
                                    }}
                                >
                                    {formatDate(
                                        customer.createdAt
                                    )}
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Paper>

                {/* ==============================|| PROVIDER STATUS ||============================== */}

                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        mb: 1.5
                    }}
                >
                    Provider Status
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor:
                            'divider',
                        borderRadius: 2,
                        mb: 3
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            {getProviderStatusIcon(
                                customer.providerStatus
                            )}

                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Provider Registration
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600
                                    }}
                                >
                                    {customer.providerStatus.replace(
                                        '_',
                                        ' '
                                    )}
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            size="small"
                            label={customer.providerStatus.replace(
                                '_',
                                ' '
                            )}
                            color={getProviderStatusColor(
                                customer.providerStatus
                            )}
                            variant="outlined"
                            sx={{
                                fontWeight: 600
                            }}
                        />
                    </Stack>

                    {customer.salonId && (
                        <>
                            <Divider
                                sx={{ my: 2 }}
                            />

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Salon ID
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    mt: 0.5
                                }}
                            >
                                {customer.salonId}
                            </Typography>
                        </>
                    )}
                </Paper>

                {/* ==============================|| BOOKING STATISTICS ||============================== */}

                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        mb: 1.5
                    }}
                >
                    Booking Statistics
                </Typography>

                <Grid
                    container
                    spacing={1.5}
                    sx={{ mb: 3 }}
                >
                    <Grid item xs={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border:
                                    '1px solid',
                                borderColor:
                                    'divider',
                                borderRadius: 2
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Total Bookings
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    mt: 0.5,
                                    fontWeight: 700
                                }}
                            >
                                {
                                    customer.totalBookings
                                }
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border:
                                    '1px solid',
                                borderColor:
                                    'divider',
                                borderRadius: 2
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Completed
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    mt: 0.5,
                                    fontWeight: 700
                                }}
                            >
                                {
                                    customer.completedBookings
                                }
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border:
                                    '1px solid',
                                borderColor:
                                    'divider',
                                borderRadius: 2
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Cancelled
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    mt: 0.5,
                                    fontWeight: 700
                                }}
                            >
                                {
                                    customer.cancelledBookings
                                }
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border:
                                    '1px solid',
                                borderColor:
                                    'divider',
                                borderRadius: 2
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Total Spent
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    mt: 0.5,
                                    fontWeight: 700
                                }}
                            >
                                {formatCurrency(
                                    customer.totalSpent
                                )}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* ==============================|| ACTIVITY ||============================== */}

                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        mb: 1.5
                    }}
                >
                    Activity
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor:
                            'divider',
                        borderRadius: 2
                    }}
                >
                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            <ClockCircleOutlined />

                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Last Booking
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600
                                    }}
                                >
                                    {formatDate(
                                        customer.lastBooking
                                    )}
                                </Typography>
                            </Box>
                        </Stack>

                        <Divider />

                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            <CheckCircleOutlined />

                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Last Updated
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600
                                    }}
                                >
                                    {formatDate(
                                        customer.updatedAt
                                    )}
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Paper>
            </Box>
        </Drawer>
    );
}