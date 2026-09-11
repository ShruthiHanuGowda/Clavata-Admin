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

import { alpha } from '@mui/material/styles';

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
    salonName: string;
    ownerName: string;
    businessType: string;
    email: string;
    ownerPhoneNumber: string;
    alternatePhone?: string | null;
    address: SalonAddress;
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
    salonId?: string | null;
    mediaType: string;
    key: string;
    objectUrl?: string | null;

    /*
     * These fields are optional because media inside
     * SalonProfileChanges is REQUESTED media, not independently
     * approved media.
     */
    status?: string | null;
    uploadedAt?: string | null;
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

    /*
     * Requested media belonging to THIS profile request.
     */
    logoMedia?: SalonMedia | null;
    coverMedia?: SalonMedia | null;
    galleryMedia?: SalonMedia[] | null;

    /*
     * Original live media stored by the backend for audit.
     */
    previousLogoMedia?: SalonMedia | null;
    previousCoverMedia?: SalonMedia | null;
    previousGalleryMedia?: SalonMedia[] | null;

    /*
     * Media-specific change summary.
     */
    mediaChanges?:
        | SalonProfileFieldChange[]
        | string
        | null;

    status: ProfileChangeStatus;

    submittedBy: string;
    submittedAt: string;

    reviewedBy?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;

    previousProfile?:
        | SalonProfileSnapshot
        | string
        | null;

    requestedProfile?:
        | SalonProfileSnapshot
        | string
        | null;

    changes?:
        | SalonProfileFieldChange[]
        | string
        | null;

    changedFields?: string[] | string | null;

    changeCount?: number | null;
}

interface ApiResponse {
    success?: boolean;
    message?: string | null;
    change?: SalonProfileChange | null;
}

// ============================================================
// SAFE AWSJSON PARSERS
// ============================================================

const parseJsonValue = <T,>(
    value: unknown
): T | null => {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    if (typeof value !== 'string') {
        return value as T;
    }

    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    try {
        return JSON.parse(trimmed) as T;
    } catch {
        return null;
    }
};

const getPreviousProfile = (
    change: SalonProfileChange
): SalonProfileSnapshot | null => {
    return parseJsonValue<SalonProfileSnapshot>(
        change.previousProfile
    );
};

const getRequestedProfile = (
    change: SalonProfileChange
): SalonProfileSnapshot | null => {
    return parseJsonValue<SalonProfileSnapshot>(
        change.requestedProfile
    );
};

const getStoredChanges = (
    change: SalonProfileChange
): SalonProfileFieldChange[] => {
    const parsed =
        parseJsonValue<SalonProfileFieldChange[]>(
            change.changes
        );

    return Array.isArray(parsed)
        ? parsed
        : [];
};

const getMediaChanges = (
    change: SalonProfileChange
): SalonProfileFieldChange[] => {
    const parsed =
        parseJsonValue<SalonProfileFieldChange[]>(
            change.mediaChanges
        );

    return Array.isArray(parsed)
        ? parsed
        : [];
};

const getChangedFields = (
    change: SalonProfileChange
): string[] => {
    const parsed =
        parseJsonValue<string[]>(
            change.changedFields
        );

    return Array.isArray(parsed)
        ? parsed
        : [];
};

// ============================================================
// HELPERS
// ============================================================

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

const getChangeChipColor = (
    changeType?: ProfileChangeType
):
    | 'warning'
    | 'success'
    | 'error' => {
    switch (changeType) {
        case 'ADDED':
            return 'success';

        case 'REMOVED':
            return 'error';

        case 'UPDATED':
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
    // Null / undefined
    if (value === null || value === undefined) {
        return 'Not provided';
    }

    // Strings
    if (typeof value === 'string') {
        const trimmed = value.trim();

        // Empty string
        if (!trimmed) {
            return 'Not provided';
        }

        // JSON encoded empty string: ""
        if (trimmed === '""' || trimmed === "''") {
            return 'Not provided';
        }

        // Try parsing AWSJSON / JSON encoded values
        try {
            const parsed = JSON.parse(trimmed);

            // JSON string
            if (typeof parsed === 'string') {
                const parsedTrimmed = parsed.trim();

                return parsedTrimmed
                    ? parsed
                    : 'Not provided';
            }

            // JSON object / array / other value
            return formatChangeValue(parsed);
        } catch {
            // Normal non-JSON string
            return value;
        }
    }

    // Numbers / booleans
    if (
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return String(value);
    }

    // Arrays
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return 'Not provided';
        }

        return value
            .map((item) => formatChangeValue(item))
            .join(', ');
    }

    // Objects
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    }

    return String(value);
};

