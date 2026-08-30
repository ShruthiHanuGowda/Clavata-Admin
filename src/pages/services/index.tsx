
import { useMemo, useState } from 'react';

// material-ui
import {
  Avatar,
  Box,
  Button,
  Chip,
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
}

// ==============================|| STATIC DATA ||============================== //

const initialServices: Service[] = [
  {
    serviceId: 'SRV001',
    salonId: 'SAL001',
    salonName: 'Clavata Luxury Salon',
    name: 'Haircut',
    category: 'Hair',
    description: 'Professional haircut and styling',
    duration: 45,
    price: 500,
    gender: 'UNISEX',
    popular: true,
    active: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-20'
  },
  {
    serviceId: 'SRV002',
    salonId: 'SAL001',
    salonName: 'Clavata Luxury Salon',
    name: 'Hair Spa',
    category: 'Hair',
    description: 'Deep conditioning and relaxing hair spa',
    duration: 60,
    price: 1200,
    gender: 'WOMEN',
    popular: true,
    active: true,
    createdAt: '2026-08-02',
    updatedAt: '2026-08-20'
  },
  {
    serviceId: 'SRV003',
    salonId: 'SAL002',
    salonName: 'Glow Beauty Studio',
    name: 'Facial',
    category: 'Skin',
    description: 'Deep cleansing facial treatment',
    duration: 60,
    price: 900,
    gender: 'WOMEN',
    popular: true,
    active: true,
    createdAt: '2026-08-03',
    updatedAt: '2026-08-18'
  },
  {
    serviceId: 'SRV004',
    salonId: 'SAL002',
    salonName: 'Glow Beauty Studio',
    name: 'Beard Styling',
    category: 'Grooming',
    description: 'Professional beard trimming and styling',
    duration: 30,
    price: 350,
    gender: 'MEN',
    popular: false,
    active: true,
    createdAt: '2026-08-04',
    updatedAt: '2026-08-18'
  },
  {
    serviceId: 'SRV005',
    salonId: 'SAL003',
    salonName: 'Urban Cuts',
    name: 'Hair Coloring',
    category: 'Hair',
    description: 'Premium professional hair coloring',
    duration: 120,
    price: 2500,
    gender: 'UNISEX',
    popular: true,
    active: true,
    createdAt: '2026-08-05',
    updatedAt: '2026-08-15'
  },
  {
    serviceId: 'SRV006',
    salonId: 'SAL003',
    salonName: 'Urban Cuts',
    name: 'Manicure',
    category: 'Nails',
    description: 'Complete manicure treatment',
    duration: 45,
    price: 600,
    gender: 'WOMEN',
    popular: false,
    active: true,
    createdAt: '2026-08-06',
    updatedAt: '2026-08-15'
  },
  {
    serviceId: 'SRV007',
    salonId: 'SAL004',
    salonName: 'The Groom Room',
    name: 'Classic Shave',
    category: 'Grooming',
    description: 'Traditional professional shave',
    duration: 30,
    price: 300,
    gender: 'MEN',
    popular: false,
    active: false,
    createdAt: '2026-08-07',
    updatedAt: '2026-08-12'
  },
  {
    serviceId: 'SRV008',
    salonId: 'SAL004',
    salonName: 'The Groom Room',
    name: 'Head Massage',
    category: 'Wellness',
    description: 'Relaxing head and scalp massage',
    duration: 30,
    price: 450,
    gender: 'UNISEX',
    popular: true,
    active: true,
    createdAt: '2026-08-08',
    updatedAt: '2026-08-12'
  }
];

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

const getGenderColor = (gender: ServiceGender) => {
  switch (gender) {
    case 'MEN':
      return 'info';
    case 'WOMEN':
      return 'secondary';
    default:
      return 'default';
  }
};

// ==============================|| SERVICE PAGE ||============================== //

export default function Services() {
  const [services, setServices] = useState<Service[]>(initialServices);

  const [search, setSearch] = useState('');
  const [salonFilter, setSalonFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ==============================|| FILTER OPTIONS ||============================== //

  const salons = useMemo(
    () => Array.from(new Set(services.map((service) => service.salonName))),
    [services]
  );

  const categories = useMemo(
    () => Array.from(new Set(services.map((service) => service.category))),
    [services]
  );

  // ==============================|| FILTER DATA ||============================== //

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.salonName.toLowerCase().includes(query) ||
        service.serviceId.toLowerCase().includes(query);

      const matchesSalon =
        salonFilter === 'ALL' || service.salonName === salonFilter;

      const matchesCategory =
        categoryFilter === 'ALL' || service.category === categoryFilter;

      const matchesGender =
        genderFilter === 'ALL' || service.gender === genderFilter;

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

  const activeServices = services.filter((service) => service.active).length;

  const inactiveServices = services.filter((service) => !service.active).length;

  const popularServices = services.filter((service) => service.popular).length;

  // ==============================|| ACTIONS ||============================== //

  const handleReset = () => {
    setSearch('');
    setSalonFilter('ALL');
    setCategoryFilter('ALL');
    setGenderFilter('ALL');
    setStatusFilter('ALL');
    setPage(0);
  };

  const handleToggleStatus = (serviceId: string) => {
    setServices((previous) =>
      previous.map((service) =>
        service.serviceId === serviceId
          ? {
              ...service,
              active: !service.active,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : service
      )
    );
  };

  const handleDelete = (serviceId: string) => {
    const service = services.find((item) => item.serviceId === serviceId);

    if (!service) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.name}"?`
    );

    if (!confirmed) return;

    setServices((previous) =>
      previous.filter((item) => item.serviceId !== serviceId)
    );
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
        sx={{ display: 'block', mt: 0.5 }}
      >
        {description}
      </Typography>
    </Paper>
  );

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* PAGE HEADER */}

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
            Manage and monitor services offered across all salons.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          sx={{
            borderRadius: 1.5,
            px: 2.5,
            textTransform: 'none'
          }}
          onClick={() => {
            alert('Create Service form will be connected later.');
          }}
        >
          Add Service
        </Button>
      </Stack>

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
              placeholder="Search services..."
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
                <MenuItem value="ALL">All Salons</MenuItem>

                {salons.map((salon) => (
                  <MenuItem key={salon} value={salon}>
                    {salon}
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
                <MenuItem value="ALL">All Categories</MenuItem>

                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredServices
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
                          {service.name.charAt(0).toUpperCase()}
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
                        color={getGenderColor(service.gender)}
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
                        label={service.active ? 'Active' : 'Inactive'}
                        size="small"
                        color={service.active ? 'success' : 'default'}
                        onClick={() =>
                          handleToggleStatus(service.serviceId)
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
                              alert(
                                `View service: ${service.name}`
                              )
                            }
                          >
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() =>
                              alert(
                                `Edit service: ${service.name}`
                              )
                            }
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDelete(service.serviceId)
                            }
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

              {/* EMPTY STATE */}

              {filteredServices.length === 0 && (
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

        {/* PAGINATION */}

        <TablePagination
          component="div"
          count={filteredServices.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
}

