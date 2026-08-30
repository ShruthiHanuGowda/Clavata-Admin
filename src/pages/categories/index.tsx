
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

// icons
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  TagsOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

interface Category {
  id: string;
  name: string;
  description: string;
  servicesCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

// ==============================|| STATIC DATA ||============================== //

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'CAT001',
    name: 'Hair',
    description: 'Haircuts, styling, coloring and hair treatments',
    servicesCount: 24,
    status: 'ACTIVE',
    createdAt: '12 Aug 2026'
  },
  {
    id: 'CAT002',
    name: 'Skin',
    description: 'Facials, cleanup, skin treatments and skincare',
    servicesCount: 18,
    status: 'ACTIVE',
    createdAt: '12 Aug 2026'
  },
  {
    id: 'CAT003',
    name: 'Nails',
    description: 'Manicure, pedicure, nail art and nail care',
    servicesCount: 12,
    status: 'ACTIVE',
    createdAt: '13 Aug 2026'
  },
  {
    id: 'CAT004',
    name: 'Makeup',
    description: 'Party, bridal, engagement and professional makeup',
    servicesCount: 15,
    status: 'ACTIVE',
    createdAt: '13 Aug 2026'
  },
  {
    id: 'CAT005',
    name: 'Spa',
    description: 'Relaxation, massage and wellness services',
    servicesCount: 10,
    status: 'ACTIVE',
    createdAt: '14 Aug 2026'
  },
  {
    id: 'CAT006',
    name: 'Bridal',
    description: 'Bridal packages and wedding preparation services',
    servicesCount: 8,
    status: 'ACTIVE',
    createdAt: '14 Aug 2026'
  },
  {
    id: 'CAT007',
    name: 'Hair Removal',
    description: 'Waxing, threading and other hair removal services',
    servicesCount: 9,
    status: 'ACTIVE',
    createdAt: '15 Aug 2026'
  },
  {
    id: 'CAT008',
    name: 'Men Grooming',
    description: 'Men-specific grooming and personal care services',
    servicesCount: 14,
    status: 'ACTIVE',
    createdAt: '15 Aug 2026'
  },
  {
    id: 'CAT009',
    name: 'Beauty Packages',
    description: 'Combined beauty and salon service packages',
    servicesCount: 6,
    status: 'INACTIVE',
    createdAt: '16 Aug 2026'
  }
];

// ==============================|| CATEGORY FORM ||============================== //

