import { useMemo, useState } from 'react';

// material-ui
import {
  Box,
  Chip,
  Grid,
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
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SearchOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

interface AuditLog {
  id: string;
  admin: string;
  action: string;
  module: string;
  target: string;
  description: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
}

// ==============================|| DATA ||============================== //

const logs: AuditLog[] = [
  {
    id: 'LOG001',
    admin: 'Clavata Super Admin',
    action: 'APPROVED',
    module: 'Salon Applications',
    target: 'Glow Beauty Studio',
    description: 'Salon application approved',
    timestamp: '30 Aug 2026, 10:31 AM',
    status: 'SUCCESS'
  },
  {
    id: 'LOG002',
    admin: 'Operations Admin',
    action: 'UPDATED',
    module: 'Salons',
    target: 'Salon SALON102',
    description: 'Updated salon visibility status',
    timestamp: '30 Aug 2026, 10:12 AM',
    status: 'SUCCESS'
  },
  {
    id: 'LOG003',
    admin: 'Finance Admin',
    action: 'REFUND',
    module: 'Refunds',
    target: 'Booking BK1023',
    description: 'Refund initiated for customer',
    timestamp: '30 Aug 2026, 09:54 AM',
    status: 'SUCCESS'
  },
  {
    id: 'LOG004',
    admin: 'Verification Admin',
    action: 'REJECTED',
    module: 'KYC / Documents',
    target: 'Salon SALON099',
    description: 'KYC documents rejected',
    timestamp: '29 Aug 2026, 05:22 PM',
    status: 'SUCCESS'
  },
  {
    id: 'LOG005',
    admin: 'Clavata Super Admin',
    action: 'UPDATED',
    module: 'Roles & Permissions',
    target: 'FINANCE_ADMIN',
    description: 'Permission configuration updated',
    timestamp: '29 Aug 2026, 03:18 PM',
    status: 'SUCCESS'
  },
  {
    id: 'LOG006',
    admin: 'Support Admin',
    action: 'UPDATED',
    module: 'Bookings',
    target: 'Booking BK1001',
    description: 'Booking status changed',
    timestamp: '29 Aug 2026, 01:40 PM',
    status: 'SUCCESS'
  }
];

// ==============================|| COMPONENT ||============================== //

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredLogs = useMemo(() => {
    const value = search.toLowerCase();

    return logs.filter(
      (log) =>
        log.admin.toLowerCase().includes(value) ||
        log.action.toLowerCase().includes(value) ||
        log.module.toLowerCase().includes(value) ||
        log.target.toLowerCase().includes(value) ||
        log.description.toLowerCase().includes(value)
    );
  }, [search]);

  return (
    <Box>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Typography variant="h4">
            Audit Logs
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Track important actions performed across the Clavata admin
            platform.
          </Typography>
        </Grid>

        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchOutlined style={{ marginRight: 8 }} />
              )
            }}
          />
        </Grid>
      </Grid>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography color="text.secondary" variant="body2">
              Total Events
            </Typography>

            <Typography variant="h3" sx={{ mt: 1 }}>
              {logs.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography color="text.secondary" variant="body2">
              Successful
            </Typography>

            <Typography variant="h3" sx={{ mt: 1 }}>
              {logs.filter((log) => log.status === 'SUCCESS').length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography color="text.secondary" variant="body2">
              Failed
            </Typography>

            <Typography variant="h3" sx={{ mt: 1 }}>
              {logs.filter((log) => log.status === 'FAILED').length}
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
                <TableCell>Action</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredLogs
                .slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
                .map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {log.admin}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>{log.module}</TableCell>

                    <TableCell>{log.target}</TableCell>

                    <TableCell>{log.description}</TableCell>

                    <TableCell>{log.timestamp}</TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={log.status}
                        color={
                          log.status === 'SUCCESS'
                            ? 'success'
                            : 'error'
                        }
                        icon={
                          log.status === 'SUCCESS' ? (
                            <CheckCircleOutlined />
                          ) : (
                            <CloseCircleOutlined />
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredLogs.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
}