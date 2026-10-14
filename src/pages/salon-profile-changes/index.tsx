
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
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';

import {
    ADMIN_APPROVE_SALON_PROFILE_CHANGE,
    ADMIN_REJECT_SALON_PROFILE_CHANGE,
    ADMIN_SALON_PROFILE_CHANGES,
} from '../../graphql/queries';

// ============================================================
// TYPES
// ============================================================

type ProfileChangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type PageView = 'REQUESTS' | 'HISTORY';
type ProfileChangeType = 'ADDED' | 'UPDATED' | 'REMOVED';

interface SalonAddress {
    addressLine?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
}

interface SalonProfileSnapshot {
    salonName?: string | null;
    ownerName?: string | null;
    email?: string | null;
    ownerPhoneNumber?: string | null;
    alternatePhone?: string | null;
    address?: SalonAddress | null;

    categorySelections?: unknown;
    subcategorySelections?: unknown;
    serviceSelections?: unknown;

    [key: string]: unknown;
}

interface SalonProfileFieldChange {
    field: string;
    label?: string;
    oldValue?: unknown;
    newValue?: unknown;
    changeType?: ProfileChangeType;
}

interface SalonMedia {
    imageId: string;
    salonId?: string | null;
    mediaType: string;
    key: string;
    objectUrl?: string | null;
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

    previousLogoMedia?: SalonMedia | null;
    previousCoverMedia?: SalonMedia | null;
    previousGalleryMedia?: SalonMedia[] | null;

    mediaChanges?: SalonProfileFieldChange[] | string | null;
    status: ProfileChangeStatus;

    submittedBy: string;
    submittedAt: string;

    reviewedBy?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;

    previousProfile?: SalonProfileSnapshot | string | null;
    requestedProfile?: SalonProfileSnapshot | string | null;
    changes?: SalonProfileFieldChange[] | string | null;
    changedFields?: string[] | string | null;
    changeCount?: number | null;
}

interface ApiResponse {
    success?: boolean;
    message?: string | null;
    change?: SalonProfileChange | null;
}

interface MediaPreviewItem {
    media: SalonMedia;
    label: string;
}

type SelectionRecord = {
    audiences?: string[] | string;
    audience?: string;
    categoryId?: string;
    categoryName?: string;
    subcategoryId?: string;
    subcategoryName?: string;
    serviceId?: string;
    serviceName?: string;
    name?: string;
    [key: string]: unknown;
};

type SelectionContext = {
    categorySelections?: unknown;
    subcategorySelections?: unknown;
    serviceSelections?: unknown;
};

// ============================================================
// CONSTANTS
// ============================================================

const SELECTION_FIELDS = [
    'categorySelections',
    'subcategorySelections',
    'serviceSelections',
] as const;

const PROFILE_FIELD_DEFINITIONS: Array<{
    field: string;
    label: string;
}> = [
    { field: 'salonName', label: 'Salon Name' },
    { field: 'ownerName', label: 'Owner Name' },
    { field: 'email', label: 'Email' },
    {
        field: 'ownerPhoneNumber',
        label: 'Owner Phone Number',
    },
    {
        field: 'alternatePhone',
        label: 'Alternate Phone',
    },
    {
        field: 'address.addressLine',
        label: 'Address Line',
    },
    { field: 'address.city', label: 'City' },
    { field: 'address.state', label: 'State' },
    { field: 'address.pincode', label: 'Pincode' },
    {
        field: 'categorySelections',
        label: 'Category Selections',
    },
    {
        field: 'subcategorySelections',
        label: 'Subcategory Selections',
    },
    {
        field: 'serviceSelections',
        label: 'Service Selections',
    },
];

// ============================================================
// AWSJSON PARSING
// ============================================================

function parseJsonValue<T>(value: unknown): T | null {
    if (value === null || value === undefined) {
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
}

function getPreviousProfile(
    change: SalonProfileChange,
): SalonProfileSnapshot | null {
    return parseJsonValue<SalonProfileSnapshot>(
        change.previousProfile,
    );
}

function getRequestedProfile(
    change: SalonProfileChange,
): SalonProfileSnapshot | null {
    return parseJsonValue<SalonProfileSnapshot>(
        change.requestedProfile,
    );
}

function getStoredChanges(
    change: SalonProfileChange,
): SalonProfileFieldChange[] {
    const result = parseJsonValue<SalonProfileFieldChange[]>(
        change.changes,
    );

    return Array.isArray(result) ? result : [];
}

function getMediaChanges(
    change: SalonProfileChange,
): SalonProfileFieldChange[] {
    const result = parseJsonValue<SalonProfileFieldChange[]>(
        change.mediaChanges,
    );

    return Array.isArray(result) ? result : [];
}

function getChangedFields(change: SalonProfileChange): string[] {
    const result = parseJsonValue<string[]>(change.changedFields);

    if (Array.isArray(result)) {
        return result.filter(
            (field): field is string => typeof field === 'string',
        );
    }

    if (typeof change.changedFields === 'string') {
        return change.changedFields
            .split(',')
            .map(field => field.trim())
            .filter(Boolean);
    }

    return [];
}

// ============================================================
// PROFILE NORMALIZATION
// ============================================================

function normalizeField(field: string): string {
    const normalized = field
        .replace(/\[(\d+)\]/g, '.$1')
        .replace(/[_\s]/g, '')
        .toLowerCase();

    const aliases: Record<string, string> = {
        salonname: 'salonname',
        ownername: 'ownername',
        email: 'email',
        ownerphonenumber: 'ownerphonenumber',
        phonenumber: 'ownerphonenumber',
        alternatephone: 'alternatephone',

        address: 'address.addressline',
        addressline: 'address.addressline',
        addressaddressline: 'address.addressline',
        addresscity: 'address.city',
        city: 'address.city',
        addressstate: 'address.state',
        state: 'address.state',
        addresspincode: 'address.pincode',
        pincode: 'address.pincode',
        postalcode: 'address.pincode',

        categoryselections: 'categoryselections',
        categoryselection: 'categoryselections',
        subcategoryselections: 'subcategoryselections',
        subcategoryselection: 'subcategoryselections',
        serviceselections: 'serviceselections',
        serviceselection: 'serviceselections',
    };

    return aliases[normalized] ?? normalized;
}

/**
 * IMPORTANT:
 * normalizeField() returns lowercase names.
 * Never compare those values directly against camelCase
 * entries in SELECTION_FIELDS.
 */
function isSelectionField(field: string): boolean {
    const normalized = normalizeField(field);

    return (
        normalized === 'categoryselections' ||
        normalized === 'subcategoryselections' ||
        normalized === 'serviceselections'
    );
}

function getSnapshotValue(
    profile: SalonProfileSnapshot | null,
    field: string,
): unknown {
    if (!profile) {
        return undefined;
    }

    const normalized = normalizeField(field);

    const values: Record<string, unknown> = {
        salonname: profile.salonName,
        ownername: profile.ownerName,
        email: profile.email,
        ownerphonenumber: profile.ownerPhoneNumber,
        alternatephone: profile.alternatePhone,

        'address.addressline': profile.address?.addressLine,
        'address.city': profile.address?.city,
        'address.state': profile.address?.state,
        'address.pincode': profile.address?.pincode,

        categoryselections: profile.categorySelections,
        subcategoryselections: profile.subcategorySelections,
        serviceselections: profile.serviceSelections,
    };

    if (
        normalized in values &&
        values[normalized] !== undefined
    ) {
        return values[normalized];
    }

    // Support equivalent keys in snapshots with different naming.
    const matchingKey = Object.keys(profile).find(
        key => normalizeField(key) === normalized,
    );

    if (matchingKey) {
        return profile[matchingKey];
    }

    return undefined;
}

function changeSnapshotValue(
    change: SalonProfileChange,
    field: string,
): unknown {
    const record = change as unknown as Record<string, unknown>;

    if (record[field] !== undefined && record[field] !== null) {
        return record[field];
    }

    const normalized = normalizeField(field);

    const matchingKey = Object.keys(record).find(
        key => normalizeField(key) === normalized,
    );

    if (matchingKey) {
        return record[matchingKey];
    }

    return undefined;
}

function getDisplayProfile(
    change: SalonProfileChange,
): SalonProfileSnapshot {
    const previous = getPreviousProfile(change);
    const requested = getRequestedProfile(change);

    const address =
        requested?.address ??
        change.address ??
        previous?.address ??
        {};

    return {
        salonName:
            requested?.salonName ??
            change.salonName ??
            previous?.salonName ??
            '',
        ownerName:
            requested?.ownerName ??
            change.ownerName ??
            previous?.ownerName ??
            '',
        email:
            requested?.email ??
            change.email ??
            previous?.email ??
            '',
        ownerPhoneNumber:
            requested?.ownerPhoneNumber ??
            change.ownerPhoneNumber ??
            previous?.ownerPhoneNumber ??
            '',
        alternatePhone:
            requested?.alternatePhone ??
            change.alternatePhone ??
            previous?.alternatePhone ??
            '',
        address: {
            addressLine: address.addressLine ?? '',
            city: address.city ?? '',
            state: address.state ?? '',
            pincode: address.pincode ?? '',
        },
        categorySelections:
            requested?.categorySelections ??
            changeSnapshotValue(change, 'categorySelections') ??
            previous?.categorySelections,
        subcategorySelections:
            requested?.subcategorySelections ??
            changeSnapshotValue(change, 'subcategorySelections') ??
            previous?.subcategorySelections,
        serviceSelections:
            requested?.serviceSelections ??
            changeSnapshotValue(change, 'serviceSelections') ??
            previous?.serviceSelections,
    };
}

function normalizeCompareValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return '';
        }
    }

    return String(value).trim();
}

