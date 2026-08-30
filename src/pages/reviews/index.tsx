
import { useMemo, useState } from 'react';

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
  StarFilled,
  UserOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

interface Review {
  reviewId: string;
  salonId: string;
  salonName: string;
  customerUserId: string;
  customerName: string;
  rating: number;
  review: string;
  createdAt: string;

  bookingId: string;
  serviceName: string;

  status: 'PUBLISHED' | 'FLAGGED' | 'HIDDEN';
}

// ==============================|| STATIC DATA ||============================== //

const reviews: Review[] = [
  {
    reviewId: 'REV-10001',
    salonId: 'SALON-001',
    salonName: 'Glow Beauty Studio',
    customerUserId: 'USR-001',
    customerName: 'Ananya Sharma',
    rating: 5,
    review:
      'Amazing experience! The staff were very professional and the service was excellent.',
    createdAt: '2026-08-30 10:45 AM',
    bookingId: 'BK-10001',
    serviceName: 'Hair Cut & Hair Spa',
    status: 'PUBLISHED'
  },
  {
    reviewId: 'REV-10002',
    salonId: 'SALON-002',
    salonName: 'Urban Glam Salon',
    customerUserId: 'USR-002',
    customerName: 'Rahul Kumar',
    rating: 4,
    review:
      'Good service and friendly staff. The salon was clean and comfortable.',
    createdAt: '2026-08-29 04:20 PM',
    bookingId: 'BK-10002',
    serviceName: 'Men Haircut',
    status: 'PUBLISHED'
  },
  {
    reviewId: 'REV-10003',
    salonId: 'SALON-003',
    salonName: 'Luxe Hair & Spa',
    customerUserId: 'USR-003',
    customerName: 'Sneha Reddy',
    rating: 5,
    review:
      'Loved the facial and manicure. Everything was handled professionally.',
    createdAt: '2026-08-29 06:15 PM',
    bookingId: 'BK-10003',
    serviceName: 'Facial & Manicure',
    status: 'PUBLISHED'
  },
  {
    reviewId: 'REV-10004',
    salonId: 'SALON-004',
    salonName: 'Blush & Bloom',
    customerUserId: 'USR-005',
    customerName: 'Megha Patel',
    rating: 4.5,
    review:
      'Beautiful salon and very good makeup trial. The artist understood exactly what I wanted.',
    createdAt: '2026-08-28 02:30 PM',
    bookingId: 'BK-10005',
    serviceName: 'Bridal Makeup Trial',
    status: 'PUBLISHED'
  },
  {
    reviewId: 'REV-10005',
    salonId: 'SALON-005',
    salonName: 'The Hair Lounge',
    customerUserId: 'USR-006',
    customerName: 'Vikram Singh',
    rating: 2,
    review:
      'The appointment was delayed and I had to wait for quite some time.',
    createdAt: '2026-08-27 05:45 PM',
    bookingId: 'BK-10006',
    serviceName: 'Haircut',
    status: 'FLAGGED'
  },
  {
    reviewId: 'REV-10006',
    salonId: 'SALON-001',
    salonName: 'Glow Beauty Studio',
    customerUserId: 'USR-007',
    customerName: 'Pooja Rao',
    rating: 3,
    review:
      'The service was okay but there is some room for improvement.',
    createdAt: '2026-08-26 01:10 PM',
    bookingId: 'BK-10007',
    serviceName: 'Hair Coloring',
    status: 'PUBLISHED'
  },
  {
    reviewId: 'REV-10007',
    salonId: 'SALON-002',
    salonName: 'Urban Glam Salon',
    customerUserId: 'USR-008',
    customerName: 'Kiran Joshi',
    rating: 1,
    review:
      'Very disappointing experience. I would not recommend this service.',
    createdAt: '2026-08-25 07:30 PM',
    bookingId: 'BK-10008',
    serviceName: 'Hair Styling',
    status: 'FLAGGED'
  },
  {
    reviewId: 'REV-10008',
    salonId: 'SALON-003',
    salonName: 'Luxe Hair & Spa',
    customerUserId: 'USR-009',
    customerName: 'Divya Nair',
    rating: 5,
    review:
      'Excellent service. Very clean salon and highly skilled staff.',
    createdAt: '2026-08-24 11:25 AM',
    bookingId: 'BK-10009',
    serviceName: 'Spa Treatment',
    status: 'PUBLISHED'
  },
  {
    reviewId: 'REV-10009',
    salonId: 'SALON-004',
    salonName: 'Blush & Bloom',
    customerUserId: 'USR-010',
    customerName: 'Riya Mehta',
    rating: 4,
    review:
      'Really nice experience. Staff were polite and the results were good.',
    createdAt: '2026-08-23 03:45 PM',
    bookingId: 'BK-10010',
    serviceName: 'Facial',
    status: 'PUBLISHED'
  },
  {
    reviewId: 'REV-10010',
    salonId: 'SALON-005',
    salonName: 'The Hair Lounge',
    customerUserId: 'USR-011',
    customerName: 'Arjun Rao',
    rating: 2.5,
    review:
      'Service was average and took longer than expected.',
    createdAt: '2026-08-22 05:00 PM',
    bookingId: 'BK-10011',
    serviceName: 'Beard Styling',
    status: 'HIDDEN'
  }
];

