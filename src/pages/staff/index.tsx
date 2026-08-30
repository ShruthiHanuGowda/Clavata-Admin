
import { useMemo, useState } from 'react';

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
  Divider,
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

// icons
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

interface StaffMember {
  staffId: string;
  salonId: string;
  salonName: string;
  name: string;
  phoneNumber: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  profileImageUrl?: string;
  specializations: string[];
  isActive: boolean;
  createdAt: string;
}

// ==============================|| STATIC DATA ||============================== //

const initialStaff: StaffMember[] = [
  {
    staffId: 'STF-1001',
    salonId: 'SAL-1001',
    salonName: 'Glow Beauty Studio',
    name: 'Ananya Sharma',
    phoneNumber: '+91 98765 43210',
    email: 'ananya@glowbeauty.com',
    gender: 'FEMALE',
    specializations: ['Hair Styling', 'Hair Coloring'],
    isActive: true,
    createdAt: '2026-01-15'
  },
  {
    staffId: 'STF-1002',
    salonId: 'SAL-1001',
    salonName: 'Glow Beauty Studio',
    name: 'Rahul Kumar',
    phoneNumber: '+91 98765 12345',
    email: 'rahul@glowbeauty.com',
    gender: 'MALE',
    specializations: ['Haircut', 'Beard Styling'],
    isActive: true,
    createdAt: '2026-02-02'
  },
  {
    staffId: 'STF-1003',
    salonId: 'SAL-1002',
    salonName: 'Style Lounge',
    name: 'Priya Reddy',
    phoneNumber: '+91 99887 66554',
    email: 'priya@stylelounge.com',
    gender: 'FEMALE',
    specializations: ['Facial', 'Skin Care'],
    isActive: true,
    createdAt: '2026-02-10'
  },
  {
    staffId: 'STF-1004',
    salonId: 'SAL-1002',
    salonName: 'Style Lounge',
    name: 'Arjun Rao',
    phoneNumber: '+91 91234 56789',
    email: 'arjun@stylelounge.com',
    gender: 'MALE',
    specializations: ['Massage', 'Spa'],
    isActive: false,
    createdAt: '2026-02-18'
  },
  {
    staffId: 'STF-1005',
    salonId: 'SAL-1003',
    salonName: 'Urban Cuts',
    name: 'Sneha Patel',
    phoneNumber: '+91 90000 11122',
    email: 'sneha@urbancuts.com',
    gender: 'FEMALE',
    specializations: ['Makeup', 'Bridal Makeup'],
    isActive: true,
    createdAt: '2026-03-01'
  },
  {
    staffId: 'STF-1006',
    salonId: 'SAL-1003',
    salonName: 'Urban Cuts',
    name: 'Vikram Singh',
    phoneNumber: '+91 90123 45678',
    email: 'vikram@urbancuts.com',
    gender: 'MALE',
    specializations: ['Haircut', 'Hair Styling'],
    isActive: true,
    createdAt: '2026-03-08'
  },
  {
    staffId: 'STF-1007',
    salonId: 'SAL-1004',
    salonName: 'Blush & Bloom',
    name: 'Meera Nair',
    phoneNumber: '+91 90909 80808',
    email: 'meera@blushbloom.com',
    gender: 'FEMALE',
    specializations: ['Nail Care', 'Manicure', 'Pedicure'],
    isActive: true,
    createdAt: '2026-03-12'
  }
];

