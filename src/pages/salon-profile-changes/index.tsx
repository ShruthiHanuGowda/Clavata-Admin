import { useMemo, useState } from 'react';

import {
    Alert,
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
    TableRow,
    TextField,
    Typography
} from '@mui/material';

import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons';

import { useMutation, useQuery } from '@apollo/client';

import {
    ADMIN_APPROVE_SALON_PROFILE_CHANGE,
    ADMIN_REJECT_SALON_PROFILE_CHANGE,
    ADMIN_SALON_PROFILE_CHANGES
} from '../../graphql/queries';

// ============================================================
// TYPES
// ============================================================

type ProfileChangeStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED';

type ProfileChangeType =
    | 'ADDED'
    | 'UPDATED'
    | 'REMOVED';

interface SalonAddress {
    addressLine?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
}

interface SalonProfileSnapshot {
    salonName?: string | null;
    ownerName?: string | null;
    businessType?: string | null;
    email?: string | null;
    ownerPhoneNumber?: string | null;
    alternatePhone?: string | null;
    address?: SalonAddress | null;
}

interface SalonProfileFieldChange {
    field: string;
    label: string;
    oldValue?: unknown;
    newValue?: unknown;
    changeType: ProfileChangeType;
}

interface SalonMedia {
    imageId: string;
    salonId: string;
    mediaType: string;
    key: string;
    objectUrl?: string | null;
    status: string;
    uploadedAt: string;
    approvedAt?: string | null;
    approvedBy?: string | null;
    rejectedAt?: string | null;
    rejectedBy?: string | null;
    rejectionReason?: string | null;
}

interface SalonProfileChange {
    changeId: string;
    salonId: string;

    salonName: string;
    ownerName: string;
    businessType: string;
    email: string;
    ownerPhoneNumber: string;
    alternatePhone?: string | null;

    address?: SalonAddress | null;

    logoUrl?: string | null;
    coverImageUrl?: string | null;
    galleryImages?: string[] | null;

    logoMedia?: SalonMedia | null;
    coverMedia?: SalonMedia | null;
    galleryMedia?: SalonMedia[] | null;

    status: ProfileChangeStatus;

    submittedBy: string;
    submittedAt: string;

    reviewedBy?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;

    // ========================================================
    // CHANGE COMPARISON
    // ========================================================

    previousProfile?: SalonProfileSnapshot | null;

    requestedProfile?: SalonProfileSnapshot | null;

    changes?: SalonProfileFieldChange[] | null;

    changedFields?: string[] | null;

    changeCount?: number | null;
}

interface ApiResponse {
    success?: boolean;
    message?: string | null;
    change?: SalonProfileChange | null;
}

// ============================================================
// HELPERS
// ============================================================

const formatDate = (value?: string | null) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
};

const getStatusColor = (
    status?: ProfileChangeStatus
): 'warning' | 'success' | 'error' => {
    switch (status) {
        case 'APPROVED':
            return 'success';

        case 'REJECTED':
            return 'error';

        case 'PENDING':
        default:
            return 'warning';
    }
};

const getStatusLabel = (
    status?: ProfileChangeStatus
) => {
    switch (status) {
        case 'PENDING':
            return 'Pending';

        case 'APPROVED':
            return 'Approved';

        case 'REJECTED':
            return 'Rejected';

        default:
            return '-';
    }
};

const getMediaStatusColor = (
    status?: string
): 'warning' | 'success' | 'error' => {
    switch (status) {
        case 'APPROVED':
            return 'success';

        case 'REJECTED':
            return 'error';

        case 'PENDING':
        default:
            return 'warning';
    }
};

// ============================================================
// CHANGE VALUE FORMATTER
// ============================================================

const formatChangeValue = (
    value: unknown
): string => {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '-';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number' ||
        typeof value === 'boolean') {
        return String(value);
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '-';
        }

        return value
            .map((item) => formatChangeValue(item))
            .join(', ');
    }

    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }

    return String(value);
};

// ============================================================
// FALLBACK CHANGE DETECTION
//
// This is intentionally included as a safety net.
// If Lambda returns previousProfile/requestedProfile but
// changes is missing, the admin UI can still calculate the
// differences.
// ============================================================

const normalizeCompareValue = (
    value: unknown
): string => {
    if (
        value === null ||
        value === undefined
    ) {
        return '';
    }

    return String(value).trim();
};

