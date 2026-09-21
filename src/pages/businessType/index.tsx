import {
  useEffect,
  useMemo,
  useState
} from 'react';

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
  Typography
} from '@mui/material';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  TagsOutlined
} from '@ant-design/icons';

import {
  useMutation,
  useQuery
} from '@apollo/client';

import {
  GET_BUSINESS_TYPES,
  CREATE_BUSINESS_TYPE,
  UPDATE_BUSINESS_TYPE,
  DELETE_BUSINESS_TYPE
} from '../../graphql/queries';

// ======================================================
// TYPES
// ======================================================

type BusinessTypeStatus =
  | 'ACTIVE'
  | 'INACTIVE';

type StatusFilter =
  | 'ALL'
  | BusinessTypeStatus;

interface BusinessType {
  businessTypeId: string;
  name: string;
  description: string | null;
  status: BusinessTypeStatus;
  createdAt: string;
  updatedAt: string;
}

interface BusinessTypeForm {
  name: string;
  description: string;
  status: BusinessTypeStatus;
}

// ======================================================
// GRAPHQL RESPONSE TYPES
// ======================================================

interface GetBusinessTypesData {
  businessTypes: {
    success: boolean;
    message: string;
    totalCount: number;
    businessTypes: BusinessType[];
  };
}

interface CreateBusinessTypeData {
  createBusinessType: {
    success: boolean;
    message: string;
    businessType: BusinessType | null;
  };
}

interface UpdateBusinessTypeData {
  updateBusinessType: {
    success: boolean;
    message: string;
    businessType: BusinessType | null;
  };
}

interface DeleteBusinessTypeData {
  deleteBusinessType: {
    success: boolean;
    message: string;
    businessType: BusinessType | null;
  };
}

// ======================================================
// DEFAULT FORM
// ======================================================

const EMPTY_BUSINESS_TYPE_FORM: BusinessTypeForm = {
  name: '',
  description: '',
  status: 'ACTIVE'
};

// ======================================================
// COMPONENT
// ======================================================