// ==============================|| HELPERS ||============================== //

const getStatusColor = (
  status: Review['status']
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

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
          <Typography variant="body2" color="text.secondary">
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
    useState<'ALL' | '5' | '4' | '3' | '2' | '1'>('ALL');

  const [statusFilter, setStatusFilter] =
    useState<'ALL' | Review['status']>('ALL');

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ==============================|| STATISTICS ||============================== //

  const statistics = useMemo(() => {
    const total = reviews.length;

    const published = reviews.filter(
      (review) => review.status === 'PUBLISHED'
    ).length;

    const flagged = reviews.filter(
      (review) => review.status === 'FLAGGED'
    ).length;

    const hidden = reviews.filter(
      (review) => review.status === 'HIDDEN'
    ).length;

    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
            (sum, review) => sum + review.rating,
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
  }, []);

  // ==============================|| FILTER ||============================== //

  const filteredReviews = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !searchValue ||
        review.reviewId.toLowerCase().includes(searchValue) ||
        review.customerName.toLowerCase().includes(searchValue) ||
        review.salonName.toLowerCase().includes(searchValue) ||
        review.review.toLowerCase().includes(searchValue) ||
        review.bookingId.toLowerCase().includes(searchValue) ||
        review.serviceName.toLowerCase().includes(searchValue);

      const matchesRating =
        ratingFilter === 'ALL' ||
        Math.floor(review.rating) === Number(ratingFilter);

      const matchesStatus =
        statusFilter === 'ALL' ||
        review.status === statusFilter;

      return (
        matchesSearch &&
        matchesRating &&
        matchesStatus
      );
    });
  }, [search, ratingFilter, statusFilter]);

  // ==============================|| HANDLERS ||============================== //

  const handleRatingChange = (event: SelectChangeEvent) => {
    setRatingFilter(
      event.target.value as 'ALL' | '5' | '4' | '3' | '2' | '1'
    );

    setPage(0);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(
      event.target.value as 'ALL' | Review['status']
    );

    setPage(0);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(
      parseInt(event.target.value, 10)
    );

    setPage(0);
  };

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* HEADER */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
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
            Monitor customer feedback and manage
            reviews across all Clavata salons.
          </Typography>
        </Box>
      </Stack>

      {/* STATISTICS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Reviews"
            value={String(statistics.total)}
            description="All customer reviews"
            icon={<StarFilled />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={statistics.averageRating.toFixed(1)}
            description="Across all salons"
            icon={<StarFilled />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Published"
            value={String(statistics.published)}
            description="Visible to customers"
            icon={<EyeOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Flagged"
            value={String(statistics.flagged)}
            description="Requires attention"
            icon={<DeleteOutlined />}
          />
        </Grid>
      </Grid>

      {/* TABLE */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        {/* FILTERS */}
        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <TextField
              fullWidth
              placeholder="Search customer, salon, booking or review..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
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

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
            >
              <Select
                size="small"
                value={ratingFilter}
                onChange={handleRatingChange}
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
                onChange={handleStatusChange}
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

        {/* REVIEW TABLE */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Salon</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Review</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredReviews
                .slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
                .map((review) => (
                  <TableRow
                    key={review.reviewId}
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
                            bgcolor: 'primary.lighter',
                            color: 'primary.main',
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
                            {review.customerName}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {review.customerUserId}
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
                        {review.salonName}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {review.salonId}
                      </Typography>
                    </TableCell>

                    {/* SERVICE */}
                    <TableCell>
                      <Typography variant="body2">
                        {review.serviceName}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {review.bookingId}
                      </Typography>
                    </TableCell>

                    {/* RATING */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <Rating
                            value={review.rating}
                            precision={0.5}
                            size="small"
                            readOnly
                          />

                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            {review.rating}
                          </Typography>
                        </Stack>
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
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
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
                        {review.createdAt}
                      </Typography>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={review.status}
                        color={getStatusColor(
                          review.status
                        )}
                        variant={
                          review.status === 'PUBLISHED'
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
                        <Tooltip title="View Review">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              alert(
                                `Review ${review.reviewId}\n\n${review.review}`
                              );
                            }}
                          >
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>

                        {review.status !== 'HIDDEN' && (
                          <Tooltip title="Hide Review">
                            <IconButton
                              color="error"
                              onClick={() => {
                                alert(
                                  `Hide review ${review.reviewId} later through GraphQL`
                                );
                              }}
                            >
                              <DeleteOutlined />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredReviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box
                      sx={{
                        py: 7,
                        textAlign: 'center'
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
                        sx={{ mt: 1 }}
                      >
                        No reviews found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Try changing your search or
                        filters.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        <TablePagination
          component="div"
          count={filteredReviews.length}
          page={page}
          onPageChange={(_, newPage) =>
            setPage(newPage)
          }
          rowsPerPage={rowsPerPage}
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

