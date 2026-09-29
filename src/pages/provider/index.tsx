import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  CloseOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';

import { gql, useQuery } from '@apollo/client';


// ============================================================
// TYPES
// ============================================================

export type ProviderStatus =
  | 'NOT_REGISTERED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';


export interface Provider {

  userId: string;

  fullName: string;

  phoneNumber: string;

  email?: string | null;

  activeRole: 'PROVIDER';

  providerStatus: ProviderStatus;

  salonId?: string | null;

  createdAt: string;

  updatedAt: string;

}


interface AdminProvidersResponse {

  adminProviders: {

    success: boolean;

    message: string;

    providers: Provider[];

    totalCount: number;

  };

}


// ============================================================
// GRAPHQL
// ============================================================

export const ADMIN_PROVIDERS = gql`

  query AdminProviders(
    $search: String
    $providerStatus: ProviderStatus
  ) {

    adminProviders(
      search: $search
      providerStatus: $providerStatus
    ) {

      success

      message

      providers {

        userId

        fullName

        phoneNumber

        email

        activeRole

        providerStatus

        salonId

        createdAt

        updatedAt

      }

      totalCount

    }

  }

`;


// ============================================================
// CONSTANTS
// ============================================================

const ROWS_PER_PAGE_OPTIONS = [
  10,
  25,
  50,
  100,
];


// ============================================================
// HELPERS
// ============================================================

const formatDate = (
  value?: string | null
): string => {

  if (!value) {
    return '-';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '-';
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );

};


const formatDateTime = (
  value?: string | null
): string => {

  if (!value) {
    return '-';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '-';
  }

  return date.toLocaleString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

};


const getInitials = (
  name?: string
): string => {

  if (!name?.trim()) {
    return 'P';
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();

};


// ============================================================
// STATUS LABEL
// ============================================================

const getProviderStatusLabel = (
  status: ProviderStatus
): string => {

  switch (status) {

    case 'NOT_REGISTERED':
      return 'Not Registered';

    case 'PENDING':
      return 'Pending';

    case 'APPROVED':
      return 'Approved';

    case 'REJECTED':
      return 'Rejected';

    default:
      return status;

  }

};


// ============================================================
// STATUS CHIP
// ============================================================

const ProviderStatusChip = ({
  status,
}: {
  status: ProviderStatus;
}) => {

  switch (status) {

    case 'APPROVED':

      return (
        <Chip
          icon={
            <CheckCircleOutlined />
          }
          label="Approved"
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
          }}
        />
      );


    case 'PENDING':

      return (
        <Chip
          icon={
            <ClockCircleOutlined />
          }
          label="Pending"
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
          }}
        />
      );


    case 'REJECTED':

      return (
        <Chip
          icon={
            <StopOutlined />
          }
          label="Rejected"
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
          }}
        />
      );


    case 'NOT_REGISTERED':

      return (
        <Chip
          icon={
            <UserOutlined />
          }
          label="Not Registered"
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
          }}
        />
      );


    default:

      return (
        <Chip
          label={
            getProviderStatusLabel(
              status
            )
          }
          size="small"
          variant="outlined"
        />
      );

  }

};


// ============================================================
// PROVIDER DETAILS
// ============================================================

interface ProviderDetailsProps {
  provider: Provider;
  onClose: () => void;
}


