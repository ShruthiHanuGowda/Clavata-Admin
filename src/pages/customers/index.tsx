import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';

// material-ui
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Alert
} from '@mui/material';

// icons
import {
    CalendarOutlined,
    EyeOutlined,
    PhoneOutlined,
    SearchOutlined,
    UserOutlined,
    UsergroupAddOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';

// project import
import { ADMIN_CUSTOMERS } from '../../graphql/queries';
import CustomerDetails from './CustomerDetails';

// ==============================|| TYPES ||============================== //

export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export type ProviderStatus =
    | 'NOT_REGISTERED'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED';

export interface Customer {
    userId: string;
    fullName: string;
    phoneNumber: string;
    email?: string | null;

    activeRole: 'CUSTOMER';

    providerStatus: ProviderStatus;

    salonId?: string | null;

    status: CustomerStatus;

    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalSpent: number;

    lastBooking?: string | null;

    createdAt: string;
    updatedAt: string;
}

interface AdminCustomersResponse {
    adminCustomers: {
        success: boolean;
        message: string;
        customers: Customer[];
        totalCount: number;
    };
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

// ==============================|| STAT CARD ||============================== //

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
}

function StatCard({
    title,
    value,
    subtitle,
    icon
}: StatCardProps) {
    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2.5
            }}
        >
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontWeight: 500,
                                mb: 1
                            }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700
                            }}
                        >
                            {value}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: 'block',
                                mt: 0.75
                            }}
                        >
                            {subtitle}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'primary.lighter',
                            color: 'primary.main'
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

// ==============================|| CUSTOMERS PAGE ||============================== //

