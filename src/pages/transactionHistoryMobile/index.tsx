import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Grid, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Box, Divider, CardContent, Stack } from '@mui/material';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { Context } from 'App';
import MainCard from 'components/MainCard';
import { CSVExport, TablePaginationToken } from 'components/third-party/reactTable';
import ScrollX from 'components/ScrollX';
import Search from 'layout/Dashboard/Header/HeaderContent/Search';
import { LIST_TRANSACTION_HISTORY_MOBILE } from 'graphql/queries'; // Define the query for transaction history
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';

function TransactionHistoryMobilePage({
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
  data: any[];
  columns: ColumnDef<any>[];
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
  const navigate = useNavigate();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  const headers: any[] = [];
  table.getAllColumns().map((col: any) =>
    headers.push({
      label: col.columnDef.header,
      key: col.columnDef.accessorKey
    })
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <>
      <MainCard
        title="Mobile Transactions"
        content={false}
        secondary={<CSVExport {...{ data, headers, filename: 'mobile-transactions.csv' }} />}
      >
        <CardContent sx={{ p: 2 }}>
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
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableCell key={header.id} {...header.column.columnDef.meta}>
                            <span onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
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
                    {table.getRowModel().rows?.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell: any) => (
                            <TableCell
                              key={cell.id}
                              {...cell.column.columnDef.meta}
                              style={{ cursor: cell.column.columnDef.accessorKey === 'transactionHash' ? 'pointer' : 'default' }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow key={0}>No data found!</TableRow>
                    )}
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

export default function MobileTransactionHistory() {
  const { logout } = useAuth();
  const context = useContext(Context);
  const { searchTerm } = context as any;

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
  } = useQuery(LIST_TRANSACTION_HISTORY_MOBILE, {
    variables: {
      nextToken: null,
      limit: pageSize,
      filter: {
        or: [
          { from: { contains: searchTerm } },
          { to: { contains: searchTerm } },
          { method: { contains: searchTerm } },
          { coinCode: { contains: searchTerm } },
          { transactionStatus: { contains: searchTerm } },
          { transactionHash: { contains: searchTerm } },
          { createdAt: { contains: searchTerm } }
        ]
      }
    }
  });

  if (error) {
    console.error('Error fetching mobile transaction history:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  // const transformedData = data?.listTransactionHistoryMobiles?.items || [];

  // const filteredData = useMemo(() => {
  //   if (!searchTerm) return data;
  //   return data.filter(
  //     (item: any) =>
  //       item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       item.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       item.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       item.transactionHash.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [searchTerm, data]);

  useEffect(() => {
    if (queryData) {
      setData(queryData.listTransactionHistoryMobiles.items);
      setNextToken(queryData.listTransactionHistoryMobiles.nextToken);
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

        setData(fetchedData.listTransactionHistoryMobiles.items);
        setNextToken(fetchedData.listTransactionHistoryMobiles.nextToken);

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

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'Transaction Hash',
        accessorKey: 'transactionHash',
        cell: (cell) => {
          const hash = cell.getValue() as string;
          return (
            <Link to={getBlockExploreLink(hash, 'transaction')} target="_blank">
              {shortenAddress(hash)}
            </Link>
          );
        }
      },
      {
        header: 'From',
        accessorKey: 'from',
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
        header: 'To',
        accessorKey: 'to',
        cell: (cell) => {
          const address = cell.getValue() as string;
          return (
            <Link to={getBlockExploreLink(address)} target="_blank">
              {shortenAddress(address)}
            </Link>
          );
        }
      },
      { header: 'Amount', accessorKey: 'amount' },
      { header: 'Coin Code', accessorKey: 'coinCode' },
      { header: 'Method', accessorKey: 'method' },
      { header: 'Status', accessorKey: 'transactionStatus' },
      { header: 'Transaction Fee', accessorKey: 'txnFee' },
      { header: 'Created At', accessorKey: 'createdAt', cell: (cell) => formatDate(cell.getValue() as string) }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TransactionHistoryMobilePage
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
