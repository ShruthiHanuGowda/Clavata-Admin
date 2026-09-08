import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { gql, useMutation, useQuery } from '@apollo/client';
import { ADMIN_APPROVE_OFFER, ADMIN_OFFERS, ADMIN_REJECT_OFFER } from '../../graphql/queries';
/* =========================================================
   TYPES
========================================================= */

type OfferStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'PAUSED'
  | 'EXPIRED'
  | 'REJECTED';

type OfferDiscountType =
  | 'PERCENTAGE'
  | 'FIXED';

type Offer = {
  offerId: string;
  salonId: string;
  title: string;
  description: string;
  discountType: OfferDiscountType;
  discountValue: number;
  couponCode?: string | null;
  minimumBookingAmount?: number | null;
  category?: string | null;
  serviceIds: string[];
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usageCount: number;
  customerLimit?: number | null;
  status: OfferStatus;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminOffersResponse = {
  adminOffers: {
    success: boolean;
    message: string;
    totalCount: number;
    offers: Offer[];
  };
};

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (
  value?: string | null,
) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};

const formatDateTime = (
  value?: string | null,
) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};

const getDiscountText = (
  offer: Offer,
) => {
  if (
    offer.discountType ===
    'PERCENTAGE'
  ) {
    return `${offer.discountValue}% OFF`;
  }

  return `₹${offer.discountValue} OFF`;
};

const getStatusColor = (
  status: OfferStatus,
) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';

    case 'PENDING_APPROVAL':
      return 'warning';

    case 'REJECTED':
      return 'error';

    case 'PAUSED':
      return 'default';

    case 'EXPIRED':
      return 'default';

    case 'DRAFT':
      return 'info';

    default:
      return 'default';
  }
};