const buildFallbackChanges = (
    change: SalonProfileChange
): SalonProfileFieldChange[] => {
    const previous =
        change.previousProfile;

    const requested =
        change.requestedProfile || {
            salonName: change.salonName,
            ownerName: change.ownerName,
            businessType: change.businessType,
            email: change.email,
            ownerPhoneNumber:
                change.ownerPhoneNumber,
            alternatePhone:
                change.alternatePhone,
            address: change.address
        };

    if (!previous) {
        return [];
    }

    const result: SalonProfileFieldChange[] = [];

    const compareField = (
        field: string,
        label: string,
        oldValue: unknown,
        newValue: unknown
    ) => {
        if (
            normalizeCompareValue(oldValue) !==
            normalizeCompareValue(newValue)
        ) {
            let changeType:
                ProfileChangeType =
                'UPDATED';

            const oldEmpty =
                normalizeCompareValue(
                    oldValue
                ) === '';

            const newEmpty =
                normalizeCompareValue(
                    newValue
                ) === '';

            if (oldEmpty && !newEmpty) {
                changeType = 'ADDED';
            } else if (
                !oldEmpty &&
                newEmpty
            ) {
                changeType = 'REMOVED';
            }

            result.push({
                field,
                label,
                oldValue,
                newValue,
                changeType
            });
        }
    };

    compareField(
        'salonName',
        'Salon Name',
        previous.salonName,
        requested.salonName
    );

    compareField(
        'ownerName',
        'Owner Name',
        previous.ownerName,
        requested.ownerName
    );

    compareField(
        'businessType',
        'Business Type',
        previous.businessType,
        requested.businessType
    );

    compareField(
        'email',
        'Email',
        previous.email,
        requested.email
    );

    compareField(
        'ownerPhoneNumber',
        'Owner Phone Number',
        previous.ownerPhoneNumber,
        requested.ownerPhoneNumber
    );

    compareField(
        'alternatePhone',
        'Alternate Phone',
        previous.alternatePhone,
        requested.alternatePhone
    );

    compareField(
        'address.addressLine',
        'Address → Address Line',
        previous.address?.addressLine,
        requested.address?.addressLine
    );

    compareField(
        'address.city',
        'Address → City',
        previous.address?.city,
        requested.address?.city
    );

    compareField(
        'address.state',
        'Address → State',
        previous.address?.state,
        requested.address?.state
    );

    compareField(
        'address.pincode',
        'Address → Pincode',
        previous.address?.pincode,
        requested.address?.pincode
    );

    return result;
};

