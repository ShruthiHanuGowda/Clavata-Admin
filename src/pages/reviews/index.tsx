import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';

// material-ui
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Rating,
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
  EyeOutlined,
  SearchOutlined,
  StarFilled
} from '@ant-design/icons';

// GraphQL
import {
  ADMIN_REVIEWS,
  UPDATE_REVIEW_STATUS
} from 'graphql/queries';

// ==============================|| TYPES ||============================== //

type ReviewStatus =
  | 'PUBLISHED'
  | 'FLAGGED'
  | 'HIDDEN';

interface Review {
  reviewId: string;
  bookingId?: string | null;
  salonId: string;
  salonName?: string | null;
  customerUserId: string;
  customerName?: string | null;
  rating: number;
  review: string;
  createdAt: string;
  status: ReviewStatus;
}

interface AdminReviewsData {
  adminReviews: {
    success: boolean;
    message: string;
    totalCount: number;
    reviews: Review[];
  };
}

interface UpdateReviewStatusData {
  updateReviewStatus: {
    success: boolean;
    message: string;
    review?: Review | null;
  };
}

// ==============================|| HELPERS ||============================== //

const getStatusColor = (
  status: ReviewStatus
): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'PUBLISHED':
      return 'success';

    case 'FLAGGED':
      return 'warning';

    case 'HIDDEN':
      return 'error';

    default:
      return 'success';
  }
};

