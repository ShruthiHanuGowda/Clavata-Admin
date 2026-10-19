
import { useCallback, useEffect, useMemo, useState } from 'react';
import { gql, useApolloClient, useQuery } from '@apollo/client';

// Material UI
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  Typography
} from '@mui/material';

// Ant Design icons
import {
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  StarFilled
} from '@ant-design/icons';

// ============================================================
// GRAPHQL
// ============================================================

const ADMIN_SALONS = gql`
  query AdminSalons {
    adminSalons {
      success
      message
      totalCount
      salons {
        salonId
        salonName
        ownerName
        isActive
        isVisible
        isDeleted
        kycStatus
        adminApprovalStatus
        salonStatus
      }
    }
  }
`;

const LIST_SERVICES = gql`
  query ListServices($salonId: ID!) {
    listServices(salonId: $salonId) {
      serviceId
      salonId
      name
      categoryId
      categoryName
      subcategoryId
      subcategoryName
      description
      duration
      price
      audience
      popular
      active
      createdAt
      updatedAt
      updatedBy
    }
  }
`;

// ============================================================
// TYPES
// ============================================================

type ServiceAudience = 'FEMALE' | 'MALE' | 'KIDS';

interface Service {
  serviceId: string;
  salonId: string;
  salonName: string;
  name: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string | null;
  subcategoryName?: string | null;
  description?: string | null;
  duration: number;
  price: number;
  audience: ServiceAudience;
  popular: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
}

interface AdminSalon {
  salonId: string;
  salonName: string;
  ownerName?: string;
  isActive?: boolean;
  isVisible?: boolean;
  isDeleted?: boolean;
  kycStatus?: string;
  adminApprovalStatus?: string;
  salonStatus?: string;
}

interface ServiceLoadError {
  salonId: string;
  salonName: string;
  message: string;
}

type AudienceFilter = ServiceAudience | 'ALL';
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

const formatAudience = (audience?: string) => {
  switch (audience) {
    case 'FEMALE':
      return 'Female';
    case 'MALE':
      return 'Male';
    case 'KIDS':
      return 'Kids';
    default:
      return audience || 'Not specified';
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getCategoryLabel = (service: Service) =>
  service.categoryName || service.categoryId || '—';

const getSubcategoryLabel = (service: Service) =>
  service.subcategoryName || service.subcategoryId || '—';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

// ============================================================
// STAT CARD
// ============================================================

interface StatCardProps {
  title: string;
  value: number;
  description: string;
}

function StatCard({
  title,
  value,
  description
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        {title}
      </Typography>

      <Typography variant="h4" fontWeight={700}>
        {value.toLocaleString('en-IN')}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          mt: 0.5
        }}
      >
        {description}
      </Typography>
    </Paper>
  );
}

// ============================================================
// SERVICES PAGE — READ ONLY
// ============================================================

