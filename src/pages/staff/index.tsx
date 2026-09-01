
import { useEffect, useMemo, useState } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';

// material-ui
import {
  Avatar,
  Box,
  Button,
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

// ==============================|| GRAPHQL ||============================== //

const ADMIN_SALONS = gql`
  query AdminSalons {
    adminSalons {
      success
      message
      totalCount
      salons {
        salonId
        salonName
      }
    }
  }
`;

const LIST_STAFF = gql`
  query ListStaff($salonId: ID!) {
    listStaff(salonId: $salonId) {
      staffId
      salonId
      name
      phoneNumber
      email
      gender
      profileImageUrl
      specializations
      workingHours {
        MONDAY {
          open
          close
          isWorking
        }
        TUESDAY {
          open
          close
          isWorking
        }
        WEDNESDAY {
          open
          close
          isWorking
        }
        THURSDAY {
          open
          close
          isWorking
        }
        FRIDAY {
          open
          close
          isWorking
        }
        SATURDAY {
          open
          close
          isWorking
        }
        SUNDAY {
          open
          close
          isWorking
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`;

const CREATE_STAFF = gql`
  mutation CreateStaff($input: CreateStaffInput!) {
    createStaff(input: $input) {
      success
      message
      staff {
        staffId
        salonId
        name
        phoneNumber
        email
        gender
        profileImageUrl
        specializations
        workingHours {
          MONDAY {
            open
            close
            isWorking
          }
          TUESDAY {
            open
            close
            isWorking
          }
          WEDNESDAY {
            open
            close
            isWorking
          }
          THURSDAY {
            open
            close
            isWorking
          }
          FRIDAY {
            open
            close
            isWorking
          }
          SATURDAY {
            open
            close
            isWorking
          }
          SUNDAY {
            open
            close
            isWorking
          }
        }
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_STAFF = gql`
  mutation UpdateStaff($input: UpdateStaffInput!) {
    updateStaff(input: $input) {
      success
      message
      staff {
        staffId
        salonId
        name
        phoneNumber
        email
        gender
        profileImageUrl
        specializations
        workingHours {
          MONDAY {
            open
            close
            isWorking
          }
          TUESDAY {
            open
            close
            isWorking
          }
          WEDNESDAY {
            open
            close
            isWorking
          }
          THURSDAY {
            open
            close
            isWorking
          }
          FRIDAY {
            open
            close
            isWorking
          }
          SATURDAY {
            open
            close
            isWorking
          }
          SUNDAY {
            open
            close
            isWorking
          }
        }
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

const DELETE_STAFF = gql`
  mutation DeleteStaff($input: DeleteStaffInput!) {
    deleteStaff(input: $input) {
      success
      message
      staff {
        staffId
        salonId
      }
    }
  }
`;

// ==============================|| TYPES ||============================== //

type Gender = 'MALE' | 'FEMALE' | 'OTHER';

interface BusinessDay {
  open: string;
  close: string;
  isWorking: boolean;
}

interface WorkingHours {
  MONDAY: BusinessDay;
  TUESDAY: BusinessDay;
  WEDNESDAY: BusinessDay;
  THURSDAY: BusinessDay;
  FRIDAY: BusinessDay;
  SATURDAY: BusinessDay;
  SUNDAY: BusinessDay;
}

interface StaffMember {
  staffId: string;
  salonId: string;
  salonName: string;
  name: string;
  phoneNumber: string;
  email: string;
  gender?: Gender;
  profileImageUrl?: string;
  specializations: string[];
  workingHours: WorkingHours;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface Salon {
  salonId: string;
  salonName: string;
}

// ==============================|| DEFAULT WORKING HOURS ||============================== //

const DEFAULT_WORKING_HOURS: WorkingHours = {
  MONDAY: {
    open: '09:00',
    close: '18:00',
    isWorking: true
  },
  TUESDAY: {
    open: '09:00',
    close: '18:00',
    isWorking: true
  },
  WEDNESDAY: {
    open: '09:00',
    close: '18:00',
    isWorking: true
  },
  THURSDAY: {
    open: '09:00',
    close: '18:00',
    isWorking: true
  },
  FRIDAY: {
    open: '09:00',
    close: '18:00',
    isWorking: true
  },
  SATURDAY: {
    open: '09:00',
    close: '18:00',
    isWorking: true
  },
  SUNDAY: {
    open: '09:00',
    close: '18:00',
    isWorking: false
  }
};

// ==============================|| STAFF PAGE ||============================== //

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [salonFilter, setSalonFilter] = useState('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedStaff, setSelectedStaff] =
    useState<StaffMember | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [loadingStaff, setLoadingStaff] = useState(false);

  const [newStaff, setNewStaff] = useState({
    salonId: '',
    name: '',
    phoneNumber: '',
    email: '',
    gender: 'FEMALE' as Gender,
    specializations: ''
  });

  const [editStaff, setEditStaff] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    gender: 'FEMALE' as Gender,
    specializations: ''
  });

  // ==============================|| QUERIES ||============================== //

  const [fetchSalons, { loading: loadingSalons }] =
    useLazyQuery(ADMIN_SALONS, {
      fetchPolicy: 'network-only'
    });

  const [fetchStaff] = useLazyQuery(LIST_STAFF, {
    fetchPolicy: 'network-only'
  });

  // ==============================|| MUTATIONS ||============================== //

  const [createStaff, { loading: creatingStaff }] =
    useMutation(CREATE_STAFF);

  const [updateStaff, { loading: updatingStaff }] =
    useMutation(UPDATE_STAFF);

  const [deleteStaff] = useMutation(DELETE_STAFF);

  // ==============================|| LOAD DATA ||============================== //

  const loadStaff = async (salonList: Salon[]) => {
    if (!salonList.length) {
      setStaff([]);
      return;
    }

    setLoadingStaff(true);

    try {
      const results = await Promise.all(
        salonList.map((salon) =>
          fetchStaff({
            variables: {
              salonId: salon.salonId
            }
          })
        )
      );

      const allStaff: StaffMember[] = [];

      results.forEach((result, index) => {
        const salon = salonList[index];

        const salonStaff = result.data?.listStaff || [];

        salonStaff.forEach((member: any) => {
          allStaff.push({
            ...member,
            salonName: salon.salonName
          });
        });
      });

      setStaff(allStaff);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadData = async () => {
    try {
      const result = await fetchSalons();

      if (!result.data?.adminSalons?.success) {
        console.error(
          'Failed to load salons:',
          result.data?.adminSalons?.message
        );
        return;
      }

      const salonList: Salon[] =
        result.data.adminSalons.salons || [];

      setSalons(salonList);

      await loadStaff(salonList);
    } catch (error) {
      console.error('Failed to load staff data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==============================|| FILTER STAFF ||============================== //

  const filteredStaff = useMemo(() => {
    return staff.filter((item) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        item.name?.toLowerCase().includes(searchValue) ||
        item.phoneNumber?.toLowerCase().includes(searchValue) ||
        item.email?.toLowerCase().includes(searchValue) ||
        item.salonName?.toLowerCase().includes(searchValue) ||
        item.staffId?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      const matchesGender =
        genderFilter === 'ALL' ||
        item.gender === genderFilter;

      const matchesSalon =
        salonFilter === 'ALL' ||
        item.salonId === salonFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGender &&
        matchesSalon
      );
    });
  }, [
    staff,
    search,
    statusFilter,
    genderFilter,
    salonFilter
  ]);

  // ==============================|| COUNTERS ||============================== //

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (item) => item.isActive
  ).length;

  const inactiveStaff = staff.filter(
    (item) => !item.isActive
  ).length;

  // ==============================|| HANDLERS ||============================== //

  const handleView = (member: StaffMember) => {
    setSelectedStaff(member);
    setDetailsOpen(true);
  };

  const handleEditOpen = (member: StaffMember) => {
    setSelectedStaff(member);

    setEditStaff({
      name: member.name || '',
      phoneNumber: member.phoneNumber || '',
      email: member.email || '',
      gender: member.gender || 'FEMALE',
      specializations:
        member.specializations?.join(', ') || ''
    });

    setEditOpen(true);
  };

  // ==============================|| TOGGLE STATUS ||============================== //

  const handleToggleStatus = async (member: StaffMember) => {
    try {
      const result = await updateStaff({
        variables: {
          input: {
            salonId: member.salonId,
            staffId: member.staffId,
            isActive: !member.isActive
          }
        }
      });

      if (!result.data?.updateStaff?.success) {
        window.alert(
          result.data?.updateStaff?.message ||
            'Failed to update staff status.'
        );
        return;
      }

      const updated = result.data.updateStaff.staff;

      setStaff((previous) =>
        previous.map((item) =>
          item.staffId === member.staffId
            ? {
                ...item,
                ...updated,
                salonName: member.salonName
              }
            : item
        )
      );

      setSelectedStaff((previous) =>
        previous && previous.staffId === member.staffId
          ? {
              ...previous,
              isActive: !previous.isActive
            }
          : previous
      );
    } catch (error) {
      console.error('Failed to toggle staff status:', error);
      window.alert('Failed to update staff status.');
    }
  };

  // ==============================|| DELETE ||============================== //

  const handleDelete = async (member: StaffMember) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.name}?`
    );

    if (!confirmed) return;

    try {
      const result = await deleteStaff({
        variables: {
          input: {
            salonId: member.salonId,
            staffId: member.staffId
          }
        }
      });

      if (!result.data?.deleteStaff?.success) {
        window.alert(
          result.data?.deleteStaff?.message ||
            'Failed to delete staff.'
        );
        return;
      }

      setStaff((previous) =>
        previous.filter(
          (item) => item.staffId !== member.staffId
        )
      );

      if (
        selectedStaff &&
        selectedStaff.staffId === member.staffId
      ) {
        setSelectedStaff(null);
        setDetailsOpen(false);
        setEditOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
      window.alert('Failed to delete staff.');
    }
  };

  // ==============================|| ADD STAFF ||============================== //

  const handleAddStaff = async () => {
    if (
      !newStaff.salonId ||
      !newStaff.name.trim() ||
      !newStaff.phoneNumber.trim()
    ) {
      return;
    }

    try {
      const result = await createStaff({
        variables: {
          input: {
            salonId: newStaff.salonId,
            name: newStaff.name.trim(),
            phoneNumber: newStaff.phoneNumber.trim(),
            email: newStaff.email.trim() || null,
            gender: newStaff.gender,
            profileImageUrl: null,
            specializations: newStaff.specializations
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            workingHours: DEFAULT_WORKING_HOURS
          }
        }
      });

      if (!result.data?.createStaff?.success) {
        window.alert(
          result.data?.createStaff?.message ||
            'Failed to create staff.'
        );
        return;
      }

      const created = result.data.createStaff.staff;

      const selectedSalon = salons.find(
        (salon) => salon.salonId === newStaff.salonId
      );

      if (created) {
        setStaff((previous) => [
          {
            ...created,
            salonName:
              selectedSalon?.salonName || 'Unknown Salon'
          },
          ...previous
        ]);
      }

      setNewStaff({
        salonId: '',
        name: '',
        phoneNumber: '',
        email: '',
        gender: 'FEMALE',
        specializations: ''
      });

      setAddOpen(false);
    } catch (error) {
      console.error('Failed to create staff:', error);
      window.alert('Failed to create staff.');
    }
  };

  // ==============================|| EDIT STAFF ||============================== //

  const handleUpdateStaff = async () => {
    if (!selectedStaff || !editStaff.name.trim()) {
      return;
    }

    try {
      const result = await updateStaff({
        variables: {
          input: {
            salonId: selectedStaff.salonId,
            staffId: selectedStaff.staffId,
            name: editStaff.name.trim(),
            phoneNumber: editStaff.phoneNumber.trim(),
            email: editStaff.email.trim() || null,
            gender: editStaff.gender,
            specializations: editStaff.specializations
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          }
        }
      });

      if (!result.data?.updateStaff?.success) {
        window.alert(
          result.data?.updateStaff?.message ||
            'Failed to update staff.'
        );
        return;
      }

      const updated = result.data.updateStaff.staff;

      if (updated) {
        setStaff((previous) =>
          previous.map((item) =>
            item.staffId === selectedStaff.staffId
              ? {
                  ...item,
                  ...updated,
                  salonName: selectedStaff.salonName
                }
              : item
          )
        );

        setSelectedStaff({
          ...selectedStaff,
          ...updated,
          salonName: selectedStaff.salonName
        });
      }

      setEditOpen(false);
    } catch (error) {
      console.error('Failed to update staff:', error);
      window.alert('Failed to update staff.');
    }
  };

  // ==============================|| RENDER ||============================== //

  const isLoading =
    loadingSalons || loadingStaff;

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

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Manage staff members across all Clavata salons.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setAddOpen(true)}
          disabled={!salons.length}
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
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total Staff
                </Typography>

                <Typography variant="h4">
                  {isLoading ? '—' : totalStaff}
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
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Active Staff
                </Typography>

                <Typography variant="h4">
                  {isLoading ? '—' : activeStaff}
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
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Inactive Staff
                </Typography>

                <Typography variant="h4">
                  {isLoading ? '—' : inactiveStaff}
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
                <MenuItem value="ALL">
                  All Gender
                </MenuItem>

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
                <MenuItem value="ALL">
                  All Salons
                </MenuItem>

                {salons.map((salon) => (
                  <MenuItem
                    key={salon.salonId}
                    value={salon.salonId}
                  >
                    {salon.salonName}
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
                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <CircularProgress size={32} />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      Loading staff...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff
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
                          <Avatar
                            src={
                              member.profileImageUrl ||
                              undefined
                            }
                          >
                            {!member.profileImageUrl &&
                              member.name?.charAt(0)}
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
                              style={{ fontSize: 13 }}
                            />

                            <Typography variant="body2">
                              {member.phoneNumber}
                            </Typography>
                          </Stack>

                          {member.email && (
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <MailOutlined
                                style={{ fontSize: 13 }}
                              />

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {member.email}
                              </Typography>
                            </Stack>
                          )}
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
                            ?.slice(0, 2)
                            .map((specialization) => (
                              <Chip
                                key={specialization}
                                label={specialization}
                                size="small"
                                variant="outlined"
                              />
                            ))}

                          {member.specializations?.length >
                            2 && (
                            <Chip
                              label={`+${
                                member.specializations
                                  .length - 2
                              }`}
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
                                handleEditOpen(member)
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
                                handleToggleStatus(member)
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
                                handleDelete(member)
                              }
                            >
                              <DeleteOutlined />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
              )}

              {!isLoading &&
                filteredStaff.length === 0 && (
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
      {/* STAFF DETAILS */}
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
                  src={
                    selectedStaff.profileImageUrl ||
                    undefined
                  }
                  sx={{
                    width: 64,
                    height: 64,
                    fontSize: 24
                  }}
                >
                  {!selectedStaff.profileImageUrl &&
                    selectedStaff.name?.charAt(0)}
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
                    {selectedStaff.gender || '—'}
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
                    {selectedStaff.email || '—'}
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
                    {selectedStaff.specializations?.map(
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
                    {selectedStaff.createdAt
                      ? new Date(
                          selectedStaff.createdAt
                        ).toLocaleDateString()
                      : '—'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() =>
                  handleToggleStatus(selectedStaff)
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
      {/* ADD STAFF */}
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
              <FormControl fullWidth>
                <InputLabel>Salon</InputLabel>

                <Select
                  value={newStaff.salonId}
                  label="Salon"
                  onChange={(event) =>
                    setNewStaff({
                      ...newStaff,
                      salonId: event.target.value
                    })
                  }
                >
                  <MenuItem value="">
                    Select Salon
                  </MenuItem>

                  {salons.map((salon) => (
                    <MenuItem
                      key={salon.salonId}
                      value={salon.salonId}
                    >
                      {salon.salonName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

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
                        event.target.value as Gender
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
              creatingStaff ||
              !newStaff.salonId ||
              !newStaff.name.trim() ||
              !newStaff.phoneNumber.trim()
            }
          >
            {creatingStaff
              ? 'Adding...'
              : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================== */}
      {/* EDIT STAFF */}
      {/* ============================== */}

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Edit Staff
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={editStaff.name}
                onChange={(event) =>
                  setEditStaff({
                    ...editStaff,
                    name: event.target.value
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editStaff.phoneNumber}
                onChange={(event) =>
                  setEditStaff({
                    ...editStaff,
                    phoneNumber:
                      event.target.value
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={editStaff.email}
                onChange={(event) =>
                  setEditStaff({
                    ...editStaff,
                    email: event.target.value
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>

                <Select
                  value={editStaff.gender}
                  label="Gender"
                  onChange={(event) =>
                    setEditStaff({
                      ...editStaff,
                      gender:
                        event.target.value as Gender
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
                value={editStaff.specializations}
                onChange={(event) =>
                  setEditStaff({
                    ...editStaff,
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
            onClick={() => setEditOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdateStaff}
            disabled={
              updatingStaff ||
              !editStaff.name.trim()
            }
          >
            {updatingStaff
              ? 'Saving...'
              : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

