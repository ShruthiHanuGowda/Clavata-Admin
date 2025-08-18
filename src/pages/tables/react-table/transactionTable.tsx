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
import { CSVExport, TablePaginationToken } from 'components/third-party/react-table';

// types
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';

//query
import { LIST_TRANSACTION_HISTORY } from '../../../graphql/queries';
import { useQuery } from '@apollo/client';
import { CardContent } from '@mui/material';
import { Context } from 'App';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';

// ==============================|| REACT TABLE ||============================== //

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

export default function transactionTable() {
  const { logout } = useAuth();
  // const data: TableDataProps[] = makeData(100);
  const context = useContext(Context);
  const { searchTerm, setSearchTerm }: any = context;

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery(LIST_TRANSACTION_HISTORY, {
    variables: {
      nextToken: null,
      limit: pageSize,
      filter: {
        or: [
          { transactionId: { contains: searchTerm } },
          { amount: { contains: searchTerm } },
          { destinationAccount: { contains: searchTerm } },
          { sourceAccount: { contains: searchTerm } },
          { status: { contains: searchTerm } },
          { timestamp: { contains: searchTerm } },
          { transactionType: { contains: searchTerm } }
        ]
      }
    }
  });

  if (error) {
    console.error('GraphQL Error:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  // Transform company data to fit column structure
  // const transformedData =
  // data?.listTransactionsHistories?.items.map((item: any) => ({
  //   amount: item.amount,
  //   destinationAccount: item.destinationAccount,
  //   sourceAccount: item.sourceAccount,
  //   status: item.status,
  //   timestamp: item.timestamp,
  //   transactionId: item.transactionId,
  //   transactionType: item.transactionType
  // })) || [];

  // Filter data based on search term
  // const filteredData = useMemo(() => {
  //   if (!searchTerm) return data;
  //   return data.filter(
  //     (item: any) =>
  //       (item.amount && item.amount.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //       (item.destinationAccount && item.destinationAccount.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //       (item.sourceAccount && item.sourceAccount.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //       (item.status && item.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //       (item.timestamp && item.timestamp.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //       (item.transactionId && item.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //       (item.transactionType && item.transactionType.toLowerCase().includes(searchTerm.toLowerCase()))
  //   );
  // }, [searchTerm, data]);

  const transformedResponseData = (resData: any) => {
    return resData.listTransactionsHistories?.items.map((item: any, index: number) => ({
      id: item?.id || index || '',
      amount: item.amount,
      destinationAccount: item.destinationAccount,
      sourceAccount: item.sourceAccount,
      status: item.status,
      timestamp: item.timestamp,
      transactionId: item.transactionId,
      transactionType: item.transactionType
    }));
  };

  useEffect(() => {
    if (queryData) {
      const transformedData = transformedResponseData(queryData);
      setData(transformedData);
      setNextToken(queryData.listTransactionsHistories.nextToken);
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

      let variables: { limit: number; nextToken?: string } = {
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
        setNextToken(fetchedData.listTransactionsHistories.nextToken);

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
    [nextToken, previousTokens, pageSize, fetchMore]
  );

  useEffect(() => {
    handlePagination('first');
  }, [pageSize]);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Amount',
        accessorKey: 'amount'
      },
      {
        header: 'Destination Account',
        accessorKey: 'destinationAccount'
      },
      {
        header: 'Source Account',
        accessorKey: 'sourceAccount'
      },
      {
        header: 'Status',
        accessorKey: 'status'
      },
      {
        header: 'Timestamp',
        accessorKey: 'timestamp',
        cell: (cell) => formatDate(cell.getValue() as string)
      },
      {
        header: 'Transaction Id',
        accessorKey: 'transactionId'
      },
      {
        header: 'Transaction Type',
        accessorKey: 'transactionType'
      }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ReactTable
          {...{
            data,
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