const getActualChanges = (
    change: SalonProfileChange
): SalonProfileFieldChange[] => {
    if (
        change.changes &&
        change.changes.length > 0
    ) {
        return change.changes;
    }

    return buildFallbackChanges(change);
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function SalonProfileChanges() {
    const [status, setStatus] =
        useState<ProfileChangeStatus>('PENDING');

    const [selectedChange, setSelectedChange] =
        useState<SalonProfileChange | null>(null);

    const [viewModalOpen, setViewModalOpen] =
        useState(false);

    const [approveModalOpen, setApproveModalOpen] =
        useState(false);

    const [rejectModalOpen, setRejectModalOpen] =
        useState(false);

    const [rejectionReason, setRejectionReason] =
        useState('');

    const [actionError, setActionError] =
        useState<string | null>(null);

    const [actionSuccess, setActionSuccess] =
        useState<string | null>(null);

    // ==========================================================
    // QUERY
    // ==========================================================

    const {
        data,
        loading,
        error,
        refetch
    } = useQuery(
        ADMIN_SALON_PROFILE_CHANGES,
        {
            variables: {
                status
            },
            fetchPolicy: 'network-only'
        }
    );

    // ==========================================================
    // APPROVE
    // ==========================================================

    const [
        approveProfileChange,
        { loading: approving }
    ] = useMutation(
        ADMIN_APPROVE_SALON_PROFILE_CHANGE
    );

    // ==========================================================
    // REJECT
    // ==========================================================

    const [
        rejectProfileChange,
        { loading: rejecting }
    ] = useMutation(
        ADMIN_REJECT_SALON_PROFILE_CHANGE
    );

    // ==========================================================
    // DATA
    // ==========================================================

    const changes: SalonProfileChange[] =
        data?.adminSalonProfileChanges?.changes || [];

    const totalCount =
        data?.adminSalonProfileChanges?.totalCount || 0;

    // ==========================================================
    // TABLE COLUMNS
    // ==========================================================

    const columns = useMemo(
        () => [
            'Salon',
            'Owner',
            'Business Type',
            'Submitted',
            'Status',
            'Actions'
        ],
        []
    );

    // ==========================================================
    // STATUS CHANGE
    // ==========================================================

    const handleStatusChange = (
        event: SelectChangeEvent
    ) => {
        setStatus(
            event.target.value as ProfileChangeStatus
        );

        setActionError(null);
        setActionSuccess(null);
    };

    // ==========================================================
    // VIEW
    // ==========================================================

    const handleView = (
        change: SalonProfileChange
    ) => {
        setSelectedChange(change);
        setViewModalOpen(true);

        setActionError(null);
        setActionSuccess(null);
    };

    // ==========================================================
    // CLOSE VIEW
    // ==========================================================

    const handleCloseView = () => {
        if (approving || rejecting) {
            return;
        }

        setViewModalOpen(false);
        setSelectedChange(null);
    };

    // ==========================================================
    // OPEN APPROVE
    // ==========================================================

    const openApproveModal = (
        change: SalonProfileChange
    ) => {
        setSelectedChange(change);
        setApproveModalOpen(true);

        setActionError(null);
        setActionSuccess(null);
    };

    // ==========================================================
    // CLOSE APPROVE
    // ==========================================================

    const closeApproveModal = () => {
        if (approving) {
            return;
        }

        setApproveModalOpen(false);
        setActionError(null);
    };

    // ==========================================================
    // APPROVE
    // ==========================================================

    const handleApprove = async () => {
        if (!selectedChange) {
            return;
        }

        setActionError(null);
        setActionSuccess(null);

        try {
            const result =
                await approveProfileChange({
                    variables: {
                        input: {
                            changeId:
                                selectedChange.changeId
                        }
                    }
                });

            const response: ApiResponse =
                result.data
                    ?.adminApproveSalonProfileChange;

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    'Failed to approve profile changes.'
                );
            }

            setActionSuccess(
                response.message ||
                'Salon profile changes approved successfully.'
            );

            setApproveModalOpen(false);
            setViewModalOpen(false);
            setSelectedChange(null);

            await refetch();
        } catch (err: any) {
            setActionError(
                err?.message ||
                'Unable to approve profile changes.'
            );
        }
    };

    // ==========================================================
    // OPEN REJECT
    // ==========================================================

    const openRejectModal = (
        change: SalonProfileChange
    ) => {
        setSelectedChange(change);
        setRejectionReason('');
        setRejectModalOpen(true);

        setActionError(null);
        setActionSuccess(null);
    };

    // ==========================================================
    // CLOSE REJECT
    // ==========================================================

    const closeRejectModal = () => {
        if (rejecting) {
            return;
        }

        setRejectModalOpen(false);
        setRejectionReason('');
        setActionError(null);
    };

    // ==========================================================
    // REJECT
    // ==========================================================

    const handleReject = async () => {
        if (!selectedChange) {
            return;
        }

        const reason =
            rejectionReason.trim();

        if (!reason) {
            setActionError(
                'Please enter a rejection reason before rejecting the profile changes.'
            );

            return;
        }

        setActionError(null);
        setActionSuccess(null);

        try {
            const result =
                await rejectProfileChange({
                    variables: {
                        input: {
                            changeId:
                                selectedChange.changeId,
                            rejectionReason:
                                reason
                        }
                    }
                });

            const response: ApiResponse =
                result.data
                    ?.adminRejectSalonProfileChange;

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    'Failed to reject profile changes.'
                );
            }

            setActionSuccess(
                response.message ||
                'The salon profile changes have been rejected.'
            );

            setRejectModalOpen(false);
            setViewModalOpen(false);
            setSelectedChange(null);
            setRejectionReason('');

            await refetch();
        } catch (err: any) {
            setActionError(
                err?.message ||
                'Unable to reject profile changes.'
            );
        }
    };

    // ==========================================================
    // RETURN
    // ==========================================================

    return (
        <Box>
            {/* ======================================================
                HEADER
            ====================================================== */}

            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: {
                        xs: 'flex-start',
                        md: 'center'
                    },
                    justifyContent: 'space-between',
                    flexDirection: {
                        xs: 'column',
                        md: 'row'
                    },
                    gap: 2
                }}
            >
                <Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Review and approve profile changes
                        requested by salons.
                    </Typography>
                </Box>

                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row'
                    }}
                    spacing={1.5}
                    sx={{
                        width: {
                            xs: '100%',
                            md: 'auto'
                        }
                    }}
                >
                    <FormControl
                        size="small"
                        sx={{
                            minWidth: 160
                        }}
                    >
                        <InputLabel id="profile-change-status-label">
                            Status
                        </InputLabel>

                        <Select
                            labelId="profile-change-status-label"
                            value={status}
                            label="Status"
                            onChange={
                                handleStatusChange
                            }
                        >
                            <MenuItem value="PENDING">
                                Pending
                            </MenuItem>

                            <MenuItem value="APPROVED">
                                Approved
                            </MenuItem>

                            <MenuItem value="REJECTED">
                                Rejected
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        startIcon={
                            <ReloadOutlined />
                        }
                        onClick={() => refetch()}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Stack>
            </Box>

            {/* ======================================================
                SUCCESS
            ====================================================== */}

            {actionSuccess && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() =>
                        setActionSuccess(null)
                    }
                >
                    {actionSuccess}
                </Alert>
            )}

            {/* ======================================================
                GENERAL ERROR
            ====================================================== */}

            {actionError &&
                !rejectModalOpen &&
                !approveModalOpen && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        onClose={() =>
                            setActionError(null)
                        }
                    >
                        {actionError}
                    </Alert>
                )}

            {/* ======================================================
                TABLE
            ====================================================== */}

            <Paper
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                {error && (
                    <Alert
                        severity="error"
                        sx={{ m: 2 }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 600
                            }}
                        >
                            Unable to load profile changes
                        </Typography>

                        <Typography variant="body2">
                            {error.message}
                        </Typography>
                    </Alert>
                )}

                {loading ? (
                    <Box
                        sx={{
                            minHeight: 350,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        <CircularProgress />

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Loading profile changes...
                        </Typography>
                    </Box>
                ) : changes.length === 0 ? (
                    <Box
                        sx={{
                            minHeight: 300,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            p: 4
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                mb: 2
                            }}
                        >
                            <EyeOutlined />
                        </Avatar>

                        <Typography
                            variant="h6"
                            sx={{
                                mb: 0.5
                            }}
                        >
                            {status === 'PENDING'
                                ? 'No pending salon profile changes'
                                : 'No profile changes found'}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                        >
                            There are currently no profile
                            change requests for this status.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {columns.map(
                                        (column) => (
                                            <TableCell
                                                key={column}
                                                sx={{
                                                    fontWeight: 600,
                                                    whiteSpace:
                                                        'nowrap'
                                                }}
                                            >
                                                {column}
                                            </TableCell>
                                        )
                                    )}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {changes.map(
                                    (
                                        change
                                    ) => {
                                        const actualChanges =
                                            getActualChanges(
                                                change
                                            );

                                        return (
                                            <TableRow
                                                key={
                                                    change.changeId
                                                }
                                                hover
                                            >
                                                {/* SALON */}

                                                <TableCell>
                                                    <Stack
                                                        direction="row"
                                                        spacing={1.5}
                                                        alignItems="center"
                                                    >
                                                        <Avatar
                                                            src={
                                                                change.logoUrl ||
                                                                undefined
                                                            }
                                                            alt={
                                                                change.salonName
                                                            }
                                                        >
                                                            {change.salonName
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase()}
                                                        </Avatar>

                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                {
                                                                    change.salonName
                                                                }
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                ID:{' '}
                                                                {
                                                                    change.salonId
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>

                                                {/* OWNER */}

                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {
                                                            change.ownerName
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            change.ownerPhoneNumber
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                {/* BUSINESS TYPE */}

                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {
                                                            change.businessType ||
                                                            '-'
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                {/* SUBMITTED */}

                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            whiteSpace:
                                                                'nowrap'
                                                        }}
                                                    >
                                                        {formatDate(
                                                            change.submittedAt
                                                        )}
                                                    </Typography>
                                                </TableCell>

                                                {/* STATUS */}

                                                <TableCell>
                                                    <Stack spacing={0.7}>
                                                        <Chip
                                                            size="small"
                                                            label={getStatusLabel(
                                                                change.status
                                                            )}
                                                            color={getStatusColor(
                                                                change.status
                                                            )}
                                                        />

                                                        {actualChanges.length >
                                                            0 && (
                                                            <Chip
                                                                size="small"
                                                                variant="outlined"
                                                                label={`${actualChanges.length} change${
                                                                    actualChanges.length ===
                                                                    1
                                                                        ? ''
                                                                        : 's'
                                                                }`}
                                                                color="warning"
                                                            />
                                                        )}
                                                    </Stack>
                                                </TableCell>

                                                {/* ACTIONS */}

                                                <TableCell>
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() =>
                                                                handleView(
                                                                    change
                                                                )
                                                            }
                                                            title="View changes"
                                                        >
                                                            <EyeOutlined />
                                                        </IconButton>

                                                        {change.status ===
                                                            'PENDING' && (
                                                            <>
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    color="success"
                                                                    startIcon={
                                                                        <CheckCircleOutlined />
                                                                    }
                                                                    onClick={() =>
                                                                        openApproveModal(
                                                                            change
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        approving ||
                                                                        rejecting
                                                                    }
                                                                >
                                                                    Approve
                                                                </Button>

                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="error"
                                                                    startIcon={
                                                                        <CloseCircleOutlined />
                                                                    }
                                                                    onClick={() =>
                                                                        openRejectModal(
                                                                            change
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        approving ||
                                                                        rejecting
                                                                    }
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {!loading &&
                    changes.length > 0 && (
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderTop: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Total {totalCount}{' '}
                                profile change
                                {totalCount === 1
                                    ? ''
                                    : 's'}
                            </Typography>
                        </Box>
                    )}
            </Paper>

            {/* ======================================================
                VIEW PROFILE CHANGE
            ====================================================== */}

            <Dialog
                open={viewModalOpen}
                onClose={handleCloseView}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600
                                }}
                            >
                                Salon Profile Change Request
                            </Typography>

                            {selectedChange && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Change ID:{' '}
                                    {
                                        selectedChange.changeId
                                    }
                                </Typography>
                            )}
                        </Box>

                        {selectedChange && (
                            <Chip
                                size="small"
                                label={getStatusLabel(
                                    selectedChange.status
                                )}
                                color={getStatusColor(
                                    selectedChange.status
                                )}
                            />
                        )}
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    {selectedChange && (
                        <ProfileChangeDetails
                            change={selectedChange}
                        />
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        gap: 1
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={
                            handleCloseView
                        }
                    >
                        Close
                    </Button>

                    {selectedChange?.status ===
                        'PENDING' && (
                        <>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={
                                    <CloseCircleOutlined />
                                }
                                onClick={() =>
                                    openRejectModal(
                                        selectedChange
                                    )
                                }
                                disabled={approving}
                            >
                                Reject
                            </Button>

                            <Button
                                variant="contained"
                                color="success"
                                startIcon={
                                    <CheckCircleOutlined />
                                }
                                onClick={() =>
                                    openApproveModal(
                                        selectedChange
                                    )
                                }
                                disabled={approving}
                            >
                                Approve Changes
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* ======================================================
                APPROVE
            ====================================================== */}

            <Dialog
                open={approveModalOpen}
                onClose={
                    closeApproveModal
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Approve Profile Changes?
                </DialogTitle>

                <DialogContent dividers>
                    {selectedChange && (
                        <Stack spacing={2}>
                            <Alert severity="warning">
                                You are about to approve
                                the requested profile
                                changes for{' '}
                                <strong>
                                    {
                                        selectedChange.salonName
                                    }
                                </strong>
                                .
                            </Alert>

                            {/* SHOW CHANGES HERE TOO */}

                            <ProfileChangeSummary
                                change={selectedChange}
                            />

                            <Typography variant="body2">
                                Once approved, the requested
                                information will become the
                                salon's active profile.
                            </Typography>
                        </Stack>
                    )}

                    {actionError && (
                        <Alert
                            severity="error"
                            sx={{ mt: 2 }}
                        >
                            {actionError}
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={
                            closeApproveModal
                        }
                        disabled={approving}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        startIcon={
                            approving ? (
                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                            ) : (
                                <CheckCircleOutlined />
                            )
                        }
                        onClick={handleApprove}
                        disabled={approving}
                    >
                        {approving
                            ? 'Approving...'
                            : 'Approve Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ======================================================
                REJECTION
            ====================================================== */}

            <Dialog
                open={rejectModalOpen}
                onClose={
                    closeRejectModal
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Reject Salon Profile Changes
                </DialogTitle>

                <DialogContent dividers>
                    {selectedChange && (
                        <Stack spacing={2}>
                            <Alert severity="warning">
                                Rejecting changes for{' '}
                                <strong>
                                    {
                                        selectedChange.salonName
                                    }
                                </strong>
                                .
                            </Alert>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Please provide a clear
                                reason so the salon owner
                                knows what needs to be
                                corrected.
                            </Typography>

                            <ProfileChangeSummary
                                change={selectedChange}
                            />

                            <TextField
                                fullWidth
                                multiline
                                minRows={5}
                                maxRows={10}
                                label="Rejection Reason"
                                placeholder="Enter rejection reason..."
                                value={
                                    rejectionReason
                                }
                                onChange={(event) =>
                                    setRejectionReason(
                                        event.target.value
                                    )
                                }
                                inputProps={{
                                    maxLength: 1000
                                }}
                                helperText={`${rejectionReason.length}/1000`}
                                error={
                                    !!actionError &&
                                    !rejectionReason.trim()
                                }
                            />

                            {actionError && (
                                <Alert severity="error">
                                    {actionError}
                                </Alert>
                            )}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={
                            closeRejectModal
                        }
                        disabled={rejecting}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={
                            rejecting ? (
                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                            ) : (
                                <CloseCircleOutlined />
                            )
                        }
                        onClick={handleReject}
                        disabled={rejecting}
                    >
                        {rejecting
                            ? 'Rejecting...'
                            : 'Reject Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// ============================================================
// PROFILE CHANGE DETAILS
// ============================================================

function ProfileChangeDetails({
    change
}: {
    change: SalonProfileChange;
}) {
    const images = [
        change.logoUrl,
        change.coverImageUrl,
        ...(change.galleryImages || [])
    ].filter(Boolean) as string[];

    const actualChanges =
        getActualChanges(change);

    return (
        <Stack spacing={3}>

            {/* ======================================================
                CHANGE SUMMARY
            ====================================================== */}

            <ProfileChangeSummary
                change={change}
            />

            {/* ======================================================
                STATUS
            ====================================================== */}

            <Alert
                severity={getStatusColor(
                    change.status
                )}
            >
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 600
                    }}
                >
                    Status:{' '}
                    {getStatusLabel(
                        change.status
                    )}
                </Typography>

                <Typography variant="body2">
                    {change.status ===
                        'PENDING'
                        ? 'These changes are waiting for admin review.'
                        : change.status ===
                            'REJECTED'
                            ? change.rejectionReason ||
                            'This request was rejected.'
                            : 'These changes were approved.'}
                </Typography>
            </Alert>

            {/* ======================================================
                BUSINESS INFORMATION
            ====================================================== */}

            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 2
                    }}
                >
                    Business Information
                </Typography>

                <Paper
                    variant="outlined"
                    sx={{
                        borderRadius: 1,
                        overflow: 'hidden'
                    }}
                >
                    <Grid container>
                        <HighlightedInfoItem
                            label="Salon Name"
                            field="salonName"
                            value={change.salonName}
                            change={actualChanges}
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Owner Name"
                            field="ownerName"
                            value={change.ownerName}
                            change={actualChanges}
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Business Type"
                            field="businessType"
                            value={
                                change.businessType ||
                                '-'
                            }
                            change={actualChanges}
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Email"
                            field="email"
                            value={
                                change.email || '-'
                            }
                            change={actualChanges}
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Phone"
                            field="ownerPhoneNumber"
                            value={
                                change.ownerPhoneNumber ||
                                '-'
                            }
                            change={actualChanges}
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Alternate Phone"
                            field="alternatePhone"
                            value={
                                change.alternatePhone ||
                                '-'
                            }
                            change={actualChanges}
                            xs={12}
                            sm={6}
                        />

                        <InfoItem
                            label="Submitted By"
                            value={
                                change.submittedBy ||
                                '-'
                            }
                            xs={12}
                            sm={6}
                        />

                        <InfoItem
                            label="Submitted At"
                            value={formatDate(
                                change.submittedAt
                            )}
                            xs={12}
                            sm={6}
                        />

                        {change.reviewedBy && (
                            <InfoItem
                                label="Reviewed By"
                                value={
                                    change.reviewedBy
                                }
                                xs={12}
                                sm={6}
                            />
                        )}

                        {change.reviewedAt && (
                            <InfoItem
                                label="Reviewed At"
                                value={formatDate(
                                    change.reviewedAt
                                )}
                                xs={12}
                                sm={6}
                            />
                        )}
                    </Grid>
                </Paper>
            </Box>

            <Divider />

            {/* ======================================================
                ADDRESS
            ====================================================== */}

            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 2
                    }}
                >
                    Address
                </Typography>

                <Paper
                    variant="outlined"
                    sx={{
                        borderRadius: 1,
                        overflow: 'hidden'
                    }}
                >
                    <Grid container>
                        <HighlightedInfoItem
                            label="Address"
                            field="address.addressLine"
                            value={
                                change.address
                                    ?.addressLine ||
                                '-'
                            }
                            change={actualChanges}
                            xs={12}
                        />

                        <HighlightedInfoItem
                            label="City"
                            field="address.city"
                            value={
                                change.address?.city ||
                                '-'
                            }
                            change={actualChanges}
                            xs={12}
                            sm={4}
                        />

                        <HighlightedInfoItem
                            label="State"
                            field="address.state"
                            value={
                                change.address?.state ||
                                '-'
                            }
                            change={actualChanges}
                            xs={12}
                            sm={4}
                        />

                        <HighlightedInfoItem
                            label="Pincode"
                            field="address.pincode"
                            value={
                                change.address?.pincode ||
                                '-'
                            }
                            change={actualChanges}
                            xs={12}
                            sm={4}
                        />
                    </Grid>
                </Paper>
            </Box>

            <Divider />

            {/* ======================================================
                REQUESTED IMAGES
            ====================================================== */}

            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 2
                    }}
                >
                    Requested Images
                </Typography>

                {images.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        No image changes requested.
                    </Typography>
                ) : (
                    <Grid
                        container
                        spacing={2}
                    >
                        {images.map(
                            (url, index) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    key={`${url}-${index}`}
                                >
                                    <ImagePreview
                                        url={url}
                                        index={index}
                                    />
                                </Grid>
                            )
                        )}
                    </Grid>
                )}
            </Box>

            <Divider />

            {/* ======================================================
                MEDIA STATUS
            ====================================================== */}

            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 2
                    }}
                >
                    Media Status
                </Typography>

                <Stack spacing={1.5}>
                    {change.logoMedia && (
                        <MediaStatus
                            label="Logo"
                            media={
                                change.logoMedia
                            }
                        />
                    )}

                    {change.coverMedia && (
                        <MediaStatus
                            label="Cover Image"
                            media={
                                change.coverMedia
                            }
                        />
                    )}

                    {change.galleryMedia &&
                        change.galleryMedia
                            .length > 0 &&
                        change.galleryMedia.map(
                            (media) => (
                                <MediaStatus
                                    key={
                                        media.imageId
                                    }
                                    label="Gallery Image"
                                    media={media}
                                />
                            )
                        )}

                    {!change.logoMedia &&
                        !change.coverMedia &&
                        (!change.galleryMedia ||
                            change.galleryMedia
                                .length === 0) && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                No media approval
                                information available.
                            </Typography>
                        )}
                </Stack>
            </Box>

            {/* ======================================================
                REJECTION
            ====================================================== */}

            {change.status ===
                'REJECTED' &&
                change.rejectionReason && (
                    <>
                        <Divider />

                        <Alert severity="error">
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 600,
                                    mb: 0.5
                                }}
                            >
                                Rejection Reason
                            </Typography>

                            <Typography variant="body2">
                                {
                                    change.rejectionReason
                                }
                            </Typography>
                        </Alert>
                    </>
                )}
        </Stack>
    );
}

// ============================================================
// CHANGE SUMMARY
// ============================================================

function ProfileChangeSummary({
    change
}: {
    change: SalonProfileChange;
}) {
    const actualChanges =
        getActualChanges(change);

    if (actualChanges.length === 0) {
        return (
            <Alert severity="info">
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 600
                    }}
                >
                    No field-level changes detected
                </Typography>

                <Typography variant="body2">
                    The submitted profile is currently
                    identical to the stored comparison
                    values, or this request was created
                    before change tracking was enabled.
                </Typography>
            </Alert>
        );
    }

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                borderColor: 'warning.main'
            }}
        >
            {/* HEADER */}

            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: 'warning.lighter',
                    borderBottom: '1px solid',
                    borderColor: 'warning.main'
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700
                            }}
                        >
                            Changes Requested
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Review exactly what the salon
                            wants to change.
                        </Typography>
                    </Box>

                    <Chip
                        label={`${actualChanges.length} ${
                            actualChanges.length ===
                            1
                                ? 'field'
                                : 'fields'
                        } changed`}
                        color="warning"
                        sx={{
                            fontWeight: 700
                        }}
                    />
                </Stack>
            </Box>

            {/* CHANGES */}

            <Stack
                divider={
                    <Divider flexItem />
                }
            >
                {actualChanges.map(
                    (item, index) => (
                        <Box
                            key={`${item.field}-${index}`}
                            sx={{
                                p: 2,
                                bgcolor:
                                    'rgba(255, 152, 0, 0.04)'
                            }}
                        >
                            <Stack
                                spacing={1}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    spacing={2}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 700
                                        }}
                                    >
                                        {item.label ||
                                            item.field}
                                    </Typography>

                                    <Chip
                                        size="small"
                                        label={
                                            item.changeType ||
                                            'UPDATED'
                                        }
                                        color={
                                            item.changeType ===
                                            'ADDED'
                                                ? 'success'
                                                : item.changeType ===
                                                    'REMOVED'
                                                    ? 'error'
                                                    : 'warning'
                                        }
                                    />
                                </Stack>

                                {/* OLD VALUE */}

                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        bgcolor:
                                            'error.lighter',
                                        border:
                                            '1px solid',
                                        borderColor:
                                            'error.light'
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display:
                                                'block',
                                            fontWeight: 700,
                                            color:
                                                'error.main',
                                            mb: 0.5
                                        }}
                                    >
                                        CURRENT VALUE
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            wordBreak:
                                                'break-word',
                                            textDecoration:
                                                item.changeType ===
                                                'UPDATED'
                                                    ? 'line-through'
                                                    : 'none'
                                        }}
                                    >
                                        {formatChangeValue(
                                            item.oldValue
                                        )}
                                    </Typography>
                                </Box>

                                {/* ARROW */}

                                <Box
                                    sx={{
                                        display:
                                            'flex',
                                        justifyContent:
                                            'center'
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color:
                                                'warning.main',
                                            fontSize: 18
                                        }}
                                    >
                                        ↓
                                    </Typography>
                                </Box>

                                {/* NEW VALUE */}

                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        bgcolor:
                                            'success.lighter',
                                        border:
                                            '1px solid',
                                        borderColor:
                                            'success.light'
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display:
                                                'block',
                                            fontWeight: 700,
                                            color:
                                                'success.main',
                                            mb: 0.5
                                        }}
                                    >
                                        REQUESTED VALUE
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 700,
                                            wordBreak:
                                                'break-word'
                                        }}
                                    >
                                        {formatChangeValue(
                                            item.newValue
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    )
                )}
            </Stack>
        </Paper>
    );
}

