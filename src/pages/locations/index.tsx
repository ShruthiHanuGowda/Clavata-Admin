import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';

// material-ui
import {
  Box,
  Button,
  Chip,
  CircularProgress,
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

// graphql
import { GET_LOCATIONS } from '../../graphql/queries';
import {
  CREATE_LOCATION,
  UPDATE_LOCATION,
  DELETE_LOCATION
} from '../../graphql/queries';

// ==============================|| TYPES ||============================== //

type LocationStatus = 'ACTIVE' | 'INACTIVE';

type StatusFilter = 'ALL' | LocationStatus;

interface LocationData {
  locationId: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  salons: number;
  customers: number;
  status: LocationStatus;
  createdAt: string;
  updatedAt: string;
}

interface LocationForm {
  city: string;
  state: string;
  country: string;
  pincode: string;
  status: LocationStatus;
}

interface LocationsQueryData {
  locations: {
    success: boolean;
    message: string;
    totalCount: number;
    locations: LocationData[];
  };
}

interface LocationsQueryVariables {
  search?: string;
  status?: LocationStatus;
}

interface CreateLocationData {
  createLocation: {
    success: boolean;
    message: string;
    location: LocationData | null;
  };
}

interface CreateLocationVariables {
  input: {
    city: string;
    state: string;
    country: string;
    pincode: string;
    status: LocationStatus;
  };
}

interface UpdateLocationData {
  updateLocation: {
    success: boolean;
    message: string;
    location: LocationData | null;
  };
}

interface UpdateLocationVariables {
  input: {
    locationId: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    status: LocationStatus;
  };
}

interface DeleteLocationData {
  deleteLocation: {
    success: boolean;
    message: string;
    location: LocationData | null;
  };
}

interface DeleteLocationVariables {
  locationId: string;
}

// ==============================|| INITIAL FORM ||============================== //

const emptyForm: LocationForm = {
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  status: 'ACTIVE'
};

// ==============================|| LOCATION PAGE ||============================== //

export default function Locations() {
  // ==============================|| STATE ||============================== //

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);

  const [editingLocation, setEditingLocation] =
    useState<LocationData | null>(null);

  const [form, setForm] = useState<LocationForm>(emptyForm);

  const [formError, setFormError] = useState('');

  // ==============================|| QUERY ||============================== //

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<
    LocationsQueryData,
    LocationsQueryVariables
  >(GET_LOCATIONS, {
    variables: {
      search: search.trim() || undefined,
      status:
        statusFilter === 'ALL'
          ? undefined
          : statusFilter
    },
    fetchPolicy: 'network-only'
  });

  // ==============================|| MUTATIONS ||============================== //

  const [
    createLocation,
    {
      loading: creating
    }
  ] = useMutation<
    CreateLocationData,
    CreateLocationVariables
  >(CREATE_LOCATION);

  const [
    updateLocation,
    {
      loading: updating
    }
  ] = useMutation<
    UpdateLocationData,
    UpdateLocationVariables
  >(UPDATE_LOCATION);

  const [
    deleteLocation,
    {
      loading: deleting
    }
  ] = useMutation<
    DeleteLocationData,
    DeleteLocationVariables
  >(DELETE_LOCATION);

  // ==============================|| DATA ||============================== //

  const locations: LocationData[] =
    data?.locations?.locations || [];

  const totalCount =
    data?.locations?.totalCount || 0;

  // ==============================|| RESET PAGE ||============================== //

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

  // ==============================|| STATISTICS ||============================== //

  /*
   * IMPORTANT:
   *
   * Because the query is filtered by search/status,
   * statistics should not be calculated from the filtered
   * table if you want global totals.
   *
   * The backend currently returns the location list only.
   *
   * For now, these statistics represent the locations
   * returned by the current query.
   */

  const activeLocations = useMemo(() => {
    return locations.filter(
      (location) => location.status === 'ACTIVE'
    ).length;
  }, [locations]);

  const totalSalons = useMemo(() => {
    return locations.reduce(
      (sum, location) =>
        sum + Number(location.salons || 0),
      0
    );
  }, [locations]);

  const totalCustomers = useMemo(() => {
    return locations.reduce(
      (sum, location) =>
        sum + Number(location.customers || 0),
      0
    );
  }, [locations]);

  // ==============================|| OPEN ADD ||============================== //

  const handleAddLocation = () => {
    setEditingLocation(null);
    setForm({ ...emptyForm });
    setFormError('');
    setOpenDialog(true);
  };

  // ==============================|| OPEN EDIT ||============================== //

  const handleEditLocation = (
    location: LocationData
  ) => {
    setEditingLocation(location);

    setForm({
      city: location.city,
      state: location.state,
      country: location.country,
      pincode: location.pincode,
      status: location.status
    });

    setFormError('');
    setOpenDialog(true);
  };

  // ==============================|| CLOSE DIALOG ||============================== //

  const handleCloseDialog = () => {
    if (creating || updating) {
      return;
    }

    setOpenDialog(false);
    setEditingLocation(null);
    setForm({ ...emptyForm });
    setFormError('');
  };

  // ==============================|| DELETE ||============================== //

  const handleDeleteLocation = async (
    locationId: string
  ) => {
    const location = locations.find(
      (item) => item.locationId === locationId
    );

    if (!location) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${location.city}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteLocation({
        variables: {
          locationId
        }
      });

      const response =
        result.data?.deleteLocation;

      if (!response?.success) {
        window.alert(
          response?.message ||
            'Failed to delete location.'
        );

        return;
      }

      window.alert(
        response.message ||
          'Location deleted successfully.'
      );

      await refetch();
    } catch (mutationError) {
      console.error(
        'Delete location error:',
        mutationError
      );

      window.alert(
        mutationError instanceof Error
          ? mutationError.message
          : 'Failed to delete location.'
      );
    }
  };

  // ==============================|| VALIDATION ||============================== //

  const validateForm = (): boolean => {
    const city = form.city.trim();
    const state = form.state.trim();
    const country = form.country.trim();
    const pincode = form.pincode.trim();

    if (!city) {
      setFormError('Please enter city.');
      return false;
    }

    if (!state) {
      setFormError('Please enter state.');
      return false;
    }

    if (!country) {
      setFormError('Please enter country.');
      return false;
    }

    if (!pincode) {
      setFormError('Please enter pincode.');
      return false;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setFormError(
        'Pincode must contain exactly 6 digits.'
      );

      return false;
    }

    return true;
  };

  // ==============================|| SAVE ||============================== //

  const handleSaveLocation = async () => {
    setFormError('');

    if (!validateForm()) {
      return;
    }

    const input = {
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      pincode: form.pincode.trim(),
      status: form.status
    };

    try {
      // ==============================|| UPDATE ||============================== //

      if (editingLocation) {
        const result = await updateLocation({
          variables: {
            input: {
              locationId:
                editingLocation.locationId,
              ...input
            }
          }
        });

        const response =
          result.data?.updateLocation;

        if (!response?.success) {
          setFormError(
            response?.message ||
              'Failed to update location.'
          );

          return;
        }

        setOpenDialog(false);
        setEditingLocation(null);
        setForm({ ...emptyForm });

        window.alert(
          response.message ||
            'Location updated successfully.'
        );

        await refetch();

        return;
      }

      // ==============================|| CREATE ||============================== //

      const result = await createLocation({
        variables: {
          input
        }
      });

      const response =
        result.data?.createLocation;

      if (!response?.success) {
        setFormError(
          response?.message ||
            'Failed to create location.'
        );

        return;
      }

      setOpenDialog(false);
      setEditingLocation(null);
      setForm({ ...emptyForm });

      window.alert(
        response.message ||
          'Location created successfully.'
      );

      await refetch();
    } catch (mutationError) {
      console.error(
        'Save location error:',
        mutationError
      );

      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Something went wrong.'
      );
    }
  };

  // ==============================|| PAGINATION ||============================== //

  const paginatedLocations = useMemo(() => {
    const start =
      page * rowsPerPage;

    const end =
      start + rowsPerPage;

    return locations.slice(start, end);
  }, [locations, page, rowsPerPage]);

  // ==============================|| LOADING ||============================== //

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />

          <Typography
            color="text.secondary"
          >
            Loading locations...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ==============================|| ERROR ||============================== //

  if (error) {
    return (
      <Box>
        <MainCard>
          <Stack
            spacing={2}
            alignItems="center"
            sx={{ py: 5 }}
          >
            <Typography
              variant="h6"
              color="error"
            >
              Failed to load locations
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {error.message}
            </Typography>

            <Button
              variant="contained"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </Stack>
        </MainCard>
      </Box>
    );
  }

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* PAGE HEADER */}

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
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
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
            Manage cities and geographic areas
            supported by Clavata.
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

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <MainCard>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Total Locations
            </Typography>

            <Typography
              variant="h3"
              sx={{ mt: 1 }}
            >
              {totalCount}
            </Typography>
          </MainCard>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <MainCard>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Active Locations
            </Typography>

            <Typography
              variant="h3"
              sx={{ mt: 1 }}
            >
              {activeLocations}
            </Typography>
          </MainCard>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <MainCard>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Total Salons
            </Typography>

            <Typography
              variant="h3"
              sx={{ mt: 1 }}
            >
              {totalSalons}
            </Typography>
          </MainCard>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <MainCard>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Total Customers
            </Typography>

            <Typography
              variant="h3"
              sx={{ mt: 1 }}
            >
              {totalCustomers.toLocaleString()}
            </Typography>
          </MainCard>
        </Grid>
      </Grid>

      {/* TABLE CARD */}

      <MainCard content={false}>
        {/* FILTER BAR */}

        <Box sx={{ p: 2.5 }}>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              xs={12}
              md={8}
            >
              <TextField
                fullWidth
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );

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

            <Grid
              item
              xs={12}
              md={4}
            >
              <Select
                fullWidth
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as StatusFilter
                  );

                  setPage(0);
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
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* TABLE */}

        <TableContainer
          component={Paper}
          elevation={0}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Location
                </TableCell>

                <TableCell>
                  State
                </TableCell>

                <TableCell>
                  Pincode
                </TableCell>

                <TableCell align="center">
                  Salons
                </TableCell>

                <TableCell align="center">
                  Customers
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Created
                </TableCell>

                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedLocations.length > 0 ? (
                paginatedLocations.map(
                  (location) => (
                    <TableRow
                      hover
                      key={
                        location.locationId
                      }
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
                              justifyContent:
                                'center',
                              bgcolor:
                                'primary.lighter'
                            }}
                          >
                            <EnvironmentOutlined
                              style={{
                                fontSize: 20
                              }}
                            />
                          </Box>

                          <Box>
                            <Typography
                              variant="subtitle1"
                            >
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
                          {Number(
                            location.salons || 0
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography fontWeight={600}>
                          {Number(
                            location.customers ||
                              0
                          ).toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            location.status
                          }
                          size="small"
                          color={
                            location.status ===
                            'ACTIVE'
                              ? 'success'
                              : 'default'
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {location.createdAt
                          ? new Date(
                              location.createdAt
                            ).toLocaleDateString(
                              'en-IN'
                            )
                          : '-'}
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
                                handleEditLocation(
                                  location
                                )
                              }
                            >
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <span>
                              <IconButton
                                color="error"
                                disabled={
                                  deleting
                                }
                                onClick={() =>
                                  handleDeleteLocation(
                                    location.locationId
                                  )
                                }
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <EnvironmentOutlined
                      style={{
                        fontSize: 40,
                        opacity: 0.4
                      }}
                    />

                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      No locations found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Try changing your search
                      or filter.
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
          count={locations.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) =>
            setPage(newPage)
          }
          onRowsPerPageChange={(event) => {
            setRowsPerPage(
              parseInt(
                event.target.value,
                10
              )
            );

            setPage(0);
          }}
          rowsPerPageOptions={[
            5,
            10,
            25,
            50
          ]}
        />
      </MainCard>

      {/* ADD / EDIT DIALOG */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingLocation
            ? 'Edit Location'
            : 'Add Location'}
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2.5}
            sx={{ mt: 1 }}
          >
            <TextField
              fullWidth
              required
              label="City"
              value={form.city}
              onChange={(event) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    city: event.target.value
                  })
                )
              }
              placeholder="e.g. Bengaluru"
            />

            <TextField
              fullWidth
              required
              label="State"
              value={form.state}
              onChange={(event) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    state: event.target.value
                  })
                )
              }
              placeholder="e.g. Karnataka"
            />

            <TextField
              fullWidth
              required
              label="Country"
              value={form.country}
              onChange={(event) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    country: event.target.value
                  })
                )
              }
            />

            <TextField
              fullWidth
              required
              label="Pincode"
              value={form.pincode}
              onChange={(event) => {
                const value =
                  event.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6);

                setForm(
                  (previous) => ({
                    ...previous,
                    pincode: value
                  })
                );
              }}
              inputProps={{
                maxLength: 6,
                inputMode: 'numeric'
              }}
              placeholder="e.g. 560001"
            />

            <Select
              fullWidth
              value={form.status}
              onChange={(event) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    status:
                      event.target
                        .value as LocationStatus
                  })
                )
              }
            >
              <MenuItem value="ACTIVE">
                Active
              </MenuItem>

              <MenuItem value="INACTIVE">
                Inactive
              </MenuItem>
            </Select>

            {formError && (
              <Typography
                variant="body2"
                color="error"
              >
                {formError}
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >
          <Button
            onClick={handleCloseDialog}
            disabled={
              creating || updating
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveLocation}
            disabled={
              creating || updating
            }
            startIcon={
              creating || updating ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : undefined
            }
          >
            {creating
              ? 'Adding...'
              : updating
                ? 'Updating...'
                : editingLocation
                  ? 'Update'
                  : 'Add Location'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}