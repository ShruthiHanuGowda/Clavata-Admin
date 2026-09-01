
import { useEffect, useMemo, useState } from 'react';
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client';

// material-ui
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

// ant design icons
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StarFilled
} from '@ant-design/icons';

// ==============================|| GRAPHQL ||============================== //

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
      category
      description
      duration
      price
      gender
      popular
      active
      createdAt
      updatedAt
      updatedBy
    }
  }
`;

const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      success
      message
      service {
        serviceId
        salonId
        name
        category
        description
        duration
        price
        gender
        popular
        active
        createdAt
        updatedAt
        updatedBy
      }
    }
  }
`;

const UPDATE_SERVICE = gql`
  mutation UpdateService($input: UpdateServiceInput!) {
    updateService(input: $input) {
      success
      message
      service {
        serviceId
        salonId
        name
        category
        description
        duration
        price
        gender
        popular
        active
        createdAt
        updatedAt
        updatedBy
      }
    }
  }
`;

const DELETE_SERVICE = gql`
  mutation DeleteService($input: DeleteServiceInput!) {
    deleteService(input: $input) {
      success
      message
      service {
        serviceId
        salonId
        name
        category
        description
        duration
        price
        gender
        popular
        active
        createdAt
        updatedAt
        updatedBy
      }
    }
  }
`;

// ==============================|| TYPES ||============================== //

type ServiceGender = 'MEN' | 'WOMEN' | 'UNISEX';

