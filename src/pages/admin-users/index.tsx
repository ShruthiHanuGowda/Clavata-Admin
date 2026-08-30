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
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

// icons
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  createdAt: string;
}

// ==============================|| STATIC DATA ||============================== //

const initialUsers: AdminUser[] = [
  {
    id: 'ADM001',
    name: 'Clavata Super Admin',
    email: 'admin@clavata.com',
    phone: '+91 9876543210',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    lastLogin: '30 Aug 2026, 10:32 AM',
    createdAt: '01 Aug 2026'
  },
  {
    id: 'ADM002',
    name: 'Operations Admin',
    email: 'operations@clavata.com',
    phone: '+91 9876543211',
    role: 'OPERATIONS_ADMIN',
    status: 'ACTIVE',
    lastLogin: '30 Aug 2026, 09:14 AM',
    createdAt: '05 Aug 2026'
  },
  {
    id: 'ADM003',
    name: 'Finance Admin',
    email: 'finance@clavata.com',
    phone: '+91 9876543212',
    role: 'FINANCE_ADMIN',
    status: 'ACTIVE',
    lastLogin: '29 Aug 2026, 06:42 PM',
    createdAt: '08 Aug 2026'
  },
  {
    id: 'ADM004',
    name: 'Support Admin',
    email: 'support@clavata.com',
    phone: '+91 9876543213',
    role: 'SUPPORT_ADMIN',
    status: 'INACTIVE',
    lastLogin: '27 Aug 2026, 02:11 PM',
    createdAt: '10 Aug 2026'
  }
];

// ==============================|| COMPONENT ||============================== //

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'ADMIN'
  });

  const filteredUsers = useMemo(() => {
    const value = search.toLowerCase();

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value)
    );
  }, [users, search]);

  const handleOpenAdd = () => {
    setEditingUser(null);

    setForm({
      name: '',
      email: '',
      phone: '',
      role: 'ADMIN'
    });

    setOpenDialog(true);
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });

    setOpenDialog(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;

    if (editingUser) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                ...form
              }
            : user
        )
      );
    } else {
      const newUser: AdminUser = {
        id: `ADM${String(users.length + 1).padStart(3, '0')}`,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        status: 'ACTIVE',
        lastLogin: 'Never',
        createdAt: '30 Aug 2026'
      };

      setUsers((prev) => [...prev, newUser]);
    }

    setOpenDialog(false);
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  return (
    <Box>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4">Admin Users</Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage administrators and their access to the Clavata platform.
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            <TextField
              size="small"
              placeholder="Search administrators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchOutlined style={{ marginRight: 8 }} />
                )
              }}
            />

            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={handleOpenAdd}
            >
              Add Admin
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Total Admins
            </Typography>

            <Typography variant="h3" sx={{ mt: 1 }}>
              {users.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Active Admins
            </Typography>

            <Typography variant="h3" sx={{ mt: 1 }}>
              {users.filter((user) => user.status === 'ACTIVE').length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Roles Assigned
            </Typography>

            <Typography variant="h3" sx={{ mt: 1 }}>
              {new Set(users.map((user) => user.role)).size}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Administrator</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'primary.lighter',
                            color: 'primary.main'
                          }}
                        >
                          <UserOutlined />
                        </Box>

                        <Box>
                          <Typography fontWeight={600}>
                            {user.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={
                          user.status === 'ACTIVE' ? 'success' : 'default'
                        }
                      />
                    </TableCell>

                    <TableCell>{user.lastLogin}</TableCell>

                    <TableCell>{user.createdAt}</TableCell>

                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(user)}
                      >
                        <EditOutlined />
                      </IconButton>

                      {user.role !== 'SUPER_ADMIN' && (
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(user.id)}
                        >
                          <DeleteOutlined />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No administrators found.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
        />
      </Paper>

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Edit Administrator' : 'Add Administrator'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value
                }))
              }
            />

            <TextField
              label="Email"
              fullWidth
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value
                }))
              }
            />

            <TextField
              label="Phone"
              fullWidth
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  phone: e.target.value
                }))
              }
            />

            <TextField
              select
              label="Role"
              fullWidth
              SelectProps={{ native: true }}
              value={form.role}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  role: e.target.value
                }))
              }
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="OPERATIONS_ADMIN">
                OPERATIONS_ADMIN
              </option>
              <option value="FINANCE_ADMIN">FINANCE_ADMIN</option>
              <option value="VERIFICATION_ADMIN">
                VERIFICATION_ADMIN
              </option>
              <option value="SUPPORT_ADMIN">SUPPORT_ADMIN</option>
              <option value="CONTENT_ADMIN">CONTENT_ADMIN</option>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>

          <Button variant="contained" onClick={handleSave}>
            {editingUser ? 'Update' : 'Create Admin'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}