// ==============================|| STAFF PAGE ||============================== //

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [salonFilter, setSalonFilter] = useState('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);

  const [newStaff, setNewStaff] = useState({
    name: '',
    salonName: '',
    phoneNumber: '',
    email: '',
    gender: 'FEMALE' as StaffMember['gender'],
    specializations: ''
  });

  // ==============================|| FILTER OPTIONS ||============================== //

  const salons = useMemo(() => {
    return Array.from(new Set(staff.map((item) => item.salonName)));
  }, [staff]);

  // ==============================|| FILTER STAFF ||============================== //

  const filteredStaff = useMemo(() => {
    return staff.filter((item) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        item.name.toLowerCase().includes(searchValue) ||
        item.phoneNumber.toLowerCase().includes(searchValue) ||
        item.email.toLowerCase().includes(searchValue) ||
        item.salonName.toLowerCase().includes(searchValue) ||
        item.staffId.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      const matchesGender =
        genderFilter === 'ALL' ||
        item.gender === genderFilter;

      const matchesSalon =
        salonFilter === 'ALL' ||
        item.salonName === salonFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGender &&
        matchesSalon
      );
    });
  }, [staff, search, statusFilter, genderFilter, salonFilter]);

  // ==============================|| COUNTERS ||============================== //

  const totalStaff = staff.length;
  const activeStaff = staff.filter((item) => item.isActive).length;
  const inactiveStaff = staff.filter((item) => !item.isActive).length;

  // ==============================|| HANDLERS ||============================== //

  const handleView = (member: StaffMember) => {
    setSelectedStaff(member);
    setDetailsOpen(true);
  };

  const handleToggleStatus = (staffId: string) => {
    setStaff((previous) =>
      previous.map((item) =>
        item.staffId === staffId
          ? { ...item, isActive: !item.isActive }
          : item
      )
    );
  };

  const handleDelete = (staffId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this staff member?'
    );

    if (!confirmed) return;

    setStaff((previous) =>
      previous.filter((item) => item.staffId !== staffId)
    );
  };

  const handleAddStaff = () => {
    if (!newStaff.name.trim() || !newStaff.salonName.trim()) {
      return;
    }

    const createdStaff: StaffMember = {
      staffId: `STF-${1000 + staff.length + 1}`,
      salonId: `SAL-${1000 + staff.length + 1}`,
      salonName: newStaff.salonName,
      name: newStaff.name,
      phoneNumber: newStaff.phoneNumber,
      email: newStaff.email,
      gender: newStaff.gender,
      specializations: newStaff.specializations
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStaff((previous) => [createdStaff, ...previous]);

    setNewStaff({
      name: '',
      salonName: '',
      phoneNumber: '',
      email: '',
      gender: 'FEMALE',
      specializations: ''
    });

    setAddOpen(false);
  };

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
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Staff
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage staff members across all Clavata salons.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setAddOpen(true)}
        >
          Add Staff
        </Button>
      </Box>

      {/* SUMMARY CARDS */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.lighter',
                  color: 'primary.main'
                }}
              >
                <TeamOutlined />
              </Avatar>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Staff
                </Typography>

                <Typography variant="h4">
                  {totalStaff}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'success.lighter',
                  color: 'success.main'
                }}
              >
                <TeamOutlined />
              </Avatar>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Active Staff
                </Typography>

                <Typography variant="h4">
                  {activeStaff}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'warning.lighter',
                  color: 'warning.main'
                }}
              >
                <TeamOutlined />
              </Avatar>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Inactive Staff
                </Typography>

                <Typography variant="h4">
                  {inactiveStaff}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* FILTERS */}
      <Paper
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search staff, salon, phone or email..."
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

          <Grid item xs={12} sm={4} md={2}>
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
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
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
                <MenuItem value="ALL">All Gender</MenuItem>
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
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
        </Grid>
      </Paper>

      {/* TABLE */}
      <Paper
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Staff</TableCell>
                <TableCell>Salon</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Specializations</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredStaff
                .slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
                .map((member) => (
                  <TableRow
                    key={member.staffId}
                    hover
                    sx={{
                      '&:last-child td': {
                        borderBottom: 0
                      }
                    }}
                  >
                    {/* STAFF */}
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Avatar>
                          {member.name.charAt(0)}
                        </Avatar>

                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {member.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {member.staffId}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* SALON */}
                    <TableCell>
                      <Typography variant="body2">
                        {member.salonName}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {member.salonId}
                      </Typography>
                    </TableCell>

                    {/* CONTACT */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <PhoneOutlined
                            style={{
                              fontSize: 13
                            }}
                          />

                          <Typography variant="body2">
                            {member.phoneNumber}
                          </Typography>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <MailOutlined
                            style={{
                              fontSize: 13
                            }}
                          />

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {member.email}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>

                    {/* SPECIALIZATIONS */}
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {member.specializations
                          .slice(0, 2)
                          .map((specialization) => (
                            <Chip
                              key={specialization}
                              label={specialization}
                              size="small"
                              variant="outlined"
                            />
                          ))}

                        {member.specializations.length > 2 && (
                          <Chip
                            label={`+${member.specializations.length - 2}`}
                            size="small"
                          />
                        )}
                      </Stack>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <Chip
                        label={
                          member.isActive
                            ? 'Active'
                            : 'Inactive'
                        }
                        size="small"
                        color={
                          member.isActive
                            ? 'success'
                            : 'default'
                        }
                        variant={
                          member.isActive
                            ? 'filled'
                            : 'outlined'
                        }
                      />
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleView(member)
                            }
                          >
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleView(member)
                            }
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            member.isActive
                              ? 'Deactivate'
                              : 'Activate'
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleToggleStatus(
                                member.staffId
                              )
                            }
                          >
                            <TeamOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDelete(member.staffId)
                            }
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredStaff.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <Typography
                      variant="h6"
                      color="text.secondary"
                    >
                      No staff found
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

        <Divider />

        <TablePagination
          component="div"
          count={filteredStaff.length}
          page={page}
          onPageChange={(_, newPage) =>
            setPage(newPage)
          }
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(
              parseInt(event.target.value, 10)
            );
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* ============================== */}
      {/* STAFF DETAILS DIALOG */}
      {/* ============================== */}

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        {selectedStaff && (
          <>
            <DialogTitle>
              Staff Details
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
                    fontSize: 24
                  }}
                >
                  {selectedStaff.name.charAt(0)}
                </Avatar>

                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600 }}
                  >
                    {selectedStaff.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {selectedStaff.staffId}
                  </Typography>

                  <Chip
                    label={
                      selectedStaff.isActive
                        ? 'Active'
                        : 'Inactive'
                    }
                    size="small"
                    color={
                      selectedStaff.isActive
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
                    {selectedStaff.salonName}
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
                    {selectedStaff.gender}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Phone
                  </Typography>

                  <Typography variant="body1">
                    {selectedStaff.phoneNumber}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Email
                  </Typography>

                  <Typography variant="body1">
                    {selectedStaff.email}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Specializations
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 1 }}
                  >
                    {selectedStaff.specializations.map(
                      (specialization) => (
                        <Chip
                          key={specialization}
                          label={specialization}
                        />
                      )
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Joined
                  </Typography>

                  <Typography variant="body1">
                    {selectedStaff.createdAt}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() =>
                  handleToggleStatus(
                    selectedStaff.staffId
                  )
                }
              >
                {selectedStaff.isActive
                  ? 'Deactivate'
                  : 'Activate'}
              </Button>

              <Button
                variant="contained"
                onClick={() =>
                  setDetailsOpen(false)
                }
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ============================== */}
      {/* ADD STAFF DIALOG */}
      {/* ============================== */}

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Add Staff
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={newStaff.name}
                onChange={(event) =>
                  setNewStaff({
                    ...newStaff,
                    name: event.target.value
                  })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Salon"
                value={newStaff.salonName}
                onChange={(event) =>
                  setNewStaff({
                    ...newStaff,
                    salonName: event.target.value
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newStaff.phoneNumber}
                onChange={(event) =>
                  setNewStaff({
                    ...newStaff,
                    phoneNumber: event.target.value
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={newStaff.email}
                onChange={(event) =>
                  setNewStaff({
                    ...newStaff,
                    email: event.target.value
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>

                <Select
                  value={newStaff.gender}
                  label="Gender"
                  onChange={(event) =>
                    setNewStaff({
                      ...newStaff,
                      gender:
                        event.target.value as StaffMember['gender']
                    })
                  }
                >
                  <MenuItem value="MALE">
                    Male
                  </MenuItem>

                  <MenuItem value="FEMALE">
                    Female
                  </MenuItem>

                  <MenuItem value="OTHER">
                    Other
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specializations"
                placeholder="Hair Styling, Hair Coloring"
                helperText="Separate multiple specializations with commas."
                value={newStaff.specializations}
                onChange={(event) =>
                  setNewStaff({
                    ...newStaff,
                    specializations:
                      event.target.value
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setAddOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleAddStaff}
            disabled={
              !newStaff.name.trim() ||
              !newStaff.salonName.trim()
            }
          >
            Add Staff
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

