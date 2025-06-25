import { useContext, useMemo } from 'react';

// material-ui
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
// third-party
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  HeaderGroup,
  flexRender,
  getSortedRowModel
} from '@tanstack/react-table';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import { CSVExport, TablePagination } from 'components/third-party/react-table';

// types
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';

//query
import { useQuery } from '@apollo/client';
import { LIST_USER_WALLETS } from 'graphql/queries';
import { CardContent } from '@mui/material';
import { Context } from 'App';
import { Link } from 'react-router-dom';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ data, columns, top }: { data: TableDataProps[]; columns: ColumnDef<TableDataProps>[]; top?: boolean }) {
  const context = useContext(Context);
  const { setSearchTerm }: any = context;
  console.log('user data', data);
  console.log('user column', columns);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true
  });

  let headers: LabelKeyObject[] = [];
  table.getAllColumns().map((columns) =>
    headers.push({
      label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
      // @ts-ignore
      key: columns.columnDef.accessorKey
    })
  );

  const handleSearch = (term: any) => {
    setSearchTerm(term);
  };

  return (
    <>
      <MainCard
        title={' '}
        content={false}
        secondary={<CSVExport {...{ data, headers, filename: top ? 'pagination-top.csv' : 'pagination-bottom.csv' }} />}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Add Search component below the title */}
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
                              onClick={header.column.getToggleSortingHandler()} // Handle sorting when clicked
                              style={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                              { {
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
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
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
  console.log('Query user Response:', { loading, error, data });
  if (error) {
    console.error('GraphQL Error:', error);
  }

  // Transform company data to fit column structure
  const transformedData = data?.listUserWalletAddresses?.items.map((item: any) => {
    let parsedUserDetail = null;
    try {
      if (item.kycDetails) {
        if (typeof item.kycDetails === 'string') {
          parsedUserDetail = JSON.parse(item.kycDetails);
        } else if (typeof item.kycDetails === 'object') {
          parsedUserDetail = item.kycDetails;
        }
      } else {
        console.warn('kycDetails is missing or null for:', item.emailAddress || item.userWallet);
      }
    } catch (e) {
      console.error('Failed to parse kycDetails for:', item.emailAddress || item.userWallet, 'Error:', e);
    }
    // Log parsedUserDetail to debug
    console.log('Parsed User Detail:', parsedUserDetail);

    return {
      email: item.emailAddress,
      wallet_address: item.userWallet,
      denergyWallet: item.denergyWallet,
      ethereumWallet: item.ethereumWallet,
      applicantId: item.applicantId,
      is_verified: item.is_verified,
      reviewStatus: item.reviewStatus,
      date: item.date,
      kycDetails: parsedUserDetail // Store the entire parsedUserDetail
    };
  }) || [];

  // Filter data based on search term
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
    // {
    //   header: 'Denergy Wallet Address',
    //   accessorKey: 'denergyWallet',
    //   enableSorting: true,
    //   cell: (cell) => {
    //     const address = cell.getValue() as string;
    //     return (
    //       <Link to={getBlockExploreLink(address)} target="_blank">
    //         {shortenAddress(address)}
    //       </Link>
    //     );
    //   }
    // },
    // {
    //   header: 'Ethereum Wallet Address',
    //   accessorKey: 'ethereumWallet',
    //   enableSorting: true,
    //   cell: (cell) => {
    //     const address = cell.getValue() as string;
    //     return (
    //       <Link to={getBlockExploreLink(address)} target="_blank">
    //         {shortenAddress(address)}
    //       </Link>
    //     );
    //   }
    // },
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
      accessorKey: 'kycDetails', // This is now the entire object
      cell: (info) => {
        const detail = info.getValue() as any;
        console.log("Rendering KYC Details:", detail);

        // If no detail exists, return a placeholder or "N/A"
        if (!detail) return '—'; // Placeholder for missing data

        // Destructure the values you're looking for
        const { fullResponse } = detail || {};
        const infoSection = fullResponse?.info || {};  
        const fixedInfo = fullResponse?.fixedInfo || {};
        const review = fullResponse?.review || {};

        // Additional logs for full response inspection
        console.log("Full Response:", fullResponse);

        return (
          <Box>
            <div><strong>First Name:</strong> {infoSection.firstName || 'N/A'}</div>
            <div><strong>Last Name:</strong> {infoSection.lastName || 'N/A'}</div>
            <div><strong>Date of Birth:</strong> {infoSection.dob || 'N/A'}</div>
            <div><strong>Country:</strong> {infoSection.country || 'N/A'}</div>
            <div><strong>Nationality:</strong> {fixedInfo.nationality || 'N/A'}</div>
            <div><strong>Email:</strong> {detail?.email || 'N/A'}</div>
            <div><strong>Review Status:</strong> {review?.reviewResult?.reviewAnswer || 'N/A'}</div>
            <div><strong>IP Country:</strong> {detail?.ipCountry || 'N/A'}</div>
          </Box>
        );
      }
    }
  ], []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ReactTable {...{ data: filteredData, columns }} />
      </Grid>
    </Grid>
  );
}
