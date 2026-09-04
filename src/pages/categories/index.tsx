import { useEffect, useMemo, useState } from 'react';

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

import { useMutation, useQuery } from '@apollo/client';

import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  GET_CATEGORIES
} from '../../graphql/queries';

// ======================================================
// TYPES
// ======================================================

type CategoryStatus = 'ACTIVE' | 'INACTIVE';

type StatusFilter = 'ALL' | CategoryStatus;

interface Category {
  categoryId: string;
  name: string;
  description: string | null;
  servicesCount: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
}

interface CategoryForm {
  name: string;
  description: string;
  status: CategoryStatus;
}

interface GetCategoriesData {
  categories: {
    success: boolean;
    message: string;
    totalCount: number;
    categories: Category[];
  };
}

interface CreateCategoryData {
  createCategory: {
    success: boolean;
    message: string;
    category: Category | null;
  };
}

interface UpdateCategoryData {
  updateCategory: {
    success: boolean;
    message: string;
    category: Category | null;
  };
}

interface DeleteCategoryData {
  deleteCategory: {
    success: boolean;
    message: string;
    category: Category | null;
  };
}

// ======================================================
// DEFAULT FORM
// ======================================================

const EMPTY_FORM: CategoryForm = {
  name: '',
  description: '',
  status: 'ACTIVE'
};

// ======================================================
// COMPONENT
// ======================================================

