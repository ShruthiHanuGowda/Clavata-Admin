import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
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
} from '@mui/material';

import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  TagsOutlined,
} from '@ant-design/icons';

import { useMutation, useQuery } from '@apollo/client';

import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  GET_CATEGORIES,
  CREATE_SUBCATEGORY,
  UPDATE_SUBCATEGORY,
  DELETE_SUBCATEGORY,
  GET_SUBCATEGORIES,
} from '../../graphql/queries';

/* ============================================================
   TYPES
============================================================ */

type CategoryStatus = 'ACTIVE' | 'INACTIVE';

type SubcategoryStatus = 'ACTIVE' | 'INACTIVE';

type StatusFilter = 'ALL' | CategoryStatus;

type ServiceAudience =
  | 'FEMALE'
  | 'MALE'
  | 'KIDS';

interface Category {
  categoryId: string;
  name: string;
  description: string | null;
  servicesCount: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  subcategoryId: string;
  categoryId: string;
  name: string;
  description: string | null;
  servicesCount: number;
  status: SubcategoryStatus;
  audiences: ServiceAudience[] | null;
  createdAt: string;
  updatedAt: string;
}

interface CategoryForm {
  name: string;
  description: string;
  status: CategoryStatus;
}

interface SubcategoryForm {
  categoryId: string;
  name: string;
  description: string;
  status: SubcategoryStatus;
  audiences: ServiceAudience[];
}

/* ============================================================
   GRAPHQL RESPONSE TYPES
============================================================ */

interface CategoriesResponse {
  success: boolean;
  message?: string | null;
  totalCount?: number;
  categories: Category[];
}

interface SubcategoriesResponse {
  success: boolean;
  message?: string | null;
  totalCount?: number;
  subcategories: Subcategory[];
}

interface GetCategoriesData {
  categories: CategoriesResponse;
}

interface GetSubcategoriesData {
  subcategories: SubcategoriesResponse;
}

interface MutationResponse {
  success: boolean;
  message?: string | null;
}

interface CreateCategoryData {
  createCategory: MutationResponse & {
    category?: Category | null;
  };
}

interface UpdateCategoryData {
  updateCategory: MutationResponse & {
    category?: Category | null;
  };
}

interface DeleteCategoryData {
  deleteCategory: MutationResponse & {
    category?: Category | null;
  };
}

interface CreateSubcategoryData {
  createSubcategory: MutationResponse & {
    subcategory?: Subcategory | null;
  };
}

interface UpdateSubcategoryData {
  updateSubcategory: MutationResponse & {
    subcategory?: Subcategory | null;
  };
}

interface DeleteSubcategoryData {
  deleteSubcategory: MutationResponse & {
    subcategory?: Subcategory | null;
  };
}

/* ============================================================
   CONSTANTS
============================================================ */

const AUDIENCE_OPTIONS: Array<{
  value: ServiceAudience;
  label: string;
}> = [
  {
    value: 'FEMALE',
    label: 'Female',
  },
  {
    value: 'MALE',
    label: 'Male',
  },
  {
    value: 'KIDS',
    label: 'Kids',
  },
];

const EMPTY_CATEGORY_FORM: CategoryForm = {
  name: '',
  description: '',
  status: 'ACTIVE',
};

const EMPTY_SUBCATEGORY_FORM: SubcategoryForm = {
  categoryId: '',
  name: '',
  description: '',
  status: 'ACTIVE',
  audiences: [],
};

/* ============================================================
   HELPERS
============================================================ */

