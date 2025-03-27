import { useContext, useMemo } from 'react';

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
import Search from '../../../../../admin-panel-fe/src/layout/Dashboard/Header/HeaderContent/Search';
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
import { useQuery } from '@apollo/client';
import { CardContent } from '@mui/material';
import { Context } from 'App';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ data, columns, top }: { data: TableDataProps[]; columns: ColumnDef<TableDataProps>[]; top?: boolean }) {
  const context = useContext(Context);
  const { searchTerm, setSearchTerm }: any = context;
  console.log('company data', data);
  console.log('column', columns);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    getSortedRowModel: getSortedRowModel(),
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

export default function PaginationTable() {
  // const data: TableDataProps[] = makeData(100);
  const context = useContext(Context);
  const { searchTerm, setSearchTerm }: any = context;
  const { loading, error, data, fetchMore } = useQuery(LIST_COMPANY_WALLETS, {
    variables: { nextToken: null }
  });

  console.log('Query company Response:', { loading, error, data });

  if (error) {
    console.error('GraphQL Error:', error);
  }

  // Transform company data to fit column structure
  const transformedData =
    data?.listUserWallets?.items.map((item: any) => ({
      email: item.userAddress,
      wallet_address: item.userWallet,
      applicantId: item.applicantId,
      is_verified: item.is_verified,
      reviewStatus: item.reviewStatus,
      date: item.date
    })) || [];

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedData;
    return transformedData.filter((item: any) =>
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.wallet_address && item.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.applicantId && item.applicantId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.reviewStatus && item.reviewStatus.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, transformedData]);

  console.log('new company data', data);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Email',
        accessorKey: 'email'
      },
      {
        header: 'User Wallet Address',
        accessorKey: 'wallet_address'
      },
      {
        header: 'KYB Applicant ID',
        accessorKey: 'applicantId'
      },
      {
        header: 'KYB Verified',
        accessorKey: 'is_verified'
      },
      // {
      //   header: 'Denergy Wallet',
      //   accessorKey: 'age',
      //   meta: {
      //     className: 'cell-right'
      //   }
      // },
      {
        header: 'KYB Review Status',
        accessorKey: 'reviewStatus'
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
        accessorKey: 'date'
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
        <ReactTable {...{ data: filteredData, columns }} />
      </Grid>
    </Grid>
  );
}