function getChangeType(
    oldValue: unknown,
    newValue: unknown,
): ProfileChangeType {
    const oldEmpty = normalizeCompareValue(oldValue) === '';
    const newEmpty = normalizeCompareValue(newValue) === '';

    if (oldEmpty && !newEmpty) {
        return 'ADDED';
    }

    if (!oldEmpty && newEmpty) {
        return 'REMOVED';
    }

    return 'UPDATED';
}

// ============================================================
// SELECTION PARSING AND DISPLAY
// ============================================================

function parseSelectionArray(value: unknown): SelectionRecord[] {
    const parsedValue = parseJsonValue<unknown>(value);

    if (Array.isArray(parsedValue)) {
        return parsedValue
            .filter(
                item =>
                    !!item &&
                    typeof item === 'object' &&
                    !Array.isArray(item),
            )
            .map(item => item as SelectionRecord);
    }

    if (
        parsedValue &&
        typeof parsedValue === 'object' &&
        !Array.isArray(parsedValue)
    ) {
        return [parsedValue as SelectionRecord];
    }

    return [];
}

function formatAudience(value: unknown): string {
    const audiences: string[] = Array.isArray(value)
        ? value.map(item => String(item).trim()).filter(Boolean)
        : typeof value === 'string'
          ? value.split(',').map(item => item.trim()).filter(Boolean)
          : [];

    return audiences
        .map(audience => {
            switch (audience.toUpperCase()) {
                case 'FEMALE':
                    return 'Female';
                case 'MALE':
                    return 'Male';
                case 'KIDS':
                    return 'Kids';
                default:
                    return audience;
            }
        })
        .join(', ');
}

function getSelectionName(
    item: SelectionRecord,
    type: 'category' | 'subcategory' | 'service',
): string {
    if (type === 'category') {
        return (
            item.categoryName ||
            item.name ||
            item.categoryId ||
            'Unnamed category'
        );
    }

    if (type === 'subcategory') {
        return (
            item.subcategoryName ||
            item.name ||
            item.subcategoryId ||
            'Unnamed subcategory'
        );
    }

    return (
        item.serviceName ||
        item.name ||
        item.serviceId ||
        'Unnamed service'
    );
}

function getMatchingSelection(
    records: SelectionRecord[],
    id: string | undefined,
    key: 'categoryId' | 'subcategoryId' | 'serviceId',
): SelectionRecord | undefined {
    if (!id) {
        return undefined;
    }

    return records.find(item => item[key] === id);
}

function formatSelectionValue(
    value: unknown,
    field: string,
    context?: SelectionContext,
): string {
    if (value === null || value === undefined || value === '') {
        return 'Not provided';
    }

    const normalized = normalizeField(field);

    if (!isSelectionField(field)) {
        return formatChangeValue(value);
    }

    const records = parseSelectionArray(value);

    if (records.length === 0) {
        // Avoid displaying raw [] or JSON for selection fields.
        return 'No previous selections';
    }

    const categories = parseSelectionArray(
        context?.categorySelections,
    );

    const subcategories = parseSelectionArray(
        context?.subcategorySelections,
    );

    if (normalized === 'categoryselections') {
        return records
            .map(item => {
                const name = getSelectionName(item, 'category');
                const audiences = formatAudience(
                    item.audiences ?? item.audience,
                );

                return audiences ? `${name} (${audiences})` : name;
            })
            .join('\n');
    }

    if (normalized === 'subcategoryselections') {
        return records
            .map(item => {
                const category = getMatchingSelection(
                    categories,
                    item.categoryId,
                    'categoryId',
                );

                const categoryName =
                    item.categoryName ||
                    category?.categoryName ||
                    category?.name ||
                    item.categoryId ||
                    'Category';

                const subcategoryName = getSelectionName(
                    item,
                    'subcategory',
                );

                const audiences = formatAudience(
                    item.audiences ??
                    item.audience ??
                    category?.audiences,
                );

                const path = `${categoryName} › ${subcategoryName}`;

                return audiences ? `${path} (${audiences})` : path;
            })
            .join('\n');
    }

    return records
        .map(item => {
            const category = getMatchingSelection(
                categories,
                item.categoryId,
                'categoryId',
            );

            const subcategory = getMatchingSelection(
                subcategories,
                item.subcategoryId,
                'subcategoryId',
            );

            const categoryName =
                item.categoryName ||
                category?.categoryName ||
                category?.name ||
                item.categoryId ||
                'Category';

            const subcategoryName =
                item.subcategoryName ||
                subcategory?.subcategoryName ||
                subcategory?.name ||
                item.subcategoryId ||
                'Subcategory';

            const serviceName =
                item.serviceName ||
                item.name ||
                item.serviceId;

            const path = serviceName
                ? `${categoryName} › ${subcategoryName} › ${serviceName}`
                : `${categoryName} › ${subcategoryName}`;

            const audiences = formatAudience(
                item.audiences ??
                item.audience ??
                subcategory?.audiences,
            );

            return audiences ? `${path} (${audiences})` : path;
        })
        .join('\n');
}

