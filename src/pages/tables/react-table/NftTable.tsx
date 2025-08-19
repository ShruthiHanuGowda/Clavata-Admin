import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { LIST_NFT_WALLETS } from '../../../graphql/queries';
import Search from '../../../../../admin-panel-fe/src/layout/Dashboard/Header/HeaderContent/Search';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
// import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { CSVExport, TablePaginationToken } from 'components/third-party/react-table';
// import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';

//query
import { Context } from 'App';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
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
                  {/* <TablePagination
                    {...{
                      setPageSize: table.setPageSize,
                      setPageIndex: table.setPageIndex,
                      getState: table.getState,
                      getPageCount: table.getPageCount
                    }}
                  /> */}
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
                    {table.getRowModel().rows?.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
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

// ==============================|| REACT TABLE - PAGINATION ||============================== //

export default function NftTable() {
  const { logout } = useAuth();
  // const data: TableDataProps[] = makeData(100);

  const [contractAddress, setContractAddress] = useState('');

  const context = useContext(Context);
  const location = useLocation();
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
  } = useQuery(LIST_NFT_WALLETS, {
    variables: { limit: pageSize, contractAddress }
  });

  if (error) {
    console.error('GraphQL Error:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search); // Parse the URL query
    const searchParam = params.get('search');
    if (searchParam) {
      setContractAddress(searchParam); // Set the search term from URL
    }
    return () => {
      setContractAddress('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Transform company data to fit column structure
  // const transformedData = useMemo(() => {
  //   return (data?.listMintedNfts?.items || []).map((item: any) => ({
  //     assetId: item.assetId,
  //     contractAddress: item.contractAddress,
  //     createdAt: item.createdAt,
  //     mintedVolume: item.mintedVolume,
  //     tokenId: item.tokenId
  //   }));
  // }, [data]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (item: any) =>
        (item.assetId && item.assetId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.contractAddress && item.contractAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.createdAt && item.createdAt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.mintedVolume && item.mintedVolume.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tokenId && item.tokenId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, data]);

  const transformedResponseData = (resData: any) => {
    return (resData?.listMintedNfts?.items || []).map((item: any, index: number) => ({
      id: item?.id || index || '',
      assetId: item.assetId,
      contractAddress: item.contractAddress,
      createdAt: item.createdAt,
      mintedVolume: item.mintedVolume,
      tokenId: item.tokenId
    }));
  };

  useEffect(() => {
    if (queryData) {
      const transformedData = transformedResponseData(queryData);
      setData(transformedData);
      setNextToken(queryData.listMintedNfts.nextToken);
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
        setNextToken(fetchedData.listMintedNfts.nextToken);

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
        header: 'Asset Id',
        accessorKey: 'assetId'
      },
      {
        header: 'Contract Address',
        accessorKey: 'contractAddress',
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
        header: 'Created At',
        accessorKey: 'createdAt',
        cell: (cell) => formatDate(cell.getValue() as string)
      },
      {
        header: 'Minted Volume',
        accessorKey: 'mintedVolume'
      },
      // {
      //   header: 'Denergy Wallet',
      //   accessorKey: 'age',
      //   meta: {
      //     className: 'cell-right'
      //   }
      // },
      {
        header: 'Token Id',
        accessorKey: 'tokenId'
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
      }
      // {
      //   header: 'KYC status',
      //   accessorKey: 'progress'
      //   // cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />
      // },
      //   {
      //     header: 'Date Registered',
      //     accessorKey: 'date'
      //   }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      {/* <Grid item xs={12}>
        <ReactTable {...{ data, columns, top: true }} />
      </Grid> */}
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