const ProviderDetails = ({
  provider,
  onClose,
}: ProviderDetailsProps) => {

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >

      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >

        <Typography
          variant="h6"
          fontWeight={700}
        >
          Provider Details
        </Typography>

        <IconButton
          onClick={onClose}
          size="small"
        >
          <CloseOutlined />
        </IconButton>

      </DialogTitle>


      <DialogContent>

        <Stack
          spacing={3}
          sx={{
            pt: 1,
          }}
        >

          {/* Provider header */}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >

            <Avatar
              sx={{
                width: 64,
                height: 64,
              }}
            >
              {getInitials(
                provider.fullName
              )}
            </Avatar>


            <Box>

              <Typography
                variant="h6"
                fontWeight={700}
              >
                {provider.fullName || '-'}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {provider.userId}
              </Typography>

            </Box>

          </Box>


          <Divider />


          {/* Status */}

          <Box>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={0.5}
            >
              Provider Status
            </Typography>

            <ProviderStatusChip
              status={
                provider.providerStatus
              }
            />

          </Box>


          {/* Details */}

          <Grid
            container
            spacing={2}
          >

            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Full Name
              </Typography>

              <Typography
                variant="body1"
                fontWeight={600}
              >
                {provider.fullName || '-'}
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Phone Number
              </Typography>

              <Typography
                variant="body1"
                fontWeight={600}
              >
                {provider.phoneNumber || '-'}
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
            >

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Email
              </Typography>

              <Typography
                variant="body1"
                fontWeight={600}
              >
                {provider.email || '-'}
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
            >

              <Typography
                variant="caption"
                color="text.secondary"
              >
                User ID
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  wordBreak: 'break-all',
                }}
              >
                {provider.userId}
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Salon ID
              </Typography>

              <Typography
                variant="body1"
                fontWeight={600}
              >
                {provider.salonId || '-'}
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Active Role
              </Typography>

              <Typography
                variant="body1"
                fontWeight={600}
              >
                {provider.activeRole}
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Created
              </Typography>

              <Typography
                variant="body1"
              >
                {formatDateTime(
                  provider.createdAt
                )}
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Last Updated
              </Typography>

              <Typography
                variant="body1"
              >
                {formatDateTime(
                  provider.updatedAt
                )}
              </Typography>

            </Grid>

          </Grid>

        </Stack>

      </DialogContent>


      <DialogActions>

        <Button
          onClick={onClose}
        >
          Close
        </Button>

      </DialogActions>

    </Dialog>
  );

};


// ============================================================
// MAIN PAGE
// ============================================================