// ============================================================
// HIGHLIGHTED INFO ITEM
// ============================================================

function HighlightedInfoItem({
    label,
    field,
    value,
    change,
    xs = 12,
    sm
}: {
    label: string;
    field: string;
    value: string;
    change: SalonProfileFieldChange[];
    xs?: number;
    sm?: number;
}) {
    const changed = change.find(
        (item) => item.field === field
    );

    if (!changed) {
        return (
            <InfoItem
                label={label}
                value={value}
                xs={xs}
                sm={sm}
            />
        );
    }

    return (
        <Grid
            item
            xs={xs}
            sm={sm}
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Box
                sx={{
                    p: 2,
                    minHeight: 70,
                    bgcolor:
                        'rgba(255, 152, 0, 0.08)',
                    borderLeft:
                        '4px solid',
                    borderLeftColor:
                        'warning.main'
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{
                        mb: 0.5
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            fontWeight: 700,
                            color: 'warning.dark'
                        }}
                    >
                        {label}
                    </Typography>

                    <Chip
                        size="small"
                        label="CHANGED"
                        color="warning"
                        sx={{
                            height: 22,
                            fontSize: 10,
                            fontWeight: 700
                        }}
                    />
                </Stack>

                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 700,
                        wordBreak:
                            'break-word'
                    }}
                >
                    {value}
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    Requested value
                </Typography>
            </Box>
        </Grid>
    );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
    label,
    value,
    xs = 12,
    sm
}: {
    label: string;
    value: string;
    xs?: number;
    sm?: number;
}) {
    return (
        <Grid
            item
            xs={xs}
            sm={sm}
            sx={{
                borderBottom:
                    '1px solid',
                borderColor:
                    'divider'
            }}
        >
            <Box
                sx={{
                    p: 2,
                    minHeight: 70
                }}
            >
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: 'block',
                        mb: 0.5
                    }}
                >
                    {label}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 500,
                        wordBreak:
                            'break-word'
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Grid>
    );
}