// ============================================================
// NORMALIZE VALUE FOR COMPARISON
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

    if (typeof value === 'string') {
        return value.trim();
    }

    return String(value).trim();
};

// ============================================================
// FALLBACK PROFILE CHANGE DETECTION
// ============================================================

const buildFallbackChanges = (
    change: SalonProfileChange
): SalonProfileFieldChange[] => {
    const previous =
        getPreviousProfile(change);

    const requested =
        getRequestedProfile(change) || {
            salonName: change.salonName,
            ownerName: change.ownerName,
            businessType: change.businessType,
            email: change.email,
            ownerPhoneNumber:
                change.ownerPhoneNumber,
            alternatePhone:
                change.alternatePhone,
            address:
                change.address || {
                    addressLine: '',
                    city: '',
                    state: '',
                    pincode: ''
                }
        };

    if (!previous) {
        return [];
    }

    const result: SalonProfileFieldChange[] =
        [];

    const compareField = (
        field: string,
        label: string,
        oldValue: unknown,
        newValue: unknown
    ) => {
        if (
            normalizeCompareValue(
                oldValue
            ) ===
            normalizeCompareValue(
                newValue
            )
        ) {
            return;
        }

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

        if (
            oldEmpty &&
            !newEmpty
        ) {
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

// ============================================================
// ACTUAL PROFILE CHANGES
// ============================================================

const getActualProfileChanges = (
    change: SalonProfileChange
): SalonProfileFieldChange[] => {
    const storedChanges =
        getStoredChanges(change);

    if (storedChanges.length > 0) {
        return storedChanges;
    }

    return buildFallbackChanges(change);
};

// ============================================================
// ACTUAL MEDIA CHANGES
// ============================================================

const getActualMediaChanges = (
    change: SalonProfileChange
): SalonProfileFieldChange[] => {
    return getMediaChanges(change);
};

// ============================================================
// ALL CHANGES
// ============================================================

const getAllActualChanges = (
    change: SalonProfileChange
): SalonProfileFieldChange[] => {
    const profileChanges =
        getActualProfileChanges(change);

    const mediaChanges =
        getActualMediaChanges(change);

    return [
        ...profileChanges,
        ...mediaChanges
    ];
};

// ============================================================
// MEDIA HELPERS
// ============================================================

const getRequestedMediaItems = (
    change: SalonProfileChange
) => {
    const items: Array<{
        type: 'LOGO' | 'COVER' | 'GALLERY';
        label: string;
        media: SalonMedia;
        index?: number;
    }> = [];

    if (change.logoMedia) {
        items.push({
            type: 'LOGO',
            label: 'Logo',
            media: change.logoMedia
        });
    }

    if (change.coverMedia) {
        items.push({
            type: 'COVER',
            label: 'Cover Image',
            media: change.coverMedia
        });
    }

    if (
        Array.isArray(
            change.galleryMedia
        )
    ) {
        change.galleryMedia.forEach(
            (media, index) => {
                if (!media) {
                    return;
                }

                items.push({
                    type: 'GALLERY',
                    label: `Gallery Image ${
                        index + 1
                    }`,
                    media,
                    index
                });
            }
        );
    }

    /*
     * Fallback for older records that have URLs
     * but don't have media objects.
     */

    if (
        !change.logoMedia &&
        change.logoUrl
    ) {
        items.push({
            type: 'LOGO',
            label: 'Logo',
            media: {
                imageId:
                    `legacy-logo-${change.changeId}`,
                salonId:
                    change.salonId,
                mediaType: 'LOGO',
                key: '',
                objectUrl:
                    change.logoUrl
            }
        });
    }

    if (
        !change.coverMedia &&
        change.coverImageUrl
    ) {
        items.push({
            type: 'COVER',
            label: 'Cover Image',
            media: {
                imageId:
                    `legacy-cover-${change.changeId}`,
                salonId:
                    change.salonId,
                mediaType: 'COVER',
                key: '',
                objectUrl:
                    change.coverImageUrl
            }
        });
    }

    if (
        (!change.galleryMedia ||
            change.galleryMedia.length === 0) &&
        Array.isArray(
            change.galleryImages
        )
    ) {
        change.galleryImages.forEach(
            (url, index) => {
                if (!url) {
                    return;
                }

                items.push({
                    type: 'GALLERY',
                    label: `Gallery Image ${
                        index + 1
                    }`,
                    media: {
                        imageId:
                            `legacy-gallery-${change.changeId}-${index}`,
                        salonId:
                            change.salonId,
                        mediaType:
                            'GALLERY',
                        key: '',
                        objectUrl: url
                    },
                    index
                });
            }
        );
    }

    return items;
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function SalonProfileChanges() {
    const [status, setStatus] =
        useState<ProfileChangeStatus>(
            'PENDING'
        );

    const [
        selectedChange,
        setSelectedChange
    ] =
        useState<SalonProfileChange | null>(
            null
        );

    const [
        viewModalOpen,
        setViewModalOpen
    ] = useState(false);

    const [
        approveModalOpen,
        setApproveModalOpen
    ] = useState(false);

    const [
        rejectModalOpen,
        setRejectModalOpen
    ] = useState(false);

    const [
        rejectionReason,
        setRejectionReason
    ] = useState('');

    const [
        actionError,
        setActionError
    ] = useState<string | null>(null);

    const [
        actionSuccess,
        setActionSuccess
    ] = useState<string | null>(null);

    // ========================================================
    // QUERY
    // ========================================================

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

    // ========================================================
    // APPROVE
    // ========================================================

    const [
        approveProfileChange,
        {
            loading: approving
        }
    ] = useMutation(
        ADMIN_APPROVE_SALON_PROFILE_CHANGE
    );

    // ========================================================
    // REJECT
    // ========================================================

    const [
        rejectProfileChange,
        {
            loading: rejecting
        }
    ] = useMutation(
        ADMIN_REJECT_SALON_PROFILE_CHANGE
    );

    // ========================================================
    // DATA
    // ========================================================

    const changes: SalonProfileChange[] =
        data
            ?.adminSalonProfileChanges
            ?.changes || [];

    const totalCount =
        data
            ?.adminSalonProfileChanges
            ?.totalCount || 0;

    // ========================================================
    // TABLE COLUMNS
    // ========================================================

    const columns = useMemo(
        () => [
            'Salon',
            'Owner',
            'Business Type',
            'Submitted',
            'Changes',
            'Status',
            'Actions'
        ],
        []
    );

    // ========================================================
    // STATUS CHANGE
    // ========================================================

    const handleStatusChange = (
        event: SelectChangeEvent
    ) => {
        setStatus(
            event.target.value as ProfileChangeStatus
        );

        setActionError(null);
        setActionSuccess(null);
    };

    // ========================================================
    // VIEW
    // ========================================================

    const handleView = (
        change: SalonProfileChange
    ) => {
        setSelectedChange(change);
        setViewModalOpen(true);

        setActionError(null);
        setActionSuccess(null);
    };

    // ========================================================
    // CLOSE VIEW
    // ========================================================

    const handleCloseView = () => {
        if (
            approving ||
            rejecting
        ) {
            return;
        }

        setViewModalOpen(false);
        setSelectedChange(null);
    };

    // ========================================================
    // OPEN APPROVE
    // ========================================================

    const openApproveModal = (
        change: SalonProfileChange
    ) => {
        setSelectedChange(change);
        setApproveModalOpen(true);

        setActionError(null);
        setActionSuccess(null);
    };

    // ========================================================
    // CLOSE APPROVE
    // ========================================================

    const closeApproveModal = () => {
        if (approving) {
            return;
        }

        setApproveModalOpen(false);
        setActionError(null);
    };

    // ========================================================
    // APPROVE
    // ========================================================

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
                    'Failed to approve salon profile changes.'
                );
            }

            setActionSuccess(
                response.message ||
                'Salon profile and media changes approved successfully.'
            );

            setApproveModalOpen(false);
            setViewModalOpen(false);
            setSelectedChange(null);

            await refetch();
        } catch (err: any) {
            setActionError(
                err?.message ||
                'Unable to approve salon profile changes.'
            );
        }
    };

    // ========================================================
    // OPEN REJECT
    // ========================================================

    const openRejectModal = (
        change: SalonProfileChange
    ) => {
        setSelectedChange(change);
        setRejectionReason('');
        setRejectModalOpen(true);

        setActionError(null);
        setActionSuccess(null);
    };

    // ========================================================
    // CLOSE REJECT
    // ========================================================

    const closeRejectModal = () => {
        if (rejecting) {
            return;
        }

        setRejectModalOpen(false);
        setRejectionReason('');
        setActionError(null);
    };

    // ========================================================
    // REJECT
    // ========================================================

    const handleReject = async () => {
        if (!selectedChange) {
            return;
        }

        const reason =
            rejectionReason.trim();

        if (!reason) {
            setActionError(
                'Please enter a rejection reason before rejecting the salon changes.'
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
                    'Failed to reject salon profile changes.'
                );
            }

            setActionSuccess(
                response.message ||
                'The salon profile and media changes have been rejected.'
            );

            setRejectModalOpen(false);
            setViewModalOpen(false);
            setSelectedChange(null);
            setRejectionReason('');

            await refetch();
        } catch (err: any) {
            setActionError(
                err?.message ||
                'Unable to reject salon profile changes.'
            );
        }
    };

    // ========================================================
    // RETURN
    // ========================================================

    return (
        <Box>
            {/* ====================================================
                HEADER
            ==================================================== */}

            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: {
                        xs: 'flex-start',
                        md: 'center'
                    },
                    justifyContent:
                        'space-between',
                    flexDirection: {
                        xs: 'column',
                        md: 'row'
                    },
                    gap: 2
                }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            mb: 0.5
                        }}
                    >
                        Salon Profile Changes
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Review profile information
                        and requested media changes
                        together before approving or
                        rejecting the salon request.
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
                        onClick={() =>
                            refetch()
                        }
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Stack>
            </Box>

            {/* ====================================================
                SUCCESS
            ==================================================== */}

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

            {/* ====================================================
                GENERAL ERROR
            ==================================================== */}

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

            {/* ====================================================
                TABLE
            ==================================================== */}

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
                            Unable to load profile
                            changes
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
                            alignItems:
                                'center',
                            justifyContent:
                                'center',
                            flexDirection:
                                'column',
                            gap: 2
                        }}
                    >
                        <CircularProgress />

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Loading salon profile
                            changes...
                        </Typography>
                    </Box>
                ) : changes.length ===
                    0 ? (
                    <Box
                        sx={{
                            minHeight: 300,
                            display: 'flex',
                            alignItems:
                                'center',
                            justifyContent:
                                'center',
                            flexDirection:
                                'column',
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
                            {status ===
                                'PENDING'
                                ? 'No pending salon changes'
                                : 'No salon changes found'}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                        >
                            There are currently
                            no salon profile or
                            media change requests
                            for this status.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {columns.map(
                                        (
                                            column
                                        ) => (
                                            <TableCell
                                                key={
                                                    column
                                                }
                                                sx={{
                                                    fontWeight: 600,
                                                    whiteSpace:
                                                        'nowrap'
                                                }}
                                            >
                                                {
                                                    column
                                                }
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
                                        const allChanges =
                                            getAllActualChanges(
                                                change
                                            );

                                        const profileChangeCount =
                                            getActualProfileChanges(
                                                change
                                            ).length;

                                        const mediaChangeCount =
                                            getActualMediaChanges(
                                                change
                                            ).length;

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
                                                        spacing={
                                                            1.5
                                                        }
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

                                                {/* CHANGES */}

                                                <TableCell>
                                                    <Stack
                                                        spacing={
                                                            0.7
                                                        }
                                                    >
                                                        <Chip
                                                            size="small"
                                                            variant="outlined"
                                                            label={`${allChanges.length} total`}
                                                        />

                                                        {profileChangeCount >
                                                            0 && (
                                                            <Chip
                                                                size="small"
                                                                color="warning"
                                                                variant="outlined"
                                                                label={`${profileChangeCount} profile`}
                                                            />
                                                        )}

                                                        {mediaChangeCount >
                                                            0 && (
                                                            <Chip
                                                                size="small"
                                                                color="info"
                                                                variant="outlined"
                                                                label={`${mediaChangeCount} media`}
                                                            />
                                                        )}
                                                    </Stack>
                                                </TableCell>

                                                {/* STATUS */}

                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={getStatusLabel(
                                                            change.status
                                                        )}
                                                        color={getStatusColor(
                                                            change.status
                                                        )}
                                                    />
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
                                                            title="View complete request"
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
                    changes.length >
                    0 && (
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderTop:
                                    '1px solid',
                                borderColor:
                                    'divider'
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Total {totalCount}{' '}
                                salon change
                                request
                                {totalCount ===
                                    1
                                    ? ''
                                    : 's'}
                            </Typography>
                        </Box>
                    )}
            </Paper>

            {/* ====================================================
                VIEW COMPLETE REQUEST
            ==================================================== */}

            <Dialog
                open={viewModalOpen}
                onClose={
                    handleCloseView
                }
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
                                Salon Change Request
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
                            change={
                                selectedChange
                            }
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
                                disabled={
                                    rejecting
                                }
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
                                disabled={
                                    approving
                                }
                            >
                                Approve Changes
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* ====================================================
                APPROVE
            ==================================================== */}

            <Dialog
                open={
                    approveModalOpen
                }
                onClose={
                    closeApproveModal
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Approve Complete Salon Request?
                </DialogTitle>

                <DialogContent dividers>
                    {selectedChange && (
                        <Stack spacing={2}>
                            <Alert severity="warning">
                                You are about to
                                approve the complete
                                profile request for{' '}
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
                                This approval applies
                                to the profile
                                information and all
                                requested logo, cover,
                                and gallery media
                                together.
                            </Typography>

                            <ProfileChangeSummary
                                change={
                                    selectedChange
                                }
                            />

                            <Typography variant="body2">
                                Once approved, the
                                requested profile and
                                media will become the
                                salon's active
                                information.
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
                        disabled={
                            approving
                        }
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
                        onClick={
                            handleApprove
                        }
                        disabled={
                            approving
                        }
                    >
                        {approving
                            ? 'Approving...'
                            : 'Approve Complete Request'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ====================================================
                REJECTION
            ==================================================== */}

            <Dialog
                open={
                    rejectModalOpen
                }
                onClose={
                    closeRejectModal
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Reject Complete Salon Request
                </DialogTitle>

                <DialogContent dividers>
                    {selectedChange && (
                        <Stack spacing={2}>
                            <Alert severity="warning">
                                Rejecting the complete
                                profile and media
                                request for{' '}
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
                                The current live salon
                                profile will remain
                                unchanged. The salon
                                owner will receive the
                                rejection reason.
                            </Typography>

                            <ProfileChangeSummary
                                change={
                                    selectedChange
                                }
                            />

                            <TextField
                                fullWidth
                                multiline
                                minRows={5}
                                maxRows={10}
                                label="Rejection Reason"
                                placeholder="Enter rejection reason..."
                                value={rejectionReason}
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
                                    {
                                        actionError
                                    }
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
                        disabled={
                            rejecting
                        }
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
                        onClick={
                            handleReject
                        }
                        disabled={
                            rejecting
                        }
                    >
                        {rejecting
                            ? 'Rejecting...'
                            : 'Reject Complete Request'}
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
    const actualProfileChanges =
        getActualProfileChanges(change);

    const actualMediaChanges =
        getActualMediaChanges(change);

    const requestedMedia =
        getRequestedMediaItems(change);

    return (
        <Stack spacing={3}>
            {/* ====================================================
                COMPLETE CHANGE SUMMARY
            ==================================================== */}

            <ProfileChangeSummary
                change={change}
            />

            {/* ====================================================
                STATUS
            ==================================================== */}

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
                    Request Status:{' '}
                    {getStatusLabel(
                        change.status
                    )}
                </Typography>

                <Typography variant="body2">
                    {change.status ===
                        'PENDING'
                        ? 'The profile information and requested media are waiting for admin review.'
                        : change.status ===
                            'REJECTED'
                            ? change.rejectionReason ||
                            'This complete salon change request was rejected.'
                            : 'The profile information and requested media were approved together.'}
                </Typography>
            </Alert>

            {/* ====================================================
                BUSINESS INFORMATION
            ==================================================== */}

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
                            value={
                                change.salonName
                            }
                            change={
                                actualProfileChanges
                            }
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Owner Name"
                            field="ownerName"
                            value={
                                change.ownerName
                            }
                            change={
                                actualProfileChanges
                            }
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Business Type"
                            field="businessType"
                            value={
                                change.businessType ||
                                'Not provided'
                            }
                            change={
                                actualProfileChanges
                            }
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Email"
                            field="email"
                            value={
                                formatChangeValue(
                                    change.email
                                )
                            }
                            change={
                                actualProfileChanges
                            }
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Owner Phone Number"
                            field="ownerPhoneNumber"
                            value={
                                formatChangeValue(
                                    change.ownerPhoneNumber
                                )
                            }
                            change={
                                actualProfileChanges
                            }
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Alternate Phone"
                            field="alternatePhone"
                            value={
                                formatChangeValue(
                                    change.alternatePhone
                                )
                            }
                            change={
                                actualProfileChanges
                            }
                            xs={12}
                            sm={6}
                        />

                        <InfoItem
                            label="Submitted By"
                            value={
                                change.submittedBy ||
                                'Not provided'
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

            {/* ====================================================
                ADDRESS
            ==================================================== */}

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
                                formatChangeValue(
                                    change.address
                                        ?.addressLine
                                )
                            }
                            change={
                                actualProfileChanges
                            }
                            xs={12}
                        />

                        <HighlightedInfoItem
                            label="City"
                            field="address.city"
                            value={
                                formatChangeValue(
                                    change.address
                                        ?.city
                                )
                            }
                            change={
                                actualProfileChanges
                            }
                            xs={12}
                            sm={4}
                        />

                        <HighlightedInfoItem
                            label="State"
                            field="address.state"
                            value={
                                formatChangeValue(
                                    change.address
                                        ?.state
                                )
                            }
                            change={
                                actualProfileChanges
                            }
                            xs={12}
                            sm={4}
                        />

                        <HighlightedInfoItem
                            label="Pincode"
                            field="address.pincode"
                            value={
                                formatChangeValue(
                                    change.address
                                        ?.pincode
                                )
                            }
                            change={
                                actualProfileChanges
                            }
                            xs={12}
                            sm={4}
                        />
                    </Grid>
                </Paper>
            </Box>

            <Divider />

            {/* ====================================================
                REQUESTED MEDIA
            ==================================================== */}

            <Box>
                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row'
                    }}
                    alignItems={{
                        xs: 'flex-start',
                        sm: 'center'
                    }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600
                            }}
                        >
                            Requested Media
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            These images are part of
                            the same salon profile
                            approval request.
                        </Typography>
                    </Box>

                    {actualMediaChanges.length >
                        0 && (
                        <Chip
                            size="small"
                            color="info"
                            label={`${actualMediaChanges.length} media change${
                                actualMediaChanges.length ===
                                1
                                    ? ''
                                    : 's'
                            }`}
                        />
                    )}
                </Stack>

                {requestedMedia.length ===
                0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        No media changes requested.
                    </Typography>
                ) : (
                    <Grid
                        container
                        spacing={2}
                    >
                        {requestedMedia.map(
                            (
                                item
                            ) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    key={`${item.media.imageId}-${item.label}`}
                                >
                                    <ImagePreview
                                        url={
                                            item.media
                                                .objectUrl ||
                                            ''
                                        }
                                        label={
                                            item.label
                                        }
                                        mediaType={
                                            item.media
                                                .mediaType
                                        }
                                    />
                                </Grid>
                            )
                        )}
                    </Grid>
                )}
            </Box>

            {/* ====================================================
                MEDIA CHANGE DETAILS
            ==================================================== */}

            {actualMediaChanges.length >
                0 && (
                <>
                    <Divider />

                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                mb: 2
                            }}
                        >
                            Media Changes
                        </Typography>

                        <Stack spacing={1.5}>
                            {actualMediaChanges.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <MediaChangeItem
                                        key={`${item.field}-${index}`}
                                        change={
                                            item
                                        }
                                    />
                                )
                            )}
                        </Stack>
                    </Box>
                </>
            )}

            {/* ====================================================
                REJECTION
            ==================================================== */}

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
// COMPLETE CHANGE SUMMARY
// ============================================================

function ProfileChangeSummary({
    change
}: {
    change: SalonProfileChange;
}) {
    const profileChanges =
        getActualProfileChanges(change);

    const mediaChanges =
        getActualMediaChanges(change);

    const allChanges = [
        ...profileChanges,
        ...mediaChanges
    ];

    const backendCount =
        Number(change.changeCount);

    const totalCount =
        Number.isFinite(
            backendCount
        ) &&
        backendCount >=
            allChanges.length
            ? backendCount
            : allChanges.length;

    if (allChanges.length === 0) {
        return (
            <Alert severity="info">
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 600
                    }}
                >
                    No field-level changes
                    detected
                </Typography>

                <Typography variant="body2">
                    The submitted request does not
                    contain detectable profile or
                    media differences.
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
                borderColor:
                    'warning.main'
            }}
        >
            {/* HEADER */}

            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: (theme) =>
                        alpha(
                            theme.palette.warning
                                .main,
                            0.08
                        ),
                    borderBottom:
                        '1px solid',
                    borderColor:
                        'warning.main'
                }}
            >
                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row'
                    }}
                    alignItems={{
                        xs: 'flex-start',
                        sm: 'center'
                    }}
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
                            Review the complete
                            profile and media
                            request before making
                            your decision.
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                    >
                        <Chip
                            label={`${totalCount} total`}
                            color="warning"
                            sx={{
                                fontWeight: 700
                            }}
                        />

                        {profileChanges.length >
                            0 && (
                            <Chip
                                label={`${profileChanges.length} profile`}
                                variant="outlined"
                                color="warning"
                            />
                        )}

                        {mediaChanges.length >
                            0 && (
                            <Chip
                                label={`${mediaChanges.length} media`}
                                variant="outlined"
                                color="info"
                            />
                        )}
                    </Stack>
                </Stack>
            </Box>

            {/* CHANGES */}

            <Stack
                divider={
                    <Divider flexItem />
                }
            >
                {allChanges.map(
                    (
                        item,
                        index
                    ) => (
                        <ChangeSummaryItem
                            key={`${item.field}-${index}`}
                            item={item}
                            isMedia={mediaChanges.includes(
                                item
                            )}
                        />
                    )
                )}
            </Stack>
        </Paper>
    );
}