export default function BusinessTypes() {

  // ====================================================
  // SEARCH / FILTER
  // ====================================================

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  // ====================================================
  // PAGINATION
  // ====================================================

  const [page, setPage] =
    useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  // ====================================================
  // CREATE / EDIT DIALOG
  // ====================================================

  const [openBusinessTypeDialog, setOpenBusinessTypeDialog] =
    useState(false);

  const [editingBusinessType, setEditingBusinessType] =
    useState<BusinessType | null>(null);

  const [businessTypeForm, setBusinessTypeForm] =
    useState<BusinessTypeForm>(
      EMPTY_BUSINESS_TYPE_FORM
    );

  // ====================================================
  // DELETE DIALOG
  // ====================================================

  const [deleteDialog, setDeleteDialog] =
    useState(false);

  const [businessTypeToDelete, setBusinessTypeToDelete] =
    useState<BusinessType | null>(null);

  // ====================================================
  // ERROR
  // ====================================================

  const [errorMessage, setErrorMessage] =
    useState('');

  // ====================================================
  // FETCH BUSINESS TYPES
  // ====================================================

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<GetBusinessTypesData>(
    GET_BUSINESS_TYPES,
    {
      variables: {
        search:
          search.trim()
            ? search.trim()
            : undefined,

        status:
          statusFilter === 'ALL'
            ? undefined
            : statusFilter
      },

      fetchPolicy:
        'network-only',

      notifyOnNetworkStatusChange:
        true
    }
  );

  // ====================================================
  // CREATE
  // ====================================================

  const [
    createBusinessType,
    {
      loading: creating
    }
  ] = useMutation<CreateBusinessTypeData>(
    CREATE_BUSINESS_TYPE
  );

  // ====================================================
  // UPDATE
  // ====================================================

  const [
    updateBusinessType,
    {
      loading: updating
    }
  ] = useMutation<UpdateBusinessTypeData>(
    UPDATE_BUSINESS_TYPE
  );

  // ====================================================
  // DELETE
  // ====================================================

  const [
    deleteBusinessType,
    {
      loading: deleting
    }
  ] = useMutation<DeleteBusinessTypeData>(
    DELETE_BUSINESS_TYPE
  );

  // ====================================================
  // SERVER DATA
  // ====================================================

  const businessTypes: BusinessType[] =
    data?.businessTypes?.businessTypes ??
    [];

  const totalBusinessTypes =
    data?.businessTypes?.totalCount ??
    0;

  // ====================================================
  // COUNTERS
  // ====================================================

  const activeBusinessTypes =
    useMemo(
      () =>
        businessTypes.filter(
          businessType =>
            businessType.status ===
            'ACTIVE'
        ).length,
      [businessTypes]
    );

  const inactiveBusinessTypes =
    useMemo(
      () =>
        businessTypes.filter(
          businessType =>
            businessType.status ===
            'INACTIVE'
        ).length,
      [businessTypes]
    );

  // ====================================================
  // PAGINATION
  // ====================================================

  const paginatedBusinessTypes =
    useMemo(
      () =>
        businessTypes.slice(
          page * rowsPerPage,
          page * rowsPerPage +
            rowsPerPage
        ),
      [
        businessTypes,
        page,
        rowsPerPage
      ]
    );

  useEffect(() => {

    const maxPage =
      Math.max(
        0,
        Math.ceil(
          businessTypes.length /
            rowsPerPage
        ) - 1
      );

    if (page > maxPage) {
      setPage(maxPage);
    }

  }, [
    businessTypes.length,
    page,
    rowsPerPage
  ]);

  // ====================================================
  // GRAPHQL ERROR
  // ====================================================

  useEffect(() => {

    if (error) {
      setErrorMessage(
        error.message
      );
    }

  }, [error]);

  // ====================================================
  // OPEN CREATE
  // ====================================================

  const handleOpenCreateBusinessType =
    () => {

      setEditingBusinessType(null);

      setBusinessTypeForm({
        ...EMPTY_BUSINESS_TYPE_FORM
      });

      setErrorMessage('');

      setOpenBusinessTypeDialog(
        true
      );
    };

  // ====================================================
  // OPEN EDIT
  // ====================================================

  const handleOpenEditBusinessType =
    (
      businessType: BusinessType
    ) => {

      setEditingBusinessType(
        businessType
      );

      setBusinessTypeForm({
        name:
          businessType.name,

        description:
          businessType.description ??
          '',

        status:
          businessType.status
      });

      setErrorMessage('');

      setOpenBusinessTypeDialog(
        true
      );
    };

  // ====================================================
  // CLOSE CREATE / EDIT
  // ====================================================

  const handleCloseBusinessTypeDialog =
    () => {

      if (
        creating ||
        updating
      ) {
        return;
      }

      setOpenBusinessTypeDialog(
        false
      );

      setEditingBusinessType(
        null
      );

      setBusinessTypeForm({
        ...EMPTY_BUSINESS_TYPE_FORM
      });

      setErrorMessage('');
    };

  // ====================================================
  // INPUT CHANGE
  // ====================================================

  const handleBusinessTypeInputChange =
    (
      field: keyof BusinessTypeForm,
      value: string
    ) => {

      setBusinessTypeForm(
        previous => ({
          ...previous,
          [field]: value
        })
      );

      setErrorMessage('');
    };

  // ====================================================
  // STATUS CHANGE
  // ====================================================

  const handleBusinessTypeStatusChange =
    (
      event: SelectChangeEvent
    ) => {

      setBusinessTypeForm(
        previous => ({
          ...previous,

          status:
            event.target.value as
              BusinessTypeStatus
        })
      );

      setErrorMessage('');
    };

  // ====================================================
  // SAVE BUSINESS TYPE
  // ====================================================

  const handleSaveBusinessType =
    async () => {

      const name =
        businessTypeForm.name.trim();

      const description =
        businessTypeForm.description.trim();

      // ----------------------------------------------
      // VALIDATION
      // ----------------------------------------------

      if (!name) {

        setErrorMessage(
          'Business Type name is required.'
        );

        return;
      }

      if (name.length > 100) {

        setErrorMessage(
          'Business Type name cannot exceed 100 characters.'
        );

        return;
      }

      if (description.length > 500) {

        setErrorMessage(
          'Description cannot exceed 500 characters.'
        );

        return;
      }

      try {

        setErrorMessage('');

        // ============================================
        // UPDATE
        // ============================================

        if (editingBusinessType) {

          const response =
            await updateBusinessType({
              variables: {
                input: {

                  businessTypeId:
                    editingBusinessType.businessTypeId,

                  name,

                  description:
                    description ||
                    null,

                  status:
                    businessTypeForm.status
                }
              }
            });

          const result =
            response.data
              ?.updateBusinessType;

          if (!result?.success) {

            throw new Error(
              result?.message ||
              'Failed to update business type.'
            );
          }

        }

        // ============================================
        // CREATE
        // ============================================

        else {

          const response =
            await createBusinessType({
              variables: {
                input: {

                  name,

                  description:
                    description ||
                    null,

                  status:
                    businessTypeForm.status
                }
              }
            });

          const result =
            response.data
              ?.createBusinessType;

          if (!result?.success) {

            throw new Error(
              result?.message ||
              'Failed to create business type.'
            );
          }
        }

        // ============================================
        // REFRESH
        // ============================================

        await refetch();

        // ============================================
        // RESET
        // ============================================

        setOpenBusinessTypeDialog(
          false
        );

        setEditingBusinessType(
          null
        );

        setBusinessTypeForm({
          ...EMPTY_BUSINESS_TYPE_FORM
        });

        setErrorMessage('');

      } catch (err) {

        console.error(
          'Business Type save error:',
          err
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to save business type.'
        );
      }
    };

  // ====================================================
  // TOGGLE STATUS
  // ====================================================

  const handleToggleBusinessTypeStatus =
    async (
      businessType: BusinessType
    ) => {

      try {

        setErrorMessage('');

        const newStatus:
          BusinessTypeStatus =
            businessType.status ===
            'ACTIVE'
              ? 'INACTIVE'
              : 'ACTIVE';

        const response =
          await updateBusinessType({
            variables: {
              input: {

                businessTypeId:
                  businessType.businessTypeId,

                status:
                  newStatus
              }
            }
          });

        const result =
          response.data
            ?.updateBusinessType;

        if (!result?.success) {

          throw new Error(
            result?.message ||
            'Failed to update business type status.'
          );
        }

        await refetch();

      } catch (err) {

        console.error(
          'Business Type status error:',
          err
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to update business type status.'
        );
      }
    };

  // ====================================================
  // OPEN DELETE
  // ====================================================

  const handleOpenDeleteBusinessType =
    (
      businessType: BusinessType
    ) => {

      setBusinessTypeToDelete(
        businessType
      );

      setErrorMessage('');

      setDeleteDialog(true);
    };

  // ====================================================
  // CLOSE DELETE
  // ====================================================

  const handleCloseDeleteBusinessType =
    () => {

      if (deleting) {
        return;
      }

      setDeleteDialog(false);

      setBusinessTypeToDelete(
        null
      );

      setErrorMessage('');
    };

  // ====================================================
  // DELETE
  // ====================================================

  const handleDeleteBusinessType =
    async () => {

      if (
        !businessTypeToDelete
      ) {
        return;
      }

      try {

        setErrorMessage('');

        const response =
          await deleteBusinessType({
            variables: {

              businessTypeId:
                businessTypeToDelete.businessTypeId
            }
          });

        const result =
          response.data
            ?.deleteBusinessType;

        if (!result?.success) {

          throw new Error(
            result?.message ||
            'Failed to delete business type.'
          );
        }

        await refetch();

        setDeleteDialog(false);

        setBusinessTypeToDelete(
          null
        );

        setErrorMessage('');

      } catch (err) {

        console.error(
          'Business Type delete error:',
          err
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to delete business type.'
        );
      }
    };

  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearchChange =
    (
      value: string
    ) => {

      setSearch(value);

      setPage(0);
    };

  // ====================================================
  // STATUS FILTER
  // ====================================================

  const handleStatusFilterChange =
    (
      event: SelectChangeEvent
    ) => {

      setStatusFilter(
        event.target.value as
          StatusFilter
      );

      setPage(0);
    };

  // ====================================================
  // DATE FORMAT
  // ====================================================

  const formatDate =
    (
      date?: string
    ) => {

      if (!date) {
        return '—';
      }

      const parsedDate =
        new Date(date);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return date;
      }

      return parsedDate.toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      );
    };

  // ====================================================
  // SUMMARY CARD
  // ====================================================

  const SummaryCard = ({
    title,
    value,
    subtitle
  }: {
    title: string;
    value: number;
    subtitle: string;
  }) => (

    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        background:
          'background.paper'
      }}
    >

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 1
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 0.5
        }}
      >
        {value.toLocaleString()}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {subtitle}
      </Typography>

    </Paper>
  );

  // ====================================================
  // RENDER
  // ====================================================

  return (

    <Box>

      {/* ==================================================
          HEADER
      ================================================== */}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap'
        }}
      >

        <Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700
            }}
          >
            Business Types
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >
            Manage the business types
            available for salon partners
            across Clavata.
          </Typography>

        </Box>

        <Button
          variant="contained"
          startIcon={
            <PlusOutlined />
          }
          onClick={
            handleOpenCreateBusinessType
          }
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            px: 2.5,
            py: 1
          }}
        >
          Add Business Type
        </Button>

      </Box>

      {/* ==================================================
          ERROR
      ================================================== */}

      {errorMessage && (

        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2,
            border: '1px solid',
            borderColor:
              'error.light',
            borderRadius: 2
          }}
        >

          <Typography
            variant="body2"
            color="error"
          >
            {errorMessage}
          </Typography>

        </Paper>

      )}

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3
        }}
      >

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
        >

          <SummaryCard
            title="Total Business Types"
            value={
              totalBusinessTypes
            }
            subtitle="All configured business types"
          />

        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
        >

          <SummaryCard
            title="Active"
            value={
              activeBusinessTypes
            }
            subtitle="Available for salon registration"
          />

        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
        >

          <SummaryCard
            title="Inactive"
            value={
              inactiveBusinessTypes
            }
            subtitle="Currently unavailable"
          />

        </Grid>

      </Grid>

      {/* ==================================================
          TABLE
      ================================================== */}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >

        {/* ==================================================
            FILTERS
        ================================================== */}

        <Box
          sx={{
            p: 2.5
          }}
        >

          <Stack
            direction={{
              xs: 'column',
              md: 'row'
            }}
            spacing={2}
            justifyContent="space-between"
          >

            {/* SEARCH */}

            <TextField
              value={search}
              onChange={(event) =>
                handleSearchChange(
                  event.target.value
                )
              }
              placeholder="Search business types..."
              size="small"
              sx={{
                width: {
                  xs: '100%',
                  md: 350
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                  >
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />

            {/* STATUS */}

            <Select
              value={
                statusFilter
              }
              size="small"
              onChange={
                handleStatusFilterChange
              }
              sx={{
                minWidth: 150
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

          </Stack>

        </Box>

        <Divider />

        {/* ==================================================
            TABLE
        ================================================== */}

        <TableContainer>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Business Type
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Description
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Status
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Created
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Actions
                </TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {/* ==================================================
                  LOADING
              ================================================== */}

              {loading && (

                <TableRow>

                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{
                      py: 8
                    }}
                  >

                    <Stack
                      spacing={2}
                      alignItems="center"
                    >

                      <CircularProgress
                        size={32}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Loading business types...
                      </Typography>

                    </Stack>

                  </TableCell>

                </TableRow>

              )}

              {/* ==================================================
                  DATA
              ================================================== */}

              {!loading &&
                paginatedBusinessTypes.map(
                  (
                    businessType
                  ) => (

                    <TableRow
                      key={
                        businessType.businessTypeId
                      }
                      hover
                    >

                      {/* BUSINESS TYPE */}

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
                              backgroundColor:
                                'primary.lighter',
                              color:
                                'primary.main'
                            }}
                          >

                            <TagsOutlined
                              style={{
                                fontSize: 19
                              }}
                            />

                          </Box>

                          <Box>

                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600
                              }}
                            >
                              {
                                businessType.name
                              }
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {
                                businessType.businessTypeId
                              }
                            </Typography>

                          </Box>

                        </Stack>

                      </TableCell>

                      {/* DESCRIPTION */}

                      <TableCell>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: 400
                          }}
                        >
                          {
                            businessType.description ||
                            '—'
                          }
                        </Typography>

                      </TableCell>

                      {/* STATUS */}

                      <TableCell>

                        <Tooltip
                          title={
                            businessType.status ===
                            'ACTIVE'
                              ? 'Click to deactivate'
                              : 'Click to activate'
                          }
                        >

                          <Chip
                            label={
                              businessType.status
                            }
                            size="small"
                            color={
                              businessType.status ===
                              'ACTIVE'
                                ? 'success'
                                : 'default'
                            }
                            variant="outlined"
                            onClick={() =>
                              handleToggleBusinessTypeStatus(
                                businessType
                              )
                            }
                            sx={{
                              cursor:
                                'pointer',
                              fontWeight:
                                600
                            }}
                          />

                        </Tooltip>

                      </TableCell>

                      {/* CREATED */}

                      <TableCell>

                        <Typography
                          variant="body2"
                        >
                          {formatDate(
                            businessType.createdAt
                          )}
                        </Typography>

                      </TableCell>

                      {/* ACTIONS */}

                      <TableCell
                        align="right"
                      >

                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >

                          <Tooltip title="Edit">

                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenEditBusinessType(
                                  businessType
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
                                handleOpenDeleteBusinessType(
                                  businessType
                                )
                              }
                            >
                              <DeleteOutlined />
                            </IconButton>

                          </Tooltip>

                        </Stack>

                      </TableCell>

                    </TableRow>

                  )
                )}

              {/* ==================================================
                  EMPTY
              ================================================== */}

              {!loading &&
                paginatedBusinessTypes.length ===
                0 && (

                  <TableRow>

                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{
                        py: 8
                      }}
                    >

                      <TagsOutlined
                        style={{
                          fontSize: 40,
                          opacity: 0.4,
                          marginBottom: 12
                        }}
                      />

                      <Typography
                        variant="h6"
                        color="text.secondary"
                      >
                        No business types found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {search
                          ? 'Try changing your search.'
                          : 'Create your first business type to get started.'}
                      </Typography>

                    </TableCell>

                  </TableRow>

                )}

            </TableBody>

          </Table>

        </TableContainer>

        {/* ==================================================
            PAGINATION
        ================================================== */}

        <TablePagination
          component="div"
          count={
            businessTypes.length
          }
          page={page}
          rowsPerPage={
            rowsPerPage
          }
          onPageChange={(
            _,
            newPage
          ) =>
            setPage(newPage)
          }
          onRowsPerPageChange={(
            event
          ) => {

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
            25
          ]}
        />

      </Paper>

      {/* ==================================================
          CREATE / EDIT DIALOG
      ================================================== */}

      <Dialog
        open={
          openBusinessTypeDialog
        }
        onClose={
          handleCloseBusinessTypeDialog
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>

          {editingBusinessType
            ? 'Edit Business Type'
            : 'Add Business Type'}

        </DialogTitle>

        <DialogContent>

          <Stack
            spacing={2.5}
            sx={{
              mt: 1
            }}
          >

            {/* DIALOG ERROR */}

            {errorMessage && (

              <Typography
                variant="body2"
                color="error"
              >
                {errorMessage}
              </Typography>

            )}

            {/* NAME */}

            <TextField
              label="Business Type Name"
              fullWidth
              required
              value={
                businessTypeForm.name
              }
              onChange={(event) =>
                handleBusinessTypeInputChange(
                  'name',
                  event.target.value
                )
              }
              placeholder="e.g. Beauty Salon"
              disabled={
                creating ||
                updating
              }
            />

            {/* DESCRIPTION */}

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={
                businessTypeForm.description
              }
              onChange={(event) =>
                handleBusinessTypeInputChange(
                  'description',
                  event.target.value
                )
              }
              placeholder="Describe this business type"
              disabled={
                creating ||
                updating
              }
            />

            {/* STATUS */}

            <Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mb: 0.75,
                  display: 'block'
                }}
              >
                Status
              </Typography>

              <Select
                fullWidth
                value={
                  businessTypeForm.status
                }
                onChange={
                  handleBusinessTypeStatusChange
                }
                disabled={
                  creating ||
                  updating
                }
              >

                <MenuItem value="ACTIVE">
                  Active
                </MenuItem>

                <MenuItem value="INACTIVE">
                  Inactive
                </MenuItem>

              </Select>

            </Box>

          </Stack>

        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >

          <Button
            onClick={
              handleCloseBusinessTypeDialog
            }
            color="inherit"
            disabled={
              creating ||
              updating
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveBusinessType
            }
            disabled={
              !businessTypeForm.name.trim() ||
              creating ||
              updating
            }
            startIcon={
              creating ||
              updating ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : undefined
            }
          >

            {creating ||
            updating
              ? 'Saving...'
              : editingBusinessType
                ? 'Save Changes'
                : 'Create Business Type'}

          </Button>

        </DialogActions>

      </Dialog>

      {/* ==================================================
          DELETE DIALOG
      ================================================== */}

      <Dialog
        open={
          deleteDialog
        }
        onClose={
          handleCloseDeleteBusinessType
        }
        maxWidth="xs"
        fullWidth
      >

        <DialogTitle>
          Delete Business Type
        </DialogTitle>

        <DialogContent>

          {errorMessage && (

            <Typography
              variant="body2"
              color="error"
              sx={{
                mb: 2
              }}
            >
              {errorMessage}
            </Typography>

          )}

          <Typography
            variant="body2"
          >
            Are you sure you want
            to delete{' '}
            <strong>
              {
                businessTypeToDelete?.name
              }
            </strong>
            ?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2
            }}
          >
            Deleting this business type
            removes it from the admin
            configuration. Existing salon
            records using the stored business
            type value are not automatically
            changed.
          </Typography>

        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >

          <Button
            onClick={
              handleCloseDeleteBusinessType
            }
            color="inherit"
            disabled={
              deleting
            }
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              handleDeleteBusinessType
            }
            disabled={
              deleting
            }
            startIcon={
              deleting ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : (
                <DeleteOutlined />
              )
            }
          >

            {deleting
              ? 'Deleting...'
              : 'Delete'}

          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
}