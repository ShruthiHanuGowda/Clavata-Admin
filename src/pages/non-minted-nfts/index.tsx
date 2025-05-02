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
import { LIST_NON_MINTED_NFTS } from 'graphql/queries'; // Assuming this is your GraphQL query for NonMintedNFTs
import { useNavigate } from 'react-router';

function ReactTable({ data, columns, top }: { data: any[]; columns: ColumnDef<any>[]; top?: boolean }) {
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

  const handleItemIdClick = (itemId: string) => {
    navigate(`/nft/non-minted/${itemId}`); // Navigate to Non-Minted NFT details page
  };

  return (
    <>
      <MainCard title="Non-Minted NFTs" content={false} secondary={<CSVExport {...{ data, headers, filename: 'non-minted-nfts.csv' }} />}>
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
                              onClick={() => {
                                if (cell.column.columnDef?.accessorKey === 'itemId') {
                                  handleItemIdClick(cell.getValue());
                                }
                              }}
                              style={{ cursor: cell.column.columnDef.accessorKey === 'itemId' ? 'pointer' : 'default' }}
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

export default function NonMintedNftsTable() {
  const context = useContext(Context);
  const { searchTerm } = context as any;

  // Query for Non-Minted NFTs
  const { error, data } = useQuery(LIST_NON_MINTED_NFTS, {
    variables: { nextToken: null }
  });

  if (error) {
    console.error('Error fetching Non-Minted NFTs:', error);
  }

  const transformedData = data?.listNonMintedNfts?.items || [];

  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedData;
    return transformedData.filter(
      (item: any) =>
        item.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.commissioningDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transformedData]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { header: 'Item ID', accessorKey: 'itemId' },
      { header: 'Asset ID', accessorKey: 'assetId' },
      { header: 'Commissioning Date', accessorKey: 'commissioningDate' },
      { header: 'Country', accessorKey: 'country' },
      { header: 'Start Date', accessorKey: 'startDate' },
      { header: 'End Date', accessorKey: 'endDate' },
      { header: 'Facility Name', accessorKey: 'facilityName' },
      { header: 'Volume', accessorKey: 'volume' },
      { header: 'Year', accessorKey: 'year' }
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
