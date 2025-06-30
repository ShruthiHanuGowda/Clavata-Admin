import React, { useContext, useMemo, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Search from '../../../../../admin-panel-fe/src/layout/Dashboard/Header/HeaderContent/Search';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    ColumnDef,
    HeaderGroup,
    flexRender,
    getSortedRowModel
} from '@tanstack/react-table';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import { CSVExport, TablePagination } from 'components/third-party/react-table';
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { Button, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Context } from 'App';
import CloseIcon from '@mui/icons-material/Close';

interface Validator {
    validatorId: string;
    validatorName: string;
    commissionRate: number;
    totalStakeAmount: number;
    totalStakedNFT: number;
    totalStakedWatt: number;
    validatorAge: number;
    status: string;
}

function ReactTable({ data, columns, top, onRowClick }: { data: TableDataProps[]; columns: ColumnDef<TableDataProps>[]; top?: boolean; onRowClick?: (rowData: any) => void }) {
    const context = useContext(Context);
    const { setSearchTerm }: any = context;

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        debugTable: true,
        getSortedRowModel: getSortedRowModel(), // Ensure sorting is active
    });

    let headers: LabelKeyObject[] = [];
    table.getAllColumns().map((columns: any) =>
        headers.push({
            label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
            key: columns.columnDef.accessorKey
        })
    );

    const handleSearch = (term: any) => {
        setSearchTerm(term);
    };

    return (
        <MainCard
            title={'Validators'}
            content={false}
            secondary={<CSVExport {...{ data, headers, filename: top ? 'pagination-top.csv' : 'pagination-bottom.csv' }} />}
        >
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Search onSearch={handleSearch} />
                </Box>
                <ScrollX>
                    <Stack>
                        {top && (
                            <Box sx={{ p: 2 }}>
                                <TablePagination
                                    {...{
                                        setPageSize: table.setPageSize,
                                        setPageIndex: table.setPageIndex,
                                        getState: table.getState,
                                        getPageCount: table.getPageCount
                                    }}
                                />
                            </Box>
                        )}

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableCell key={header.id} {...header.column.columnDef.meta}>
                                                    <span
                                                        onClick={header.column.getToggleSortingHandler()}
                                                        style={{ cursor: 'pointer', fontWeight: 'bold' }}
                                                    >
                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getIsSorted() === false
                                                            ? null
                                                            : { asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as 'asc' | 'desc']}
                                                    </span>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHead>
                                <TableBody>
                                    {table.getRowModel().rows?.length > 0 ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id} hover style={{ cursor: 'pointer' }} onClick={() => onRowClick?.(row?.original?.validatorId)}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow key={0}>
                                            <TableCell colSpan={columns.length} align="center">
                                                No data found!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {!top && (
                            <>
                                <Divider />
                                <Box sx={{ p: 2 }}>
                                    <TablePagination
                                        {...{
                                            setPageSize: table.setPageSize,
                                            setPageIndex: table.setPageIndex,
                                            getState: table.getState,
                                            getPageCount: table.getPageCount
                                        }}
                                    />
                                </Box>
                            </>
                        )}
                    </Stack>
                </ScrollX>
            </CardContent>
        </MainCard>
    );
}

