import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
// third-party
import { useReactTable, getCoreRowModel, ColumnDef, HeaderGroup, flexRender, getSortedRowModel } from '@tanstack/react-table';

// project-import
import { LabelKeyObject } from 'react-csv/lib/core';
import { useQuery } from '@apollo/client';
import { CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { LIST_COMPANY_WALLETS } from '../../../graphql/queries';
import Search from '../../../layout/Dashboard/Header/HeaderContent/Search';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import { CSVExport, TablePaginationToken } from 'components/third-party/reactTable';

// types
import { TableDataProps } from 'types/table';

//query
import { Context } from 'App';
import { shortenAddress } from 'utils/shortenAddress';
import { getBlockExploreLink } from 'utils/explorer';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';

// ==============================|| REACT TABLE ||============================== //

// interface CompanyDetail {
//   companyName?: string;
//   registrationNumber?: string;
// }

function ReactTable({
  data,
  columns,
  top,
  currentPageIndex,
  handlePagination,
  nextToken,
  previousTokens,
  pageSize,
  setPageSize,
  isLoading
}: {
  data: TableDataProps[];
  columns: ColumnDef<TableDataProps>[];
  top?: boolean;
  currentPageIndex: number;
  handlePagination: (direction: 'next' | 'previous' | 'first') => Promise<void>;
  nextToken: string | null;
  previousTokens: string[];
  setPageSize: (size: number) => void;
  pageSize: number;
  isLoading: boolean;
}) {
  const context = useContext(Context);
  const { setSearchTerm }: any = context;
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    getSortedRowModel: getSortedRowModel()
  });

  const headers: LabelKeyObject[] = [];
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
                  {/* <TablePagination
                    {...{
                      setPageSize: table.setPageSize,
                      setPageIndex: table.setPageIndex,
                      getState: table.getState,
                      getPageCount: table.getPageCount
                    }}
                  /> */}
                  <TablePaginationToken
                    {...{
                      currentPageIndex,
                      handlePagination,
                      nextToken,
                      previousTokens,
                      pageSize,
                      setPageSize,
                      isLoading
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
                    <TablePaginationToken
                      {...{
                        currentPageIndex,
                        handlePagination,
                        nextToken,
                        previousTokens,
                        pageSize,
                        setPageSize,
                        isLoading
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
  const { logout } = useAuth();
  // const data: TableDataProps[] = makeData(100);
  const context = useContext(Context);
  const { searchTerm }: any = context;

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState<TableDataProps[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery(LIST_COMPANY_WALLETS, {
    variables: { limit: pageSize }
  });

  if (error) {
    console.error('GraphQL Error:', error, error?.message?.includes('code 401'), error?.message);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  // Transform company data to fit column structure
  // const transformedData =
  //   data?.listUserWallets?.items.map((item: any) => {
  //     let parsedCompanyDetail = null;

  //     try {
  //       parsedCompanyDetail = typeof item.company_detail === 'string' ? JSON.parse(item.company_detail) : item.company_detail;
  //     } catch (e) {
  //       console.error('Invalid JSON in company_detail:', e);
  //     }

  //     const companyInfo = parsedCompanyDetail?.fullResponse?.fixedInfo?.companyInfo;

  //     return {
  //       email: item.userAddress,
  //       wallet_address: item.userWallet,
  //       denergyWallet: item.denergyWallet,
  //       ethereumWallet: item.ethereumWallet,
  //       applicantId: item.applicantId,
  //       is_verified_kyb: item.is_verified_kyb,
  //       reviewStatus: item.reviewStatus,
  //       date: item.date,
  //       company_detail: companyInfo || null
  //     };
  //   }) || [];

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (item: any) =>
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.wallet_address && item.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.denergyWallet && item.denergyWallet.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.ethereumWallet && item.ethereumWallet.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.applicantId && item.applicantId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.is_verified_kyb?.toString() && item.is_verified_kyb.toString().includes(searchTerm.toLowerCase())) ||
        (item.reviewStatus && item.reviewStatus.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, data]);

  const transformedResponseData = (resData: any) => {
    return resData.listUserWallets?.items.map((item: any, index: number) => {
      let parsedCompanyDetail = null;

      try {
        parsedCompanyDetail = typeof item.company_detail === 'string' ? JSON.parse(item.company_detail) : item.company_detail;
      } catch (e) {
        console.error('Invalid JSON in company_detail:', e);
      }

      const companyInfo = parsedCompanyDetail?.fullResponse?.fixedInfo?.companyInfo;

      return {
        id: item?.id || index || '',
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
    });
  };

  useEffect(() => {
    if (queryData) {
      const transformedData = transformedResponseData(queryData);
      setData(transformedData);
      setNextToken(queryData.listUserWallets.nextToken);
    }
  }, [queryData]);

  const handlePagination = useCallback(
    async (direction: 'next' | 'previous' | 'first') => {
      let token = direction === 'next' ? nextToken : previousTokens[previousTokens.length - 1];

      if (!token) token = null;
      if (nextToken === null) {
        token = previousTokens[previousTokens.length - 2];
      }
      switch (direction) {
        case 'first':
          token = null;
          setPreviousTokens([]);
          break;
        case 'previous':
          if (currentPageIndex === 2) {
            token = null;
          }
          break;
        case 'next':
          break;
        default:
          break;
      }

      const variables: { limit: number; nextToken?: string } = {
        limit: pageSize
      };
      if (token) {
        variables.nextToken = token;
      }
      fetchMore({
        variables
      }).then((fetchMoreResult: any) => {
        const fetchedData = fetchMoreResult.data;

        const transformedData = transformedResponseData(fetchedData);

        setData(transformedData);
        setNextToken(fetchMoreResult.data.listUserWallets.nextToken);

        if (direction === 'next') {
          setPreviousTokens((prev) => [...prev, nextToken!]);
          setCurrentPageIndex((prev) => prev + 1);
        } else if (direction === 'previous') {
          setCurrentPageIndex((prev) => prev - 1);
          if (nextToken === null) {
            setPreviousTokens((prev) => prev.slice(0, prev.length - 2));
          } else {
            setPreviousTokens((prev) => prev.slice(0, prev.length - 1));
          }
        } else {
          setCurrentPageIndex(1);
        }
      });
    },
    [nextToken, previousTokens, pageSize, fetchMore, currentPageIndex]
  );

  useEffect(() => {
    handlePagination('first');
  }, [pageSize]);

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
      // {
      //   header: 'Denergy Wallet Address',
      //   accessorKey: 'denergyWallet',
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
        header: 'KYB Company Detail',
        accessorKey: 'company_detail',
        cell: (info) => {
          const applicantId = info.row.original.applicantId;

          return (
            <Link to={`/companies/${applicantId}`}>
              <button
                style={{
                  padding: '6px 12px',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                View Details
              </button>
            </Link>
          );
        }
      }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ReactTable
          {...{
            data: filteredData,
            columns,
            nextToken,
            previousTokens,
            currentPageIndex,
            pageSize,
            setPageSize,
            handlePagination,
            isLoading: loading
          }}
        />
      </Grid>
    </Grid>
  );
}