const getInitials = (
  name?: string | null
) => {
  if (!name) {
    return 'CU';
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ==============================|| STAT CARD ||============================== //

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function StatCard({
  title,
  value,
  description,
  icon
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        height: '100%'
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 1,
              fontWeight: 700
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {description}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.lighter',
            color: 'primary.main',
            fontSize: 20
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

// ==============================|| MAIN COMPONENT ||============================== //

export default function Reviews() {
  const [search, setSearch] = useState('');

  const [ratingFilter, setRatingFilter] =
    useState<
      'ALL' | '5' | '4' | '3' | '2' | '1'
    >('ALL');

  const [statusFilter, setStatusFilter] =
    useState<'ALL' | ReviewStatus>('ALL');

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  // ============================================================
  // ADMIN REVIEWS QUERY
  // ============================================================

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<AdminReviewsData>(
    ADMIN_REVIEWS,
    {
      variables: {
        search:
          search.trim() || null,

        rating:
          ratingFilter === 'ALL'
            ? null
            : Number(ratingFilter),

        status:
          statusFilter === 'ALL'
            ? null
            : statusFilter,

        salonId: null
      },

      fetchPolicy: 'network-only'
    }
  );

  // ============================================================
  // UPDATE REVIEW STATUS
  // ============================================================

  const [
    updateReviewStatus,
    {
      loading: updating
    }
  ] = useMutation<UpdateReviewStatusData>(
    UPDATE_REVIEW_STATUS,
    {
      onCompleted: (result) => {
        if (
          result?.updateReviewStatus?.success
        ) {
          refetch();
          return;
        }

        alert(
          result?.updateReviewStatus?.message ||
            'Failed to update review status.'
        );
      },

      onError: (mutationError) => {
        console.error(
          'UPDATE REVIEW STATUS ERROR:',
          mutationError
        );

        alert(
          mutationError.message ||
            'Failed to update review status.'
        );
      }
    }
  );

  // ============================================================
  // DATA
  // ============================================================

  const reviews =
    data?.adminReviews?.reviews ?? [];

  const totalCount =
    data?.adminReviews?.totalCount ??
    reviews.length;

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    const total = reviews.length;

    const published =
      reviews.filter(
        (review) =>
          review.status === 'PUBLISHED'
      ).length;

    const flagged =
      reviews.filter(
        (review) =>
          review.status === 'FLAGGED'
      ).length;

    const hidden =
      reviews.filter(
        (review) =>
          review.status === 'HIDDEN'
      ).length;

    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
            (sum, review) =>
              sum +
              Number(
                review.rating || 0
              ),
            0
          ) / reviews.length
        : 0;

    return {
      total,
      published,
      flagged,
      hidden,
      averageRating
    };
  }, [reviews]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleRatingChange = (
    event: SelectChangeEvent
  ) => {
    setRatingFilter(
      event.target.value as
        | 'ALL'
        | '5'
        | '4'
        | '3'
        | '2'
        | '1'
    );

    setPage(0);
  };

  const handleStatusChange = (
    event: SelectChangeEvent
  ) => {
    setStatusFilter(
      event.target.value as
        | 'ALL'
        | ReviewStatus
    );

    setPage(0);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(
      parseInt(
        event.target.value,
        10
      )
    );

    setPage(0);
  };

  // ============================================================
  // VIEW REVIEW
  // ============================================================

  const handleViewReview = (
    review: Review
  ) => {
    alert(
      `Review ID: ${review.reviewId}

Customer: ${
        review.customerName ||
        'Unknown Customer'
      }

Customer ID: ${
        review.customerUserId
      }

Salon: ${
        review.salonName ||
        'Unknown Salon'
      }

Salon ID: ${
        review.salonId
      }

Booking: ${
        review.bookingId ||
        '-'
      }

Rating: ${
        Number(review.rating).toFixed(1)
      }

Status: ${
        review.status
      }

Review:

${review.review}`
    );
  };

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  const changeReviewStatus = async (
    review: Review,
    status: ReviewStatus
  ) => {
    try {
      await updateReviewStatus({
        variables: {
          input: {
            reviewId:
              review.reviewId,
            status
          }
        }
      });
    } catch (error) {
      console.error(
        'CHANGE REVIEW STATUS ERROR:',
        error
      );
    }
  };

  // ============================================================
  // HIDE REVIEW
  // ============================================================

  const handleHideReview = async (
    review: Review
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to hide review ${review.reviewId}?`
      );

    if (!confirmed) {
      return;
    }

    await changeReviewStatus(
      review,
      'HIDDEN'
    );
  };

  // ============================================================
  // FLAG REVIEW
  // ============================================================

  const handleFlagReview = async (
    review: Review
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to flag review ${review.reviewId}?`
      );

    if (!confirmed) {
      return;
    }

    await changeReviewStatus(
      review,
      'FLAGGED'
    );
  };

  // ============================================================
  // PUBLISH REVIEW
  // ============================================================

  const handlePublishReview = async (
    review: Review
  ) => {
    const confirmed =
      window.confirm(
        `Publish review ${review.reviewId}?`
      );

    if (!confirmed) {
      return;
    }

    await changeReviewStatus(
      review,
      'PUBLISHED'
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box>
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <Stack
        direction={{
          xs: 'column',
          sm: 'row'
        }}
        justifyContent="space-between"
        alignItems={{
          xs: 'flex-start',
          sm: 'center'
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Reviews
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Monitor customer feedback and
            manage reviews across all
            Clavata salons.
          </Typography>
        </Box>
      </Stack>

      {/* ====================================================== */}
      {/* STATISTICS */}
      {/* ====================================================== */}

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
          <StatCard
            title="Total Reviews"
            value={String(
              statistics.total
            )}
            description="All customer reviews"
            icon={<StarFilled />}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <StatCard
            title="Average Rating"
            value={statistics.averageRating.toFixed(
              1
            )}
            description="Across all salons"
            icon={<StarFilled />}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <StatCard
            title="Published"
            value={String(
              statistics.published
            )}
            description="Visible to customers"
            icon={<EyeOutlined />}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <StatCard
            title="Flagged"
            value={String(
              statistics.flagged
            )}
            description="Requires attention"
            icon={<DeleteOutlined />}
          />
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        {/* ==================================================== */}
        {/* FILTERS */}
        {/* ==================================================== */}

        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{
              xs: 'column',
              md: 'row'
            }}
            justifyContent="space-between"
            spacing={2}
          >
            {/* SEARCH */}

            <TextField
              fullWidth
              placeholder="Search customer, salon, booking or review..."
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );

                setPage(0);
              }}
              sx={{
                maxWidth: 500
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />

            {/* FILTERS */}

            <Stack
              direction={{
                xs: 'column',
                sm: 'row'
              }}
              spacing={2}
            >
              <Select
                size="small"
                value={ratingFilter}
                onChange={
                  handleRatingChange
                }
                sx={{
                  minWidth: 150
                }}
              >
                <MenuItem value="ALL">
                  All Ratings
                </MenuItem>

                <MenuItem value="5">
                  5 Stars
                </MenuItem>

                <MenuItem value="4">
                  4 Stars
                </MenuItem>

                <MenuItem value="3">
                  3 Stars
                </MenuItem>

                <MenuItem value="2">
                  2 Stars
                </MenuItem>

                <MenuItem value="1">
                  1 Star
                </MenuItem>
              </Select>

              <Select
                size="small"
                value={statusFilter}
                onChange={
                  handleStatusChange
                }
                sx={{
                  minWidth: 160
                }}
              >
                <MenuItem value="ALL">
                  All Status
                </MenuItem>

                <MenuItem value="PUBLISHED">
                  Published
                </MenuItem>

                <MenuItem value="FLAGGED">
                  Flagged
                </MenuItem>

                <MenuItem value="HIDDEN">
                  Hidden
                </MenuItem>
              </Select>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* ==================================================== */}
        {/* ERROR */}
        {/* ==================================================== */}

        {error && (
          <Box sx={{ p: 3 }}>
            <Typography
              color="error"
              variant="body2"
            >
              Failed to load reviews:{' '}
              {error.message}
            </Typography>
          </Box>
        )}

        {/* ==================================================== */}
        {/* TABLE */}
        {/* ==================================================== */}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Customer
                </TableCell>

                <TableCell>
                  Salon
                </TableCell>

                <TableCell>
                  Booking
                </TableCell>

                <TableCell>
                  Rating
                </TableCell>

                <TableCell>
                  Review
                </TableCell>

                <TableCell>
                  Date
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* ================================================= */}
              {/* LOADING */}
              {/* ================================================= */}

              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                  >
                    <Box
                      sx={{
                        py: 6
                      }}
                    >
                      <Typography
                        color="text.secondary"
                      >
                        Loading reviews...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {/* ================================================= */}
              {/* DATA */}
              {/* ================================================= */}

              {!loading &&
                reviews
                  .slice(
                    page *
                      rowsPerPage,
                    page *
                        rowsPerPage +
                      rowsPerPage
                  )
                  .map((review) => (
                    <TableRow
                      key={
                        review.reviewId
                      }
                      hover
                    >
                      {/* CUSTOMER */}

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor:
                                'primary.lighter',
                              color:
                                'primary.main',
                              fontSize: 13
                            }}
                          >
                            {getInitials(
                              review.customerName
                            )}
                          </Avatar>

                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {review.customerName ||
                                'Unknown Customer'}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {
                                review.customerUserId
                              }
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* SALON */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {review.salonName ||
                            'Unknown Salon'}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {
                            review.salonId
                          }
                        </Typography>
                      </TableCell>

                      {/* BOOKING */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {review.bookingId ||
                            '-'}
                        </Typography>
                      </TableCell>

                      {/* RATING */}

                      <TableCell>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <Rating
                            value={Number(
                              review.rating
                            )}
                            precision={0.5}
                            size="small"
                            readOnly
                          />

                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            {Number(
                              review.rating
                            ).toFixed(1)}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* REVIEW */}

                      <TableCell
                        sx={{
                          maxWidth: 350
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            display:
                              '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient:
                              'vertical'
                          }}
                        >
                          {review.review}
                        </Typography>
                      </TableCell>

                      {/* DATE */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {formatDate(
                            review.createdAt
                          )}
                        </Typography>
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            review.status
                          }
                          color={getStatusColor(
                            review.status
                          )}
                          variant={
                            review.status ===
                            'PUBLISHED'
                              ? 'outlined'
                              : 'filled'
                          }
                        />
                      </TableCell>

                      {/* ACTIONS */}

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                        >
                          {/* VIEW */}

                          <Tooltip title="View Review">
                            <IconButton
                              color="primary"
                              onClick={() =>
                                handleViewReview(
                                  review
                                )
                              }
                            >
                              <EyeOutlined />
                            </IconButton>
                          </Tooltip>

                          {/* FLAG */}

                          {review.status ===
                            'PUBLISHED' && (
                            <Tooltip title="Flag Review">
                              <span>
                                <IconButton
                                  color="warning"
                                  disabled={
                                    updating
                                  }
                                  onClick={() =>
                                    handleFlagReview(
                                      review
                                    )
                                  }
                                >
                                  <StarFilled />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {/* PUBLISH */}

                          {review.status !==
                            'PUBLISHED' && (
                            <Tooltip title="Publish Review">
                              <span>
                                <IconButton
                                  color="success"
                                  disabled={
                                    updating
                                  }
                                  onClick={() =>
                                    handlePublishReview(
                                      review
                                    )
                                  }
                                >
                                  <EyeOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {/* HIDE */}

                          {review.status !==
                            'HIDDEN' && (
                            <Tooltip title="Hide Review">
                              <span>
                                <IconButton
                                  color="error"
                                  disabled={
                                    updating
                                  }
                                  onClick={() =>
                                    handleHideReview(
                                      review
                                    )
                                  }
                                >
                                  <DeleteOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

              {/* ================================================= */}
              {/* EMPTY */}
              {/* ================================================= */}

              {!loading &&
                reviews.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                    >
                      <Box
                        sx={{
                          py: 7,
                          textAlign:
                            'center'
                        }}
                      >
                        <StarFilled
                          style={{
                            fontSize: 34,
                            opacity: 0.35
                          }}
                        />

                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{
                            mt: 1
                          }}
                        >
                          No reviews found
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Try changing your
                          search or filters.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ==================================================== */}
        {/* PAGINATION */}
        {/* ==================================================== */}

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(
            _,
            newPage
          ) =>
            setPage(newPage)
          }
          rowsPerPage={
            rowsPerPage
          }
          onRowsPerPageChange={
            handleRowsPerPageChange
          }
          rowsPerPageOptions={[
            5,
            10,
            25,
            50
          ]}
        />
      </Paper>
    </Box>
  );
}