const formatDate = (
  value?: string | null,
): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getAudienceLabel = (
  audience: ServiceAudience,
): string => {
  const option = AUDIENCE_OPTIONS.find(
    item => item.value === audience,
  );

  return option?.label ?? audience;
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

const Categories: React.FC = () => {
  /* ==========================================================
     CATEGORY QUERY
  ========================================================== */

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<GetCategoriesData>(
    GET_CATEGORIES,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );

  /* ==========================================================
     SUBCATEGORY QUERY
  ========================================================== */

  const {
    data: subcategoriesData,
    loading: subcategoriesLoading,
    error: subcategoriesError,
    refetch: refetchSubcategories,
  } = useQuery<GetSubcategoriesData>(
    GET_SUBCATEGORIES,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );

  /* ==========================================================
     MUTATIONS
  ========================================================== */

  const [
    createCategory,
    {
      loading: creatingCategory,
    },
  ] = useMutation<CreateCategoryData>(
    CREATE_CATEGORY,
  );

  const [
    updateCategory,
    {
      loading: updatingCategory,
    },
  ] = useMutation<UpdateCategoryData>(
    UPDATE_CATEGORY,
  );

  const [
    deleteCategory,
    {
      loading: deletingCategory,
    },
  ] = useMutation<DeleteCategoryData>(
    DELETE_CATEGORY,
  );

  const [
    createSubcategory,
    {
      loading: creatingSubcategory,
    },
  ] = useMutation<CreateSubcategoryData>(
    CREATE_SUBCATEGORY,
  );

  const [
    updateSubcategory,
    {
      loading: updatingSubcategory,
    },
  ] = useMutation<UpdateSubcategoryData>(
    UPDATE_SUBCATEGORY,
  );

  const [
    deleteSubcategory,
    {
      loading: deletingSubcategory,
    },
  ] = useMutation<DeleteSubcategoryData>(
    DELETE_SUBCATEGORY,
  );

  /* ==========================================================
     DATA
  ========================================================== */

  const categories = useMemo(
    () =>
      data?.categories?.categories ?? [],
    [data],
  );

  const subcategories = useMemo(
    () =>
      subcategoriesData?.subcategories
        ?.subcategories ?? [],
    [subcategoriesData],
  );

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>('ALL');

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    expandedCategories,
    setExpandedCategories,
  ] = useState<
    Record<string, boolean>
  >({});

  /* ==========================================================
     CATEGORY DIALOG STATE
  ========================================================== */

  const [
    openCategoryDialog,
    setOpenCategoryDialog,
  ] = useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState<Category | null>(null);

  const [
    categoryForm,
    setCategoryForm,
  ] = useState<CategoryForm>({
    ...EMPTY_CATEGORY_FORM,
  });

  /* ==========================================================
     SUBCATEGORY DIALOG STATE
  ========================================================== */

  const [
    openSubcategoryDialog,
    setOpenSubcategoryDialog,
  ] = useState(false);

  const [
    editingSubcategory,
    setEditingSubcategory,
  ] = useState<Subcategory | null>(null);

  const [
    subcategoryForm,
    setSubcategoryForm,
  ] = useState<SubcategoryForm>({
    ...EMPTY_SUBCATEGORY_FORM,
  });

  /* ==========================================================
     DELETE STATE
  ========================================================== */

  const [
    categoryToDelete,
    setCategoryToDelete,
  ] = useState<Category | null>(null);

  const [
    subcategoryToDelete,
    setSubcategoryToDelete,
  ] = useState<Subcategory | null>(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  /* ==========================================================
     FILTERED CATEGORIES
  ========================================================== */

  const filteredCategories = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return categories.filter(category => {
      const matchesSearch =
        !normalizedSearch ||
        category.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        (
          category.description ?? ''
        )
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'ALL' ||
        category.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    categories,
    search,
    statusFilter,
  ]);

  /* ==========================================================
     PAGINATED CATEGORIES
  ========================================================== */

  const paginatedCategories = useMemo(
    () =>
      filteredCategories.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [
      filteredCategories,
      page,
      rowsPerPage,
    ],
  );

  /* ==========================================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================================== */

  useEffect(() => {
    setPage(0);
  }, [
    search,
    statusFilter,
  ]);

  /* ==========================================================
     SUBCATEGORIES BY CATEGORY
  ========================================================== */

  const getSubcategoriesForCategory =
    useCallback(
      (categoryId: string) =>
        subcategories.filter(
          subcategory =>
            subcategory.categoryId ===
            categoryId,
        ),
      [subcategories],
    );

  /* ==========================================================
     OPEN CREATE CATEGORY
  ========================================================== */

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);

    setCategoryForm({
      ...EMPTY_CATEGORY_FORM,
    });

    setErrorMessage('');

    setOpenCategoryDialog(true);
  };

  /* ==========================================================
     OPEN EDIT CATEGORY
  ========================================================== */

  const handleOpenEditCategory = (
    category: Category,
  ) => {
    setEditingCategory(category);

    setCategoryForm({
      name: category.name,
      description:
        category.description ?? '',
      status: category.status,
    });

    setErrorMessage('');

    setOpenCategoryDialog(true);
  };

  /* ==========================================================
     CLOSE CATEGORY DIALOG
  ========================================================== */

  const handleCloseCategoryDialog = () => {
    if (creatingCategory || updatingCategory) {
      return;
    }

    setOpenCategoryDialog(false);
    setEditingCategory(null);

    setCategoryForm({
      ...EMPTY_CATEGORY_FORM,
    });

    setErrorMessage('');
  };

  /* ==========================================================
     SAVE CATEGORY
  ========================================================== */

  const handleSaveCategory = async () => {
    const name =
      categoryForm.name.trim();

    const description =
      categoryForm.description.trim();

    if (!name) {
      setErrorMessage(
        'Category name is required.',
      );

      return;
    }

    try {
      setErrorMessage('');

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
                status:
                  categoryForm.status,
              },
            },
          });

        const result =
          response.data?.updateCategory;

        if (!result?.success) {
          throw new Error(
            result?.message ||
              'Failed to update category.',
          );
        }
      } else {
        const response =
          await createCategory({
            variables: {
              input: {
                name,
                description:
                  description || null,
                status:
                  categoryForm.status,
              },
            },
          });

        const result =
          response.data?.createCategory;

        if (!result?.success) {
          throw new Error(
            result?.message ||
              'Failed to create category.',
          );
        }
      }

      await Promise.all([
        refetch(),
        refetchSubcategories(),
      ]);

      handleCloseCategoryDialog();
    } catch (err) {
      console.error(
        'Category save error:',
        err,
      );

      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to save category.',
      );
    }
  };

  /* ==========================================================
     TOGGLE CATEGORY STATUS
  ========================================================== */

  const handleToggleCategoryStatus =
    async (
      category: Category,
    ) => {
      try {
        setErrorMessage('');

        const nextStatus: CategoryStatus =
          category.status === 'ACTIVE'
            ? 'INACTIVE'
            : 'ACTIVE';

        const response =
          await updateCategory({
            variables: {
              input: {
                categoryId:
                  category.categoryId,
                name: category.name,
                description:
                  category.description ??
                  null,
                status: nextStatus,
              },
            },
          });

        const result =
          response.data?.updateCategory;

        if (!result?.success) {
          throw new Error(
            result?.message ||
              'Failed to update category status.',
          );
        }

        await refetch();
      } catch (err) {
        console.error(
          'Category status error:',
          err,
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to update category status.',
        );
      }
    };

  /* ==========================================================
     DELETE CATEGORY
  ========================================================== */

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) {
      return;
    }

    try {
      setErrorMessage('');

      const response =
        await deleteCategory({
          variables: {
            categoryId:
              categoryToDelete.categoryId,
          },
        });

      const result =
        response.data?.deleteCategory;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            'Failed to delete category.',
        );
      }

      await Promise.all([
        refetch(),
        refetchSubcategories(),
      ]);

      setCategoryToDelete(null);
    } catch (err) {
      console.error(
        'Category delete error:',
        err,
      );

      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to delete category.',
      );
    }
  };

  /* ==========================================================
     OPEN CREATE SUBCATEGORY
  ========================================================== */

  const handleOpenCreateSubcategory = (
    categoryId?: string,
  ) => {
    setEditingSubcategory(null);

    setSubcategoryForm({
      ...EMPTY_SUBCATEGORY_FORM,
      categoryId:
        categoryId ?? '',
    });

    setErrorMessage('');

    setOpenSubcategoryDialog(true);
  };

  /* ==========================================================
     OPEN EDIT SUBCATEGORY
  ========================================================== */

  const handleOpenEditSubcategory = (
    subcategory: Subcategory,
  ) => {
    setEditingSubcategory(
      subcategory,
    );

    setSubcategoryForm({
      categoryId:
        subcategory.categoryId,
      name: subcategory.name,
      description:
        subcategory.description ?? '',
      status:
        subcategory.status,
      audiences:
        subcategory.audiences ?? [],
    });

    setErrorMessage('');

    setOpenSubcategoryDialog(true);
  };

  /* ==========================================================
     CLOSE SUBCATEGORY DIALOG
  ========================================================== */

  const handleCloseSubcategoryDialog =
    () => {
      if (
        creatingSubcategory ||
        updatingSubcategory
      ) {
        return;
      }

      setOpenSubcategoryDialog(false);
      setEditingSubcategory(null);

      setSubcategoryForm({
        ...EMPTY_SUBCATEGORY_FORM,
      });

      setErrorMessage('');
    };

  /* ==========================================================
     SAVE SUBCATEGORY
  ========================================================== */

  const handleSaveSubcategory =
    async () => {
      const name =
        subcategoryForm.name.trim();

      const description =
        subcategoryForm.description.trim();

      if (!subcategoryForm.categoryId) {
        setErrorMessage(
          'Please select a parent category.',
        );

        return;
      }

      if (!name) {
        setErrorMessage(
          'Subcategory name is required.',
        );

        return;
      }

      if (
        subcategoryForm.audiences.length ===
        0
      ) {
        setErrorMessage(
          'Please select at least one audience.',
        );

        return;
      }

      try {
        setErrorMessage('');

        if (editingSubcategory) {
          const response =
            await updateSubcategory({
              variables: {
                input: {
                  subcategoryId:
                    editingSubcategory.subcategoryId,
                  categoryId:
                    subcategoryForm.categoryId,
                  name,
                  description:
                    description || null,
                  status:
                    subcategoryForm.status,
                  audiences:
                    subcategoryForm.audiences,
                },
              },
            });

          const result =
            response.data
              ?.updateSubcategory;

          if (!result?.success) {
            throw new Error(
              result?.message ||
                'Failed to update subcategory.',
            );
          }
        } else {
          const response =
            await createSubcategory({
              variables: {
                input: {
                  categoryId:
                    subcategoryForm.categoryId,
                  name,
                  description:
                    description || null,
                  status:
                    subcategoryForm.status,
                  audiences:
                    subcategoryForm.audiences,
                },
              },
            });

          const result =
            response.data
              ?.createSubcategory;

          if (!result?.success) {
            throw new Error(
              result?.message ||
                'Failed to create subcategory.',
            );
          }
        }

        await Promise.all([
          refetch(),
          refetchSubcategories(),
        ]);

        handleCloseSubcategoryDialog();

        setExpandedCategories(
          previous => ({
            ...previous,
            [subcategoryForm.categoryId]:
              true,
          }),
        );
      } catch (err) {
        console.error(
          'Subcategory save error:',
          err,
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to save subcategory.',
        );
      }
    };

  /* ==========================================================
     TOGGLE SUBCATEGORY STATUS
  ========================================================== */

  const handleToggleSubcategoryStatus =
    async (
      subcategory: Subcategory,
    ) => {
      try {
        setErrorMessage('');

        const nextStatus:
          SubcategoryStatus =
          subcategory.status === 'ACTIVE'
            ? 'INACTIVE'
            : 'ACTIVE';

        const response =
          await updateSubcategory({
            variables: {
              input: {
                subcategoryId:
                  subcategory.subcategoryId,
                categoryId:
                  subcategory.categoryId,
                name: subcategory.name,
                description:
                  subcategory.description ??
                  null,
                status: nextStatus,
                audiences:
                  subcategory.audiences ??
                  [],
              },
            },
          });

        const result =
          response.data
            ?.updateSubcategory;

        if (!result?.success) {
          throw new Error(
            result?.message ||
              'Failed to update subcategory status.',
          );
        }

        await refetchSubcategories();
      } catch (err) {
        console.error(
          'Subcategory status error:',
          err,
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to update subcategory status.',
        );
      }
    };

  /* ==========================================================
     DELETE SUBCATEGORY
  ========================================================== */

  const handleDeleteSubcategory =
    async () => {
      if (!subcategoryToDelete) {
        return;
      }

      try {
        setErrorMessage('');

        const response =
          await deleteSubcategory({
            variables: {
              subcategoryId:
                subcategoryToDelete.subcategoryId,
            },
          });

        const result =
          response.data
            ?.deleteSubcategory;

        if (!result?.success) {
          throw new Error(
            result?.message ||
              'Failed to delete subcategory.',
          );
        }

        await Promise.all([
          refetch(),
          refetchSubcategories(),
        ]);

        setSubcategoryToDelete(null);
      } catch (err) {
        console.error(
          'Subcategory delete error:',
          err,
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to delete subcategory.',
        );
      }
    };

  /* ==========================================================
     EXPAND / COLLAPSE
  ========================================================== */

  const handleToggleCategory = (
    categoryId: string,
  ) => {
    setExpandedCategories(
      previous => ({
        ...previous,
        [categoryId]:
          !previous[categoryId],
      }),
    );
  };

  /* ==========================================================
     SELECT HANDLERS
  ========================================================== */

  const handleCategoryStatusChange = (
    event: SelectChangeEvent<CategoryStatus>,
  ) => {
    setCategoryForm(previous => ({
      ...previous,
      status:
        event.target.value as CategoryStatus,
    }));
  };

  const handleSubcategoryStatusChange =
    (
      event: SelectChangeEvent<SubcategoryStatus>,
    ) => {
      setSubcategoryForm(previous => ({
        ...previous,
        status:
          event.target
            .value as SubcategoryStatus,
      }));
    };

  const handleSubcategoryCategoryChange =
    (
      event: SelectChangeEvent<string>,
    ) => {
      setSubcategoryForm(previous => ({
        ...previous,
        categoryId:
          event.target.value,
      }));
    };

  const handleAudienceChange = (
    event: SelectChangeEvent<
      ServiceAudience[]
    >,
  ) => {
    const value =
      event.target.value;

    setSubcategoryForm(previous => ({
      ...previous,
      audiences:
        typeof value === 'string'
          ? (value
              .split(',')
              .filter(Boolean) as ServiceAudience[])
          : value,
    }));
  };

  /* ==========================================================
     LOADING STATE
  ========================================================== */

  const initialLoading =
    loading &&
    !data;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Box
      sx={{
        width: '100%',
        p: {
          xs: 1.5,
          sm: 2,
          md: 3,
        },
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        alignItems={{
          xs: 'flex-start',
          sm: 'center',
        }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            mb={0.5}
          >
            <TagsOutlined
              style={{
                fontSize: 22,
              }}
            />

            <Typography
              variant="h5"
              fontWeight={700}
            >
              Categories
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Manage service categories,
            subcategories and audiences
            across Clavata.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={
            handleOpenCreateCategory
          }
          sx={{
            minWidth: 150,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add Category
        </Button>
      </Stack>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {(errorMessage ||
        error ||
        subcategoriesError) && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: '1px solid',
            borderColor:
              'error.light',
            backgroundColor:
              'error.lighter',
          }}
        >
          <Typography
            color="error"
            variant="body2"
          >
            {errorMessage ||
              error?.message ||
              subcategoriesError?.message}
          </Typography>
        </Paper>
      )}

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
        >
          <Grid
            item
            xs={12}
            md={7}
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={event =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search categories..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={3}
          >
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>
                Status
              </InputLabel>

              <Select
                label="Status"
                value={statusFilter}
                onChange={event =>
                  setStatusFilter(
                    event.target.value as StatusFilter,
                  )
                }
              >
                <MenuItem value="ALL">
                  All
                </MenuItem>

                <MenuItem value="ACTIVE">
                  Active
                </MenuItem>

                <MenuItem value="INACTIVE">
                  Inactive
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={2}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign={{
                xs: 'left',
                md: 'right',
              }}
            >
              {filteredCategories.length}{' '}
              {filteredCategories.length ===
              1
                ? 'category'
                : 'categories'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* ======================================================
          MAIN TABLE
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {initialLoading ? (
          <Box
            sx={{
              minHeight: 350,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{
                  minWidth: 900,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell width={50} />

                    <TableCell>
                      <Typography fontWeight={700}>
                        Category
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Description
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography fontWeight={700}>
                        Services
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Status
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        Created
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={700}>
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedCategories.length ===
                  0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                      >
                        <Box
                          sx={{
                            py: 8,
                          }}
                        >
                          <TagsOutlined
                            style={{
                              fontSize: 36,
                              opacity: 0.35,
                            }}
                          />

                          <Typography
                            sx={{
                              mt: 1,
                            }}
                            color="text.secondary"
                          >
                            No categories found.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCategories.map(
                      category => {
                        const isExpanded =
                          Boolean(
                            expandedCategories[
                              category.categoryId
                            ],
                          );

                        const categorySubcategories =
                          getSubcategoriesForCategory(
                            category.categoryId,
                          );

                        return (
                          <React.Fragment
                            key={
                              category.categoryId
                            }
                          >
                            <TableRow
                              hover
                              sx={{
                                '& > *': {
                                  borderBottom:
                                    isExpanded
                                      ? 'none'
                                      : undefined,
                                },
                              }}
                            >
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleToggleCategory(
                                      category.categoryId,
                                    )
                                  }
                                >
                                  {isExpanded ? (
                                    <DownOutlined />
                                  ) : (
                                    <RightOutlined />
                                  )}
                                </IconButton>
                              </TableCell>

                              <TableCell>
                                <Stack
                                  spacing={0.5}
                                >
                                  <Typography
                                    fontWeight={600}
                                  >
                                    {category.name}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {
                                      categorySubcategories.length
                                    }{' '}
                                    {categorySubcategories.length ===
                                    1
                                      ? 'subcategory'
                                      : 'subcategories'}
                                  </Typography>
                                </Stack>
                              </TableCell>

                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color={
                                    category.description
                                      ? 'text.primary'
                                      : 'text.secondary'
                                  }
                                  sx={{
                                    maxWidth: 420,
                                  }}
                                >
                                  {category.description ||
                                    '—'}
                                </Typography>
                              </TableCell>

                              <TableCell align="center">
                                <Chip
                                  size="small"
                                  label={
                                    category.servicesCount ??
                                    0
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <Chip
                                  size="small"
                                  label={
                                    category.status ===
                                    'ACTIVE'
                                      ? 'Active'
                                      : 'Inactive'
                                  }
                                  color={
                                    category.status ===
                                    'ACTIVE'
                                      ? 'success'
                                      : 'default'
                                  }
                                  variant={
                                    category.status ===
                                    'ACTIVE'
                                      ? 'filled'
                                      : 'outlined'
                                  }
                                  onClick={() =>
                                    handleToggleCategoryStatus(
                                      category,
                                    )
                                  }
                                  sx={{
                                    cursor:
                                      'pointer',
                                  }}
                                />
                              </TableCell>

                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {formatDate(
                                    category.createdAt,
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell align="right">
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  justifyContent="flex-end"
                                >
                                  <Tooltip title="Add Subcategory">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleOpenCreateSubcategory(
                                          category.categoryId,
                                        )
                                      }
                                    >
                                      <PlusOutlined />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Edit Category">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleOpenEditCategory(
                                          category,
                                        )
                                      }
                                    >
                                      <EditOutlined />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Delete Category">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        setCategoryToDelete(
                                          category,
                                        )
                                      }
                                    >
                                      <DeleteOutlined />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>

                            {/* ==================================
                                EXPANDED SUBCATEGORIES
                            ================================== */}

                            <TableRow>
                              <TableCell
                                colSpan={7}
                                sx={{
                                  p: 0,
                                  borderBottom:
                                    isExpanded
                                      ? undefined
                                      : 'none',
                                }}
                              >
                                <Collapse
                                  in={isExpanded}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <Box
                                    sx={{
                                      p: 2,
                                      backgroundColor:
                                        'action.hover',
                                    }}
                                  >
                                    <Stack
                                      direction={{
                                        xs: 'column',
                                        sm: 'row',
                                      }}
                                      alignItems={{
                                        xs: 'flex-start',
                                        sm: 'center',
                                      }}
                                      justifyContent="space-between"
                                      spacing={1}
                                      mb={1.5}
                                    >
                                      <Box>
                                        <Typography
                                          variant="subtitle1"
                                          fontWeight={700}
                                        >
                                          {
                                            category.name
                                          }{' '}
                                          Subcategories
                                        </Typography>

                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          Define the
                                          audiences that
                                          can receive
                                          services under
                                          each
                                          subcategory.
                                        </Typography>
                                      </Box>

                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={
                                          <PlusOutlined />
                                        }
                                        onClick={() =>
                                          handleOpenCreateSubcategory(
                                            category.categoryId,
                                          )
                                        }
                                        sx={{
                                          textTransform:
                                            'none',
                                        }}
                                      >
                                        Add Subcategory
                                      </Button>
                                    </Stack>

                                    <Divider
                                      sx={{
                                        mb: 2,
                                      }}
                                    />

                                    {subcategoriesLoading ? (
                                      <Box
                                        sx={{
                                          py: 4,
                                          display:
                                            'flex',
                                          justifyContent:
                                            'center',
                                        }}
                                      >
                                        <CircularProgress
                                          size={26}
                                        />
                                      </Box>
                                    ) : categorySubcategories.length ===
                                      0 ? (
                                      <Box
                                        sx={{
                                          py: 4,
                                          textAlign:
                                            'center',
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          No
                                          subcategories
                                          have been
                                          created for
                                          this
                                          category yet.
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <TableContainer
                                        component={
                                          Paper
                                        }
                                        elevation={0}
                                        sx={{
                                          border:
                                            '1px solid',
                                          borderColor:
                                            'divider',
                                          borderRadius: 1.5,
                                        }}
                                      >
                                        <Table
                                          size="small"
                                          sx={{
                                            minWidth: 900,
                                          }}
                                        >
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>
                                                <Typography
                                                  fontWeight={
                                                    700
                                                  }
                                                >
                                                  Subcategory
                                                </Typography>
                                              </TableCell>

                                              <TableCell>
                                                <Typography
                                                  fontWeight={
                                                    700
                                                  }
                                                >
                                                  Audiences
                                                </Typography>
                                              </TableCell>

                                              <TableCell>
                                                <Typography
                                                  fontWeight={
                                                    700
                                                  }
                                                >
                                                  Description
                                                </Typography>
                                              </TableCell>

                                              <TableCell align="center">
                                                <Typography
                                                  fontWeight={
                                                    700
                                                  }
                                                >
                                                  Services
                                                </Typography>
                                              </TableCell>

                                              <TableCell>
                                                <Typography
                                                  fontWeight={
                                                    700
                                                  }
                                                >
                                                  Status
                                                </Typography>
                                              </TableCell>

                                              <TableCell>
                                                <Typography
                                                  fontWeight={
                                                    700
                                                  }
                                                >
                                                  Created
                                                </Typography>
                                              </TableCell>

                                              <TableCell align="right">
                                                <Typography
                                                  fontWeight={
                                                    700
                                                  }
                                                >
                                                  Actions
                                                </Typography>
                                              </TableCell>
                                            </TableRow>
                                          </TableHead>

                                          <TableBody>
                                            {categorySubcategories.map(
                                              subcategory => (
                                                <TableRow
                                                  hover
                                                  key={
                                                    subcategory.subcategoryId
                                                  }
                                                >
                                                  <TableCell>
                                                    <Typography
                                                      fontWeight={
                                                        600
                                                      }
                                                    >
                                                      {
                                                        subcategory.name
                                                      }
                                                    </Typography>
                                                  </TableCell>

                                                  <TableCell>
                                                    <Stack
                                                      direction="row"
                                                      spacing={
                                                        0.5
                                                      }
                                                      flexWrap="wrap"
                                                      useFlexGap
                                                    >
                                                      {(
                                                        subcategory.audiences ??
                                                        []
                                                      ).length >
                                                      0 ? (
                                                        (
                                                          subcategory.audiences ??
                                                          []
                                                        ).map(
                                                          audience => (
                                                            <Chip
                                                              key={`${subcategory.subcategoryId}-${audience}`}
                                                              size="small"
                                                              label={getAudienceLabel(
                                                                audience,
                                                              )}
                                                              variant="outlined"
                                                            />
                                                          ),
                                                        )
                                                      ) : (
                                                        <Typography
                                                          variant="body2"
                                                          color="text.secondary"
                                                        >
                                                          —
                                                        </Typography>
                                                      )}
                                                    </Stack>
                                                  </TableCell>

                                                  <TableCell>
                                                    <Typography
                                                      variant="body2"
                                                      color={
                                                        subcategory.description
                                                          ? 'text.primary'
                                                          : 'text.secondary'
                                                      }
                                                      sx={{
                                                        maxWidth: 350,
                                                      }}
                                                    >
                                                      {subcategory.description ||
                                                        '—'}
                                                    </Typography>
                                                  </TableCell>

                                                  <TableCell align="center">
                                                    <Chip
                                                      size="small"
                                                      label={
                                                        subcategory.servicesCount ??
                                                        0
                                                      }
                                                    />
                                                  </TableCell>

                                                  <TableCell>
                                                    <Chip
                                                      size="small"
                                                      label={
                                                        subcategory.status ===
                                                        'ACTIVE'
                                                          ? 'Active'
                                                          : 'Inactive'
                                                      }
                                                      color={
                                                        subcategory.status ===
                                                        'ACTIVE'
                                                          ? 'success'
                                                          : 'default'
                                                      }
                                                      variant={
                                                        subcategory.status ===
                                                        'ACTIVE'
                                                          ? 'filled'
                                                          : 'outlined'
                                                      }
                                                      onClick={() =>
                                                        handleToggleSubcategoryStatus(
                                                          subcategory,
                                                        )
                                                      }
                                                      sx={{
                                                        cursor:
                                                          'pointer',
                                                      }}
                                                    />
                                                  </TableCell>

                                                  <TableCell>
                                                    <Typography
                                                      variant="body2"
                                                      color="text.secondary"
                                                    >
                                                      {formatDate(
                                                        subcategory.createdAt,
                                                      )}
                                                    </Typography>
                                                  </TableCell>

                                                  <TableCell align="right">
                                                    <Stack
                                                      direction="row"
                                                      spacing={
                                                        0.5
                                                      }
                                                      justifyContent="flex-end"
                                                    >
                                                      <Tooltip title="Edit Subcategory">
                                                        <IconButton
                                                          size="small"
                                                          onClick={() =>
                                                            handleOpenEditSubcategory(
                                                              subcategory,
                                                            )
                                                          }
                                                        >
                                                          <EditOutlined />
                                                        </IconButton>
                                                      </Tooltip>

                                                      <Tooltip title="Delete Subcategory">
                                                        <IconButton
                                                          size="small"
                                                          color="error"
                                                          onClick={() =>
                                                            setSubcategoryToDelete(
                                                              subcategory,
                                                            )
                                                          }
                                                        >
                                                          <DeleteOutlined />
                                                        </IconButton>
                                                      </Tooltip>
                                                    </Stack>
                                                  </TableCell>
                                                </TableRow>
                                              ),
                                            )}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    )}
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      },
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredCategories.length}
              page={page}
              onPageChange={(
                _event,
                nextPage,
              ) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={event => {
                setRowsPerPage(
                  Number(event.target.value),
                );
                setPage(0);
              }}
              rowsPerPageOptions={[
                5,
                10,
                25,
                50,
              ]}
            />
          </>
        )}
      </Paper>

      {/* ======================================================
          CATEGORY DIALOG
      ====================================================== */}

      <Dialog
        open={openCategoryDialog}
        onClose={
          handleCloseCategoryDialog
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingCategory
            ? 'Edit Category'
            : 'Add Category'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              required
              label="Category Name"
              placeholder="e.g. Hair"
              value={categoryForm.name}
              onChange={event =>
                setCategoryForm(
                  previous => ({
                    ...previous,
                    name: event.target.value,
                  }),
                )
              }
              autoFocus
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              placeholder="Short description of the category"
              value={
                categoryForm.description
              }
              onChange={event =>
                setCategoryForm(
                  previous => ({
                    ...previous,
                    description:
                      event.target.value,
                  }),
                )
              }
              helperText="Keep the description short and customer-friendly."
            />

            <FormControl fullWidth>
              <InputLabel>
                Status
              </InputLabel>

              <Select
                label="Status"
                value={
                  categoryForm.status
                }
                onChange={
                  handleCategoryStatusChange
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

            {errorMessage && (
              <Typography
                variant="body2"
                color="error"
              >
                {errorMessage}
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCloseCategoryDialog
            }
            disabled={
              creatingCategory ||
              updatingCategory
            }
            sx={{
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveCategory
            }
            disabled={
              creatingCategory ||
              updatingCategory
            }
            sx={{
              minWidth: 110,
              textTransform: 'none',
            }}
          >
            {creatingCategory ||
            updatingCategory ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : editingCategory ? (
              'Save Changes'
            ) : (
              'Create Category'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          SUBCATEGORY DIALOG
      ====================================================== */}

      <Dialog
        open={openSubcategoryDialog}
        onClose={
          handleCloseSubcategoryDialog
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingSubcategory
            ? 'Edit Subcategory'
            : 'Add Subcategory'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <FormControl fullWidth required>
              <InputLabel>
                Parent Category
              </InputLabel>

              <Select
                label="Parent Category"
                value={
                  subcategoryForm.categoryId
                }
                onChange={
                  handleSubcategoryCategoryChange
                }
              >
                {categories.map(
                  category => (
                    <MenuItem
                      key={
                        category.categoryId
                      }
                      value={
                        category.categoryId
                      }
                    >
                      {category.name}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="Subcategory Name"
              placeholder="e.g. Haircut"
              value={
                subcategoryForm.name
              }
              onChange={event =>
                setSubcategoryForm(
                  previous => ({
                    ...previous,
                    name: event.target.value,
                  }),
                )
              }
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              placeholder="Short description of the subcategory"
              value={
                subcategoryForm.description
              }
              onChange={event =>
                setSubcategoryForm(
                  previous => ({
                    ...previous,
                    description:
                      event.target.value,
                  }),
                )
              }
              helperText="Keep the description short and customer-friendly."
            />

            <FormControl fullWidth required>
              <InputLabel>
                Audiences
              </InputLabel>

              <Select<
                ServiceAudience[]
              >
                multiple
                value={
                  subcategoryForm.audiences
                }
                onChange={
                  handleAudienceChange
                }
                label="Audiences"
                renderValue={selected => (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {selected.map(
                      audience => (
                        <Chip
                          key={audience}
                          size="small"
                          label={getAudienceLabel(
                            audience,
                          )}
                        />
                      ),
                    )}
                  </Stack>
                )}
              >
                {AUDIENCE_OPTIONS.map(
                  option => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: -1.5,
              }}
            >
              These audiences define who can
              receive services under this
              subcategory.
            </Typography>

            <FormControl fullWidth>
              <InputLabel>
                Status
              </InputLabel>

              <Select
                label="Status"
                value={
                  subcategoryForm.status
                }
                onChange={
                  handleSubcategoryStatusChange
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

            {errorMessage && (
              <Typography
                variant="body2"
                color="error"
              >
                {errorMessage}
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCloseSubcategoryDialog
            }
            disabled={
              creatingSubcategory ||
              updatingSubcategory
            }
            sx={{
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveSubcategory
            }
            disabled={
              creatingSubcategory ||
              updatingSubcategory
            }
            sx={{
              minWidth: 130,
              textTransform: 'none',
            }}
          >
            {creatingSubcategory ||
            updatingSubcategory ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : editingSubcategory ? (
              'Save Changes'
            ) : (
              'Create Subcategory'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          DELETE CATEGORY DIALOG
      ====================================================== */}

      <Dialog
        open={Boolean(
          categoryToDelete,
        )}
        onClose={() =>
          deletingCategory
            ? undefined
            : setCategoryToDelete(null)
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Category
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete
            <strong>
              {' '}
              {categoryToDelete?.name}
            </strong>
            ?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            This action cannot be undone.
            Make sure the category does not
            contain active subcategories or
            services.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setCategoryToDelete(null)
            }
            disabled={deletingCategory}
            sx={{
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              handleDeleteCategory
            }
            disabled={deletingCategory}
            sx={{
              minWidth: 90,
              textTransform: 'none',
            }}
          >
            {deletingCategory ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          DELETE SUBCATEGORY DIALOG
      ====================================================== */}

      <Dialog
        open={Boolean(
          subcategoryToDelete,
        )}
        onClose={() =>
          deletingSubcategory
            ? undefined
            : setSubcategoryToDelete(
                null,
              )
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Subcategory
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete
            <strong>
              {' '}
              {
                subcategoryToDelete?.name
              }
            </strong>
            ?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            This action cannot be undone.
            Make sure this subcategory does
            not contain active services.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setSubcategoryToDelete(
                null,
              )
            }
            disabled={
              deletingSubcategory
            }
            sx={{
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              handleDeleteSubcategory
            }
            disabled={
              deletingSubcategory
            }
            sx={{
              minWidth: 90,
              textTransform: 'none',
            }}
          >
            {deletingSubcategory ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;