// ============================================================
// IMAGE PREVIEW
// ============================================================

function ImagePreview({
    url,
    index
}: {
    url: string;
    index: number;
}) {
    const [imageOpen, setImageOpen] =
        useState(false);

    const getImageLabel = () => {
        if (index === 0) {
            return 'Logo';
        }

        if (index === 1) {
            return 'Cover Image';
        }

        return `Gallery Image ${index - 1}`;
    };

    return (
        <>
            <Paper
                variant="outlined"
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition:
                        'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                        transform:
                            'translateY(-2px)',
                        boxShadow: 3
                    }
                }}
                onClick={() =>
                    setImageOpen(true)
                }
            >
                <Box
                    sx={{
                        width: '100%',
                        height: 160,
                        bgcolor:
                            'action.hover',
                        display: 'flex',
                        alignItems:
                            'center',
                        justifyContent:
                            'center'
                    }}
                >
                    <Box
                        component="img"
                        src={url}
                        alt={getImageLabel()}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onError={(event) => {
                            event.currentTarget.style.display =
                                'none';
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        p: 1.5
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 500
                        }}
                    >
                        {getImageLabel()}
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Click to preview
                    </Typography>
                </Box>
            </Paper>

            <Dialog
                open={imageOpen}
                onClose={() =>
                    setImageOpen(false)
                }
                maxWidth="lg"
            >
                <DialogContent
                    sx={{
                        p: 1,
                        bgcolor: 'black'
                    }}
                >
                    <Box
                        component="img"
                        src={url}
                        alt={getImageLabel()}
                        sx={{
                            display: 'block',
                            maxWidth: '90vw',
                            maxHeight: '85vh',
                            objectFit: 'contain'
                        }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setImageOpen(false)
                        }
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