interface CategoryForm {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const EMPTY_FORM: CategoryForm = {
  name: '',
  description: '',
  status: 'ACTIVE'
};

// ==============================|| MAIN COMPONENT ||============================== //

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // ==============================|| FILTERING ||============================== //

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || category.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // ==============================|| COUNTERS ||============================== //

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.status === 'ACTIVE'
  ).length;

  const inactiveCategories = categories.filter(
    (category) => category.status === 'INACTIVE'
  ).length;

  const totalServices = categories.reduce(
    (total, category) => total + category.servicesCount,
    0
  );

  // ==============================|| HANDLERS ||============================== //

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setOpenDialog(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);

    setForm({
      name: category.name,
      description: category.description,
      status: category.status
    });

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
  };

  const handleInputChange = (
    field: keyof CategoryForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setForm((previous) => ({
      ...previous,
      status: event.target.value as 'ACTIVE' | 'INACTIVE'
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      return;
    }

    if (editingCategory) {
      setCategories((previous) =>
        previous.map((category) =>
          category.id === editingCategory.id
            ? {
                ...category,
                name: form.name.trim(),
                description: form.description.trim(),
                status: form.status
              }
            : category
        )
      );
    } else {
      const newCategory: Category = {
        id: `CAT${String(categories.length + 1).padStart(3, '0')}`,
        name: form.name.trim(),
        description: form.description.trim(),
        servicesCount: 0,
        status: form.status,
        createdAt: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      };

      setCategories((previous) => [newCategory, ...previous]);
    }

    handleCloseDialog();
  };

  const handleOpenDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialog(true);
  };

  const handleCloseDelete = () => {
    setDeleteDialog(false);
    setCategoryToDelete(null);
  };

  const handleDelete = () => {
    if (!categoryToDelete) return;

    setCategories((previous) =>
      previous.filter(
        (category) => category.id !== categoryToDelete.id
      )
    );

    handleCloseDelete();
  };

  const handleToggleStatus = (category: Category) => {
    setCategories((previous) =>
      previous.map((item) =>
        item.id === category.id
          ? {
              ...item,
              status:
                item.status === 'ACTIVE'
                  ? 'INACTIVE'
                  : 'ACTIVE'
            }
          : item
      )
    );
  };

  // ==============================|| SUMMARY CARD ||============================== //

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
        background: 'background.paper'
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

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* PAGE HEADER */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Categories
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage service categories available across Clavata.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={handleOpenCreate}
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

      {/* SUMMARY */}
      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Categories"
            value={totalCategories}
            subtitle="All configured categories"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Active"
            value={activeCategories}
            subtitle="Currently available"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Inactive"
            value={inactiveCategories}
            subtitle="Currently disabled"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Services"
            value={totalServices}
            subtitle="Services across categories"
          />
        </Grid>
      </Grid>

      {/* TABLE CARD */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* FILTER HEADER */}
        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
          >
            <TextField
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
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

            <Select
              value={statusFilter}
              size="small"
              onChange={(event) => {
                setStatusFilter(
                  event.target.value as
                    | 'ALL'
                    | 'ACTIVE'
                    | 'INACTIVE'
                );
                setPage(0);
              }}
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
                <TableCell sx={{ fontWeight: 700 }}>
                  Category
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Description
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: 700 }}
                >
                  Services
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Created
                </TableCell>

                <TableCell
                  align="right"
                  sx={{ fontWeight: 700 }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredCategories
                .slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
                .map((category) => (
                  <TableRow
                    key={category.id}
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'primary.lighter',
                            color: 'primary.main'
                          }}
                        >
                          <TagsOutlined
                            style={{ fontSize: 19 }}
                          />
                        </Box>

                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {category.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {category.id}
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
                        {category.description || '—'}
                      </Typography>
                    </TableCell>

                    {/* SERVICES */}
                    <TableCell align="center">
                      <Chip
                        label={category.servicesCount}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <Chip
                        label={category.status}
                        size="small"
                        color={
                          category.status === 'ACTIVE'
                            ? 'success'
                            : 'default'
                        }
                        variant="outlined"
                        onClick={() =>
                          handleToggleStatus(category)
                        }
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>

                    {/* CREATED */}
                    <TableCell>
                      <Typography variant="body2">
                        {category.createdAt}
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
                              handleOpenEdit(category)
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
                              handleOpenDelete(category)
                            }
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 8 }}
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
          count={filteredCategories.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(
              parseInt(event.target.value, 10)
            );
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* ==============================|| CREATE / EDIT DIALOG ||============================== */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingCategory
            ? 'Edit Category'
            : 'Add Category'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
              fullWidth
              required
              value={form.name}
              onChange={(event) =>
                handleInputChange(
                  'name',
                  event.target.value
                )
              }
              placeholder="e.g. Hair"
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={form.description}
              onChange={(event) =>
                handleInputChange(
                  'description',
                  event.target.value
                )
              }
              placeholder="Describe what services belong to this category"
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.75, display: 'block' }}
              >
                Status
              </Typography>

              <Select
                fullWidth
                value={form.status}
                onChange={handleStatusChange}
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

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCloseDialog}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.name.trim()}
          >
            {editingCategory
              ? 'Save Changes'
              : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==============================|| DELETE DIALOG ||============================== */}

      <Dialog
        open={deleteDialog}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Category
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete{' '}
            <strong>
              {categoryToDelete?.name}
            </strong>
            ?
          </Typography>

          {categoryToDelete &&
            categoryToDelete.servicesCount > 0 && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 2 }}
              >
                This category currently contains{' '}
                {categoryToDelete.servicesCount} services.
                In the production version, categories with
                existing services should normally be
                deactivated instead of deleted.
              </Typography>
            )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCloseDelete}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