export default function Validator() {
    const context = useContext(Context);
    const { searchTerm, setSearchTerm }: any = context;
    const [validators, setValidators] = useState<Validator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedValidator, setSelectedValidator] = useState<any | null>(null);
    const [delegators, setDelegators] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const fetchValidators = async () => {
            setLoading(true);
            try {
                const res = await fetch('https://2f6h4d0go8.execute-api.me-central-1.amazonaws.com/default/staking_getValidators');
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const json = await res.json();
                setValidators(json.validators || []);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch validators');
            } finally {
                setLoading(false);
            }
        };
        fetchValidators();
    }, []);

    const fetchValidatorDetails = async (validatorId: string) => {
        console.log("validatorId", validatorId);
        const id: any = typeof validatorId === 'object' && validatorId !== null ? validatorId : validatorId;

        if (!id) {
            console.error('Invalid validator ID');
            return;
        }
        try {
            const response = await fetch(
                `https://2f6h4d0go8.execute-api.me-central-1.amazonaws.com/default/staking_getValidators?validatorId=${validatorId}`
            );
            const json = await response.json();
            setSelectedValidator(json.validator);
            setDelegators(json.delegators);
            setOpenDialog(true);
        } catch (err) {
            console.error('Failed to fetch validator details', err);
        }
    };

    const transformedData: any = useMemo(() => {
        return validators.map((v) => ({
            name: v.validatorName,
            validatorId: v.validatorId,
            commissionRate: v.commissionRate,
            totalStakeAmount: v.totalStakeAmount,
            totalStakedNFT: v.totalStakedNFT,
            totalStakedWatt: v.totalStakedWatt,
            validatorAge: v.validatorAge,
            status: v.status
        }));
    }, [validators]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return transformedData;
        return transformedData.filter(
            (item: any) =>
                (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.validatorId && item.validatorId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.status && item.status.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, transformedData]);

    const columns = useMemo<ColumnDef<TableDataProps>[]>(() => [
        { header: 'Validator Name', accessorKey: 'name' },
        { header: 'Validator ID', accessorKey: 'validatorId' },
        { header: 'Commission Rate', accessorKey: 'commissionRate', cell: ({ getValue }: any) => (getValue() * 100).toFixed(2) + '%' },
        { header: 'Total Stake Amount', accessorKey: 'totalStakeAmount', cell: ({ getValue }) => Number(getValue()).toLocaleString() },
        { header: 'Total Staked NFT', accessorKey: 'totalStakedNFT', cell: ({ getValue }) => Number(getValue()).toLocaleString() },
        { header: 'Total Staked WATT', accessorKey: 'totalStakedWatt', cell: ({ getValue }) => Number(getValue()).toLocaleString() },
        { header: 'Validator Age', accessorKey: 'validatorAge' },
        { header: 'Status', accessorKey: 'status' }
    ], []);

    if (loading) return <div>Loading validators...</div>;
    if (error) return <div>Error loading validators: {error}</div>;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <ReactTable data={filteredData} columns={columns} onRowClick={fetchValidatorDetails} />
            </Grid>

            {/* Dialog for displaying the validator details */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Validator Details
                    <IconButton edge="end" color="inherit" onClick={() => setOpenDialog(false)} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedValidator && (
                        <div>
                            <h3>{selectedValidator.validatorName}</h3>
                            <p><strong>Validator ID:</strong> {selectedValidator.validatorId}</p>
                            <p><strong>Commission Rate:</strong> {(selectedValidator.commissionRate * 100).toFixed(2)}%</p>
                            <p><strong>Total Stake Amount:</strong> {selectedValidator.totalStakeAmount}</p>
                            <p><strong>Total Staked NFT:</strong> {selectedValidator.totalStakedNFT}</p>
                            <p><strong>Total Staked WATT:</strong> {selectedValidator.totalStakedWatt}</p>
                            <p><strong>Validator Age:</strong> {selectedValidator.validatorAge} days</p>
                            <p><strong>Status:</strong> {selectedValidator.status}</p>

                            <Divider />
                            <h4>Delegators</h4>
                            {delegators.map((delegator, index) => (
                                <>
                                    <p key={index}><strong>Delegator Address:</strong> {delegator.delegatorAddress}</p>
                                    <p><strong>Reward Earned:</strong> {delegator.rewardsEarned}</p>
                                    <p><strong>Staked Amount:</strong> {delegator.stakedAmount}</p>
                                    <p><strong>Staked NFT:</strong> {delegator.stakedNFT}</p>
                                    <p><strong>Staked WATT:</strong> {delegator.stakedWatt}</p>
                                </>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Grid>
    );
}
