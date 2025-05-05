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
import { LIST_NFT_COLLECTIONS } from 'graphql/queries';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';

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

  const handleContractAddressClick = (contractAddress: string) => {
    navigate(`/nft?search=${contractAddress}`); // Navigate to the desired URL with search parameter
  };

  return (
    <>
      <MainCard title="NFT Collections" content={false} secondary={<CSVExport {...{ data, headers, filename: 'nft-collections.csv' }} />}>
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
                                // Only trigger navigation when contractAddress cell is clicked
                                if (cell.column.columnDef?.accessorKey === 'contractAddress') {
                                  handleContractAddressClick(cell.getValue());
                                }
                              }}
                              style={{ cursor: cell.column.columnDef.accessorKey === 'contractAddress' ? 'pointer' : 'default' }}
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

export default function NftCollectionTable() {
  const context = useContext(Context);
  const { searchTerm } = context as any;

  // Query for NFT collections
  const { error, data } = useQuery(LIST_NFT_COLLECTIONS, {
    variables: { nextToken: null }
  });

  if (error) {
    console.error('Error fetching NFT collections:', error);
  }

  const transformedData = data?.listNftCollections?.items || [];

  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedData;
    return transformedData.filter(
      (item: any) =>
        item.collectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contractAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transformedData]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'Contract Address',
        accessorKey: 'contractAddress',
        cell: (cell) => {
          const address = cell.getValue() as string;
          return <>{shortenAddress(address)}</>;
        }
      },
      { header: 'Collection Name', accessorKey: 'collectionName' },
      { header: 'Symbol', accessorKey: 'symbol' },
      { header: 'Year', accessorKey: 'year' },
      { header: 'Country', accessorKey: 'country' },
      {
        header: 'Owner Address',
        accessorKey: 'ownerAddress',
        cell: (cell) => {
          const address = cell.getValue() as string;
          return (
            <Link to={getBlockExploreLink(address)} target="_blank">
              {shortenAddress(address)}
            </Link>
          );
        }
      },
      { header: 'Type', accessorKey: 'type' },
      { header: 'Created At', accessorKey: 'createdAt', cell: (cell) => formatDate(cell.getValue() as string) },
      { header: 'Updated At', accessorKey: 'updatedAt', cell: (cell) => formatDate(cell.getValue() as string) }
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
