import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Grid, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Box, Divider, CardContent, Stack } from '@mui/material';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { Context } from 'App';
import MainCard from 'components/MainCard';
import { CSVExport, TablePaginationToken } from 'components/third-party/react-table';
import ScrollX from 'components/ScrollX';
import Search from 'layout/Dashboard/Header/HeaderContent/Search';
import { LIST_NON_MINTED_NFTS } from 'graphql/queries';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';

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
      <MainCard title="Non-Minted NFTs" content={false} secondary={<CSVExport {...{ data, headers, filename: 'non-minted-nfts.csv' }} />}>
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
                            <TableCell key={cell.id} {...cell.column.columnDef.meta}>
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

export default function NonMintedNftsTable() {
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
  } = useQuery(LIST_NON_MINTED_NFTS, {
    variables: {
      limit: pageSize,
      filter: {
        or: [
          { assetId: { contains: searchTerm } },
          { country: { contains: searchTerm } },
          { facilityName: { contains: searchTerm } },
          { type: { contains: searchTerm } },
          { commissioningDate: { contains: searchTerm } },
          { startDate: { contains: searchTerm } },
          { endDate: { contains: searchTerm } },
          { createdAt: { contains: searchTerm } },
          { itemId: { contains: searchTerm } }
        ]
      }
    }
  });

  if (error) {
    console.error('Error fetching Non-Minted NFTs:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  // const transformedData = data?.listNonMintedNfts?.items || [];

  // const filteredData = useMemo(() => {
  //   if (!searchTerm) return data;
  //   return data.filter(
  //     (item: any) =>
  //       item.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       item.commissioningDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       item.country.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [searchTerm, data]);

  useEffect(() => {
    if (queryData) {
      setData(queryData.listNonMintedNfts.items);
      setNextToken(queryData.listNonMintedNfts.nextToken);
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

        setData(fetchedData.listNonMintedNfts.items);
        setNextToken(fetchedData.listNonMintedNfts.nextToken);

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
      { header: 'Item ID', accessorKey: 'itemId' },
      { header: 'Asset ID', accessorKey: 'assetId' },
      { header: 'Commissioning Date', accessorKey: 'commissioningDate' },
      { header: 'Country', accessorKey: 'country' },
      { header: 'Start Date', accessorKey: 'startDate', cell: (cell) => formatDate(cell.getValue() as string) },
      { header: 'End Date', accessorKey: 'endDate', cell: (cell) => formatDate(cell.getValue() as string) },
      { header: 'Facility Name', accessorKey: 'facilityName' },
      { header: 'Volume', accessorKey: 'volume' },
      { header: 'Year', accessorKey: 'year' }
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