const Providers = () => {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    searchInput,
    setSearchInput,
  ] = useState('');

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    'ALL' | ProviderStatus
  >('ALL');

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    selectedProvider,
    setSelectedProvider,
  ] = useState<Provider | null>(
    null
  );


  // ==========================================================
  // DEBOUNCED SEARCH
  // ==========================================================

  useEffect(() => {

    const timer =
      window.setTimeout(
        () => {

          setSearch(
            searchInput.trim()
          );

          setPage(1);

        },
        400
      );


    return () => {

      window.clearTimeout(
        timer
      );

    };

  }, [searchInput]);


  // ==========================================================
  // QUERY
  // ==========================================================

  const {
    data,
    loading,
    error,
    refetch,
  } =
    useQuery<AdminProvidersResponse>(
      ADMIN_PROVIDERS,
      {
        variables: {

          search:
            search || undefined,

          providerStatus:
            statusFilter === 'ALL'
              ? undefined
              : statusFilter,

        },

        fetchPolicy:
          'network-only',

        notifyOnNetworkStatusChange:
          true,

      }
    );


  // ==========================================================
  // DATA
  // ==========================================================

  const providers =
    data?.adminProviders
      ?.providers || [];


  const totalCount =
    data?.adminProviders
      ?.totalCount ||
    0;


  // ==========================================================
  // STATISTICS
  //
  // These are based on the currently returned provider
  // dataset.
  //
  // Since the backend applies filters, when a status filter
  // is active the statistics represent that filtered result.
  // ==========================================================

  const statistics =
    useMemo(() => {

      const total =
        providers.length;

      const notRegistered =
        providers.filter(
          provider =>
            provider.providerStatus ===
            'NOT_REGISTERED'
        ).length;

      const pending =
        providers.filter(
          provider =>
            provider.providerStatus ===
            'PENDING'
        ).length;

      const approved =
        providers.filter(
          provider =>
            provider.providerStatus ===
            'APPROVED'
        ).length;

      const rejected =
        providers.filter(
          provider =>
            provider.providerStatus ===
            'REJECTED'
        ).length;


      return {
        total,
        notRegistered,
        pending,
        approved,
        rejected,
      };

    }, [providers]);


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const paginatedProviders =
    useMemo(() => {

      const start =
        (page - 1) *
        rowsPerPage;

      const end =
        start +
        rowsPerPage;

      return providers.slice(
        start,
        end
      );

    }, [
      providers,
      page,
      rowsPerPage,
    ]);


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        providers.length /
        rowsPerPage
      )
    );


  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleStatusChange = (
    event: SelectChangeEvent
  ) => {

    setStatusFilter(
      event.target.value as
        | 'ALL'
        | ProviderStatus
    );

    setPage(1);

  };


  const handleRowsPerPageChange = (
    event: SelectChangeEvent
  ) => {

    setRowsPerPage(
      Number(
        event.target.value
      )
    );

    setPage(1);

  };


  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {

    setPage(value);

  };


  const handleClearSearch = () => {

    setSearchInput('');

    setSearch('');

    setPage(1);

  };


  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    !data
  ) {

    return (

      <Box
        sx={{
          p: 3,
        }}
      >

        <Alert
          severity="error"
          action={

            <Button
              color="inherit"
              size="small"
              startIcon={
                <ReloadOutlined />
              }
              onClick={() =>
                refetch()
              }
            >
              Retry
            </Button>

          }
        >
          {error.message ||
            'Failed to load providers'}
        </Alert>

      </Box>

    );

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <Box
      sx={{
        p: {
          xs: 2,
          sm: 3,
        },
      }}
    >

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          justifyContent:
            'space-between',
          gap: 2,
          mb: 3,
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
        }}
      >

        <Box>

          <Typography
            variant="h4"
            fontWeight={700}
          >
            Providers
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage users who have selected
            the provider role and track their
            salon registration status.
          </Typography>

        </Box>


        <Button
          variant="outlined"
          startIcon={
            <ReloadOutlined />
          }
          onClick={() =>
            refetch()
          }
          disabled={loading}
        >
          Refresh
        </Button>

      </Box>


      {/* ================================================== */}
      {/* STATISTICS */}
      {/* ================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >

        {/* Total */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >

          <Card>

            <CardContent>

              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                Total Providers
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {statusFilter === 'ALL'
                  ? totalCount
                  : statistics.total}
              </Typography>

            </CardContent>

          </Card>

        </Grid>


        {/* Not Registered */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >

          <Card>

            <CardContent>

              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                Not Registered
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {statistics.notRegistered}
              </Typography>

            </CardContent>

          </Card>

        </Grid>


        {/* Pending */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >

          <Card>

            <CardContent>

              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                Pending
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {statistics.pending}
              </Typography>

            </CardContent>

          </Card>

        </Grid>


        {/* Approved */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >

          <Card>

            <CardContent>

              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                Approved
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {statistics.approved}
              </Typography>

            </CardContent>

          </Card>

        </Grid>

      </Grid>


      {/* ================================================== */}
      {/* SEARCH + FILTER */}
      {/* ================================================== */}

      <Card
        sx={{
          mb: 3,
        }}
      >

        <CardContent>

          <Grid
            container
            spacing={2}
            alignItems="center"
          >

            {/* Search */}

            <Grid
              item
              xs={12}
              md={7}
            >

              <TextField
                fullWidth
                value={searchInput}
                onChange={event =>
                  setSearchInput(
                    event.target.value
                  )
                }
                placeholder="Search by name, phone, email, user ID or salon ID"
                InputProps={{
                  startAdornment: (

                    <InputAdornment
                      position="start"
                    >
                      <SearchOutlined />
                    </InputAdornment>

                  ),
                  endAdornment:
                    searchInput ? (

                      <InputAdornment
                        position="end"
                      >

                        <IconButton
                          size="small"
                          onClick={
                            handleClearSearch
                          }
                        >
                          <CloseOutlined />
                        </IconButton>

                      </InputAdornment>

                    ) : null,
                }}
              />

            </Grid>


            {/* Status */}

            <Grid
              item
              xs={12}
              md={5}
            >

              <FormControl
                fullWidth
              >

                <InputLabel>
                  Provider Status
                </InputLabel>

                <Select
                  value={
                    statusFilter
                  }
                  label="Provider Status"
                  onChange={
                    handleStatusChange
                  }
                >

                  <MenuItem value="ALL">
                    All
                  </MenuItem>

                  <MenuItem value="NOT_REGISTERED">
                    Not Registered
                  </MenuItem>

                  <MenuItem value="PENDING">
                    Pending
                  </MenuItem>

                  <MenuItem value="APPROVED">
                    Approved
                  </MenuItem>

                  <MenuItem value="REJECTED">
                    Rejected
                  </MenuItem>

                </Select>

              </FormControl>

            </Grid>

          </Grid>

        </CardContent>

      </Card>


      {/* ================================================== */}
      {/* ERROR WITH DATA */}
      {/* ================================================== */}

      {error && data && (

        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
          action={

            <Button
              color="inherit"
              size="small"
              onClick={() =>
                refetch()
              }
            >
              Retry
            </Button>

          }
        >
          {error.message}
        </Alert>

      )}


      {/* ================================================== */}
      {/* TABLE */}
      {/* ================================================== */}

      <Card>

        <TableContainer>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell>
                  Provider
                </TableCell>

                <TableCell>
                  Phone
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Salon ID
                </TableCell>

                <TableCell>
                  Created
                </TableCell>

                <TableCell
                  align="center"
                >
                  Action
                </TableCell>

              </TableRow>

            </TableHead>


            <TableBody>

              {loading && !data ? (

                <TableRow>

                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >

                    <CircularProgress />

                  </TableCell>

                </TableRow>

              ) : paginatedProviders.length === 0 ? (

                <TableRow>

                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >

                    <Typography
                      color="text.secondary"
                    >
                      No providers found.
                    </Typography>

                  </TableCell>

                </TableRow>

              ) : (

                paginatedProviders.map(
                  provider => (

                    <TableRow
                      key={
                        provider.userId
                      }
                      hover
                    >

                      {/* Provider */}

                      <TableCell>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >

                          <Avatar>
                            {getInitials(
                              provider.fullName
                            )}
                          </Avatar>


                          <Box
                            sx={{
                              minWidth: 0,
                            }}
                          >

                            <Typography
                              variant="body2"
                              fontWeight={600}
                              noWrap
                            >
                              {provider.fullName ||
                                '-'}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display:
                                  'block',
                                maxWidth: 220,
                                overflow:
                                  'hidden',
                                textOverflow:
                                  'ellipsis',
                              }}
                            >
                              {provider.userId}
                            </Typography>

                          </Box>

                        </Box>

                      </TableCell>


                      {/* Phone */}

                      <TableCell>

                        <Typography
                          variant="body2"
                        >
                          {provider.phoneNumber ||
                            '-'}
                        </Typography>

                      </TableCell>


                      {/* Status */}

                      <TableCell>

                        <ProviderStatusChip
                          status={
                            provider.providerStatus
                          }
                        />

                      </TableCell>


                      {/* Salon ID */}

                      <TableCell>

                        {provider.salonId ? (

                          <Tooltip
                            title={
                              provider.salonId
                            }
                          >

                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 180,
                                overflow:
                                  'hidden',
                                textOverflow:
                                  'ellipsis',
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {provider.salonId}
                            </Typography>

                          </Tooltip>

                        ) : (

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Not registered
                          </Typography>

                        )}

                      </TableCell>


                      {/* Created */}

                      <TableCell>

                        <Typography
                          variant="body2"
                        >
                          {formatDate(
                            provider.createdAt
                          )}
                        </Typography>

                      </TableCell>


                      {/* Action */}

                      <TableCell
                        align="center"
                      >

                        <Tooltip
                          title="View provider"
                        >

                          <IconButton
                            onClick={() =>
                              setSelectedProvider(
                                provider
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

              )}

            </TableBody>

          </Table>

        </TableContainer>


        {/* ================================================= */}
        {/* TABLE FOOTER */}
        {/* ================================================= */}

        <Divider />


        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >

          {/* Rows per page */}

          <FormControl
            size="small"
            sx={{
              minWidth: 130,
            }}
          >

            <InputLabel>
              Rows
            </InputLabel>

            <Select
              value={
                String(rowsPerPage)
              }
              label="Rows"
              onChange={
                handleRowsPerPageChange
              }
            >

              {ROWS_PER_PAGE_OPTIONS.map(
                option => (

                  <MenuItem
                    key={option}
                    value={option}
                  >
                    {option} rows
                  </MenuItem>

                )
              )}

            </Select>

          </FormControl>


          {/* Pagination */}

          {totalPages > 1 && (

            <Pagination
              count={totalPages}
              page={page}
              onChange={
                handlePageChange
              }
              color="primary"
              showFirstButton
              showLastButton
            />

          )}

        </Box>

      </Card>


      {/* ================================================== */}
      {/* PROVIDER DETAILS */}
      {/* ================================================== */}

      {selectedProvider && (

        <ProviderDetails
          provider={
            selectedProvider
          }
          onClose={() =>
            setSelectedProvider(
              null
            )
          }
        />

      )}

    </Box>

  );

};


export default Providers;