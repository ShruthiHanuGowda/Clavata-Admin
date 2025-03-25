import { useMemo } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
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

// third-party
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, HeaderGroup, flexRender, getSortedRowModel } from '@tanstack/react-table';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { CSVExport, TablePagination } from 'components/third-party/react-table';

import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';

//query
import { LIST_COMPANY_WALLETS } from '../../../graphql/queries';
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink, useQuery } from '@apollo/client';
import { LIST_USER_WALLETS } from 'graphql/queries';

const API_Key2 = 'da2-n5rv7b7ipngvvff25xfs3xlufi'; // API key for second URI
const uri2 = 'https://tvmbdqb7gvfnhfggz6liar6ylm.appsync-api.me-central-1.amazonaws.com/graphql';

const client2 = new ApolloClient({
  link: new HttpLink({
    uri: uri2,
    headers: {
      'x-api-key': API_Key2
    }
  }),
  cache: new InMemoryCache()
});

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ data, columns, top }: { data: TableDataProps[]; columns: ColumnDef<TableDataProps>[]; top?: boolean }) {
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

  return (
    <>
      <MainCard
        title={'User Data'}
        content={false}
        secondary={<CSVExport {...{ data, headers, filename: top ? 'pagination-top.csv' : 'pagination-bottom.csv' }} />}
      >
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
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
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
      </MainCard>
    </>
  );
}

// ==============================|| REACT TABLE - PAGINATION ||============================== //

export default function PaginationUserTable() {
  const { data, loading, error } = useQuery(LIST_USER_WALLETS, { client: client2 });
  console.log('Query user Response:', { loading, error, data });
  if (error) {
    console.error('GraphQL Error:', error);
  }
  // Transform company data to fit column structure
  const transformedData =
    data?.listUserWalletAddresses?.items.map((item: any) => ({
      email: item.walletAddress,
      wallet_address: item.userWallet,
      applicantId: item.applicantId,
      is_verified: item.is_verified,
      // ethereumWallet: item.ethereumWallet,
      // denergyWallet: item.denergyWallet,
      reviewStatus: item.reviewStatus,
      // progress: 0, // Replace this with the actual KYC status if available
      date: item.date
    })) || [];

  console.log('new company data', data);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Email',
        accessorKey: 'email',
        enableSorting: true,
      },
      {
        header: 'User Wallet Address',
        accessorKey: 'wallet_address',
        enableSorting: true,
      },
      {
        header: 'KYC Applicant ID',
        accessorKey: 'applicantId',
        enableSorting: true,
      },
      {
        header: 'KYC Verified',
        accessorKey: 'is_verified',
        enableSorting: true,
      },
      // {
      //   header: 'Ethereum Wallet',
      //   accessorKey: 'ethereumWallet'
      // },
      // {
      //   header: 'Denergy Wallet',
      //   accessorKey: 'denergyWallet',
      //   meta: {
      //     className: 'cell-right'
      //   }
      // },
      {
        header: 'KYC Review Status',
        accessorKey: 'reviewStatus',
        enableSorting: true,
        // cell: (cell) => {
        //   switch (cell.getValue()) {
        //     case 'Complicated':
        //       return <Chip color="error" label="Complicated" size="small" variant="light" />;
        //     case 'Relationship':
        //       return <Chip color="success" label="Relationship" size="small" variant="light" />;
        //     case 'Single':
        //     default:
        //       return <Chip color="info" label="Single" size="small" variant="light" />;
        //   }
        // }
      },
      // {
      //   header: 'KYC status',
      //   accessorKey: 'progress'
      //   // cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />
      // },
      {
        header: 'Date Registered',
        accessorKey: 'date',
        enableSorting: true,
      }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      {/* <Grid item xs={12}>
        <ReactTable {...{ data, columns, top: true }} />
      </Grid> */}
      <Grid item xs={12}>
        <ReactTable {...{ data: transformedData, columns }} />
      </Grid>
    </Grid>
  );
}
