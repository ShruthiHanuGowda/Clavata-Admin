import { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  HeaderGroup,
  useReactTable
} from '@tanstack/react-table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Divider from '@mui/material/Divider';
import { LabelKeyObject } from 'react-csv/lib/core';
import { useMemo } from 'react';
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import { FormControl, InputAdornment, OutlinedInput } from '@mui/material';
import { SearchOutlined } from '@ant-design/icons';
import { WebSocketLink } from '@apollo/client/link/ws';
import ScrollX from '../../components/ScrollX';
import { TablePaginationToken } from '../../components/third-party/react-table';
import MainCard from '../../components/MainCard';
import useAuth from 'hooks/useAuth';
import { ON_CREATE_EVIDENT_ITEM, ON_UPDATE_EVIDENT_ITEM, ON_DELETE_EVIDENT_ITEM } from 'graphql/subscriptions';
import { formatDate } from 'utils/date';
import { LIST_EVIDENT_ITEMS } from 'graphql/queries';

export default function EvidentItems() {
  const { logout } = useAuth();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery(LIST_EVIDENT_ITEMS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: pageSize,
      filter: {
        or: [{ assetId: { contains: search } }, { uid: { contains: search } }, { asset: { contains: search } }]
      }
    }
  });

  if (error) {
    console.error('GraphQL Error:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }
  // const listEvidentResponse = useQuery(LIST_EVIDENT_ITEMS, {
  //   notifyOnNetworkStatusChange: true
  // });

  const wsLink = new WebSocketLink({
    uri: import.meta.env.VITE_APP_EVIDENT_GRAPHQL_WS_URL,
    options: {
      reconnect: true,
      connectionParams: {
        'x-api-key': import.meta.env.VITE_APP_EVIDENT_GRAPHQL_API_KEY
      }
    }
  });

  const client = new ApolloClient({
    link: wsLink,
    cache: new InMemoryCache()
  });

  // useEffect(() => {
  //   if (listEvidentResponse.data?.listEvidentItems?.items) setData(listEvidentResponse.data.listEvidentItems.items);
  // }, [listEvidentResponse]);

  useEffect(() => {
    const createSub = client.subscribe({ query: ON_CREATE_EVIDENT_ITEM }).subscribe({
      next({ data }) {
        const newItem = data?.onCreateEvidentItems;
        if (newItem) {
          setData((prevData) => [...prevData, newItem] as any);
        }
      },
      error(err) {
        console.error('Create subscription error:', err);
      }
    });

    const updateSub = client.subscribe({ query: ON_UPDATE_EVIDENT_ITEM }).subscribe({
      next({ data }) {
        const updatedItem = data?.onUpdateEvidentItems;
        if (updatedItem) {
          setData((prevData) => prevData.map((item: any) => (item.uid === updatedItem.uid ? updatedItem : item)) as any);
        }
      },
      error(err) {
        console.error('Update subscription error:', err);
      }
    });

    const deleteSub = client.subscribe({ query: ON_DELETE_EVIDENT_ITEM }).subscribe({
      next({ data }) {
        const deletedItem = data?.onDeleteEvidentItems;
        if (deletedItem) {
          setData((prevData) => prevData.filter((item: any) => item.uid !== deletedItem.uid));
        }
      },
      error(err) {
        console.error('Delete subscription error:', err);
      }
    });

    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  }, [client]);

  // const filteredData = useMemo(() => {
  //   if (!search) return data;

  //   return data.filter((item: any) => {
  //     const asset = item.asset ? JSON.parse(item.asset) : {};
  //     const country = asset?.country?.name || '';
  //     const deviceName = asset?.issue?.deviceDetails?.name || '';
  //     const deviceGroup = asset?.issue?.deviceDetails?.deviceType?.deviceGroup || '';

  //     const searchLower = search.toLowerCase();

  //     return (
  //       country.toLowerCase().includes(searchLower) ||
  //       deviceName.toLowerCase().includes(searchLower) ||
  //       deviceGroup.toLowerCase().includes(searchLower)
  //     );
  //   });
  // }, [search, data]);

  useEffect(() => {
    if (queryData?.listEvidentItems?.items) {
      setData(queryData?.listEvidentItems?.items);
      setNextToken(queryData.listEvidentItems.nextToken);
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

        setData(fetchedData?.listEvidentItems?.items);
        setNextToken(fetchedData?.listEvidentItems.nextToken);

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

  const columns: any = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'Energy Type',
        accessorFn: (row: any) => (row.asset ? JSON.parse(row.asset)?.issue?.deviceDetails?.deviceType?.deviceGroup : ''),
        cell: ({ getValue }) => getValue() || ''
      },
      {
        header: 'Country',
        accessorFn: (row: any) => (row.asset ? JSON.parse(row.asset)?.country?.name : ''),
        cell: ({ getValue }) => getValue() || ''
      },
      {
        header: 'Facility Name',
        accessorFn: (row: any) => (row.asset ? JSON.parse(row.asset)?.issue?.deviceDetails?.name : ''),
        cell: ({ getValue }) => getValue() || ''
      },
      {
        header: 'Volume (MWh)',
        accessorKey: 'volume',
        cell: ({ getValue }: any) => parseFloat(getValue() || '0')
      },
      {
        header: 'Production Start Date',
        accessorFn: (row: any) => (row.asset ? JSON.parse(row.asset)?.startDate : ''),
        cell: ({ getValue }) => getValue() || ''
      },
      {
        header: 'Production End Date',
        accessorFn: (row: any) => (row.asset ? JSON.parse(row.asset)?.endDate : ''),
        cell: ({ getValue }: any) => formatDate(getValue())
      },
      {
        header: 'Facility Commissioning Date',
        accessorFn: (row: any) => (row.asset ? JSON.parse(row.asset)?.issue?.deviceDetails?.commissioningDate : ''),
        cell: ({ getValue }: any) => formatDate(getValue())
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true
  });

  const headers: LabelKeyObject[] = [];
  table.getAllColumns().map((columns) =>
    headers.push({
      label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
      // @ts-ignore
      key: columns.columnDef.accessorKey
    })
  );

  return (
    <MainCard title="Evident Items" content={false}>
      <ScrollX>
        <Stack>
          <Box sx={{ width: '100%', ml: { xs: 0, md: 1 }, mb: 2 }}>
            <FormControl sx={{ width: { xs: '100%', md: 224 } }}>
              <OutlinedInput
                size="small"
                id="evident-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startAdornment={
                  <InputAdornment position="start" sx={{ mr: -0.5 }}>
                    <SearchOutlined />
                  </InputAdornment>
                }
                aria-describedby="evident-search-text"
                inputProps={{
                  'aria-label': 'search'
                }}
                placeholder="Search..."
              />
            </FormControl>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<never>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} {...header.column.columnDef.meta}>
                        {/* {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())} */}
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
                isLoading: false
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
        </Stack>
      </ScrollX>
    </MainCard>
  );
}
