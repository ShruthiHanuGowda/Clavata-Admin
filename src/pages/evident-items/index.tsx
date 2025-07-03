import { useEffect, useState } from 'react';
import MainCard from '../../components/MainCard';
import { TablePagination } from '../../components/third-party/react-table';
import ScrollX from '../../components/ScrollX';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, HeaderGroup, useReactTable } from '@tanstack/react-table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Divider from '@mui/material/Divider';
import { LabelKeyObject } from 'react-csv/lib/core';
import { useMemo } from 'react';

import { ApolloClient, HttpLink, InMemoryCache, useQuery } from '@apollo/client';
import { LIST_EVIDENT_ITEMS } from 'graphql/queries';
import { formatDate } from 'utils/date';
import { ON_CREATE_EVIDENT_ITEM, ON_UPDATE_EVIDENT_ITEM, ON_DELETE_EVIDENT_ITEM } from 'graphql/subscriptions';
import { WebSocketLink } from '@apollo/client/link/ws';

export default function EvidentItems() {
  const [data, setData] = useState([]);
  const listEvidentResponse = useQuery(LIST_EVIDENT_ITEMS, {
    notifyOnNetworkStatusChange: true
  });

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

  useEffect(() => {
    if (listEvidentResponse.data?.listEvidentItems?.items) setData(listEvidentResponse.data.listEvidentItems.items);
  }, [listEvidentResponse]);

  useEffect(() => {
    const createSub = client.subscribe({ query: ON_CREATE_EVIDENT_ITEM }).subscribe({
      next({ data }) {
        const newItem = data?.onCreateEvidentItems;
        if (newItem) {
          setData((prevData) => [...prevData, newItem]);
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
          setData((prevData) => prevData.map((item) => (item.uid === updatedItem.uid ? updatedItem : item)));
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
          setData((prevData) => prevData.filter((item) => item.uid !== deletedItem.uid));
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

  const columns: any = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'Energy Type',
        cell: ({ row }: any) => {
          return row.original.asset ? JSON.parse(row.original.asset)?.issue?.deviceDetails?.deviceType?.deviceGroup : '';
        }
      },
      {
        header: 'Country',
        cell: ({ row }: any) => {
          return row.original.asset ? JSON.parse(row.original.asset)?.country?.name : '';
        }
      },
      {
        header: 'Facility Name',
        cell: ({ row }: any) => {
          return row.original.asset ? JSON.parse(row.original.asset)?.issue?.deviceDetails?.name : '';
        }
      },
      {
        header: 'Volume (MWh)',
        cell: ({ row }: any) => {
          return parseFloat(row.original?.volume || '0');
        }
      },
      {
        header: 'Production Start Date',
        cell: ({ row }: any) => {
          return row.original.asset ? JSON.parse(row.original.asset)?.startDate : '';
        }
      },
      {
        header: 'Production End Date',
        cell: ({ row }: any) => {
          return row.original.asset ? formatDate(JSON.parse(row.original.asset)?.endDate) : '';
        }
      },
      {
        header: 'Facility Commissioning Date',
        cell: ({ row }: any) => {
          return row.original.asset ? formatDate(JSON.parse(row.original.asset)?.issue?.deviceDetails?.commissioningDate) : '';
        }
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });

  let headers: LabelKeyObject[] = [];
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
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<never>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} {...header.column.columnDef.meta}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount
              }}
            />
          </Box>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}