export default function Categories() {
  // ====================================================
  // UI STATE ONLY
  // ====================================================

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [form, setForm] =
    useState<CategoryForm>(EMPTY_FORM);

  const [deleteDialog, setDeleteDialog] =
    useState(false);

  const [categoryToDelete, setCategoryToDelete] =
    useState<Category | null>(null);

  const [errorMessage, setErrorMessage] =
    useState('');

  // ====================================================
  // FETCH CATEGORIES
  // ====================================================

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<GetCategoriesData>(
    GET_CATEGORIES,
    {
      variables: {
        search: search.trim()
          ? search.trim()
          : undefined,

        status:
          statusFilter === 'ALL'
            ? undefined
            : statusFilter
      },

      fetchPolicy: 'network-only',

      notifyOnNetworkStatusChange: true
    }
  );

  // ====================================================
  // MUTATIONS
  // ====================================================

  const [
    createCategory,
    {
      loading: creating
    }
  ] = useMutation<CreateCategoryData>(
    CREATE_CATEGORY
  );

  const [
    updateCategory,
    {
      loading: updating
    }
  ] = useMutation<UpdateCategoryData>(
    UPDATE_CATEGORY
  );

  const [
    deleteCategory,
    {
      loading: deleting
    }
  ] = useMutation<DeleteCategoryData>(
    DELETE_CATEGORY
  );

  // ====================================================
  // SERVER DATA
  // ====================================================

  const categories: Category[] =
    data?.categories?.categories ?? [];

  const totalCategories =
    data?.categories?.totalCount ?? 0;

  // ====================================================
  // COUNTERS
  // ====================================================

  const activeCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.status === 'ACTIVE'
      ).length,
    [categories]
  );

  const inactiveCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.status === 'INACTIVE'
      ).length,
    [categories]
  );

  const totalServices = useMemo(
    () =>
      categories.reduce(
        (total, category) =>
          total +
          Number(
            category.servicesCount ?? 0
          ),
        0
      ),
    [categories]
  );

  // ====================================================
  // PAGINATION
  // ====================================================

  const paginatedCategories = useMemo(
    () =>
      categories.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [
      categories,
      page,
      rowsPerPage
    ]
  );

  useEffect(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(
        categories.length / rowsPerPage
      ) - 1
    );

    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [
    categories.length,
    page,
    rowsPerPage
  ]);

  // ====================================================
  // ERROR
  // ====================================================

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message);
    }
  }, [error]);

  // ====================================================
  // CREATE
  // ====================================================

  const handleOpenCreate = () => {
    setEditingCategory(null);

    setForm({
      ...EMPTY_FORM
    });

    setErrorMessage('');

    setOpenDialog(true);
  };

  // ====================================================
  // EDIT
  // ====================================================

  const handleOpenEdit = (
    category: Category
  ) => {
    setEditingCategory(category);

    setForm({
      name: category.name,
      description:
        category.description ?? '',
      status: category.status
    });

    setErrorMessage('');

    setOpenDialog(true);
  };

  // ====================================================
  // CLOSE FORM
  // ====================================================

  const handleCloseDialog = () => {
    if (creating || updating) {
      return;
    }

    setOpenDialog(false);

    setEditingCategory(null);

    setForm({
      ...EMPTY_FORM
    });

    setErrorMessage('');
  };

  // ====================================================
  // INPUT
  // ====================================================

  const handleInputChange = (
    field: keyof CategoryForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));

    setErrorMessage('');
  };

  // ====================================================
  // STATUS INPUT
  // ====================================================

  const handleFormStatusChange = (
    event: SelectChangeEvent
  ) => {
    setForm((previous) => ({
      ...previous,
      status:
        event.target.value as CategoryStatus
    }));

    setErrorMessage('');
  };

  // ====================================================
  // SAVE CATEGORY
  // ====================================================

  const handleSave = async () => {
    const name = form.name.trim();

    const description =
      form.description.trim();

    if (!name) {
      setErrorMessage(
        'Category name is required.'
      );

      return;
    }

    try {
      setErrorMessage('');

      // ==============================================
      // UPDATE EXISTING
      // ==============================================

      if (editingCategory) {
        const response =
          await updateCategory({
            variables: {
              input: {
                categoryId:
                  editingCategory.categoryId,

                name,

                description:
                  description || null,

                status: form.status
              }
            }
          });

        const result =
          response.data?.updateCategory;

        if (!result?.success) {
          throw new Error(
            result?.message ||
            'Failed to update category.'
          );
        }
      }

      // ==============================================
      // CREATE NEW
      // ==============================================

      else {
        const response =
          await createCategory({
            variables: {
              input: {
                name,

                description:
                  description || null,

                status: form.status
              }
            }
          });

        const result =
          response.data?.createCategory;

        if (!result?.success) {
          throw new Error(
            result?.message ||
            'Failed to create category.'
          );
        }
      }

      // ==============================================
      // REFRESH SERVER DATA
      // ==============================================

      await refetch();

      // ==============================================
      // CLOSE
      // ==============================================

      setOpenDialog(false);

      setEditingCategory(null);

      setForm({
        ...EMPTY_FORM
      });

      setErrorMessage('');
    } catch (err) {
      console.error(
        'Category save error:',
        err
      );

      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to save category.'
      );
    }
  };

  // ====================================================
  // DELETE DIALOG
  // ====================================================

  const handleOpenDelete = (
    category: Category
  ) => {
    setCategoryToDelete(category);

    setErrorMessage('');

    setDeleteDialog(true);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteDialog(false);

    setCategoryToDelete(null);

    setErrorMessage('');
  };

  // ====================================================
  // DELETE
  // ====================================================

  const handleDelete = async () => {
    if (!categoryToDelete) {
      return;
    }

    try {
      setErrorMessage('');

      const response =
        await deleteCategory({
          variables: {
            categoryId:
              categoryToDelete.categoryId
          }
        });

      const result =
        response.data?.deleteCategory;

      if (!result?.success) {
        throw new Error(
          result?.message ||
          'Failed to delete category.'
        );
      }

      await refetch();

      setDeleteDialog(false);

      setCategoryToDelete(null);

      setErrorMessage('');
    } catch (err) {
      console.error(
        'Category delete error:',
        err
      );

      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to delete category.'
      );
    }
  };

  // ====================================================
  // TOGGLE ACTIVE / INACTIVE
  // ====================================================

  const handleToggleStatus = async (
    category: Category
  ) => {
    try {
      setErrorMessage('');

      const newStatus: CategoryStatus =
        category.status === 'ACTIVE'
          ? 'INACTIVE'
          : 'ACTIVE';

      const response =
        await updateCategory({
          variables: {
            input: {
              categoryId:
                category.categoryId,

              status: newStatus
            }
          }
        });

      const result =
        response.data?.updateCategory;

      if (!result?.success) {
        throw new Error(
          result?.message ||
          'Failed to update category status.'
        );
      }

      await refetch();
    } catch (err) {
      console.error(
        'Category status error:',
        err
      );

      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to update category status.'
      );
    }
  };

  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);

    setPage(0);
  };

  // ====================================================
  // STATUS FILTER
  // ====================================================

  const handleStatusFilterChange = (
    event: SelectChangeEvent
  ) => {
    setStatusFilter(
      event.target.value as StatusFilter
    );

    setPage(0);
  };

  // ====================================================
  // DATE FORMAT
  // ====================================================

  const formatDate = (
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
        sx={{ mb: 1 }}
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
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Categories
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage service categories
            available across Clavata.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            <PlusOutlined />
          }
          onClick={
            handleOpenCreate
          }
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            px: 2.5,
            py: 1
          }}
        >
          Add Category
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
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="Total Categories"
            value={
              totalCategories
            }
            subtitle="All configured categories"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="Active"
            value={
              activeCategories
            }
            subtitle="Currently available"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="Inactive"
            value={
              inactiveCategories
            }
            subtitle="Currently disabled"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="Services"
            value={totalServices}
            subtitle="Services across categories"
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

        {/* FILTERS */}

        <Box sx={{ p: 2.5 }}>
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
              placeholder="Search categories..."
              size="small"
              sx={{
                width: {
                  xs: '100%',
                  md: 350
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
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

        {/* TABLE */}

        <TableContainer>
          <Table>

            <TableHead>
              <TableRow>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Category
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Description
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Services
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

              {/* LOADING */}

              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                        Loading categories...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}

              {/* DATA */}

              {!loading &&
                paginatedCategories.map(
                  (category) => (
                    <TableRow
                      key={
                        category.categoryId
                      }
                      hover
                    >

                      {/* CATEGORY */}

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
                              display:
                                'flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
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
                                category.name
                              }
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {
                                category.categoryId
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
                            maxWidth: 350
                          }}
                        >
                          {
                            category.description ||
                            '—'
                          }
                        </Typography>
                      </TableCell>

                      {/* SERVICES */}

                      <TableCell align="center">
                        <Chip
                          label={Number(
                            category.servicesCount ??
                            0
                          )}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <Tooltip
                          title={
                            category.status ===
                              'ACTIVE'
                              ? 'Click to deactivate'
                              : 'Click to activate'
                          }
                        >
                          <Chip
                            label={
                              category.status
                            }
                            size="small"
                            color={
                              category.status ===
                                'ACTIVE'
                                ? 'success'
                                : 'default'
                            }
                            variant="outlined"
                            onClick={() =>
                              handleToggleStatus(
                                category
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
                            category.createdAt
                          )}
                        </Typography>
                      </TableCell>

                      {/* ACTIONS */}

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenEdit(
                                  category
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
                                handleOpenDelete(
                                  category
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

              {/* EMPTY */}

              {!loading &&
                paginatedCategories.length ===
                0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                        No categories found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {search
                          ? 'Try changing your search.'
                          : 'Create your first category to get started.'}
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
          count={
            categories.length
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
        open={openDialog}
        onClose={
          handleCloseDialog
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingCategory
            ? 'Edit Category'
            : 'Add Category'}
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2.5}
            sx={{ mt: 1 }}
          >

            {/* ERROR */}

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
              label="Category Name"
              fullWidth
              required
              value={
                form.name
              }
              onChange={(
                event
              ) =>
                handleInputChange(
                  'name',
                  event.target.value
                )
              }
              placeholder="e.g. Hair"
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
                form.description
              }
              onChange={(
                event
              ) =>
                handleInputChange(
                  'description',
                  event.target.value
                )
              }
              placeholder="Describe what services belong to this category"
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
                  display:
                    'block'
                }}
              >
                Status
              </Typography>

              <Select
                fullWidth
                value={
                  form.status
                }
                onChange={
                  handleFormStatusChange
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
              handleCloseDialog
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
              handleSave
            }
            disabled={
              !form.name.trim() ||
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
              : editingCategory
                ? 'Save Changes'
                : 'Create Category'}
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
          handleCloseDelete
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Category
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
                categoryToDelete?.name
              }
            </strong>
            ?
          </Typography>

          {categoryToDelete &&
            categoryToDelete.servicesCount >
            0 && (
              <Typography
                variant="body2"
                color="error"
                sx={{
                  mt: 2
                }}
              >
                This category currently
                contains{' '}
                {
                  categoryToDelete.servicesCount
                }{' '}
                services. It is recommended
                to deactivate this category
                instead of deleting it.
              </Typography>
            )}

        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >

          <Button
            onClick={
              handleCloseDelete
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
              handleDelete
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