const getStatusLabel = (
  status: OfferStatus,
) => {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'Pending Approval';

    case 'ACTIVE':
      return 'Active';

    case 'REJECTED':
      return 'Rejected';

    case 'PAUSED':
      return 'Paused';

    case 'EXPIRED':
      return 'Expired';

    case 'DRAFT':
      return 'Draft';

    default:
      return status;
  }
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Offer() {
  const [search, setSearch] =
    useState('');

  const [status, setStatus] =
    useState<
      OfferStatus | ''
    >('');

  const [selectedOffer, setSelectedOffer] =
    useState<Offer | null>(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [rejectOpen, setRejectOpen] =
    useState(false);

  const [rejectReason, setRejectReason] =
    useState('');

  const [approveLoading, setApproveLoading] =
    useState(false);

  const [rejectLoading, setRejectLoading] =
    useState(false);

  /* =======================================================
     QUERY
  ======================================================= */

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<AdminOffersResponse>(
    ADMIN_OFFERS,
    {
      variables: {
        search:
          search.trim() || null,

        status:
          status || null,

        salonId: null,
      },

      fetchPolicy: 'network-only',
    },
  );

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [
    approveOffer,
  ] = useMutation(
    ADMIN_APPROVE_OFFER,
  );

  const [
    rejectOffer,
  ] = useMutation(
    ADMIN_REJECT_OFFER,
  );

  /* =======================================================
     OFFERS
  ======================================================= */

  const offers =
    data?.adminOffers?.offers || [];

  const totalCount =
    data?.adminOffers?.totalCount || 0;

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    return {
      all: offers.length,

      pending: offers.filter(
        offer =>
          offer.status ===
          'PENDING_APPROVAL',
      ).length,

      active: offers.filter(
        offer =>
          offer.status === 'ACTIVE',
      ).length,

      rejected: offers.filter(
        offer =>
          offer.status === 'REJECTED',
      ).length,

      paused: offers.filter(
        offer =>
          offer.status === 'PAUSED',
      ).length,

      expired: offers.filter(
        offer =>
          offer.status === 'EXPIRED',
      ).length,

      draft: offers.filter(
        offer =>
          offer.status === 'DRAFT',
      ).length,
    };
  }, [offers]);

  /* =======================================================
     STATUS CHANGE
  ======================================================= */

  const handleStatusChange = (
    event: SelectChangeEvent,
  ) => {
    setStatus(
      event.target.value as
        | OfferStatus
        | '',
    );
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error(
        'Failed to refresh offers:',
        err,
      );
    }
  };

  /* =======================================================
     APPROVE
  ======================================================= */

  const handleApprove = async (
    offer: Offer,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to approve "${offer.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setApproveLoading(true);

      const result =
        await approveOffer({
          variables: {
            input: {
              offerId:
                offer.offerId,
            },
          },
        });

      const response =
        result.data
          ?.adminApproveOffer;

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'Failed to approve offer.',
        );
      }

      alert(
        response.message ||
          'Offer approved successfully.',
      );

      setDetailsOpen(false);

      await refetch();
    } catch (err: any) {
      console.error(
        'Approve offer error:',
        err,
      );

      alert(
        err?.message ||
          'Failed to approve offer.',
      );
    } finally {
      setApproveLoading(false);
    }
  };

  /* =======================================================
     OPEN REJECT
  ======================================================= */

  const openRejectDialog = (
    offer: Offer,
  ) => {
    setSelectedOffer(offer);
    setRejectReason(
      offer.rejectionReason || '',
    );
    setRejectOpen(true);
  };

  /* =======================================================
     REJECT
  ======================================================= */

  const handleReject = async () => {
    if (!selectedOffer) {
      return;
    }

    const reason =
      rejectReason.trim();

    if (!reason) {
      alert(
        'Please enter a rejection reason.',
      );
      return;
    }

    try {
      setRejectLoading(true);

      const result =
        await rejectOffer({
          variables: {
            input: {
              offerId:
                selectedOffer.offerId,

              rejectionReason:
                reason,
            },
          },
        });

      const response =
        result.data
          ?.adminRejectOffer;

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'Failed to reject offer.',
        );
      }

      alert(
        response.message ||
          'Offer rejected successfully.',
      );

      setRejectOpen(false);
      setSelectedOffer(null);
      setRejectReason('');

      await refetch();
    } catch (err: any) {
      console.error(
        'Reject offer error:',
        err,
      );

      alert(
        err?.message ||
          'Failed to reject offer.',
      );
    } finally {
      setRejectLoading(false);
    }
  };

  /* =======================================================
     DETAILS
  ======================================================= */

  const openDetails = (
    offer: Offer,
  ) => {
    setSelectedOffer(offer);
    setDetailsOpen(true);
  };

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
        }}
      >
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          Failed to load offers:
          {' '}
          {error.message}
        </Alert>

        <Button
          variant="contained"
          startIcon={
            <RefreshIcon />
          }
          onClick={
            handleRefresh
          }
        >
          Retry
        </Button>
      </Box>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        justifyContent="space-between"
        alignItems={{
          xs: 'stretch',
          md: 'center',
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <LocalOfferIcon
              sx={{
                fontSize: 30,
              }}
            />

            <Typography
              variant="h4"
              fontWeight={700}
            >
              Offers
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Review and manage salon
            offers submitted for
            approval.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <RefreshIcon />
          }
          onClick={
            handleRefresh
          }
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr 1fr',
            sm: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Total
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
          >
            {totalCount}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Pending
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
            color="warning.main"
          >
            {counts.pending}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Active
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
            color="success.main"
          >
            {counts.active}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Rejected
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
            color="error.main"
          >
            {counts.rejected}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Paused
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
          >
            {counts.paused}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Expired
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
          >
            {counts.expired}
          </Typography>
        </Paper>
      </Box>

      {/* =================================================
          FILTERS
      ================================================= */}

      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={2}
        >
          <TextField
            fullWidth
            placeholder="Search offers..."
            value={search}
            onChange={event =>
              setSearch(
                event.target.value,
              )
            }
            InputProps={{
              startAdornment: (
                <SearchIcon
                  sx={{
                    mr: 1,
                    color:
                      'text.secondary',
                  }}
                />
              ),
            }}
          />

          <Select
            value={status}
            onChange={
              handleStatusChange
            }
            displayEmpty
            sx={{
              minWidth: 220,
            }}
          >
            <MenuItem value="">
              All statuses
            </MenuItem>

            <MenuItem value="PENDING_APPROVAL">
              Pending Approval
            </MenuItem>

            <MenuItem value="ACTIVE">
              Active
            </MenuItem>

            <MenuItem value="REJECTED">
              Rejected
            </MenuItem>

            <MenuItem value="PAUSED">
              Paused
            </MenuItem>

            <MenuItem value="EXPIRED">
              Expired
            </MenuItem>

            <MenuItem value="DRAFT">
              Draft
            </MenuItem>
          </Select>
        </Stack>
      </Paper>

      {/* =================================================
          TABLE
      ================================================= */}

      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 350,
              display: 'flex',
              justifyContent:
                'center',
              alignItems:
                'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : offers.length === 0 ? (
          <Box
            sx={{
              minHeight: 300,
              display: 'flex',
              flexDirection:
                'column',
              justifyContent:
                'center',
              alignItems:
                'center',
              p: 4,
            }}
          >
            <LocalOfferIcon
              sx={{
                fontSize: 55,
                color:
                  'text.disabled',
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              fontWeight={600}
            >
              No offers found
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              There are no offers
              matching the current
              filters.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Offer
                  </TableCell>

                  <TableCell>
                    Salon ID
                  </TableCell>

                  <TableCell>
                    Discount
                  </TableCell>

                  <TableCell>
                    Validity
                  </TableCell>

                  <TableCell>
                    Usage
                  </TableCell>

                  <TableCell>
                    Status
                  </TableCell>

                  <TableCell>
                    Created
                  </TableCell>

                  <TableCell align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {offers.map(
                  offer => (
                    <TableRow
                      key={
                        offer.offerId
                      }
                      hover
                    >
                      <TableCell>
                        <Box
                          sx={{
                            maxWidth: 260,
                          }}
                        >
                          <Typography
                            fontWeight={
                              600
                            }
                          >
                            {
                              offer.title
                            }
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {
                              offer.description
                            }
                          </Typography>

                          {offer.couponCode && (
                            <Chip
                              label={
                                offer.couponCode
                              }
                              size="small"
                              sx={{
                                mt: 0.5,
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily:
                              'monospace',
                          }}
                        >
                          {
                            offer.salonId
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          fontWeight={700}
                          color="primary.main"
                        >
                          {getDiscountText(
                            offer,
                          )}
                        </Typography>

                        {offer.minimumBookingAmount !=
                          null && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Min ₹
                            {
                              offer.minimumBookingAmount
                            }
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                        >
                          {
                            formatDate(
                              offer.startDate,
                            )
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          to{' '}
                          {
                            formatDate(
                              offer.endDate,
                            )
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                        >
                          {
                            offer.usageCount
                          }
                          {offer.usageLimit !=
                            null
                            ? ` / ${offer.usageLimit}`
                            : ' / ∞'}
                        </Typography>

                        {offer.customerLimit !=
                          null && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Customer limit:{' '}
                            {
                              offer.customerLimit
                            }
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusLabel(
                            offer.status,
                          )}
                          color={
                            getStatusColor(
                              offer.status,
                            ) as any
                          }
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                        >
                          {
                            formatDate(
                              offer.createdAt,
                            )
                          }
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              openDetails(
                                offer,
                              )
                            }
                            title="View details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>

                          {offer.status ===
                            'PENDING_APPROVAL' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                disabled={
                                  approveLoading
                                }
                                onClick={() =>
                                  handleApprove(
                                    offer,
                                  )
                                }
                                title="Approve offer"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>

                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  openRejectDialog(
                                    offer,
                                  )
                                }
                                title="Reject offer"
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* =================================================
          DETAILS DIALOG
      ================================================= */}

      <Dialog
        open={detailsOpen}
        onClose={() =>
          setDetailsOpen(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Offer Details
            </Typography>

            <IconButton
              onClick={() =>
                setDetailsOpen(false)
              }
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {selectedOffer && (
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                >
                  {
                    selectedOffer.title
                  }
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    mt: 1,
                  }}
                >
                  <Chip
                    label={getStatusLabel(
                      selectedOffer.status,
                    )}
                    color={
                      getStatusColor(
                        selectedOffer.status,
                      ) as any
                    }
                    size="small"
                  />

                  <Chip
                    label={getDiscountText(
                      selectedOffer,
                    )}
                    size="small"
                  />
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                >
                  Description
                </Typography>

                <Typography>
                  {
                    selectedOffer.description
                  }
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Offer ID
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily:
                        'monospace',
                      wordBreak:
                        'break-all',
                    }}
                  >
                    {
                      selectedOffer.offerId
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Salon ID
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily:
                        'monospace',
                      wordBreak:
                        'break-all',
                    }}
                  >
                    {
                      selectedOffer.salonId
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Category
                  </Typography>

                  <Typography>
                    {
                      selectedOffer.category ||
                      '-'
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Coupon Code
                  </Typography>

                  <Typography>
                    {
                      selectedOffer.couponCode ||
                      '-'
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Minimum Booking
                  </Typography>

                  <Typography>
                    {selectedOffer.minimumBookingAmount !=
                    null
                      ? `₹${selectedOffer.minimumBookingAmount}`
                      : '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Usage
                  </Typography>

                  <Typography>
                    {
                      selectedOffer.usageCount
                    }
                    {selectedOffer.usageLimit !=
                    null
                      ? ` / ${selectedOffer.usageLimit}`
                      : ' / Unlimited'}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Start Date
                  </Typography>

                  <Typography>
                    {
                      formatDate(
                        selectedOffer.startDate,
                      )
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    End Date
                  </Typography>

                  <Typography>
                    {
                      formatDate(
                        selectedOffer.endDate,
                      )
                    }
                  </Typography>
                </Box>
              </Box>

              {selectedOffer.status ===
                'REJECTED' &&
                selectedOffer.rejectionReason && (
                  <Alert severity="error">
                    <strong>
                      Rejection reason:
                    </strong>{' '}
                    {
                      selectedOffer.rejectionReason
                    }
                  </Alert>
                )}

              {selectedOffer.approvedAt && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Approved At
                  </Typography>

                  <Typography>
                    {
                      formatDateTime(
                        selectedOffer.approvedAt,
                      )
                    }
                  </Typography>
                </Box>
              )}

              {selectedOffer.rejectedAt && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Rejected At
                  </Typography>

                  <Typography>
                    {
                      formatDateTime(
                        selectedOffer.rejectedAt,
                      )
                    }
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          {selectedOffer?.status ===
            'PENDING_APPROVAL' && (
            <>
              <Button
                color="error"
                startIcon={
                  <CancelIcon />
                }
                onClick={() => {
                  if (
                    selectedOffer
                  ) {
                    setDetailsOpen(
                      false,
                    );
                    openRejectDialog(
                      selectedOffer,
                    );
                  }
                }}
              >
                Reject
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={
                  <CheckCircleIcon />
                }
                disabled={
                  approveLoading
                }
                onClick={() => {
                  if (
                    selectedOffer
                  ) {
                    handleApprove(
                      selectedOffer,
                    );
                  }
                }}
              >
                {approveLoading
                  ? 'Approving...'
                  : 'Approve'}
              </Button>
            </>
          )}

          <Button
            onClick={() =>
              setDetailsOpen(false)
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================
          REJECT DIALOG
      ================================================= */}

      <Dialog
        open={rejectOpen}
        onClose={() => {
          if (!rejectLoading) {
            setRejectOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Reject Offer
        </DialogTitle>

        <DialogContent>
          {selectedOffer && (
            <Typography
              variant="body2"
              sx={{
                mb: 2,
              }}
            >
              You are rejecting:
              {' '}
              <strong>
                {
                  selectedOffer.title
                }
              </strong>
            </Typography>
          )}

          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Rejection reason"
            placeholder="Enter the reason for rejecting this offer..."
            value={rejectReason}
            onChange={event =>
              setRejectReason(
                event.target.value,
              )
            }
            disabled={
              rejectLoading
            }
            required
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setRejectOpen(false)
            }
            disabled={
              rejectLoading
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={
              <CancelIcon />
            }
            onClick={
              handleReject
            }
            disabled={
              rejectLoading ||
              !rejectReason.trim()
            }
          >
            {rejectLoading
              ? 'Rejecting...'
              : 'Reject Offer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}