// ============================================================
// MEDIA STATUS
// ============================================================

function MediaStatus({
    label,
    media
}: {
    label: string;
    media: SalonMedia;
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                borderRadius: 1.5
            }}
        >
            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row'
                }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{
                    xs: 'flex-start',
                    sm: 'center'
                }}
            >
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                >
                    {media.objectUrl ? (
                        <Avatar
                            variant="rounded"
                            src={
                                media.objectUrl
                            }
                            sx={{
                                width: 64,
                                height: 48
                            }}
                        />
                    ) : (
                        <Avatar
                            variant="rounded"
                            sx={{
                                width: 64,
                                height: 48
                            }}
                        >
                            <EyeOutlined />
                        </Avatar>
                    )}

                    <Box>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600
                            }}
                        >
                            {label}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {media.mediaType ||
                                '-'}
                        </Typography>
                    </Box>
                </Stack>

                <Chip
                    size="small"
                    label={
                        media.status || 'PENDING'
                    }
                    color={getMediaStatusColor(
                        media.status
                    )}
                />
            </Stack>

            <Divider
                sx={{
                    my: 1.5
                }}
            />

            <Grid
                container
                spacing={1.5}
            >
                <Grid
                    item
                    xs={12}
                    sm={6}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Uploaded At
                    </Typography>

                    <Typography variant="body2">
                        {formatDate(
                            media.uploadedAt
                        )}
                    </Typography>
                </Grid>

                {media.approvedBy && (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Approved By
                        </Typography>

                        <Typography variant="body2">
                            {
                                media.approvedBy
                            }
                        </Typography>
                    </Grid>
                )}

                {media.approvedAt && (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Approved At
                        </Typography>

                        <Typography variant="body2">
                            {formatDate(
                                media.approvedAt
                            )}
                        </Typography>
                    </Grid>
                )}

                {media.rejectedBy && (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Rejected By
                        </Typography>

                        <Typography variant="body2">
                            {
                                media.rejectedBy
                            }
                        </Typography>
                    </Grid>
                )}

                {media.rejectedAt && (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Rejected At
                        </Typography>

                        <Typography variant="body2">
                            {formatDate(
                                media.rejectedAt
                            )}
                        </Typography>
                    </Grid>
                )}

                {media.rejectionReason && (
                    <Grid
                        item
                        xs={12}
                    >
                        <Alert
                            severity="error"
                            sx={{
                                mt: 1
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600
                                }}
                            >
                                Media Rejection Reason
                            </Typography>

                            <Typography variant="body2">
                                {
                                    media.rejectionReason
                                }
                            </Typography>
                        </Alert>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
}