export default function Customers() {
    // ==============================|| STATE ||============================== //

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    const [statusFilter, setStatusFilter] =
        useState<'ALL' | CustomerStatus>('ALL');

    const [page, setPage] = useState(0);

    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    const [detailsOpen, setDetailsOpen] = useState(false);

    // ==============================|| SEARCH DEBOUNCE ||============================== //

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(0);
        }, 400);

        return () => {
            window.clearTimeout(timer);
        };
    }, [searchInput]);

    // ==============================|| GRAPHQL QUERY ||============================== //

    const {
        data,
        loading,
        error,
        refetch
    } = useQuery<AdminCustomersResponse>(ADMIN_CUSTOMERS, {
        variables: {
            search: search || undefined,
            status:
                statusFilter === 'ALL'
                    ? undefined
                    : statusFilter
        },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true
    });

    // ==============================|| DATA ||============================== //

    const customers = data?.adminCustomers?.customers ?? [];

    const totalCount =
        data?.adminCustomers?.totalCount ??
        customers.length;

    // ==============================|| STATISTICS ||============================== //

    const totalCustomers = totalCount;

    const activeCustomers = useMemo(
        () =>
            customers.filter(
                (customer) => customer.status === 'ACTIVE'
            ).length,
        [customers]
    );

    const inactiveCustomers = useMemo(
        () =>
            customers.filter(
                (customer) => customer.status === 'INACTIVE'
            ).length,
        [customers]
    );

    const totalBookings = useMemo(
        () =>
            customers.reduce(
                (sum, customer) =>
                    sum + (customer.totalBookings || 0),
                0
            ),
        [customers]
    );

    // ==============================|| CLIENT PAGINATION ||============================== //

    const paginatedCustomers = useMemo(() => {
        const start = page * rowsPerPage;

        return customers.slice(
            start,
            start + rowsPerPage
        );
    }, [customers, page, rowsPerPage]);

    // ==============================|| HANDLERS ||============================== //

    const handleSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchInput(event.target.value);
    };

    const handleStatusChange = (
        event: SelectChangeEvent
    ) => {
        const value = event.target.value as
            | 'ALL'
            | CustomerStatus;

        setStatusFilter(value);
        setPage(0);
    };

    const handleChangePage = (
        _event: unknown,
        newPage: number
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = parseInt(
            event.target.value,
            10
        );

        setRowsPerPage(value);
        setPage(0);
    };

    const handleViewCustomer = (
        customer: Customer
    ) => {
        setSelectedCustomer(customer);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedCustomer(null);
    };

    // ==============================|| ERROR ||============================== //

    if (error) {
        return (
            <Box sx={{ width: '100%' }}>
                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row'
                    }}
                    justifyContent="space-between"
                    alignItems={{
                        xs: 'flex-start',
                        sm: 'center'
                    }}
                    spacing={2}
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: 700 }}
                        >
                            Customers
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Manage and monitor customers
                            registered on your platform.
                        </Typography>
                    </Box>
                </Stack>

                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Typography
                            component="button"
                            onClick={() => refetch()}
                            sx={{
                                border: 0,
                                background: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                color: 'inherit'
                            }}
                        >
                            Retry
                        </Typography>
                    }
                >
                    Failed to load customers.
                    {error.message
                        ? ` ${error.message}`
                        : ''}
                </Alert>
            </Box>
        );
    }

    // ==============================|| RENDER ||============================== //

    return (
        <Box sx={{ width: '100%' }}>
            {/* ==============================|| PAGE HEADER ||============================== */}

            {/* <Stack
                direction={{
                    xs: 'column',
                    sm: 'row'
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: 'flex-start',
                    sm: 'center'
                }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700 }}
                    >
                        Customers
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        Manage and monitor customers
                        registered on your platform.
                    </Typography>
                </Box>
            </Stack> */}

            {/* ==============================|| STATISTICS ||============================== */}

            <Grid
                container
                spacing={2.5}
                sx={{ mb: 3 }}
            >
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Customers"
                        value={
                            loading
                                ? '—'
                                : totalCustomers
                        }
                        subtitle="All registered customers"
                        icon={
                            <UsergroupAddOutlined
                                style={{
                                    fontSize: 22
                                }}
                            />
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Active Customers"
                        value={
                            loading
                                ? '—'
                                : activeCustomers
                        }
                        subtitle="Currently active"
                        icon={
                            <CheckCircleOutlined
                                style={{
                                    fontSize: 22
                                }}
                            />
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Inactive Customers"
                        value={
                            loading
                                ? '—'
                                : inactiveCustomers
                        }
                        subtitle="Currently inactive"
                        icon={
                            <CloseCircleOutlined
                                style={{
                                    fontSize: 22
                                }}
                            />
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Bookings"
                        value={
                            loading
                                ? '—'
                                : totalBookings
                        }
                        subtitle="Bookings made by customers"
                        icon={
                            <CalendarOutlined
                                style={{
                                    fontSize: 22
                                }}
                            />
                        }
                    />
                </Grid>
            </Grid>

            {/* ==============================|| TABLE CARD ||============================== */}

            <Card
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.5,
                    overflow: 'hidden'
                }}
            >
                {/* ==============================|| TOOLBAR ||============================== */}

                <Box sx={{ p: 2.5 }}>
                    <Stack
                        direction={{
                            xs: 'column',
                            md: 'row'
                        }}
                        spacing={2}
                        justifyContent="space-between"
                    >
                        <TextField
                            value={searchInput}
                            onChange={handleSearchChange}
                            placeholder="Search by name, phone, email or ID..."
                            size="small"
                            fullWidth
                            sx={{
                                maxWidth: {
                                    md: 420
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlined
                                            style={{
                                                fontSize: 18
                                            }}
                                        />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            <Select
                                value={statusFilter}
                                onChange={
                                    handleStatusChange
                                }
                                size="small"
                                sx={{
                                    minWidth: 140
                                }}
                            >
                                <MenuItem value="ALL">
                                    All Status
                                </MenuItem>

                                <MenuItem value="ACTIVE">
                                    Active
                                </MenuItem>

                                <MenuItem value="INACTIVE">
                                    Inactive
                                </MenuItem>
                            </Select>

                            {loading && (
                                <CircularProgress
                                    size={22}
                                />
                            )}
                        </Stack>
                    </Stack>
                </Box>

                <Divider />

                {/* ==============================|| TABLE ||============================== */}

                <TableContainer
                    component={Paper}
                    elevation={0}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 700
                                    }}
                                >
                                    Customer
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700
                                    }}
                                >
                                    Phone
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700
                                    }}
                                >
                                    Bookings
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700
                                    }}
                                >
                                    Total Spent
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700
                                    }}
                                >
                                    Last Booking
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700
                                    }}
                                >
                                    Status
                                </TableCell>

                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 700
                                    }}
                                >
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading &&
                            customers.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                    >
                                        <Box
                                            sx={{
                                                py: 8,
                                                display: 'flex',
                                                justifyContent:
                                                    'center',
                                                alignItems:
                                                    'center',
                                                flexDirection:
                                                    'column',
                                                gap: 2
                                            }}
                                        >
                                            <CircularProgress />

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Loading customers...
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedCustomers.length >
                              0 ? (
                                paginatedCustomers.map(
                                    (customer) => (
                                        <TableRow
                                            key={
                                                customer.userId
                                            }
                                            hover
                                            sx={{
                                                '&:last-child td, &:last-child th':
                                                    {
                                                        border: 0
                                                    }
                                            }}
                                        >
                                            {/* CUSTOMER */}

                                            <TableCell>
                                                <Stack
                                                    direction="row"
                                                    spacing={1.5}
                                                    alignItems="center"
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            bgcolor:
                                                                'primary.lighter',
                                                            color:
                                                                'primary.main',
                                                            fontSize: 14,
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        {getInitials(
                                                            customer.fullName
                                                        )}
                                                    </Avatar>

                                                    <Box>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            {
                                                                customer.fullName
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {
                                                                customer.userId
                                                            }
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>

                                            {/* PHONE */}

                                            <TableCell>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                >
                                                    <PhoneOutlined
                                                        style={{
                                                            fontSize: 15
                                                        }}
                                                    />

                                                    <Typography variant="body2">
                                                        {
                                                            customer.phoneNumber
                                                        }
                                                    </Typography>
                                                </Stack>
                                            </TableCell>

                                            {/* BOOKINGS */}

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {
                                                        customer.totalBookings
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {
                                                        customer.completedBookings
                                                    }{' '}
                                                    completed
                                                </Typography>
                                            </TableCell>

                                            {/* SPENDING */}

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {formatCurrency(
                                                        customer.totalSpent
                                                    )}
                                                </Typography>
                                            </TableCell>

                                            {/* LAST BOOKING */}

                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(
                                                        customer.lastBooking
                                                    )}
                                                </Typography>
                                            </TableCell>

                                            {/* STATUS */}

                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={
                                                        customer.status
                                                    }
                                                    icon={
                                                        customer.status ===
                                                        'ACTIVE' ? (
                                                            <CheckCircleOutlined />
                                                        ) : (
                                                            <CloseCircleOutlined />
                                                        )
                                                    }
                                                    color={
                                                        customer.status ===
                                                        'ACTIVE'
                                                            ? 'success'
                                                            : 'default'
                                                    }
                                                    variant="outlined"
                                                    sx={{
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </TableCell>

                                            {/* ACTION */}

                                            <TableCell align="right">
                                                <Tooltip title="View customer">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() =>
                                                            handleViewCustomer(
                                                                customer
                                                            )
                                                        }
                                                    >
                                                        <EyeOutlined />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    )
                                )
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                    >
                                        <Box
                                            sx={{
                                                py: 8,
                                                textAlign:
                                                    'center'
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    mx: 'auto',
                                                    mb: 2,
                                                    bgcolor:
                                                        'grey.100',
                                                    color:
                                                        'grey.500'
                                                }}
                                            >
                                                <UserOutlined
                                                    style={{
                                                        fontSize: 25
                                                    }}
                                                />
                                            </Avatar>

                                            <Typography variant="h6">
                                                No customers found
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.5
                                                }}
                                            >
                                                {search
                                                    ? `No customers match "${search}".`
                                                    : statusFilter !==
                                                        'ALL'
                                                      ? `There are no ${statusFilter.toLowerCase()} customers.`
                                                      : 'No customers are registered yet.'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* ==============================|| PAGINATION ||============================== */}

                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={
                        handleChangePage
                    }
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={
                        handleChangeRowsPerPage
                    }
                    rowsPerPageOptions={[
                        5,
                        10,
                        25,
                        50
                    ]}
                />
            </Card>

            {/* ==============================|| CUSTOMER DETAILS ||============================== */}

            <CustomerDetails
                customer={selectedCustomer}
                open={detailsOpen}
                onClose={handleCloseDetails}
            />
        </Box>
    );
}