interface Service {
  serviceId: string;
  salonId: string;
  salonName: string;
  name: string;
  category: string;
  description: string;
  duration: number;
  price: number;
  gender: ServiceGender;
  popular: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

interface AdminSalon {
  salonId: string;
  salonName: string;
  ownerName: string;
  isActive: boolean;
  isVisible: boolean;
  isDeleted: boolean;
  kycStatus: string;
  adminApprovalStatus: string;
  salonStatus: string;
}

interface ServiceForm {
  salonId: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  price: string;
  gender: ServiceGender;
  popular: boolean;
  active: boolean;
}

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

const getGenderColor = (
  gender: ServiceGender
): 'info' | 'secondary' | 'default' => {
  switch (gender) {
    case 'MEN':
      return 'info';

    case 'WOMEN':
      return 'secondary';

    default:
      return 'default';
  }
};

const emptyForm: ServiceForm = {
  salonId: '',
  name: '',
  category: '',
  description: '',
  duration: '',
  price: '',
  gender: 'UNISEX',
  popular: false,
  active: true
};

// ==============================|| SERVICE PAGE ||============================== //

export default function Services() {
  const client = useApolloClient();

  // ==============================|| STATE ||============================== //

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const [search, setSearch] = useState('');
  const [salonFilter, setSalonFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [form, setForm] = useState<ServiceForm>(emptyForm);

  // ==============================|| GRAPHQL ||============================== //

  const {
    data: salonData,
    loading: loadingSalons,
    error: salonError,
    refetch: refetchSalons
  } = useQuery(ADMIN_SALONS, {
    fetchPolicy: 'network-only'
  });

  const [createService, { loading: creating }] =
    useMutation(CREATE_SERVICE);

  const [updateService, { loading: updating }] =
    useMutation(UPDATE_SERVICE);

  const [deleteService, { loading: deleting }] =
    useMutation(DELETE_SERVICE);

  // ==============================|| SALONS ||============================== //

  const salons: AdminSalon[] = useMemo(() => {
    return salonData?.adminSalons?.salons || [];
  }, [salonData]);

  // ==============================|| LOAD ALL SERVICES ||============================== //

  const loadServices = async () => {
    if (!salons.length) {
      setServices([]);
      return;
    }

    setLoadingServices(true);

    try {
      const results = await Promise.all(
        salons.map(async (salon) => {
          try {
            const result = await client.query({
              query: LIST_SERVICES,
              variables: {
                salonId: salon.salonId
              },
              fetchPolicy: 'network-only'
            });

            return (result.data?.listServices || []).map(
              (service: Omit<Service, 'salonName'>) => ({
                ...service,
                salonName: salon.salonName
              })
            );
          } catch (error) {
            console.error(
              `Failed to load services for salon ${salon.salonId}`,
              error
            );

            return [];
          }
        })
      );

      const allServices = results.flat();

      setServices(allServices);
    } catch (error) {
      console.error('Failed to load services:', error);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [salons]);

  // ==============================|| FILTER OPTIONS ||============================== //

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        services
          .map((service) => service.category)
          .filter(Boolean)
      )
    ).sort();
  }, [services]);

  // ==============================|| FILTER SERVICES ||============================== //

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !query ||
        service.name?.toLowerCase().includes(query) ||
        service.category?.toLowerCase().includes(query) ||
        service.salonName?.toLowerCase().includes(query) ||
        service.serviceId?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query);

      const matchesSalon =
        salonFilter === 'ALL' ||
        service.salonId === salonFilter;

      const matchesCategory =
        categoryFilter === 'ALL' ||
        service.category === categoryFilter;

      const matchesGender =
        genderFilter === 'ALL' ||
        service.gender === genderFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && service.active) ||
        (statusFilter === 'INACTIVE' && !service.active);

      return (
        matchesSearch &&
        matchesSalon &&
        matchesCategory &&
        matchesGender &&
        matchesStatus
      );
    });
  }, [
    services,
    search,
    salonFilter,
    categoryFilter,
    genderFilter,
    statusFilter
  ]);

  // ==============================|| STATISTICS ||============================== //

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

  // ==============================|| RESET ||============================== //

  const handleReset = () => {
    setSearch('');
    setSalonFilter('ALL');
    setCategoryFilter('ALL');
    setGenderFilter('ALL');
    setStatusFilter('ALL');
    setPage(0);
  };

  // ==============================|| VIEW ||============================== //

  const handleView = (service: Service) => {
    setSelectedService(service);
    setViewOpen(true);
  };

  // ==============================|| ADD ||============================== //

  const handleOpenAdd = () => {
    setEditingService(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  // ==============================|| EDIT ||============================== //

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);

    setForm({
      salonId: service.salonId,
      name: service.name || '',
      category: service.category || '',
      description: service.description || '',
      duration: String(service.duration ?? ''),
      price: String(service.price ?? ''),
      gender: service.gender,
      popular: Boolean(service.popular),
      active: Boolean(service.active)
    });

    setFormOpen(true);
  };

  // ==============================|| SAVE ||============================== //

  const handleSave = async () => {
    if (
      !form.salonId ||
      !form.name.trim() ||
      !form.category.trim() ||
      !form.duration ||
      !form.price
    ) {
      return;
    }

    const duration = Number(form.duration);
    const price = Number(form.price);

    if (
      Number.isNaN(duration) ||
      Number.isNaN(price) ||
      duration <= 0 ||
      price < 0
    ) {
      return;
    }

    try {
      if (editingService) {
        const result = await updateService({
          variables: {
            input: {
              salonId: editingService.salonId,
              serviceId: editingService.serviceId,
              name: form.name.trim(),
              category: form.category.trim(),
              description: form.description.trim(),
              duration,
              price,
              gender: form.gender,
              popular: form.popular,
              active: form.active
            }
          }
        });

        if (!result.data?.updateService?.success) {
          alert(
            result.data?.updateService?.message ||
              'Failed to update service.'
          );
          return;
        }
      } else {
        const result = await createService({
          variables: {
            input: {
              salonId: form.salonId,
              name: form.name.trim(),
              category: form.category.trim(),
              description: form.description.trim(),
              duration,
              price,
              gender: form.gender,
              popular: form.popular,
              active: form.active
            }
          }
        });

        if (!result.data?.createService?.success) {
          alert(
            result.data?.createService?.message ||
              'Failed to create service.'
          );
          return;
        }
      }

      setFormOpen(false);
      setEditingService(null);
      setForm(emptyForm);

      await loadServices();
    } catch (error) {
      console.error('Save service error:', error);
      alert('Something went wrong while saving the service.');
    }
  };

  // ==============================|| TOGGLE STATUS ||============================== //

  const handleToggleStatus = async (service: Service) => {
    try {
      const result = await updateService({
        variables: {
          input: {
            salonId: service.salonId,
            serviceId: service.serviceId,
            active: !service.active
          }
        }
      });

      if (!result.data?.updateService?.success) {
        alert(
          result.data?.updateService?.message ||
            'Failed to update service status.'
        );
        return;
      }

      setServices((previous) =>
        previous.map((item) =>
          item.serviceId === service.serviceId
            ? {
                ...item,
                active: !item.active,
                updatedAt:
                  result.data.updateService.service?.updatedAt ||
                  item.updatedAt
              }
            : item
        )
      );
    } catch (error) {
      console.error('Toggle service error:', error);
      alert('Failed to update service status.');
    }
  };

  // ==============================|| DELETE ||============================== //

  const handleDelete = async (service: Service) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.name}"?`
    );

    if (!confirmed) return;

    try {
      const result = await deleteService({
        variables: {
          input: {
            salonId: service.salonId,
            serviceId: service.serviceId
          }
        }
      });

      if (!result.data?.deleteService?.success) {
        alert(
          result.data?.deleteService?.message ||
            'Failed to delete service.'
        );
        return;
      }

      setServices((previous) =>
        previous.filter(
          (item) => item.serviceId !== service.serviceId
        )
      );
    } catch (error) {
      console.error('Delete service error:', error);
      alert('Failed to delete service.');
    }
  };

  // ==============================|| REFRESH ||============================== //

  const handleRefresh = async () => {
    try {
      await refetchSalons();
      await loadServices();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  // ==============================|| STAT CARD ||============================== //

  const StatCard = ({
    title,
    value,
    description
  }: {
    title: string;
    value: number;
    description: string;
  }) => (
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

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* HEADER */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{
          xs: 'flex-start',
          sm: 'center'
        }}
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
            Manage and monitor services offered across all salons.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh services">
            <IconButton
              onClick={handleRefresh}
              disabled={loadingSalons || loadingServices}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5
              }}
            >
              <ReloadOutlined />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            sx={{
              borderRadius: 1.5,
              px: 2.5,
              textTransform: 'none'
            }}
            onClick={handleOpenAdd}
          >
            Add Service
          </Button>
        </Stack>
      </Stack>

      {/* ERROR */}

      {salonError && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'error.main'
          }}
        >
          <Typography color="error">
            Failed to load salons: {salonError.message}
          </Typography>
        </Paper>
      )}

      {/* STATISTICS */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Services"
            value={totalServices}
            description="Services registered"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Services"
            value={activeServices}
            description="Currently available"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive Services"
            value={inactiveServices}
            description="Currently unavailable"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Popular Services"
            value={popularServices}
            description="Marked as popular"
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

          <Grid item xs={12} sm={6} md={2.2}>
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
                <MenuItem value="ALL">
                  All Salons
                </MenuItem>

                {salons
                  .filter((salon) => !salon.isDeleted)
                  .sort((a, b) =>
                    a.salonName.localeCompare(b.salonName)
                  )
                  .map((salon) => (
                    <MenuItem
                      key={salon.salonId}
                      value={salon.salonId}
                    >
                      {salon.salonName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {/* CATEGORY */}

          <Grid item xs={12} sm={6} md={2.2}>
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
                <MenuItem value="ALL">
                  All Categories
                </MenuItem>

                {categories.map((category) => (
                  <MenuItem
                    key={category}
                    value={category}
                  >
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* GENDER */}

          <Grid item xs={12} sm={6} md={1.8}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>

              <Select
                value={genderFilter}
                label="Gender"
                onChange={(event) => {
                  setGenderFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="MEN">Men</MenuItem>
                <MenuItem value="WOMEN">Women</MenuItem>
                <MenuItem value="UNISEX">Unisex</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* STATUS */}

          <Grid item xs={12} sm={6} md={1.8}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>

              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) => {
                  setStatusFilter(event.target.value);
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

          <Grid item xs={12} md={1}>
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

      {/* TABLE */}

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
                <TableCell>Category</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Popular</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(loadingSalons || loadingServices) && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <Typography
                      variant="body1"
                      color="text.secondary"
                    >
                      Loading services...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loadingSalons &&
                !loadingServices &&
                filteredServices
                  .slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                  .map((service) => (
                    <TableRow
                      key={service.serviceId}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': {
                          border: 0
                        }
                      }}
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
                              width: 40,
                              height: 40,
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                              fontWeight: 700
                            }}
                          >
                            {service.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </Avatar>

                          <Box>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                              >
                                {service.name}
                              </Typography>

                              {service.popular && (
                                <StarFilled
                                  style={{
                                    color: '#faad14',
                                    fontSize: 13
                                  }}
                                />
                              )}
                            </Stack>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {service.serviceId}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* SALON */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                        >
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
                        <Chip
                          label={service.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      {/* GENDER */}

                      <TableCell>
                        <Chip
                          label={service.gender}
                          size="small"
                          color={getGenderColor(
                            service.gender
                          )}
                          variant="outlined"
                        />
                      </TableCell>

                      {/* DURATION */}

                      <TableCell>
                        {service.duration} min
                      </TableCell>

                      {/* PRICE */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {formatCurrency(service.price)}
                        </Typography>
                      </TableCell>

                      {/* POPULAR */}

                      <TableCell>
                        {service.popular ? (
                          <Chip
                            label="Popular"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            —
                          </Typography>
                        )}
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <Chip
                          label={
                            service.active
                              ? 'Active'
                              : 'Inactive'
                          }
                          size="small"
                          color={
                            service.active
                              ? 'success'
                              : 'default'
                          }
                          variant={
                            service.active
                              ? 'filled'
                              : 'outlined'
                          }
                          onClick={() =>
                            handleToggleStatus(service)
                          }
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>

                      {/* ACTIONS */}

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          spacing={0.5}
                        >
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleView(service)
                              }
                            >
                              <EyeOutlined />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenEdit(service)
                              }
                            >
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              disabled={deleting}
                              onClick={() =>
                                handleDelete(service)
                              }
                            >
                              <DeleteOutlined />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

              {!loadingSalons &&
                !loadingServices &&
                filteredServices.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{ py: 8 }}
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                      >
                        No services found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Try changing your search or filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredServices.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={(_, newPage) =>
            setPage(newPage)
          }
          onRowsPerPageChange={(event) => {
            setRowsPerPage(
              parseInt(event.target.value, 10)
            );
            setPage(0);
          }}
        />
      </Paper>

      {/* ============================== */}
      {/* VIEW SERVICE DIALOG */}
      {/* ============================== */}

      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        {selectedService && (
          <>
            <DialogTitle>
              Service Details
            </DialogTitle>

            <DialogContent dividers>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    fontSize: 24,
                    fontWeight: 700
                  }}
                >
                  {selectedService.name
                    ?.charAt(0)
                    .toUpperCase()}
                </Avatar>

                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Typography
                      variant="h5"
                      fontWeight={600}
                    >
                      {selectedService.name}
                    </Typography>

                    {selectedService.popular && (
                      <StarFilled
                        style={{
                          color: '#faad14'
                        }}
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {selectedService.serviceId}
                  </Typography>

                  <Chip
                    label={
                      selectedService.active
                        ? 'Active'
                        : 'Inactive'
                    }
                    size="small"
                    color={
                      selectedService.active
                        ? 'success'
                        : 'default'
                    }
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Stack>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Salon
                  </Typography>

                  <Typography variant="body1">
                    {selectedService.salonName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Category
                  </Typography>

                  <Typography variant="body1">
                    {selectedService.category}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Gender
                  </Typography>

                  <Typography variant="body1">
                    {selectedService.gender}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Duration
                  </Typography>

                  <Typography variant="body1">
                    {selectedService.duration} minutes
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Price
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    {formatCurrency(
                      selectedService.price
                    )}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Popular
                  </Typography>

                  <Typography variant="body1">
                    {selectedService.popular
                      ? 'Yes'
                      : 'No'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Description
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{ mt: 0.5 }}
                  >
                    {selectedService.description ||
                      'No description available.'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Created
                  </Typography>

                  <Typography variant="body2">
                    {selectedService.createdAt}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Last Updated
                  </Typography>

                  <Typography variant="body2">
                    {selectedService.updatedAt}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => {
                  setViewOpen(false);
                  handleOpenEdit(selectedService);
                }}
              >
                Edit
              </Button>

              <Button
                variant="contained"
                onClick={() =>
                  setViewOpen(false)
                }
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ============================== */}
      {/* ADD / EDIT SERVICE DIALOG */}
      {/* ============================== */}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingService
            ? 'Edit Service'
            : 'Add Service'}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2.5}>
            {/* SALON */}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Salon</InputLabel>

                <Select
                  value={form.salonId}
                  label="Salon"
                  disabled={Boolean(editingService)}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      salonId: event.target.value
                    }))
                  }
                >
                  {salons
                    .filter(
                      (salon) => !salon.isDeleted
                    )
                    .sort((a, b) =>
                      a.salonName.localeCompare(
                        b.salonName
                      )
                    )
                    .map((salon) => (
                      <MenuItem
                        key={salon.salonId}
                        value={salon.salonId}
                      >
                        {salon.salonName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            {/* NAME */}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Name"
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value
                  }))
                }
              />
            </Grid>

            {/* CATEGORY */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                placeholder="Hair, Skin, Grooming..."
                value={form.category}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    category: event.target.value
                  }))
                }
              />
            </Grid>

            {/* GENDER */}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>

                <Select
                  value={form.gender}
                  label="Gender"
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      gender:
                        event.target.value as ServiceGender
                    }))
                  }
                >
                  <MenuItem value="MEN">
                    Men
                  </MenuItem>

                  <MenuItem value="WOMEN">
                    Women
                  </MenuItem>

                  <MenuItem value="UNISEX">
                    Unisex
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* DURATION */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Duration"
                value={form.duration}
                inputProps={{
                  min: 1
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      min
                    </InputAdornment>
                  )
                }}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    duration: event.target.value
                  }))
                }
              />
            </Grid>

            {/* PRICE */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                value={form.price}
                inputProps={{
                  min: 0
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      ₹
                    </InputAdornment>
                  )
                }}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    price: event.target.value
                  }))
                }
              />
            </Grid>

            {/* DESCRIPTION */}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description:
                      event.target.value
                  }))
                }
              />
            </Grid>

            {/* POPULAR */}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Popular</InputLabel>

                <Select
                  value={form.popular ? 'YES' : 'NO'}
                  label="Popular"
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      popular:
                        event.target.value === 'YES'
                    }))
                  }
                >
                  <MenuItem value="YES">
                    Yes
                  </MenuItem>

                  <MenuItem value="NO">
                    No
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* ACTIVE */}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>

                <Select
                  value={form.active ? 'ACTIVE' : 'INACTIVE'}
                  label="Status"
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      active:
                        event.target.value ===
                        'ACTIVE'
                    }))
                  }
                >
                  <MenuItem value="ACTIVE">
                    Active
                  </MenuItem>

                  <MenuItem value="INACTIVE">
                    Inactive
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setFormOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              creating ||
              updating ||
              !form.salonId ||
              !form.name.trim() ||
              !form.category.trim() ||
              !form.duration ||
              !form.price
            }
          >
            {creating || updating
              ? 'Saving...'
              : editingService
                ? 'Update Service'
                : 'Add Service'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

