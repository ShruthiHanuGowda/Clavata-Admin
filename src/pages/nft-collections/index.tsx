import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Grid, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Box, Divider, CardContent, Stack } from '@mui/material';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { Context } from 'App';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { CSVExport, TablePaginationToken } from 'components/third-party/react-table';
import Search from 'layout/Dashboard/Header/HeaderContent/Search';
import { LIST_NFT_COLLECTIONS } from 'graphql/queries';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';

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
  const navigate = useNavigate();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
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

export default function NftCollectionTable() {
  const context = useContext(Context);
  const { searchTerm } = context as any;

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Query for NFT collections
  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery(LIST_NFT_COLLECTIONS, {
    variables: { limit: pageSize }
  });

  if (error) {
    console.error('Error fetching NFT collections:', error);
  }

  // const transformedData = data?.listNftCollections?.items || [];

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (item: any) =>
        item.collectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contractAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, data]);

  useEffect(() => {
    if (queryData) {
      setData(queryData.listNftCollections.items);
      setNextToken(queryData.listNftCollections.nextToken);
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

        setData(fetchedData.listNftCollections.items);
        setNextToken(fetchedData.listNftCollections.nextToken);

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
