import { useState, useContext, useMemo } from 'react';
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
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, HeaderGroup, flexRender, getSortedRowModel } from '@tanstack/react-table';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import { CSVExport, TablePagination } from 'components/third-party/react-table';
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { useQuery } from '@apollo/client';
import { LIST_USER_WALLETS } from 'graphql/queries';
import { CardContent } from '@mui/material';
import { Context } from 'App';
import { Link } from 'react-router-dom';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';
import React from 'react';

function ReactTable({ data, columns, top, handleOpenDetail, expandedRowId }: { data: TableDataProps[]; columns: ColumnDef<TableDataProps>[]; top?: boolean, handleOpenDetail: (id: string) => void, expandedRowId: string | null }) {
  const context = useContext(Context);
  const { setSearchTerm }: any = context;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true
  });

  const handleSearch = (term: any) => {
    setSearchTerm(term);
  };

  return (
    <>
      <MainCard title={' '} content={false} secondary={<CSVExport {...{ data, headers: [], filename: top ? 'pagination-top.csv' : 'pagination-bottom.csv' }} />}>
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
                              {{
                                asc: ' 🔼',
                                desc: ' 🔽'
                              }[header.column.getIsSorted() as string] ?? null}
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {table.getRowModel().rows.map((row: any) => (
                      <React.Fragment key={row.id}>
                        <TableRow>
                          {row.getVisibleCells().map((cell: any) => (
                            <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}

                        </TableRow>

                        {/* Show KYC Details to the extreme right if the row is expanded */}
                        {expandedRowId === row.id && (
                          <TableRow>
                            <TableCell colSpan={row.getVisibleCells().length} sx={{ padding: 0 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '10px', position: 'relative' }}>
                                <Box sx={{
                                  width: '250px',
                                  padding: '10px',
                                  backgroundColor: '#f9f9f9',
                                  borderRadius: '8px',
                                  boxShadow: 2
                                }}>
                                  <div><strong>First Name:</strong> {row.original.kycDetails?.fullResponse?.info.firstName || 'N/A'}</div>
                                  <div><strong>Last Name:</strong> {row.original.kycDetails?.fullResponse?.info.lastName || 'N/A'}</div>
                                  <div><strong>Date of Birth:</strong> {row.original.kycDetails?.fullResponse?.info.dob || 'N/A'}</div>
                                  <div><strong>Country:</strong> {row.original.kycDetails?.fullResponse?.info.country || 'N/A'}</div>
                                  <div><strong>Nationality:</strong> {row.original.kycDetails?.fullResponse?.fixedInfo.nationality || 'N/A'}</div>
                                  <div><strong>Email:</strong> {row.original.kycDetails?.email || 'N/A'}</div>
                                  <div><strong>Review Status:</strong> {row.original.kycDetails?.fullResponse?.review?.reviewResult?.reviewAnswer || 'N/A'}</div>
                                  <div><strong>IP Country:</strong> {row.original.kycDetails?.ipCountry || 'N/A'}</div>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
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
    </>
  );
}

// ==============================|| REACT TABLE - PAGINATION ||============================== //

export default function PaginationUserTable() {
  const context = useContext(Context);
  const { searchTerm }: any = context;
  const { data, loading, error } = useQuery(LIST_USER_WALLETS);

  if (error) {
    console.error('GraphQL Error:', error);
  }

  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const handleOpenDetail = (id: string) => {
    setExpandedRowId(prevId => (prevId === id ? null : id));
  };

  const transformedData = data?.listUserWalletAddresses?.items.map((item: any) => {
    let parsedUserDetail = null;
    try {
      if (item.kycDetails) {
        if (typeof item.kycDetails === 'string') {
          parsedUserDetail = JSON.parse(item.kycDetails);
        } else if (typeof item.kycDetails === 'object') {
          parsedUserDetail = item.kycDetails;
        }
      }
    } catch (e) {
      console.error('Failed to parse kycDetails for:', item.emailAddress || item.userWallet, 'Error:', e);
    }
    return {
      email: item.emailAddress,
      wallet_address: item.userWallet,
      denergyWallet: item.denergyWallet,
      ethereumWallet: item.ethereumWallet,
      applicantId: item.applicantId,
      is_verified: item.is_verified,
      reviewStatus: item.reviewStatus,
      date: item.date,
      kycDetails: parsedUserDetail
    };
  }) || [];

  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedData;
    return transformedData.filter(
      (item: any) =>
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.wallet_address && item.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.denergyWallet && item.denergyWallet.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.ethereumWallet && item.ethereumWallet.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.applicantId && item.applicantId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.reviewStatus && item.reviewStatus.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, transformedData]);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(() => [
    {
      header: 'Email',
      accessorKey: 'email',
      enableSorting: true
    },
    {
      header: 'User Wallet Address',
      accessorKey: 'wallet_address',
      enableSorting: true,
      cell: (cell) => {
        const address = cell.getValue() as string;
        return (
          <Link to={getBlockExploreLink(address)} target="_blank">
            {shortenAddress(address)}
          </Link>
        );
      }
    },
    {
      header: 'KYC Applicant ID',
      accessorKey: 'applicantId',
      enableSorting: true
    },
    {
      header: 'KYC Verified',
      accessorKey: 'is_verified',
      enableSorting: true
    },
    {
      header: 'Date Registered',
      accessorKey: 'date',
      enableSorting: true,
      cell: (cell) => formatDate(cell.getValue() as string)
    },
    {
      header: 'KYC User Detail',
      accessorKey: 'kycDetails',
      cell: (info) => {
        const detail = info.getValue() as any;
        return (
          <Button onClick={() => handleOpenDetail(info.row.id)}>View Details</Button>
        );
      }
    }
  ], []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ReactTable {...{ data: filteredData, columns, handleOpenDetail, expandedRowId }} />
      </Grid>
    </Grid>
  );
}
