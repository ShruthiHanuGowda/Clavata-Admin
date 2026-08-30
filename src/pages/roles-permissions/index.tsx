import { useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';

// icons
import {
  CheckOutlined,
  LockOutlined,
  SaveOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

interface PermissionGroup {
  name: string;
  permissions: string[];
}

// ==============================|| PERMISSIONS ||============================== //

const permissionGroups: PermissionGroup[] = [
  {
    name: 'Dashboard',
    permissions: ['View Dashboard', 'View Analytics']
  },
  {
    name: 'Customers',
    permissions: [
      'View Customers',
      'Create Customer',
      'Edit Customer',
      'Delete Customer',
      'Export Customers'
    ]
  },
  {
    name: 'Salons',
    permissions: [
      'View Salons',
      'Create Salon',
      'Edit Salon',
      'Suspend Salon',
      'Delete Salon'
    ]
  },
  {
    name: 'Staff',
    permissions: [
      'View Staff',
      'Create Staff',
      'Edit Staff',
      'Deactivate Staff'
    ]
  },
  {
    name: 'Services',
    permissions: [
      'View Services',
      'Create Service',
      'Edit Service',
      'Delete Service'
    ]
  },
  {
    name: 'Bookings',
    permissions: [
      'View Bookings',
      'Edit Booking',
      'Cancel Booking',
      'Export Bookings'
    ]
  },
  {
    name: 'Reviews',
    permissions: [
      'View Reviews',
      'Moderate Reviews',
      'Delete Review'
    ]
  },
  {
    name: 'Finance',
    permissions: [
      'View Payments',
      'View Transactions',
      'Process Refunds',
      'View Revenue'
    ]
  },
  {
    name: 'Verification',
    permissions: [
      'View Applications',
      'Review KYC',
      'Approve Salon',
      'Reject Salon'
    ]
  },
  {
    name: 'Operations',
    permissions: [
      'Manage Locations',
      'Manage Categories',
      'Send Notifications',
      'Manage Support'
    ]
  },
  {
    name: 'System',
    permissions: [
      'Manage Admin Users',
      'Manage Roles',
      'View Audit Logs',
      'Manage Settings'
    ]
  }
];

const roles = [
  'SUPER_ADMIN',
  'ADMIN',
  'OPERATIONS_ADMIN',
  'FINANCE_ADMIN',
  'VERIFICATION_ADMIN',
  'SUPPORT_ADMIN',
  'CONTENT_ADMIN'
];

// ==============================|| COMPONENT ||============================== //

export default function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');

  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};

      permissionGroups.forEach((group) => {
        group.permissions.forEach((permission) => {
          initial[permission] = selectedRole === 'SUPER_ADMIN';
        });
      });

      return initial;
    }
  );

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);

    const newPermissions: Record<string, boolean> = {};

    permissionGroups.forEach((group) => {
      group.permissions.forEach((permission) => {
        if (role === 'SUPER_ADMIN') {
          newPermissions[permission] = true;
        } else {
          newPermissions[permission] = false;
        }
      });
    });

    setPermissions(newPermissions);
  };

  const togglePermission = (permission: string) => {
    if (selectedRole === 'SUPER_ADMIN') return;

    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const selectAll = (group: PermissionGroup) => {
    if (selectedRole === 'SUPER_ADMIN') return;

    const allSelected = group.permissions.every(
      (permission) => permissions[permission]
    );

    setPermissions((prev) => {
      const updated = { ...prev };

      group.permissions.forEach((permission) => {
        updated[permission] = !allSelected;
      });

      return updated;
    });
  };

  const handleSave = () => {
    console.log('Saving permissions:', {
      role: selectedRole,
      permissions
    });

    alert(`Permissions saved for ${selectedRole}`);
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">
            Roles & Permissions
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Control exactly what each administrator can access and manage.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
        >
          Save Permissions
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Roles */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Roles
            </Typography>

            <Stack spacing={0.5}>
              {roles.map((role) => (
                <Button
                  key={role}
                  fullWidth
                  onClick={() => handleRoleChange(role)}
                  sx={{
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.2,
                    borderRadius: 1,
                    bgcolor:
                      selectedRole === role
                        ? 'primary.lighter'
                        : 'transparent',
                    color:
                      selectedRole === role
                        ? 'primary.main'
                        : 'text.primary'
                  }}
                >
                  {role}
                </Button>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Permissions */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 3 }}
            >
              <LockOutlined />

              <Typography variant="h5">
                {selectedRole}
              </Typography>

              {selectedRole === 'SUPER_ADMIN' && (
                <Chip
                  label="Full Access"
                  color="success"
                  size="small"
                />
              )}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={3}>
              {permissionGroups.map((group) => {
                const allSelected = group.permissions.every(
                  (permission) => permissions[permission]
                );

                return (
                  <Box key={group.name}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography fontWeight={600}>
                        {group.name}
                      </Typography>

                      <Button
                        size="small"
                        onClick={() => selectAll(group)}
                        disabled={selectedRole === 'SUPER_ADMIN'}
                      >
                        {allSelected ? 'Clear All' : 'Select All'}
                      </Button>
                    </Stack>

                    <Grid container>
                      {group.permissions.map((permission) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          key={permission}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={
                                  permissions[permission] || false
                                }
                                disabled={
                                  selectedRole === 'SUPER_ADMIN'
                                }
                                onChange={() =>
                                  togglePermission(permission)
                                }
                                icon={<CheckOutlined />}
                              />
                            }
                            label={permission}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}