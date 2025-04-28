import { useContext, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Grid, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Box, Divider, CardContent, Stack } from '@mui/material';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { Context } from 'App';
import MainCard from 'components/MainCard';
import TablePagination from 'components/third-party/react-table/TablePagination';
import ScrollX from 'components/ScrollX';
import CSVExport from 'components/third-party/react-table/CSVExport';
import Search from 'layout/Dashboard/Header/HeaderContent/Search';
import { LIST_TRANSACTION_HISTORY_MOBILE } from 'graphql/queries'; // Define the query for transaction history
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { getBlockExploreLink } from 'utils/explorer';

function TransactionHistoryMobilePage({ data, columns, top }: { data: any[]; columns: ColumnDef<any>[]; top?: boolean }) {
  const context = useContext(Context);
  const { setSearchTerm }: any = context;
  const navigate = useNavigate();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  let headers: any[] = [];
  table.getAllColumns().map((col: any) =>
    headers.push({
      label: col.columnDef.header,
      key: col.columnDef.accessorKey
    })
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleTransactionClick = (transactionHash: string) => {
    navigate(`/transaction?hash=${transactionHash}`); // Navigate to the transaction page
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
                  <TablePagination
                    setPageSize={table.setPageSize}
                    setPageIndex={table.setPageIndex}
                    getState={table.getState}
                    getPageCount={table.getPageCount}
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
                    <TablePagination
                      setPageSize={table.setPageSize}
                      setPageIndex={table.setPageIndex}
                      getState={table.getState}
                      getPageCount={table.getPageCount}
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
  const context = useContext(Context);
  const { searchTerm } = context as any;

  const { error, data } = useQuery(LIST_TRANSACTION_HISTORY_MOBILE);

  if (error) {
    console.error('Error fetching mobile transaction history:', error);
  }

  const transformedData = data?.listTransactionHistoryMobiles?.items || [];

  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedData;
    return transformedData.filter(
      (item: any) =>
        item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transactionHash.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transformedData]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'Transaction Hash',
        accessorKey: 'transactionHash',
        cell: (cell) => (
          <Link to={getBlockExploreLink(cell.getValue() as string, 'transaction')} target="_blank">
            {cell.getValue() as string}
          </Link>
        )
      },
      { header: 'From', accessorKey: 'from' },
      { header: 'To', accessorKey: 'to' },
      { header: 'Amount', accessorKey: 'amount' },
      { header: 'Coin Code', accessorKey: 'coinCode' },
      { header: 'Method', accessorKey: 'method' },
      { header: 'Status', accessorKey: 'transactionStatus' },
      { header: 'Transaction Fee', accessorKey: 'txnFee' },
      { header: 'Created At', accessorKey: 'createdAt' }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TransactionHistoryMobilePage {...{ data: filteredData, columns }} />
      </Grid>
    </Grid>
  );
}