// ============================================================
// CHANGE SUMMARY ITEM
// ============================================================

function ChangeSummaryItem({
    item,
    isMedia
}: {
    item: SalonProfileFieldChange;
    isMedia: boolean;
}) {
    return (
        <Box
            sx={{
                p: 2,
                bgcolor: (theme) =>
                    alpha(
                        isMedia
                            ? theme.palette.info.main
                            : theme.palette.warning
                                  .main,
                        0.035
                    )
            }}
        >
            <Stack spacing={1}>
                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row'
                    }}
                    alignItems={{
                        xs: 'flex-start',
                        sm: 'center'
                    }}
                    justifyContent="space-between"
                    spacing={1}
                >
                    <Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
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

                            {isMedia && (
                                <Chip
                                    size="small"
                                    label="MEDIA"
                                    color="info"
                                    variant="outlined"
                                />
                            )}
                        </Stack>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {item.field}
                        </Typography>
                    </Box>

                    <Chip
                        size="small"
                        label={
                            item.changeType ||
                            'UPDATED'
                        }
                        color={getChangeChipColor(
                            item.changeType
                        )}
                    />
                </Stack>

                {/* CURRENT VALUE */}

                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: (theme) =>
                            alpha(
                                theme.palette.error
                                    .main,
                                0.06
                            ),
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
                            fontWeight:
                                700,
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
                            whiteSpace:
                                'pre-wrap',
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
                        display: 'flex',
                        justifyContent:
                            'center'
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: 700,
                            color: isMedia
                                ? 'info.main'
                                : 'warning.main',
                            fontSize: 18
                        }}
                    >
                        ↓
                    </Typography>
                </Box>

                {/* REQUESTED VALUE */}

                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: (theme) =>
                            alpha(
                                theme.palette.success
                                    .main,
                                0.06
                            ),
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
                            fontWeight:
                                700,
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
                            fontWeight:
                                700,
                            wordBreak:
                                'break-word',
                            whiteSpace:
                                'pre-wrap'
                        }}
                    >
                        {formatChangeValue(
                            item.newValue
                        )}
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );
}