/**
 * For selection fields, an empty array in the changes list can be
 * a placeholder rather than the authoritative previous/requested
 * snapshot. Prefer the snapshot when it contains actual selections.
 */
function resolveSelectionValue(
    storedValue: unknown,
    snapshotValue: unknown,
    field: string,
): unknown {
    if (!isSelectionField(field)) {
        return storedValue !== undefined && storedValue !== null
            ? storedValue
            : snapshotValue;
    }

    const storedRecords = parseSelectionArray(storedValue);
    const snapshotRecords = parseSelectionArray(snapshotValue);

    if (storedRecords.length > 0) {
        return storedValue;
    }

    if (snapshotRecords.length > 0) {
        return snapshotValue;
    }

    if (storedValue !== undefined && storedValue !== null) {
        return storedValue;
    }

    return snapshotValue;
}

// ============================================================
// FALLBACK CHANGE DETECTION
// ============================================================

function buildFallbackChanges(
    change: SalonProfileChange,
): SalonProfileFieldChange[] {
    const previous = getPreviousProfile(change);
    const requested = getRequestedProfile(change);

    if (!previous || !requested) {
        return [];
    }

    return PROFILE_FIELD_DEFINITIONS.flatMap(({ field, label }) => {
        const oldValue = getSnapshotValue(previous, field);
        const newValue = getSnapshotValue(requested, field);

        if (
            normalizeCompareValue(oldValue) ===
            normalizeCompareValue(newValue)
        ) {
            return [];
        }

        return [{
            field,
            label,
            oldValue,
            newValue,
            changeType: getChangeType(oldValue, newValue),
        }];
    });
}

function getActualProfileChanges(
    change: SalonProfileChange,
): SalonProfileFieldChange[] {
    const previous = getPreviousProfile(change);
    const requested = getRequestedProfile(change);
    const stored = getStoredChanges(change);

    const normalizedStored = stored.map(item => {
        const oldFromSnapshot = getSnapshotValue(
            previous,
            item.field,
        );

        const newFromSnapshot = getSnapshotValue(
            requested,
            item.field,
        );

        const oldValue = resolveSelectionValue(
            item.oldValue,
            oldFromSnapshot,
            item.field,
        );

        const newValue = resolveSelectionValue(
            item.newValue,
            newFromSnapshot,
            item.field,
        );

        return {
            ...item,
            label:
                item.label ||
                PROFILE_FIELD_DEFINITIONS.find(
                    definition =>
                        normalizeField(definition.field) ===
                        normalizeField(item.field),
                )?.label ||
                item.field,
            oldValue,
            newValue,
            changeType:
                item.changeType ||
                getChangeType(oldValue, newValue),
        };
    });

    // Add selection fields missing from the stored changes array.
    const existingFields = new Set(
        normalizedStored.map(item => normalizeField(item.field)),
    );

    const missingSelectionChanges: SalonProfileFieldChange[] = [];

    for (const definition of PROFILE_FIELD_DEFINITIONS) {
        if (!isSelectionField(definition.field)) {
            continue;
        }

        const normalized = normalizeField(definition.field);

        if (existingFields.has(normalized)) {
            continue;
        }

        const oldValue = getSnapshotValue(previous, definition.field);
        const newValue = getSnapshotValue(requested, definition.field);

        if (oldValue === undefined && newValue === undefined) {
            continue;
        }

        if (
            normalizeCompareValue(oldValue) ===
            normalizeCompareValue(newValue)
        ) {
            continue;
        }

        missingSelectionChanges.push({
            field: definition.field,
            label: definition.label,
            oldValue,
            newValue,
            changeType: getChangeType(oldValue, newValue),
        });
    }

    if (normalizedStored.length > 0) {
        return [
            ...normalizedStored,
            ...missingSelectionChanges,
        ];
    }

    const fallback = buildFallbackChanges(change);

    if (fallback.length > 0) {
        return fallback;
    }

    return getChangedFields(change).map(field => {
        const oldValue = getSnapshotValue(previous, field);
        const newValue = getSnapshotValue(requested, field);

        return {
            field,
            label:
                PROFILE_FIELD_DEFINITIONS.find(
                    definition =>
                        normalizeField(definition.field) ===
                        normalizeField(field),
                )?.label || field,
            oldValue,
            newValue,
            changeType: getChangeType(oldValue, newValue),
        };
    });
}

function getActualMediaChanges(
    change: SalonProfileChange,
): SalonProfileFieldChange[] {
    return getMediaChanges(change).map(item => ({
        ...item,
        label: item.label || item.field,
        changeType:
            item.changeType ||
            getChangeType(item.oldValue, item.newValue),
    }));
}

function getAllActualChanges(
    change: SalonProfileChange,
): SalonProfileFieldChange[] {
    return [
        ...getActualProfileChanges(change),
        ...getActualMediaChanges(change),
    ];
}

// ============================================================
// DISPLAY HELPERS
// ============================================================