export default function Services() {
  const client = useApolloClient();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceErrors, setServiceErrors] = useState<ServiceLoadError[]>([]);
  const [serviceLoadMessage, setServiceLoadMessage] = useState('');

  const [search, setSearch] = useState('');
  const [salonFilter, setSalonFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [audienceFilter, setAudienceFilter] =
    useState<AudienceFilter>('ALL');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Prevent overlapping requests from replacing newer results.
  const [refreshKey, setRefreshKey] = useState(0);

  // ----------------------------------------------------------
  // LOAD SALONS
  // ----------------------------------------------------------

  const {
    data: salonData,
    loading: loadingSalons,
    error: salonError,
    refetch: refetchSalons
  } = useQuery(ADMIN_SALONS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  const salons: AdminSalon[] = useMemo(() => {
    const items = salonData?.adminSalons?.salons;

    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter(
      (salon: AdminSalon) =>
        Boolean(salon?.salonId) && !salon?.isDeleted
    );
  }, [salonData]);

  // ----------------------------------------------------------
  // LOAD SERVICES FOR ALL SALONS
  // ----------------------------------------------------------

  const loadServices = useCallback(
    async (salonList: AdminSalon[]) => {
      if (!salonList.length) {
        setServices([]);
        setServiceErrors([]);
        setServiceLoadMessage('');
        setLoadingServices(false);
        return;
      }

      setLoadingServices(true);
      setServiceErrors([]);
      setServiceLoadMessage('');

      try {
        const results = await Promise.all(
          salonList.map(async (salon) => {
            try {
              const result = await client.query({
                query: LIST_SERVICES,
                variables: {
                  salonId: salon.salonId
                },
                fetchPolicy: 'network-only',
                errorPolicy: 'none'
              });

              const salonServices = result.data?.listServices;

              if (!Array.isArray(salonServices)) {
                throw new Error(
                  'The listServices response was missing or invalid.'
                );
              }

              const normalizedServices: Service[] =
                salonServices.map((service: Omit<Service, 'salonName'>) => ({
                  ...service,
                  salonId: service.salonId || salon.salonId,
                  salonName: salon.salonName || 'Unnamed salon',
                  name: service.name || 'Unnamed service',
                  categoryId: service.categoryId || '',
                  categoryName: service.categoryName || '',
                  subcategoryId: service.subcategoryId ?? null,
                  subcategoryName: service.subcategoryName ?? null,
                  description: service.description ?? '',
                  duration: Number(service.duration ?? 0),
                  price: Number(service.price ?? 0),
                  popular: Boolean(service.popular),
                  active: Boolean(service.active),
                  audience: service.audience
                }));

              return {
                services: normalizedServices,
                error: null as ServiceLoadError | null
              };
            } catch (error) {
              console.error(
                '[ADMIN SERVICES] Failed to load salon services',
                {
                  salonId: salon.salonId,
                  salonName: salon.salonName,
                  error
                }
              );

              return {
                services: [] as Service[],
                error: {
                  salonId: salon.salonId,
                  salonName: salon.salonName || salon.salonId,
                  message: getErrorMessage(error)
                } as ServiceLoadError
              };
            }
          })
        );

        setServices(results.flatMap((result) => result.services));

        const errors = results
          .map((result) => result.error)
          .filter(
            (error): error is ServiceLoadError => error !== null
          );

        setServiceErrors(errors);

        if (errors.length > 0) {
          setServiceLoadMessage(
            `Could not load services for ${errors.length} salon(s). ` +
              'Services from successfully loaded salons are still displayed.'
          );
        }
      } catch (error) {
        console.error('[ADMIN SERVICES] Failed to load services', error);

        setServices([]);
        setServiceErrors([]);
        setServiceLoadMessage(
          `Failed to load services: ${getErrorMessage(error)}`
        );
      } finally {
        setLoadingServices(false);
      }
    },
    [client]
  );

  useEffect(() => {
    if (loadingSalons) {
      return;
    }

    if (salonError) {
      setServices([]);
      setServiceErrors([]);
      setServiceLoadMessage(
        `Failed to load salons: ${salonError.message}`
      );
      return;
    }

    void loadServices(salons);
  }, [
    salons,
    loadingSalons,
    salonError,
    loadServices,
    refreshKey
  ]);

  // ----------------------------------------------------------
  // FILTER OPTIONS
  // ----------------------------------------------------------

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        services
          .map((service) => getCategoryLabel(service))
          .filter((category) => category && category !== '—')
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [services]);

  // ----------------------------------------------------------
  // FILTER SERVICES
  // ----------------------------------------------------------

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !query ||
        service.name?.toLowerCase().includes(query) ||
        getCategoryLabel(service).toLowerCase().includes(query) ||
        getSubcategoryLabel(service).toLowerCase().includes(query) ||
        service.salonName?.toLowerCase().includes(query) ||
        service.salonId?.toLowerCase().includes(query) ||
        service.serviceId?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query);

      const matchesSalon =
        salonFilter === 'ALL' ||
        service.salonId === salonFilter;

      const matchesCategory =
        categoryFilter === 'ALL' ||
        getCategoryLabel(service) === categoryFilter;

      const matchesAudience =
        audienceFilter === 'ALL' ||
        service.audience === audienceFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && service.active) ||
        (statusFilter === 'INACTIVE' && !service.active);

      return (
        matchesSearch &&
        matchesSalon &&
        matchesCategory &&
        matchesAudience &&
        matchesStatus
      );
    });
  }, [
    services,
    search,
    salonFilter,
    categoryFilter,
    audienceFilter,
    statusFilter
  ]);

  // ----------------------------------------------------------
  // STATISTICS
  // ----------------------------------------------------------

  const totalServices = services.length;

  const activeServices = services.filter(
    (service) => service.active
  ).length;

  const inactiveServices = services.filter(
    (service) => !service.active
  ).length;

  const popularServices = services.filter(
    (service) => service.popular
  ).length;

  // ----------------------------------------------------------
  // PAGINATION
  // ----------------------------------------------------------

  const paginatedServices = useMemo(() => {
    const start = page * rowsPerPage;

    return filteredServices.slice(start, start + rowsPerPage);
  }, [filteredServices, page, rowsPerPage]);

  useEffect(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(filteredServices.length / rowsPerPage) - 1
    );

    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredServices.length, page, rowsPerPage]);

  // ----------------------------------------------------------
  // FILTER RESET
  // ----------------------------------------------------------

  const handleReset = () => {
    setSearch('');
    setSalonFilter('ALL');
    setCategoryFilter('ALL');
    setAudienceFilter('ALL');
    setStatusFilter('ALL');
    setPage(0);
  };

  // ----------------------------------------------------------
  // VIEW SERVICE DETAILS
  // ----------------------------------------------------------

  const handleView = (service: Service) => {
    setSelectedService(service);
    setViewOpen(true);
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setSelectedService(null);
  };

  // ----------------------------------------------------------
  // REFRESH
  // ----------------------------------------------------------

  const handleRefresh = async () => {
    try {
      setServiceLoadMessage('');
      setServiceErrors([]);

      const result = await refetchSalons();

      const refreshedSalons: AdminSalon[] =
        result.data?.adminSalons?.salons || [];

      const validSalons = refreshedSalons.filter(
        (salon: AdminSalon) =>
          Boolean(salon?.salonId) && !salon?.isDeleted
      );

      await loadServices(validSalons);
    } catch (error) {
      console.error('[ADMIN SERVICES] Refresh failed', error);

      setServiceLoadMessage(
        `Refresh failed: ${getErrorMessage(error)}`
      );
    }
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <Box>
      {/* HEADER */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Services
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            View and monitor services registered by salon partners.
          </Typography>
        </Box>

        <Tooltip title="Refresh salons and services">
          <span>
            <IconButton
              onClick={handleRefresh}
              disabled={loadingSalons || loadingServices}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5
              }}
            >
              {loadingSalons || loadingServices ? (
                <CircularProgress size={20} />
              ) : (
                <ReloadOutlined />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* ERRORS */}

      {salonError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load salons: {salonError.message}
        </Alert>
      )}

      {!salonError && serviceLoadMessage && (
        <Alert
          severity={
            serviceErrors.length > 0 ? 'warning' : 'error'
          }
          sx={{ mb: 2 }}
        >
          {serviceLoadMessage}

          {serviceErrors.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {serviceErrors.map((error) => (
                <Typography
                  key={error.salonId}
                  variant="body2"
                  sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
                >
                  <strong>{error.salonName}:</strong>{' '}
                  {error.message}
                </Typography>
              ))}
            </Box>
          )}
        </Alert>
      )}

      {/* STATISTICS */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Services"
            value={totalServices}
            description="Services registered by salons"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Services"
            value={activeServices}
            description="Currently marked active"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive Services"
            value={inactiveServices}
            description="Currently marked inactive"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Popular Services"
            value={popularServices}
            description="Marked as popular by salons"
          />
        </Grid>
      </Grid>

      {/* FILTERS */}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          mb: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* SEARCH */}

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search service, salon, category..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* SALON */}

          <Grid item xs={12} sm={6} md={2.3}>
            <FormControl fullWidth size="small">
              <InputLabel>Salon</InputLabel>

              <Select
                value={salonFilter}
                label="Salon"
                onChange={(event) => {
                  setSalonFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Salons</MenuItem>

                {[...salons]
                  .sort((a, b) =>
                    (a.salonName || '').localeCompare(
                      b.salonName || ''
                    )
                  )
                  .map((salon) => (
                    <MenuItem
                      key={salon.salonId}
                      value={salon.salonId}
                    >
                      {salon.salonName || salon.salonId}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {/* CATEGORY */}

          <Grid item xs={12} sm={6} md={2.3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>

              <Select
                value={categoryFilter}
                label="Category"
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Categories</MenuItem>

                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* AUDIENCE */}

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Audience</InputLabel>

              <Select
                value={audienceFilter}
                label="Audience"
                onChange={(event) => {
                  setAudienceFilter(
                    event.target.value as AudienceFilter
                  );
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Audiences</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="KIDS">Kids</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* STATUS */}

          <Grid item xs={12} sm={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>

              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as StatusFilter
                  );
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* RESET */}

          <Grid item xs={12} md={0.9}>
            <Tooltip title="Reset filters">
              <IconButton
                onClick={handleReset}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5
                }}
              >
                <ReloadOutlined />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* SERVICES TABLE */}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Salon</TableCell>
                <TableCell>Category / Subcategory</TableCell>
                <TableCell>Audience</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Popular</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loadingServices || loadingSalons ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Loading salon services...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                    >
                      {serviceErrors.length > 0
                        ? 'Some services could not be loaded'
                        : salons.length === 0
                          ? 'No salons found'
                          : 'No services found'}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {serviceErrors.length > 0
                        ? 'Review the error details above or refresh the page.'
                        : search ||
                            salonFilter !== 'ALL' ||
                            categoryFilter !== 'ALL' ||
                            audienceFilter !== 'ALL' ||
                            statusFilter !== 'ALL'
                          ? 'Try changing your search or filters.'
                          : 'Services created by salon partners will appear here.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServices.map((service) => (
                  <TableRow
                    key={`${service.salonId}-${service.serviceId}`}
                    hover
                  >
                    {/* SERVICE */}

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: 'primary.lighter',
                            color: 'primary.main',
                            fontWeight: 700
                          }}
                        >
                          {(service.name || 'S')
                            .charAt(0)
                            .toUpperCase()}
                        </Avatar>

                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                          >
                            {service.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            ID: {service.serviceId}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* SALON */}

                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {service.salonName}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {service.salonId}
                      </Typography>
                    </TableCell>

                    {/* CATEGORY */}

                    <TableCell>
                      <Typography variant="body2">
                        {getCategoryLabel(service)}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {getSubcategoryLabel(service)}
                      </Typography>
                    </TableCell>

                    {/* AUDIENCE */}

                    <TableCell>
                      <Chip
                        size="small"
                        label={formatAudience(service.audience)}
                        color={
                          service.audience === 'FEMALE'
                            ? 'secondary'
                            : service.audience === 'MALE'
                              ? 'info'
                              : 'default'
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    {/* DURATION */}

                    <TableCell>
                      {service.duration > 0
                        ? `${service.duration} min`
                        : '—'}
                    </TableCell>

                    {/* PRICE */}

                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {formatCurrency(service.price)}
                      </Typography>
                    </TableCell>

                    {/* POPULAR */}

                    <TableCell>
                      {service.popular ? (
                        <Chip
                          size="small"
                          icon={<StarFilled />}
                          label="Popular"
                          color="warning"
                          variant="outlined"
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>

                    {/* STATUS */}

                    <TableCell>
                      <Chip
                        size="small"
                        label={service.active ? 'Active' : 'Inactive'}
                        color={service.active ? 'success' : 'default'}
                      />
                    </TableCell>

                    {/* VIEW ONLY */}

                    <TableCell align="right">
                      <Tooltip title="View service details">
                        <IconButton
                          size="small"
                          onClick={() => handleView(service)}
                          aria-label={`View ${service.name}`}
                        >
                          <EyeOutlined />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredServices.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
        />
      </Paper>

      {/* SERVICE DETAILS — READ ONLY */}

      <Dialog
        open={viewOpen}
        onClose={handleCloseView}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Service Details
        </DialogTitle>

        <DialogContent dividers>
          {selectedService && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {selectedService.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Service ID: {selectedService.serviceId}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Salon
                  </Typography>

                  <Typography variant="body1">
                    {selectedService.salonName}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {selectedService.salonId}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Price
                  </Typography>

                  <Typography variant="body1" fontWeight={600}>
                    {formatCurrency(selectedService.price)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>

                  <Typography variant="body1">
                    {getCategoryLabel(selectedService)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Subcategory
                  </Typography>

                  <Typography variant="body1">
                    {getSubcategoryLabel(selectedService)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Audience
                  </Typography>

                  <Typography variant="body1">
                    {formatAudience(selectedService.audience)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Duration
                  </Typography>

                  <Typography variant="body1">
                    {selectedService.duration > 0
                      ? `${selectedService.duration} minutes`
                      : '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    {selectedService.description || 'No description provided.'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>

                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={selectedService.active ? 'Active' : 'Inactive'}
                      color={selectedService.active ? 'success' : 'default'}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Popular
                  </Typography>

                  <Typography variant="body1">
                    {selectedService.popular ? 'Yes' : 'No'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>

                  <Typography variant="body2">
                    {formatDate(selectedService.createdAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>

                  <Typography variant="body2">
                    {formatDate(selectedService.updatedAt)}
                  </Typography>
                </Grid>

                {selectedService.updatedBy && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Last Updated By
                    </Typography>

                    <Typography variant="body2">
                      {selectedService.updatedBy}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseView}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