// ============================================================
// MEDIA CHANGE ITEM
// ============================================================

function MediaChangeItem({
    change
}: {
    change: SalonProfileFieldChange;
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                borderColor:
                    'info.light',
                bgcolor: (theme) =>
                    alpha(
                        theme.palette.info.main,
                        0.025
                    )
            }}
        >
            <Stack spacing={1.5}>
                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row'
                    }}
                    justifyContent="space-between"
                    spacing={1}
                >
                    <Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 700
                                }}
                            >
                                {change.label ||
                                    change.field}
                            </Typography>

                            <Chip
                                size="small"
                                label="MEDIA"
                                color="info"
                                variant="outlined"
                            />
                        </Stack>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {change.field}
                        </Typography>
                    </Box>

                    <Chip
                        size="small"
                        label={
                            change.changeType ||
                            'UPDATED'
                        }
                        color={getChangeChipColor(
                            change.changeType
                        )}
                    />
                </Stack>

                <Grid
                    container
                    spacing={1.5}
                >
                    <Grid
                        item
                        xs={12}
                        sm={6}
                    >
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                bgcolor: (theme) =>
                                    alpha(
                                        theme.palette
                                            .error
                                            .main,
                                        0.05
                                    )
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight:
                                        700,
                                    color:
                                        'error.main'
                                }}
                            >
                                CURRENT MEDIA
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 0.5,
                                    wordBreak:
                                        'break-word'
                                }}
                            >
                                {formatChangeValue(
                                    change.oldValue
                                )}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        sm={6}
                    >
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                bgcolor: (theme) =>
                                    alpha(
                                        theme.palette
                                            .success
                                            .main,
                                        0.05
                                    )
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight:
                                        700,
                                    color:
                                        'success.main'
                                }}
                            >
                                REQUESTED MEDIA
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 0.5,
                                    wordBreak:
                                        'break-word'
                                }}
                            >
                                {formatChangeValue(
                                    change.newValue
                                )}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
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
        (item) =>
            item.field === field
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
                borderBottom:
                    '1px solid',
                borderColor:
                    'divider'
            }}
        >
            <Box
                sx={{
                    p: 2,
                    minHeight: 70,
                    bgcolor: (theme) =>
                        alpha(
                            theme.palette.warning
                                .main,
                            0.08
                        ),
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
                            display:
                                'block',
                            fontWeight: 700,
                            color:
                                'warning.dark'
                        }}
                    >
                        {label}
                    </Typography>

                    <Chip
                        size="small"
                        label={
                            changed.changeType
                        }
                        color={getChangeChipColor(
                            changed.changeType
                        )}
                        sx={{
                            height: 22,
                            fontSize: 10,
                            fontWeight: 700
                        }}
                    />
                </Stack>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display:
                            'block'
                    }}
                >
                    Current
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        wordBreak:
                            'break-word',
                        textDecoration:
                            changed.changeType ===
                                'UPDATED'
                                ? 'line-through'
                                : 'none',
                        color:
                            'error.main'
                    }}
                >
                    {formatChangeValue(
                        changed.oldValue
                    )}
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display:
                            'block',
                        mt: 0.8
                    }}
                >
                    Requested
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 700,
                        wordBreak:
                            'break-word',
                        color:
                            'success.main'
                    }}
                >
                    {formatChangeValue(
                        changed.newValue
                    )}
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
                        display:
                            'block',
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
    label,
    mediaType
}: {
    url: string;
    label: string;
    mediaType?: string | null;
}) {
    const [
        imageOpen,
        setImageOpen
    ] = useState(false);

    if (!url) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
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
                    <Stack
                        spacing={1}
                        alignItems="center"
                    >
                        <EyeOutlined />

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            No image URL
                        </Typography>
                    </Stack>
                </Box>

                <Box sx={{ p: 1.5 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600
                        }}
                    >
                        {label}
                    </Typography>
                </Box>
            </Paper>
        );
    }

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
                        alt={label}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onError={(
                            event
                        ) => {
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
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={1}
                        alignItems="center"
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600
                            }}
                        >
                            {label}
                        </Typography>

                        {mediaType && (
                            <Chip
                                size="small"
                                label={mediaType}
                                color="info"
                                variant="outlined"
                            />
                        )}
                    </Stack>

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
                    setImageOpen(
                        false
                    )
                }
                maxWidth="lg"
            >
                <DialogTitle>
                    {label}
                </DialogTitle>

                <DialogContent
                    sx={{
                        p: 1,
                        bgcolor: 'black'
                    }}
                >
                    <Box
                        component="img"
                        src={url}
                        alt={label}
                        sx={{
                            display:
                                'block',
                            maxWidth:
                                '90vw',
                            maxHeight:
                                '85vh',
                            objectFit:
                                'contain'
                        }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setImageOpen(
                                false
                            )
                        }
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}