function formatDate(value?: string | null): string {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function getStatusColor(
    status?: ProfileChangeStatus,
): 'warning' | 'success' | 'error' {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'error';
    return 'warning';
}

function getStatusLabel(status?: ProfileChangeStatus): string {
    if (status === 'PENDING') return 'Pending';
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    return '-';
}

function getChangeChipColor(
    type?: ProfileChangeType,
): 'warning' | 'success' | 'error' {
    if (type === 'ADDED') return 'success';
    if (type === 'REMOVED') return 'error';
    return 'warning';
}

function formatChangeValue(value: unknown): string {
    if (value === null || value === undefined) {
        return 'Not provided';
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (
            !trimmed ||
            trimmed === '""' ||
            trimmed === "''"
        ) {
            return 'Not provided';
        }

        try {
            const parsed: unknown = JSON.parse(trimmed);

            if (typeof parsed === 'string') {
                return parsed.trim() || 'Not provided';
            }

            if (parsed !== null && typeof parsed === 'object') {
                return JSON.stringify(parsed, null, 2);
            }
        } catch {
            // A normal string should be displayed as-is.
        }

        return value;
    }

    if (
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.length
            ? value.map(item => formatChangeValue(item)).join(', ')
            : 'Not provided';
    }

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

function formatFieldValue(
    value: unknown,
    field: string,
    context?: SelectionContext,
): string {
    if (isSelectionField(field)) {
        return formatSelectionValue(value, field, context);
    }

    return formatChangeValue(value);
}

// ============================================================
// REQUESTED MEDIA
// ============================================================

function getRequestedMediaItems(
    change: SalonProfileChange,
): MediaPreviewItem[] {
    const items: MediaPreviewItem[] = [];

    if (change.logoMedia || change.logoUrl) {
        const media = change.logoMedia;

        items.push({
            label: 'Logo',
            media: {
                imageId: media?.imageId || `logo-${change.changeId}`,
                salonId: media?.salonId || change.salonId,
                mediaType: media?.mediaType || 'LOGO',
                key: media?.key || '',
                objectUrl: media?.objectUrl || change.logoUrl || null,
                status: media?.status || change.status,
            },
        });
    }

    if (change.coverMedia || change.coverImageUrl) {
        const media = change.coverMedia;

        items.push({
            label: 'Cover Image',
            media: {
                imageId: media?.imageId || `cover-${change.changeId}`,
                salonId: media?.salonId || change.salonId,
                mediaType: media?.mediaType || 'COVER',
                key: media?.key || '',
                objectUrl:
                    media?.objectUrl ||
                    change.coverImageUrl ||
                    null,
                status: media?.status || change.status,
            },
        });
    }

    if (
        Array.isArray(change.galleryMedia) &&
        change.galleryMedia.length > 0
    ) {
        change.galleryMedia.forEach((media, index) => {
            items.push({
                label: `Gallery Image ${index + 1}`,
                media: {
                    ...media,
                    objectUrl:
                        media.objectUrl ||
                        change.galleryImages?.[index] ||
                        null,
                },
            });
        });
    } else {
        (change.galleryImages || []).forEach((url, index) => {
            items.push({
                label: `Gallery Image ${index + 1}`,
                media: {
                    imageId: `gallery-${change.changeId}-${index}`,
                    salonId: change.salonId,
                    mediaType: 'GALLERY',
                    key: '',
                    objectUrl: url,
                    status: change.status,
                },
            });
        });
    }

    return items;
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function SalonProfileChanges() {
    const [status, setStatus] =
        useState<ProfileChangeStatus>('PENDING');

    const [pageView, setPageView] =
        useState<PageView>('REQUESTS');

    const [selectedChange, setSelectedChange] =
        useState<SalonProfileChange | null>(null);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    const [rejectionReason, setRejectionReason] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const requestQuery = useQuery(ADMIN_SALON_PROFILE_CHANGES, {
        variables: { status },
        fetchPolicy: 'network-only',
        skip: pageView === 'HISTORY',
    });

    const approvedQuery = useQuery(ADMIN_SALON_PROFILE_CHANGES, {
        variables: { status: 'APPROVED' },
        fetchPolicy: 'network-only',
        skip: pageView !== 'HISTORY',
    });

    const rejectedQuery = useQuery(ADMIN_SALON_PROFILE_CHANGES, {
        variables: { status: 'REJECTED' },
        fetchPolicy: 'network-only',
        skip: pageView !== 'HISTORY',
    });

    const [approveProfileChange, { loading: approving }] =
        useMutation(ADMIN_APPROVE_SALON_PROFILE_CHANGE);

    const [rejectProfileChange, { loading: rejecting }] =
        useMutation(ADMIN_REJECT_SALON_PROFILE_CHANGE);

    const requestChanges: SalonProfileChange[] =
        requestQuery.data?.adminSalonProfileChanges?.changes || [];

    const requestTotalCount: number =
        requestQuery.data?.adminSalonProfileChanges?.totalCount || 0;

    const approvedHistory: SalonProfileChange[] =
        approvedQuery.data?.adminSalonProfileChanges?.changes || [];

    const rejectedHistory: SalonProfileChange[] =
        rejectedQuery.data?.adminSalonProfileChanges?.changes || [];

    const historyChanges = useMemo(() => {
        const unique = new Map<string, SalonProfileChange>();

        [...approvedHistory, ...rejectedHistory].forEach(item => {
            unique.set(item.changeId, item);
        });

        return Array.from(unique.values()).sort((a, b) => {
            const aTime = new Date(
                a.reviewedAt || a.submittedAt || 0,
            ).getTime();

            const bTime = new Date(
                b.reviewedAt || b.submittedAt || 0,
            ).getTime();

            return bTime - aTime;
        });
    }, [approvedHistory, rejectedHistory]);

    const changes =
        pageView === 'HISTORY' ? historyChanges : requestChanges;

    const totalCount =
        pageView === 'HISTORY'
            ? historyChanges.length
            : requestTotalCount;

    const activeLoading =
        pageView === 'HISTORY'
            ? approvedQuery.loading || rejectedQuery.loading
            : requestQuery.loading;

    const activeError =
        pageView === 'HISTORY'
            ? approvedQuery.error || rejectedQuery.error
            : requestQuery.error;

    const clearMessages = () => {
        setActionError(null);
        setActionSuccess(null);
    };

    const handleStatusChange = (event: SelectChangeEvent) => {
        setPageView('REQUESTS');
        setStatus(event.target.value as ProfileChangeStatus);
        clearMessages();
    };

    const handleRefresh = async () => {
        setActionError(null);

        try {
            if (pageView === 'HISTORY') {
                await Promise.all([
                    approvedQuery.refetch(),
                    rejectedQuery.refetch(),
                ]);
            } else {
                await requestQuery.refetch();
            }
        } catch (error: unknown) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : 'Unable to refresh salon profile changes.',
            );
        }
    };

    const handleView = (change: SalonProfileChange) => {
        setSelectedChange(change);
        setViewModalOpen(true);
        clearMessages();
    };

    const handleCloseView = () => {
        if (approving || rejecting) return;

        setViewModalOpen(false);
        setSelectedChange(null);
    };

    const openApproveModal = (change: SalonProfileChange) => {
        setSelectedChange(change);
        setApproveModalOpen(true);
        clearMessages();
    };

    const closeApproveModal = () => {
        if (approving) return;

        setApproveModalOpen(false);
        setActionError(null);
    };

    const openRejectModal = (change: SalonProfileChange) => {
        setSelectedChange(change);
        setRejectionReason('');
        setRejectModalOpen(true);
        clearMessages();
    };

    const closeRejectModal = () => {
        if (rejecting) return;

        setRejectModalOpen(false);
        setRejectionReason('');
        setActionError(null);
    };

    const handleApprove = async () => {
        if (!selectedChange) return;

        clearMessages();

        try {
            const result = await approveProfileChange({
                variables: {
                    input: {
                        changeId: selectedChange.changeId,
                    },
                },
            });

            const response: ApiResponse =
                result.data?.adminApproveSalonProfileChange;

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    'Failed to approve salon profile changes.',
                );
            }

            setActionSuccess(
                response.message ||
                'Salon profile and media changes approved successfully.',
            );

            setApproveModalOpen(false);
            setViewModalOpen(false);
            setSelectedChange(null);

            if (pageView === 'HISTORY') {
                await Promise.all([
                    approvedQuery.refetch(),
                    rejectedQuery.refetch(),
                ]);
            } else {
                await requestQuery.refetch();
            }
        } catch (error: unknown) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : 'Unable to approve salon profile changes.',
            );
        }
    };

    const handleReject = async () => {
        if (!selectedChange) return;

        const reason = rejectionReason.trim();

        if (!reason) {
            setActionError(
                'Please enter a rejection reason before rejecting the salon changes.',
            );
            return;
        }

        clearMessages();

        try {
            const result = await rejectProfileChange({
                variables: {
                    input: {
                        changeId: selectedChange.changeId,
                        rejectionReason: reason,
                    },
                },
            });

            const response: ApiResponse =
                result.data?.adminRejectSalonProfileChange;

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    'Failed to reject salon profile changes.',
                );
            }

            setActionSuccess(
                response.message ||
                'The salon profile and media changes have been rejected.',
            );

            setRejectModalOpen(false);
            setViewModalOpen(false);
            setSelectedChange(null);
            setRejectionReason('');

            if (pageView === 'HISTORY') {
                await Promise.all([
                    approvedQuery.refetch(),
                    rejectedQuery.refetch(),
                ]);
            } else {
                await requestQuery.refetch();
            }
        } catch (error: unknown) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : 'Unable to reject salon profile changes.',
            );
        }
    };

    const columns = [
        'Salon',
        'Owner',
        'Submitted',
        'Changes',
        'Status',
        'Actions',
    ];

    return (
        <Box>
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={700} mb={0.5}>
                        Salon Profile Changes
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {pageView === 'HISTORY'
                            ? 'Review the history of approved and rejected salon changes.'
                            : 'Review requested profile and media changes before making a decision.'}
                    </Typography>
                </Box>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{ width: { xs: '100%', md: 'auto' } }}
                >
                    {pageView === 'REQUESTS' && (
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel id="profile-change-status-label">
                                Status
                            </InputLabel>

                            <Select
                                labelId="profile-change-status-label"
                                value={status}
                                label="Status"
                                onChange={handleStatusChange}
                            >
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="APPROVED">Approved</MenuItem>
                                <MenuItem value="REJECTED">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    <Button
                        variant={pageView === 'HISTORY' ? 'contained' : 'outlined'}
                        onClick={() => {
                            setPageView('HISTORY');
                            clearMessages();
                        }}
                    >
                        History
                    </Button>

                    {pageView === 'HISTORY' && (
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setPageView('REQUESTS');
                                setStatus('PENDING');
                                clearMessages();
                            }}
                        >
                            Requests
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        startIcon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        disabled={activeLoading}
                    >
                        Refresh
                    </Button>
                </Stack>
            </Box>

            {pageView === 'HISTORY' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Approved and rejected requests are retained for audit purposes.
                </Alert>
            )}

            {actionSuccess && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setActionSuccess(null)}
                >
                    {actionSuccess}
                </Alert>
            )}

            {actionError && !rejectModalOpen && !approveModalOpen && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setActionError(null)}
                >
                    {actionError}
                </Alert>
            )}

            <Paper
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                {activeError && (
                    <Alert severity="error" sx={{ m: 2 }}>
                        {activeError.message}
                    </Alert>
                )}

                {activeLoading ? (
                    <Box
                        sx={{
                            minHeight: 300,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <CircularProgress />
                        <Typography color="text.secondary" variant="body2">
                            Loading salon profile changes...
                        </Typography>
                    </Box>
                ) : changes.length === 0 ? (
                    <Box
                        sx={{
                            minHeight: 280,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            p: 4,
                        }}
                    >
                        <Avatar sx={{ width: 56, height: 56, mb: 2 }}>
                            <EyeOutlined />
                        </Avatar>

                        <Typography variant="h6" mb={0.5}>
                            {pageView === 'HISTORY'
                                ? 'No salon change history'
                                : status === 'PENDING'
                                  ? 'No pending salon changes'
                                  : 'No salon changes found'}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                        >
                            No salon profile or media change requests were found.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {columns.map(column => (
                                        <TableCell
                                            key={column}
                                            sx={{
                                                fontWeight: 700,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {column}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {changes.map(change => {
                                    const profileCount =
                                        getActualProfileChanges(change).length;
                                    const mediaCount =
                                        getActualMediaChanges(change).length;
                                    const allCount = profileCount + mediaCount;

                                    return (
                                        <TableRow key={change.changeId} hover>
                                            <TableCell>
                                                <Stack
                                                    direction="row"
                                                    spacing={1.5}
                                                    alignItems="center"
                                                >
                                                    <Avatar
                                                        src={
                                                            change.logoMedia?.objectUrl ||
                                                            change.logoUrl ||
                                                            undefined
                                                        }
                                                        alt={change.salonName}
                                                    >
                                                        {change.salonName
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}
                                                    </Avatar>

                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={600}
                                                        >
                                                            {change.salonName || '-'}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            ID: {change.salonId}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={500}
                                                >
                                                    {change.ownerName || '-'}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {change.ownerPhoneNumber || '-'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ whiteSpace: 'nowrap' }}
                                                >
                                                    {formatDate(change.submittedAt)}
                                                </Typography>

                                                {pageView === 'HISTORY' &&
                                                    change.reviewedAt && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            display="block"
                                                        >
                                                            Reviewed:{' '}
                                                            {formatDate(change.reviewedAt)}
                                                        </Typography>
                                                    )}
                                            </TableCell>

                                            <TableCell>
                                                <Stack spacing={0.7}>
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        label={`${allCount} total`}
                                                    />

                                                    {profileCount > 0 && (
                                                        <Chip
                                                            size="small"
                                                            color="warning"
                                                            variant="outlined"
                                                            label={`${profileCount} profile`}
                                                        />
                                                    )}

                                                    {mediaCount > 0 && (
                                                        <Chip
                                                            size="small"
                                                            color="info"
                                                            variant="outlined"
                                                            label={`${mediaCount} media`}
                                                        />
                                                    )}
                                                </Stack>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={getStatusLabel(change.status)}
                                                    color={getStatusColor(change.status)}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                >
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleView(change)}
                                                        title="View complete request"
                                                    >
                                                        <EyeOutlined />
                                                    </IconButton>

                                                    {change.status === 'PENDING' &&
                                                        pageView === 'REQUESTS' && (
                                                            <>
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    color="success"
                                                                    startIcon={<CheckCircleOutlined />}
                                                                    onClick={() =>
                                                                        openApproveModal(change)
                                                                    }
                                                                    disabled={approving || rejecting}
                                                                >
                                                                    Approve
                                                                </Button>

                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="error"
                                                                    startIcon={<CloseCircleOutlined />}
                                                                    onClick={() =>
                                                                        openRejectModal(change)
                                                                    }
                                                                    disabled={approving || rejecting}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {!activeLoading && changes.length > 0 && (
                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Total {totalCount} salon change
                            {totalCount === 1 ? '' : 's'}
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* VIEW REQUEST */}
            <Dialog
                open={viewModalOpen}
                onClose={handleCloseView}
                fullWidth
                maxWidth="md"
                scroll="paper"
                PaperProps={{
                    sx: {
                        maxHeight: 'calc(100% - 48px)',
                        borderRadius: 2,
                    },
                }}
            >
                <DialogTitle>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" fontWeight={700}>
                                {selectedChange?.status === 'APPROVED'
                                    ? 'Approved Salon Change'
                                    : selectedChange?.status === 'REJECTED'
                                      ? 'Rejected Salon Change'
                                      : 'Salon Change Request'}
                            </Typography>

                            {selectedChange && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ overflowWrap: 'anywhere' }}
                                >
                                    Change ID: {selectedChange.changeId}
                                </Typography>
                            )}
                        </Box>

                        {selectedChange && (
                            <Chip
                                size="small"
                                label={getStatusLabel(selectedChange.status)}
                                color={getStatusColor(selectedChange.status)}
                            />
                        )}
                    </Stack>
                </DialogTitle>

                <DialogContent
                    dividers
                    sx={{
                        overflowY: 'auto',
                        minHeight: 120,
                        maxHeight: '70vh',
                    }}
                >
                    {selectedChange && (
                        <ProfileChangeDetails
                            key={selectedChange.changeId}
                            change={selectedChange}
                        />
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={handleCloseView}>
                        Close
                    </Button>

                    {selectedChange?.status === 'PENDING' &&
                        pageView === 'REQUESTS' && (
                            <>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CloseCircleOutlined />}
                                    onClick={() => openRejectModal(selectedChange)}
                                    disabled={rejecting}
                                >
                                    Reject
                                </Button>

                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleOutlined />}
                                    onClick={() => openApproveModal(selectedChange)}
                                    disabled={approving}
                                >
                                    Approve Changes
                                </Button>
                            </>
                        )}
                </DialogActions>
            </Dialog>

            {/* APPROVE */}
            <Dialog
                open={approveModalOpen}
                onClose={closeApproveModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Approve Complete Salon Request?</DialogTitle>

                <DialogContent dividers>
                    {selectedChange && (
                        <Stack spacing={2}>
                            <Alert severity="warning">
                                You are about to approve the complete profile
                                request for <strong>{selectedChange.salonName}</strong>.
                            </Alert>

                            <Typography variant="body2" color="text.secondary">
                                This approval applies to profile information
                                and all requested logo, cover, and gallery media.
                            </Typography>

                            <ProfileChangeSummary change={selectedChange} />
                        </Stack>
                    )}

                    {actionError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {actionError}
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={closeApproveModal}
                        disabled={approving}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        startIcon={
                            approving
                                ? <CircularProgress size={18} color="inherit" />
                                : <CheckCircleOutlined />
                        }
                        onClick={handleApprove}
                        disabled={approving}
                    >
                        {approving ? 'Approving...' : 'Approve Complete Request'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* REJECT */}
            <Dialog
                open={rejectModalOpen}
                onClose={closeRejectModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Reject Complete Salon Request</DialogTitle>

                <DialogContent dividers>
                    {selectedChange && (
                        <Stack spacing={2}>
                            <Alert severity="warning">
                                Rejecting the complete profile and media request
                                for <strong>{selectedChange.salonName}</strong>.
                            </Alert>

                            <Typography variant="body2" color="text.secondary">
                                The current live salon profile will remain
                                unchanged. The salon owner will receive the
                                rejection reason.
                            </Typography>

                            <ProfileChangeSummary change={selectedChange} />

                            <TextField
                                fullWidth
                                multiline
                                minRows={4}
                                maxRows={8}
                                label="Rejection Reason"
                                placeholder="Enter rejection reason..."
                                value={rejectionReason}
                                onChange={event =>
                                    setRejectionReason(event.target.value)
                                }
                                inputProps={{ maxLength: 1000 }}
                                helperText={`${rejectionReason.length}/1000`}
                                error={!!actionError && !rejectionReason.trim()}
                            />

                            {actionError && (
                                <Alert severity="error">{actionError}</Alert>
                            )}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={closeRejectModal}
                        disabled={rejecting}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={
                            rejecting
                                ? <CircularProgress size={18} color="inherit" />
                                : <CloseCircleOutlined />
                        }
                        onClick={handleReject}
                        disabled={rejecting}
                    >
                        {rejecting ? 'Rejecting...' : 'Reject Complete Request'}
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
    change,
}: {
    change: SalonProfileChange;
}) {
    const profile = getDisplayProfile(change);
    const profileChanges = getActualProfileChanges(change);
    const mediaChanges = getActualMediaChanges(change);
    const requestedMedia = getRequestedMediaItems(change);

    return (
        <Stack spacing={3}>
            <ProfileChangeSummary change={change} />

            <Alert severity={getStatusColor(change.status)}>
                <Typography variant="subtitle2" fontWeight={700}>
                    Request Status: {getStatusLabel(change.status)}
                </Typography>

                <Typography variant="body2">
                    {change.status === 'PENDING'
                        ? 'The requested profile and media changes are awaiting review.'
                        : change.status === 'REJECTED'
                          ? change.rejectionReason || 'This request was rejected.'
                          : 'This request was approved.'}
                </Typography>
            </Alert>

            <Box>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    Business Information
                </Typography>

                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Grid container>
                        <HighlightedInfoItem
                            label="Salon Name"
                            field="salonName"
                            value={formatChangeValue(profile.salonName)}
                            change={profileChanges}
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Owner Name"
                            field="ownerName"
                            value={formatChangeValue(profile.ownerName)}
                            change={profileChanges}
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Email"
                            field="email"
                            value={formatChangeValue(profile.email)}
                            change={profileChanges}
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Owner Phone Number"
                            field="ownerPhoneNumber"
                            value={formatChangeValue(profile.ownerPhoneNumber)}
                            change={profileChanges}
                            xs={12}
                            sm={6}
                        />

                        <HighlightedInfoItem
                            label="Alternate Phone"
                            field="alternatePhone"
                            value={formatChangeValue(profile.alternatePhone)}
                            change={profileChanges}
                            xs={12}
                            sm={6}
                        />

                        <InfoItem
                            label="Submitted By"
                            value={change.submittedBy || 'Not provided'}
                            xs={12}
                            sm={6}
                        />

                        <InfoItem
                            label="Submitted At"
                            value={formatDate(change.submittedAt)}
                            xs={12}
                            sm={6}
                        />

                        {change.reviewedBy && (
                            <InfoItem
                                label="Reviewed By"
                                value={change.reviewedBy}
                                xs={12}
                                sm={6}
                            />
                        )}

                        {change.reviewedAt && (
                            <InfoItem
                                label="Reviewed At"
                                value={formatDate(change.reviewedAt)}
                                xs={12}
                                sm={6}
                            />
                        )}
                    </Grid>
                </Paper>
            </Box>

            <Divider />

            <Box>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    Address
                </Typography>

                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Grid container>
                        <HighlightedInfoItem
                            label="Address Line"
                            field="address.addressLine"
                            value={formatChangeValue(profile.address?.addressLine)}
                            change={profileChanges}
                            xs={12}
                        />

                        <HighlightedInfoItem
                            label="City"
                            field="address.city"
                            value={formatChangeValue(profile.address?.city)}
                            change={profileChanges}
                            xs={12}
                            sm={4}
                        />

                        <HighlightedInfoItem
                            label="State"
                            field="address.state"
                            value={formatChangeValue(profile.address?.state)}
                            change={profileChanges}
                            xs={12}
                            sm={4}
                        />

                        <HighlightedInfoItem
                            label="Pincode"
                            field="address.pincode"
                            value={formatChangeValue(profile.address?.pincode)}
                            change={profileChanges}
                            xs={12}
                            sm={4}
                        />
                    </Grid>
                </Paper>
            </Box>

            {/* CATEGORY AND SERVICE SELECTIONS */}
            <Divider />

            <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                    Category & Service Selections
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={2}>
                    Requested category, subcategory, and service selections,
                    including their audiences.
                </Typography>

                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Grid container>
                        {SELECTION_FIELDS.map(field => {
                            const definition = PROFILE_FIELD_DEFINITIONS.find(
                                item => item.field === field,
                            )!;

                            const requestedProfile = getRequestedProfile(change);
                            const previousProfile = getPreviousProfile(change);

                            const requestedValue = getSnapshotValue(
                                requestedProfile,
                                field,
                            );

                            const previousValue = getSnapshotValue(
                                previousProfile,
                                field,
                            );

                            const changed = profileChanges.find(
                                item =>
                                    normalizeField(item.field) ===
                                    normalizeField(field),
                            );

                            const currentValue = resolveSelectionValue(
                                changed?.oldValue,
                                previousValue,
                                field,
                            );

                            const nextValue = resolveSelectionValue(
                                changed?.newValue,
                                requestedValue,
                                field,
                            );

                            const requestedContext: SelectionContext =
                                requestedProfile || {};

                            const previousContext: SelectionContext =
                                previousProfile || {};

                            return (
                                <Grid
                                    item
                                    xs={12}
                                    key={field}
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box sx={{ p: 2 }}>
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            justifyContent="space-between"
                                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                                            spacing={1}
                                            mb={1.5}
                                        >
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {definition.label}
                                            </Typography>

                                            {changed && (
                                                <Chip
                                                    size="small"
                                                    label={changed.changeType || 'UPDATED'}
                                                    color={getChangeChipColor(changed.changeType)}
                                                />
                                            )}
                                        </Stack>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <ValuePanel
                                                    title="CURRENT VALUE"
                                                    value={formatSelectionValue(
                                                        currentValue,
                                                        field,
                                                        previousContext,
                                                    )}
                                                    color="error"
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <ValuePanel
                                                    title="REQUESTED VALUE"
                                                    value={formatSelectionValue(
                                                        nextValue,
                                                        field,
                                                        requestedContext,
                                                    )}
                                                    color="success"
                                                    strong
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Paper>
            </Box>

            <Divider />

            <Box>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={1}
                    mb={2}
                >
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            Requested Media
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Images included in this profile change request.
                        </Typography>
                    </Box>

                    <Chip
                        label={`${requestedMedia.length} image${requestedMedia.length === 1 ? '' : 's'}`}
                        color="info"
                        variant="outlined"
                    />
                </Stack>

                {requestedMedia.length === 0 ? (
                    <Alert severity="info">
                        No requested media was found in this change record.
                    </Alert>
                ) : (
                    <Grid container spacing={2}>
                        {requestedMedia.map((item, index) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                key={`${item.media.imageId}-${index}`}
                            >
                                <ImagePreview
                                    key={`${item.media.imageId}-${item.media.objectUrl || ''}`}
                                    url={item.media.objectUrl || ''}
                                    label={item.label}
                                    mediaType={item.media.mediaType}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {mediaChanges.length > 0 && (
                <>
                    <Divider />

                    <Box>
                        <Typography variant="h6" fontWeight={700} mb={2}>
                            Media Changes
                        </Typography>

                        <Stack spacing={1.5}>
                            {mediaChanges.map((item, index) => (
                                <MediaChangeItem
                                    key={`${item.field}-${index}`}
                                    change={item}
                                />
                            ))}
                        </Stack>
                    </Box>
                </>
            )}

            {change.status !== 'PENDING' && (
                <>
                    <Divider />

                    <Box>
                        <Typography variant="h6" fontWeight={700} mb={2}>
                            Review History
                        </Typography>

                        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                            <Grid container>
                                <InfoItem
                                    label="Final Status"
                                    value={getStatusLabel(change.status)}
                                    xs={12}
                                    sm={4}
                                />

                                <InfoItem
                                    label="Reviewed By"
                                    value={change.reviewedBy || 'Not provided'}
                                    xs={12}
                                    sm={4}
                                />

                                <InfoItem
                                    label="Reviewed At"
                                    value={formatDate(change.reviewedAt)}
                                    xs={12}
                                    sm={4}
                                />
                            </Grid>
                        </Paper>
                    </Box>
                </>
            )}

            {change.status === 'REJECTED' && change.rejectionReason && (
                <Alert severity="error">
                    <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                        Rejection Reason
                    </Typography>
                    <Typography variant="body2">
                        {change.rejectionReason}
                    </Typography>
                </Alert>
            )}
        </Stack>
    );
}

// ============================================================
// CHANGE SUMMARY
// ============================================================

function ProfileChangeSummary({
    change,
}: {
    change: SalonProfileChange;
}) {
    const profileChanges = getActualProfileChanges(change);
    const mediaChanges = getActualMediaChanges(change);

    const uniqueChanges = new Map<string, {
        item: SalonProfileFieldChange;
        isMedia: boolean;
    }>();

    profileChanges.forEach(item => {
        uniqueChanges.set(`profile:${normalizeField(item.field)}`, {
            item,
            isMedia: false,
        });
    });

    mediaChanges.forEach(item => {
        uniqueChanges.set(`media:${normalizeField(item.field)}`, {
            item,
            isMedia: true,
        });
    });

    const allChanges = Array.from(uniqueChanges.values());

    const profileCount = allChanges.filter(item => !item.isMedia).length;
    const mediaCount = allChanges.filter(item => item.isMedia).length;

    if (allChanges.length === 0) {
        return (
            <Alert severity="info">
                <Typography variant="subtitle2" fontWeight={700}>
                    No field-level changes detected
                </Typography>
                <Typography variant="body2">
                    The request does not contain detectable profile or media
                    differences. The submitted values are displayed below.
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
                borderColor: 'warning.main',
            }}
        >
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: theme => alpha(theme.palette.warning.main, 0.08),
                    borderBottom: '1px solid',
                    borderColor: 'warning.main',
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            Changes Requested
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Compare current values with the requested values.
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                    >
                        <Chip
                            label={`${allChanges.length} total`}
                            color="warning"
                        />

                        {profileCount > 0 && (
                            <Chip
                                label={`${profileCount} profile`}
                                variant="outlined"
                                color="warning"
                            />
                        )}

                        {mediaCount > 0 && (
                            <Chip
                                label={`${mediaCount} media`}
                                variant="outlined"
                                color="info"
                            />
                        )}
                    </Stack>
                </Stack>
            </Box>

            <Stack divider={<Divider flexItem />}>
                {allChanges.map(({ item, isMedia }, index) => (
                    <ChangeSummaryItem
                        key={`${isMedia ? 'media' : 'profile'}-${normalizeField(item.field)}-${index}`}
                        item={item}
                        isMedia={isMedia}
                        change={change}
                    />
                ))}
            </Stack>
        </Paper>
    );
}

// ============================================================
// CHANGE SUMMARY ITEM
// ============================================================

function ChangeSummaryItem({
    item,
    isMedia,
    change,
}: {
    item: SalonProfileFieldChange;
    isMedia: boolean;
    change: SalonProfileChange;
}) {
    const previous = getPreviousProfile(change);
    const requested = getRequestedProfile(change);

    const oldValue = resolveSelectionValue(
        item.oldValue,
        getSnapshotValue(previous, item.field),
        item.field,
    );

    const newValue = resolveSelectionValue(
        item.newValue,
        getSnapshotValue(requested, item.field),
        item.field,
    );

    return (
        <Box
            sx={{
                p: 2,
                bgcolor: theme =>
                    alpha(
                        isMedia
                            ? theme.palette.info.main
                            : theme.palette.warning.main,
                        0.035,
                    ),
            }}
        >
            <Stack spacing={1}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
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
                            <Typography variant="subtitle2" fontWeight={700}>
                                {item.label || item.field}
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

                        <Typography variant="caption" color="text.secondary">
                            {item.field}
                        </Typography>
                    </Box>

                    <Chip
                        size="small"
                        label={item.changeType || 'UPDATED'}
                        color={getChangeChipColor(item.changeType)}
                    />
                </Stack>

                <ValuePanel
                    title="CURRENT VALUE"
                    value={formatFieldValue(
                        oldValue,
                        item.field,
                        previous || undefined,
                    )}
                    color="error"
                    strikeThrough={item.changeType === 'UPDATED'}
                />

                <Typography
                    textAlign="center"
                    fontWeight={700}
                    color={isMedia ? 'info.main' : 'warning.main'}
                >
                    ↓
                </Typography>

                <ValuePanel
                    title="REQUESTED VALUE"
                    value={formatFieldValue(
                        newValue,
                        item.field,
                        requested || undefined,
                    )}
                    color="success"
                    strong
                />
            </Stack>
        </Box>
    );
}

// ============================================================
// VALUE PANEL
// ============================================================

function ValuePanel({
    title,
    value,
    color,
    strikeThrough = false,
    strong = false,
}: {
    title: string;
    value: string;
    color: 'error' | 'success';
    strikeThrough?: boolean;
    strong?: boolean;
}) {
    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: theme => alpha(theme.palette[color].main, 0.06),
                border: '1px solid',
                borderColor: `${color}.light`,
            }}
        >
            <Typography
                variant="caption"
                fontWeight={700}
                color={`${color}.main`}
                display="block"
                mb={0.5}
            >
                {title}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    fontWeight: strong ? 700 : 400,
                    textDecoration: strikeThrough ? 'line-through' : 'none',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

// ============================================================
// MEDIA CHANGE ITEM
// ============================================================

function MediaChangeItem({
    change,
}: {
    change: SalonProfileFieldChange;
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                borderColor: 'info.light',
                bgcolor: theme => alpha(theme.palette.info.main, 0.025),
            }}
        >
            <Stack spacing={1.5}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                >
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {change.label || change.field}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {change.field}
                        </Typography>
                    </Box>

                    <Chip
                        size="small"
                        label={change.changeType || 'UPDATED'}
                        color={getChangeChipColor(change.changeType)}
                    />
                </Stack>

                <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                        <ValuePanel
                            title="CURRENT MEDIA"
                            value={formatChangeValue(change.oldValue)}
                            color="error"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <ValuePanel
                            title="REQUESTED MEDIA"
                            value={formatChangeValue(change.newValue)}
                            color="success"
                            strong
                        />
                    </Grid>
                </Grid>
            </Stack>
        </Paper>
    );
}

// ============================================================
// PROFILE INFORMATION FIELD
// ============================================================

function HighlightedInfoItem({
    label,
    field,
    value,
    change,
    xs = 12,
    sm,
}: {
    label: string;
    field: string;
    value: string;
    change: SalonProfileFieldChange[];
    xs?: number;
    sm?: number;
}) {
    const normalizedField = normalizeField(field);

    const changed = change.find(
        item => normalizeField(item.field) === normalizedField,
    );

    if (!changed) {
        return <InfoItem label={label} value={value} xs={xs} sm={sm} />;
    }

    const oldValue = resolveSelectionValue(
        changed.oldValue,
        undefined,
        field,
    );

    const newValue = resolveSelectionValue(
        changed.newValue,
        undefined,
        field,
    );

    return (
        <Grid
            item
            xs={xs}
            sm={sm}
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
            <Box
                sx={{
                    p: 2,
                    minHeight: 80,
                    bgcolor: theme => alpha(theme.palette.warning.main, 0.08),
                    borderLeft: '4px solid',
                    borderLeftColor: 'warning.main',
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    mb={0.5}
                >
                    <Typography
                        variant="caption"
                        fontWeight={700}
                        color="warning.dark"
                    >
                        {label}
                    </Typography>

                    <Chip
                        size="small"
                        label={changed.changeType || 'UPDATED'}
                        color={getChangeChipColor(changed.changeType)}
                        sx={{
                            height: 22,
                            fontSize: 10,
                            fontWeight: 700,
                        }}
                    />
                </Stack>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                >
                    Current
                </Typography>

                <Typography
                    variant="body2"
                    color="error.main"
                    sx={{
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        textDecoration:
                            changed.changeType === 'UPDATED'
                                ? 'line-through'
                                : 'none',
                    }}
                >
                    {formatChangeValue(oldValue)}
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={0.8}
                >
                    Requested
                </Typography>

                <Typography
                    variant="body2"
                    fontWeight={700}
                    color="success.main"
                    sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                >
                    {formatChangeValue(newValue)}
                </Typography>
            </Box>
        </Grid>
    );
}

// ============================================================
// BASIC INFORMATION FIELD
// ============================================================

function InfoItem({
    label,
    value,
    xs = 12,
    sm,
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
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
            <Box sx={{ p: 2, minHeight: 70 }}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={0.5}
                >
                    {label}
                </Typography>

                <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ wordBreak: 'break-word' }}
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
    mediaType,
}: {
    url: string;
    label: string;
    mediaType?: string | null;
}) {
    const [imageOpen, setImageOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    const normalizedUrl = typeof url === 'string' ? url.trim() : '';

    if (!normalizedUrl || imageError) {
        return (
            <Paper
                variant="outlined"
                sx={{ borderRadius: 2, overflow: 'hidden' }}
            >
                <Box
                    sx={{
                        height: 200,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 1,
                        px: 2,
                    }}
                >
                    <EyeOutlined />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                    >
                        {imageError
                            ? 'Unable to load image'
                            : 'No image URL available'}
                    </Typography>
                </Box>

                <Box p={1.5}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={1}
                        alignItems="center"
                    >
                        <Typography variant="body2" fontWeight={600}>
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
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                    },
                }}
                onClick={() => setImageOpen(true)}
            >
                <Box
                    sx={{
                        width: '100%',
                        height: 200,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        component="img"
                        src={normalizedUrl}
                        alt={label}
                        loading="lazy"
                        sx={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={() => setImageError(true)}
                    />
                </Box>

                <Box p={1.5}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={1}
                        alignItems="center"
                    >
                        <Typography variant="body2" fontWeight={600}>
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

                    <Typography variant="caption" color="text.secondary">
                        Click to preview
                    </Typography>
                </Box>
            </Paper>

            <Dialog
                open={imageOpen}
                onClose={() => setImageOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>{label}</DialogTitle>

                <DialogContent
                    sx={{
                        p: 1,
                        bgcolor: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 300,
                    }}
                >
                    <Box
                        component="img"
                        src={normalizedUrl}
                        alt={label}
                        sx={{
                            display: 'block',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setImageOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
