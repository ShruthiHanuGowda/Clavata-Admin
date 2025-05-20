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
import { LIST_COMPANY_WALLETS } from '../../../graphql/queries';
import { useQuery } from '@apollo/client';
import { CardContent } from '@mui/material';
import { Context } from 'App';
import { Link } from 'react-router-dom';
import { shortenAddress } from 'utils/shortenAddress';
import { getBlockExploreLink } from 'utils/explorer';
import { formatDate } from 'utils/date';

// ==============================|| REACT TABLE ||============================== //

// interface CompanyDetail {
//   companyName?: string;
//   registrationNumber?: string;
// }

function ReactTable({ data, columns, top }: { data: TableDataProps[]; columns: ColumnDef<TableDataProps>[]; top?: boolean }) {
  const context = useContext(Context);
  const { setSearchTerm }: any = context;
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    getSortedRowModel: getSortedRowModel()
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
  const { searchTerm }: any = context;
  const { loading, error, data } = useQuery(LIST_COMPANY_WALLETS, {
    variables: { nextToken: null }
  });

  console.log('Query company Response:', { loading, error, data });

  if (error) {
    console.error('GraphQL Error:', error);
  }

  // Transform company data to fit column structure
  const transformedData =
    data?.listUserWallets?.items.map((item: any) => {
      let parsedCompanyDetail = null;

      try {
        parsedCompanyDetail = typeof item.company_detail === 'string' ? JSON.parse(item.company_detail) : item.company_detail;
      } catch (e) {
        console.error('Invalid JSON in company_detail:', e);
      }

      const companyInfo = parsedCompanyDetail?.fullResponse?.fixedInfo?.companyInfo;

      return {
        email: item.userAddress,
        wallet_address: item.userWallet,
        denergyWallet: item.denergyWallet,
        ethereumWallet: item.ethereumWallet,
        applicantId: item.applicantId,
        is_verified_kyb: item.is_verified_kyb,
        reviewStatus: item.reviewStatus,
        date: item.date,
        company_detail: companyInfo || null
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
        (item.is_verified_kyb && item.is_verified_kyb.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
        accessorKey: 'wallet_address',
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
        header: 'Denergy Wallet Address',
        accessorKey: 'denergyWallet',
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
        header: 'Ethereum Wallet Address',
        accessorKey: 'ethereumWallet',
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
        header: 'KYB Applicant ID',
        accessorKey: 'applicantId'
      },
      {
        header: 'KYB Verified',
        accessorKey: 'is_verified_kyb'
      },
      // {
      //   header: 'KYB Review Status',
      //   accessorKey: 'reviewStatus'
      // },
      {
        header: 'Date Registered',
        accessorKey: 'date',
        cell: (cell) => formatDate(cell.getValue() as string)
      },
      {
        header: 'Company Detail',
        accessorKey: 'company_detail',
        cell: (info) => {
          const detail = info.getValue() as {
            companyName?: string;
            registrationNumber?: string;
            country?: string;
            legalAddress?: string;
            website?: string;
            incorporatedOn?: string;
            type?: string;
            registrationLocation?: string;
          };

          if (!detail) return '—';

          return (
            <div>
              <div>
                <strong>Company Name:</strong> {detail.companyName || 'N/A'}
              </div>
              <div>
                <strong>Registration Number:</strong> {detail.registrationNumber || 'N/A'}
              </div>
              <div>
                <strong>Country:</strong> {detail.country || 'N/A'}
              </div>
              <div>
                <strong>Address:</strong> {detail.legalAddress || 'N/A'}
              </div>
              <div>
                <strong>Website:</strong> {detail.website || 'N/A'}
              </div>
              <div>
                <strong>Incorporated On:</strong> {detail.incorporatedOn || 'N/A'}
              </div>
              <div>
                <strong>Type:</strong> {detail.type || 'N/A'}
              </div>
              <div>
                <strong>Registration Location:</strong> {detail.registrationLocation || 'N/A'}
              </div>
            </div>
          );
        }
      }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ReactTable {...{ data: filteredData, columns }} />
      </Grid>
    </Grid>
  );
}
