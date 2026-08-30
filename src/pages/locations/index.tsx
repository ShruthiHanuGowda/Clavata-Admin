
import { useMemo, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
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
  EnvironmentOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| TYPES ||============================== //

interface LocationData {
  id: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  salons: number;
  customers: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

// ==============================|| MOCK DATA ||============================== //

const initialLocations: LocationData[] = [
  {
    id: 'LOC-001',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pincode: '560001',
    salons: 42,
    customers: 1250,
    status: 'ACTIVE',
    createdAt: '2026-01-10'
  },
  {
    id: 'LOC-002',
    city: 'Mysuru',
    state: 'Karnataka',
    country: 'India',
    pincode: '570001',
    salons: 18,
    customers: 540,
    status: 'ACTIVE',
    createdAt: '2026-01-15'
  },
  {
    id: 'LOC-003',
    city: 'Mangaluru',
    state: 'Karnataka',
    country: 'India',
    pincode: '575001',
    salons: 11,
    customers: 310,
    status: 'ACTIVE',
    createdAt: '2026-02-05'
  },
  {
    id: 'LOC-004',
    city: 'Hubballi',
    state: 'Karnataka',
    country: 'India',
    pincode: '580001',
    salons: 7,
    customers: 180,
    status: 'ACTIVE',
    createdAt: '2026-02-12'
  },
  {
    id: 'LOC-005',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '600001',
    salons: 24,
    customers: 720,
    status: 'ACTIVE',
    createdAt: '2026-03-01'
  },
  {
    id: 'LOC-006',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    pincode: '500001',
    salons: 21,
    customers: 610,
    status: 'ACTIVE',
    createdAt: '2026-03-08'
  },
  {
    id: 'LOC-007',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    salons: 16,
    customers: 490,
    status: 'INACTIVE',
    createdAt: '2026-03-18'
  }
];

// ==============================|| INITIAL FORM ||============================== //

const emptyForm = {
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
};

// ==============================|| LOCATION PAGE ||============================== //

export default function Locations() {
  const [locations, setLocations] = useState<LocationData[]>(initialLocations);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);

  const [form, setForm] = useState(emptyForm);

  // ==============================|| FILTER ||============================== //

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        location.city.toLowerCase().includes(searchText) ||
        location.state.toLowerCase().includes(searchText) ||
        location.country.toLowerCase().includes(searchText) ||
        location.pincode.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === 'ALL' || location.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [locations, search, statusFilter]);

  // ==============================|| STATISTICS ||============================== //

  const totalLocations = locations.length;

  const activeLocations = locations.filter(
    (location) => location.status === 'ACTIVE'
  ).length;

  const totalSalons = locations.reduce(
    (sum, location) => sum + location.salons,
    0
  );

  const totalCustomers = locations.reduce(
    (sum, location) => sum + location.customers,
    0
  );

  // ==============================|| OPEN ADD ||============================== //

  const handleAddLocation = () => {
    setEditingLocation(null);
    setForm(emptyForm);
    setOpenDialog(true);
  };

  // ==============================|| OPEN EDIT ||============================== //

  const handleEditLocation = (location: LocationData) => {
    setEditingLocation(location);

    setForm({
      city: location.city,
      state: location.state,
      country: location.country,
      pincode: location.pincode,
      status: location.status
    });

    setOpenDialog(true);
  };

  // ==============================|| DELETE ||============================== //

  const handleDeleteLocation = (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this location?'
    );

    if (!confirmed) return;

    setLocations((previous) =>
      previous.filter((location) => location.id !== id)
    );
  };

  // ==============================|| SAVE ||============================== //

  const handleSaveLocation = () => {
    if (!form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      window.alert('Please enter city, state and pincode.');
      return;
    }

    if (editingLocation) {
      setLocations((previous) =>
        previous.map((location) =>
          location.id === editingLocation.id
            ? {
                ...location,
                city: form.city,
                state: form.state,
                country: form.country,
                pincode: form.pincode,
                status: form.status
              }
            : location
        )
      );
    } else {
      const newLocation: LocationData = {
        id: `LOC-${String(locations.length + 1).padStart(3, '0')}`,
        city: form.city,
        state: form.state,
        country: form.country,
        pincode: form.pincode,
        salons: 0,
        customers: 0,
        status: form.status,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setLocations((previous) => [...previous, newLocation]);
    }

    setOpenDialog(false);
    setEditingLocation(null);
    setForm(emptyForm);
  };

  // ==============================|| PAGINATION ||============================== //

  const paginatedLocations = filteredLocations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
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
          <Stack direction="row" spacing={1.5} alignItems="center">
            <EnvironmentOutlined
              style={{
                fontSize: 28
              }}
            />

            <Typography variant="h4">
              Locations
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage cities and geographic areas supported by Clavata.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={handleAddLocation}
        >
          Add Location
        </Button>
      </Stack>

      {/* STATISTICS */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Typography color="text.secondary" variant="body2">
              Total Locations
            </Typography>

            <Typography variant="h3" sx={{ mt: 1 }}>
              {totalLocations}
            </Typography>
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Typography color="text.secondary" variant="body2">
              Active Locations
            </Typography>

            <Typography variant="h3" sx={{ mt: 1 }}>
              {activeLocations}
            </Typography>
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Typography color="text.secondary" variant="body2">
              Total Salons
            </Typography>

            <Typography variant="h3" sx={{ mt: 1 }}>
              {totalSalons}
            </Typography>
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Typography color="text.secondary" variant="body2">
              Total Customers
            </Typography>

            <Typography variant="h3" sx={{ mt: 1 }}>
              {totalCustomers.toLocaleString()}
            </Typography>
          </MainCard>
        </Grid>
      </Grid>

      {/* TABLE CARD */}
      <MainCard content={false}>
        {/* FILTER BAR */}
        <Box sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                placeholder="Search by city, state or pincode..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE'
                  );
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* TABLE */}
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Pincode</TableCell>
                <TableCell align="center">Salons</TableCell>
                <TableCell align="center">Customers</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedLocations.length > 0 ? (
                paginatedLocations.map((location) => (
                  <TableRow
                    hover
                    key={location.id}
                  >
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'primary.lighter'
                          }}
                        >
                          <EnvironmentOutlined
                            style={{
                              fontSize: 20
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="subtitle1">
                            {location.city}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {location.country}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {location.state}
                    </TableCell>

                    <TableCell>
                      {location.pincode}
                    </TableCell>

                    <TableCell align="center">
                      <Typography fontWeight={600}>
                        {location.salons}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography fontWeight={600}>
                        {location.customers.toLocaleString()}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={location.status}
                        size="small"
                        color={
                          location.status === 'ACTIVE'
                            ? 'success'
                            : 'default'
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {location.createdAt}
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              handleEditLocation(location)
                            }
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleDeleteLocation(location.id)
                            }
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <Typography
                      variant="h6"
                      color="text.secondary"
                    >
                      No locations found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Try changing your search or filter.
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
          count={filteredLocations.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </MainCard>

      {/* ADD / EDIT DIALOG */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingLocation
            ? 'Edit Location'
            : 'Add Location'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="City"
              value={form.city}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  city: event.target.value
                }))
              }
              placeholder="e.g. Bengaluru"
            />

            <TextField
              fullWidth
              label="State"
              value={form.state}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  state: event.target.value
                }))
              }
              placeholder="e.g. Karnataka"
            />

            <TextField
              fullWidth
              label="Country"
              value={form.country}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  country: event.target.value
                }))
              }
            />

            <TextField
              fullWidth
              label="Pincode"
              value={form.pincode}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  pincode: event.target.value
                }))
              }
              inputProps={{
                maxLength: 6
              }}
              placeholder="e.g. 560001"
            />

            <Select
              fullWidth
              value={form.status}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  status: event.target.value as
                    | 'ACTIVE'
                    | 'INACTIVE'
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
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setOpenDialog(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveLocation}
          >
            {editingLocation ? 'Update' : 'Add Location'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

